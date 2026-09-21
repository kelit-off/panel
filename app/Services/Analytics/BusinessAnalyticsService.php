<?php

namespace Pterodactyl\Services\Analytics;

use Carbon\Carbon;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Order;
use Pterodactyl\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Models\StorefrontVisit;

/**
 * Business metrics computed from local orders and anonymous storefront visits.
 *
 * Amounts are estimated from the current price of the offer each order was
 * bought with: Stripe remains the source of truth for what was collected. A
 * "service" is a paid order that was, or still is, running.
 *
 * Money and dates are handled in PHP rather than SQL on purpose: it keeps the
 * maths (churn, cohorts, MRR history) readable and independent of the database.
 */
class BusinessAnalyticsService
{
    private const RECURRING_STATUSES = [
        Order::STATUS_ACTIVE,
        Order::STATUS_SUSPENDED,
        Order::STATUS_CANCELLED,
        Order::STATUS_TERMINATED,
    ];

    /** A pending order younger than this may still be in the middle of paying. */
    private const ABANDONED_AFTER_MINUTES = 60;

    private ?Collection $services = null;

    public function revenue(int $range): array
    {
        [ $days, $first ] = $this->window($range);
        $dayBefore = $first->copy()->subDay()->toDateString();

        $services = $this->services();
        $newByDay = [];
        $endedByDay = [];
        foreach ($services as $service) {
            $newByDay[$service['start_day']] = ($newByDay[$service['start_day']] ?? 0) + $service['price'];
            if (!is_null($service['end_day'])) {
                $endedByDay[$service['end_day']] = ($endedByDay[$service['end_day']] ?? 0) + $service['price'];
            }
        }

        $atStart = $services->filter(fn (array $s) => $this->aliveOn($s, $dayBefore));
        $mrrStart = (float) $atStart->sum('price');

        $running = $mrrStart;
        $newMrr = 0.0;
        $churnedMrr = 0.0;
        $series = [];
        foreach ($days as $day) {
            $new = (float) ($newByDay[$day] ?? 0);
            $ended = (float) ($endedByDay[$day] ?? 0);
            $running += $new - $ended;
            $newMrr += $new;
            $churnedMrr += $ended;
            $series[] = [ 'date' => $day, 'mrr' => round($running, 2), 'new' => round($new, 2), 'churned' => round($ended, 2) ];
        }

        $now = $services->filter(fn (array $s) => is_null($s['end_day']));
        $mrr = (float) $now->sum('price');
        $payingCustomers = $now->pluck('user_id')->unique()->count();

        // Churn is measured on what existed at the start of the window, so a
        // service sold and cancelled inside it does not inflate the rate.
        $customersAtStart = $atStart->pluck('user_id')->unique();
        $customersNow = $now->pluck('user_id')->unique();
        $lostCustomers = $customersAtStart->diff($customersNow)->count();
        $customerChurn = $customersAtStart->count() > 0 ? $lostCustomers / $customersAtStart->count() : null;
        $revenueChurn = $mrrStart > 0
            ? (float) $atStart->filter(fn (array $s) => !is_null($s['end_day']))->sum('price') / $mrrStart
            : null;

        // Rates are normalised to 30 days so 7, 30 and 90 day views stay comparable.
        $monthlyChurn = (!is_null($customerChurn) && $customerChurn < 1)
            ? 1 - pow(1 - $customerChurn, 30 / $range)
            : $customerChurn;
        $arpu = $payingCustomers > 0 ? $mrr / $payingCustomers : 0.0;
        $ltv = ($monthlyChurn ?? 0) > 0 ? $arpu / $monthlyChurn : null;

        $atRisk = DB::table('orders')
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->where('orders.status', Order::STATUS_SUSPENDED)
            ->sum(DB::raw('COALESCE(products.price, 0)'));

        return [
            'range' => $range,
            'kpis' => [
                'mrr' => round($mrr, 2),
                'arr' => round($mrr * 12, 2),
                'mrr_start' => round($mrrStart, 2),
                'mrr_growth' => $mrrStart > 0 ? round((($mrr - $mrrStart) / $mrrStart) * 100, 1) : null,
                'new_mrr' => round($newMrr, 2),
                'churned_mrr' => round($churnedMrr, 2),
                'mrr_at_risk' => round((float) $atRisk, 2),
                'arpu' => round($arpu, 2),
                'paying_customers' => $payingCustomers,
                'services' => $now->count(),
                'customer_churn' => is_null($monthlyChurn) ? null : round($monthlyChurn * 100, 1),
                'revenue_churn' => is_null($revenueChurn) ? null : round($revenueChurn * 100, 1),
                'ltv' => is_null($ltv) ? null : round($ltv, 2),
                'lifetime_months' => ($monthlyChurn ?? 0) > 0 ? round(1 / $monthlyChurn, 1) : null,
            ],
            'series' => $series,
            'by_game' => $this->mrrBreakdown($now, 'nest_id', Nest::query()->pluck('name', 'id'), 'Jeu supprimé'),
            'by_product' => $this->mrrBreakdown($now, 'product_id', Product::query()->pluck('name', 'id'), 'Offre supprimée'),
            'top_customers' => $this->topCustomers($now, $mrr),
        ];
    }

    public function customers(int $range): array
    {
        [ , $first ] = $this->window($range);
        $now = Carbon::now();
        $previousFirst = $first->copy()->subDays($range);

        $customers = fn (Carbon $from, Carbon $to) => User::query()
            ->where('root_admin', false)
            ->whereBetween('created_at', [ $from, $to ]);

        $newIds = $customers($first, $now)->pluck('id');
        $activated = $newIds->isEmpty() ? 0 : DB::table('orders')
            ->where('status', '!=', Order::STATUS_PENDING)
            ->whereIn('user_id', $newIds)
            ->distinct()
            ->count('user_id');

        $alive = $this->services()->filter(fn (array $s) => is_null($s['end_day']));
        $perCustomer = $alive->groupBy('user_id');
        $payingNow = $perCustomer->count();
        $multiService = $perCustomer->filter(fn (Collection $group) => $group->count() > 1)->count();

        $started = DB::table('orders')
            ->where('status', '!=', Order::STATUS_PENDING)
            ->where('created_at', '>=', $first);

        $paidInRange = (clone $started)->count();
        $failedInRange = (clone $started)->where('status', Order::STATUS_FAILED)->count();

        return [
            'range' => $range,
            'kpis' => [
                'customers_total' => User::query()->where('root_admin', false)->count(),
                'new_customers' => $newIds->count(),
                'new_customers_previous' => $customers($previousFirst, $first->copy()->subSecond())->count(),
                'activation_rate' => $newIds->count() > 0 ? round(($activated / $newIds->count()) * 100, 1) : null,
                'paying_customers' => $payingNow,
                'multi_service_rate' => $payingNow > 0 ? round(($multiService / $payingNow) * 100, 1) : null,
                'services_per_customer' => $payingNow > 0 ? round($alive->count() / $payingNow, 2) : null,
                'provisioning_failures' => $failedInRange,
                'provisioning_failure_rate' => $paidInRange > 0 ? round(($failedInRange / $paidInRange) * 100, 1) : null,
            ],
            'cohorts' => $this->cohorts(),
        ];
    }

    public function funnel(int $range): array
    {
        [ $days, $first ] = $this->window($range);
        $now = Carbon::now();
        $previousFirst = $first->copy()->subDays($range);
        $previousEnd = $first->copy()->subSecond();
        $abandonedBefore = $now->copy()->subMinutes(self::ABANDONED_AFTER_MINUTES);

        $visits = fn (Carbon $from, Carbon $to) => DB::table('storefront_visits')->whereBetween('created_at', [ $from, $to ]);
        $orders = fn (Carbon $from, Carbon $to) => DB::table('orders')->whereBetween('orders.created_at', [ $from, $to ]);
        $notPending = fn ($query) => $query->where('orders.status', '!=', Order::STATUS_PENDING);

        $stage = fn (Carbon $from, Carbon $to) => [
            'visitors' => $visits($from, $to)->distinct()->count('visitor'),
            'games' => $visits($from, $to)->where('kind', StorefrontVisit::KIND_GAME)->distinct()->count('visitor'),
            'checkout' => $visits($from, $to)->where('kind', StorefrontVisit::KIND_CHECKOUT)->distinct()->count('visitor'),
            'started' => $orders($from, $to)->count(),
            'paid' => $notPending($orders($from, $to))->count(),
            'provisioned' => $orders($from, $to)->whereIn('orders.status', self::RECURRING_STATUSES)->count(),
        ];
        $current = $stage($first, $now);
        $previous = $stage($previousFirst, $previousEnd);

        $visitsByDay = $visits($first, $now)
            ->selectRaw('DATE(created_at) as day, COUNT(DISTINCT visitor) as total')
            ->groupBy('day')
            ->pluck('total', 'day');
        $startedByDay = $orders($first, $now)
            ->selectRaw('DATE(orders.created_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');
        $paidByDay = $notPending($orders($first, $now))
            ->selectRaw('DATE(orders.created_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $series = array_map(fn (string $day) => [
            'date' => $day,
            'visitors' => (int) ($visitsByDay[$day] ?? 0),
            'started' => (int) ($startedByDay[$day] ?? 0),
            'paid' => (int) ($paidByDay[$day] ?? 0),
        ], $days);

        $referred = $visits($first, $now)->whereNotNull('referrer')->distinct()->count('visitor');

        $abandoned = DB::table('orders')
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->where('orders.status', Order::STATUS_PENDING)
            ->whereBetween('orders.created_at', [ $first, $abandonedBefore ])
            ->selectRaw('COUNT(*) as total, COALESCE(SUM(products.price), 0) as value')
            ->first();

        return [
            'range' => $range,
            'tracking' => DB::table('storefront_visits')->exists(),
            'stages' => $current,
            'stages_previous' => $previous,
            'series' => $series,
            'by_game' => $this->funnelByGame($first, $now, $abandonedBefore),
            'by_product' => $this->funnelByProduct($first, $now, $abandonedBefore),
            'sources' => [
                'direct' => max(0, $current['visitors'] - $referred),
                'referrers' => $visits($first, $now)
                    ->whereNotNull('referrer')
                    ->selectRaw('referrer, COUNT(DISTINCT visitor) as total')
                    ->groupBy('referrer')
                    ->orderByDesc('total')
                    ->limit(8)
                    ->get()
                    ->map(fn ($row) => [ 'host' => $row->referrer, 'visitors' => (int) $row->total ])
                    ->values(),
            ],
            'ai' => $this->aiVisibility($first, $now),
            'abandoned' => [
                'checkouts' => (int) ($abandoned->total ?? 0),
                'value' => round((float) ($abandoned->value ?? 0), 2),
            ],
        ];
    }

    /**
     * Whether AI assistants read the site (crawler visits) and whether they send
     * people back (visitors whose referrer is an assistant).
     */
    private function aiVisibility(Carbon $from, Carbon $to): array
    {
        $bots = collect(config('storefront.ai_bots', []))->keyBy('name');

        $hits = fn () => DB::table('ai_crawler_hits')->where('day', '>=', $from->toDateString());

        $crawlers = $hits()
            ->selectRaw('bot, SUM(hits) as hits, COUNT(DISTINCT path) as pages, MAX(day) as last_seen')
            ->groupBy('bot')
            ->orderByDesc('hits')
            ->get()
            ->map(fn ($row) => [
                'bot' => $row->bot,
                'operator' => $bots[$row->bot]['operator'] ?? '',
                'purpose' => $bots[$row->bot]['purpose'] ?? '',
                'hits' => (int) $row->hits,
                'pages' => (int) $row->pages,
                'last_seen' => $row->last_seen,
            ])
            ->values();

        $topPages = $hits()
            ->selectRaw('path, SUM(hits) as hits')
            ->groupBy('path')
            ->orderByDesc('hits')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [ 'path' => $row->path, 'hits' => (int) $row->hits ])
            ->values();

        $names = config('storefront.ai_referrers', []);
        $referrals = DB::table('storefront_visits')
            ->whereBetween('created_at', [ $from, $to ])
            ->whereIn('referrer', array_keys($names))
            ->selectRaw('referrer, COUNT(DISTINCT visitor) as visitors')
            ->groupBy('referrer')
            ->get()
            ->groupBy(fn ($row) => $names[$row->referrer])
            ->map(fn ($rows, $name) => [ 'name' => $name, 'visitors' => (int) $rows->sum('visitors') ])
            ->sortByDesc('visitors')
            ->values();

        return [
            'crawlers' => $crawlers,
            'top_pages' => $topPages,
            'referrals' => $referrals,
            'referral_visitors' => (int) $referrals->sum('visitors'),
        ];
    }

    public function capacity(): array
    {
        $since = Carbon::now()->subDays(30);

        $allocated = DB::table('servers')
            ->selectRaw('node_id, SUM(memory) as memory, SUM(disk) as disk, COUNT(*) as servers')
            ->groupBy('node_id')
            ->get()
            ->keyBy('node_id');

        $recent = DB::table('servers')
            ->where('created_at', '>=', $since)
            ->selectRaw('node_id, SUM(memory) as memory, SUM(disk) as disk')
            ->groupBy('node_id')
            ->get()
            ->keyBy('node_id');

        $revenue = DB::table('orders')
            ->join('servers', 'servers.id', '=', 'orders.server_id')
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->where('orders.status', Order::STATUS_ACTIVE)
            ->selectRaw('servers.node_id as node_id, SUM(COALESCE(products.price, 0)) as mrr')
            ->groupBy('servers.node_id')
            ->pluck('mrr', 'node_id');

        $nodes = Node::query()->orderBy('name')->get()->map(function (Node $node) use ($allocated, $recent, $revenue) {
            $row = $allocated[$node->id] ?? null;
            $added = $recent[$node->id] ?? null;

            $memory = [ 'used' => (int) ($row->memory ?? 0), 'limit' => (int) round($node->memory * (1 + ($node->memory_overallocate / 100))) ];
            $disk = [ 'used' => (int) ($row->disk ?? 0), 'limit' => (int) round($node->disk * (1 + ($node->disk_overallocate / 100))) ];
            $mrr = (float) ($revenue[$node->id] ?? 0);

            return [
                'id' => $node->id,
                'name' => $node->name,
                'servers' => (int) ($row->servers ?? 0),
                'memory' => $memory,
                'disk' => $disk,
                'mrr' => round($mrr, 2),
                'mrr_per_gb' => $memory['used'] > 0 ? round($mrr / ($memory['used'] / 1024), 2) : null,
                'memory_days_left' => $this->daysLeft($memory, (int) ($added->memory ?? 0)),
                'disk_days_left' => $this->daysLeft($disk, (int) ($added->disk ?? 0)),
            ];
        })->values();

        return [ 'nodes' => $nodes ];
    }

    /**
     * Days before a resource is full if the last 30 days of allocations keep
     * their pace. Null when nothing was added, so there is nothing to project.
     */
    private function daysLeft(array $resource, int $addedLast30Days): ?int
    {
        if ($addedLast30Days <= 0) {
            return null;
        }

        return max(0, (int) floor(max(0, $resource['limit'] - $resource['used']) / ($addedLast30Days / 30)));
    }

    /**
     * @return array{0: string[], 1: \Carbon\Carbon} every day of the window (oldest first) and its first day
     */
    private function window(int $range): array
    {
        $first = Carbon::today()->subDays($range - 1);
        $days = [];
        for ($i = 0; $i < $range; ++$i) {
            $days[] = $first->copy()->addDays($i)->toDateString();
        }

        return [ $days, $first ];
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function services(): Collection
    {
        return $this->services ??= DB::table('orders')
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->whereIn('orders.status', self::RECURRING_STATUSES)
            ->get([
                'orders.user_id', 'orders.nest_id', 'orders.product_id', 'orders.status',
                'orders.created_at', 'orders.updated_at', 'orders.paid_at', 'orders.ended_at', 'orders.suspended_at',
                'products.price',
            ])
            ->map(function ($row) {
                $start = Carbon::parse($row->paid_at ?? $row->created_at);
                $end = match ($row->status) {
                    Order::STATUS_CANCELLED, Order::STATUS_TERMINATED => Carbon::parse($row->ended_at ?? $row->updated_at),
                    Order::STATUS_SUSPENDED => Carbon::parse($row->suspended_at ?? $row->updated_at),
                    default => null,
                };

                if (!is_null($end) && $end->lt($start)) {
                    $end = $start->copy();
                }

                return [
                    'user_id' => (int) $row->user_id,
                    'nest_id' => $row->nest_id,
                    'product_id' => $row->product_id,
                    'price' => (float) ($row->price ?? 0),
                    'start' => $start,
                    'end' => $end,
                    'start_day' => $start->toDateString(),
                    'end_day' => $end?->toDateString(),
                ];
            })
            ->values();
    }

    private function aliveOn(array $service, string $day): bool
    {
        return $service['start_day'] <= $day && (is_null($service['end_day']) || $service['end_day'] > $day);
    }

    private function mrrBreakdown(Collection $services, string $key, Collection $names, string $fallback): array
    {
        $total = (float) $services->sum('price');

        return $services
            ->groupBy(fn (array $s) => $s[$key] ?? 0)
            ->map(fn (Collection $group, $id) => [
                'name' => $names[$id] ?? $fallback,
                'services' => $group->count(),
                'mrr' => round((float) $group->sum('price'), 2),
                'share' => $total > 0 ? round(((float) $group->sum('price') / $total) * 100, 1) : 0,
            ])
            ->sortByDesc('mrr')
            ->values()
            ->all();
    }

    private function topCustomers(Collection $services, float $mrr): array
    {
        $top = $services
            ->groupBy('user_id')
            ->map(fn (Collection $group, $userId) => [
                'user_id' => (int) $userId,
                'services' => $group->count(),
                'mrr' => (float) $group->sum('price'),
            ])
            ->sortByDesc('mrr')
            ->take(5)
            ->values();

        $users = User::query()->whereIn('id', $top->pluck('user_id'))->get([ 'id', 'username', 'email' ])->keyBy('id');

        return $top->map(fn (array $row) => [
            'id' => $row['user_id'],
            'name' => $users[$row['user_id']]->username ?? 'Client supprimé',
            'email' => $users[$row['user_id']]->email ?? null,
            'services' => $row['services'],
            'mrr' => round($row['mrr'], 2),
            'share' => $mrr > 0 ? round(($row['mrr'] / $mrr) * 100, 1) : 0,
        ])->all();
    }

    /**
     * Share of each monthly signup cohort that still has a running service N
     * months after its first purchase (month 0 is the signup month itself).
     */
    private function cohorts(int $months = 6): array
    {
        $now = Carbon::now();
        $firstMonth = $now->copy()->startOfMonth()->subMonths($months - 1);

        $byCustomer = $this->services()->groupBy('user_id')->map(function (Collection $group) {
            return [ 'first' => $group->min(fn (array $s) => $s['start']->timestamp), 'services' => $group ];
        });

        $rows = [];
        for ($i = 0; $i < $months; ++$i) {
            $cohortStart = $firstMonth->copy()->addMonths($i);
            $cohortEnd = $cohortStart->copy()->endOfMonth();

            $members = $byCustomer->filter(fn (array $c) => $c['first'] >= $cohortStart->timestamp && $c['first'] <= $cohortEnd->timestamp);
            $size = $members->count();

            $retention = [];
            for ($k = 0; $k < $months - $i; ++$k) {
                $at = $cohortStart->copy()->addMonths($k);

                if ($size === 0) {
                    $retention[] = null;
                } elseif ($k === 0) {
                    $retention[] = 100.0;
                } else {
                    $kept = $members->filter(fn (array $c) => $c['services']->contains(
                        fn (array $s) => $s['start']->lte($at) && (is_null($s['end']) || $s['end']->gt($at))
                    ))->count();
                    $retention[] = round(($kept / $size) * 100, 1);
                }
            }

            $rows[] = [ 'cohort' => $cohortStart->format('Y-m'), 'size' => $size, 'retention' => $retention ];
        }

        return $rows;
    }

    private function funnelByGame(Carbon $from, Carbon $to, Carbon $abandonedBefore): array
    {
        $viewers = fn (string $kind) => DB::table('storefront_visits')
            ->whereBetween('created_at', [ $from, $to ])
            ->where('kind', $kind)
            ->whereNotNull('nest_id')
            ->selectRaw('nest_id, COUNT(DISTINCT visitor) as total')
            ->groupBy('nest_id')
            ->pluck('total', 'nest_id');

        $gameViews = $viewers(StorefrontVisit::KIND_GAME);
        $checkoutViews = $viewers(StorefrontVisit::KIND_CHECKOUT);

        $orders = $this->ordersBy('orders.nest_id', $from, $to, $abandonedBefore);
        $names = Nest::query()->pluck('name', 'id');

        return collect($gameViews->keys())->merge($checkoutViews->keys())->merge($orders->keys())
            ->filter()
            ->unique()
            ->map(function ($id) use ($gameViews, $checkoutViews, $orders, $names) {
                $row = $orders[$id] ?? null;
                $visitors = (int) ($gameViews[$id] ?? 0);
                $paid = (int) ($row->paid ?? 0);

                return [
                    'name' => $names[$id] ?? 'Jeu supprimé',
                    'visitors' => $visitors,
                    'checkout' => (int) ($checkoutViews[$id] ?? 0),
                    'started' => (int) ($row->started ?? 0),
                    'paid' => $paid,
                    'sold' => round((float) ($row->sold ?? 0), 2),
                    'conversion' => $visitors > 0 ? round(($paid / $visitors) * 100, 1) : null,
                ];
            })
            ->sortByDesc('visitors')
            ->values()
            ->all();
    }

    private function funnelByProduct(Carbon $from, Carbon $to, Carbon $abandonedBefore): array
    {
        $checkoutViews = DB::table('storefront_visits')
            ->whereBetween('created_at', [ $from, $to ])
            ->where('kind', StorefrontVisit::KIND_CHECKOUT)
            ->whereNotNull('product_id')
            ->selectRaw('product_id, COUNT(DISTINCT visitor) as total')
            ->groupBy('product_id')
            ->pluck('total', 'product_id');

        $orders = $this->ordersBy('orders.product_id', $from, $to, $abandonedBefore);
        $products = Product::query()->with('nest:id,name')->get([ 'id', 'name', 'nest_id' ])->keyBy('id');

        return collect($checkoutViews->keys())->merge($orders->keys())
            ->filter()
            ->unique()
            ->map(function ($id) use ($checkoutViews, $orders, $products) {
                $row = $orders[$id] ?? null;
                $product = $products[$id] ?? null;
                $started = (int) ($row->started ?? 0);
                $paid = (int) ($row->paid ?? 0);

                return [
                    'name' => $product?->name ?? 'Offre supprimée',
                    'game' => $product?->nest?->name,
                    'checkout' => (int) ($checkoutViews[$id] ?? 0),
                    'started' => $started,
                    'paid' => $paid,
                    'abandoned' => (int) ($row->abandoned ?? 0),
                    'abandoned_value' => round((float) ($row->abandoned_value ?? 0), 2),
                    'conversion' => $started > 0 ? round(($paid / $started) * 100, 1) : null,
                ];
            })
            ->sortByDesc('started')
            ->values()
            ->all();
    }

    private function ordersBy(string $column, Carbon $from, Carbon $to, Carbon $abandonedBefore): Collection
    {
        return DB::table('orders')
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->whereBetween('orders.created_at', [ $from, $to ])
            ->selectRaw(
                $column . ' as id, COUNT(*) as started, '
                . 'SUM(CASE WHEN orders.status != ? THEN 1 ELSE 0 END) as paid, '
                . 'SUM(CASE WHEN orders.status != ? THEN COALESCE(products.price, 0) ELSE 0 END) as sold, '
                . 'SUM(CASE WHEN orders.status = ? AND orders.created_at < ? THEN 1 ELSE 0 END) as abandoned, '
                . 'SUM(CASE WHEN orders.status = ? AND orders.created_at < ? THEN COALESCE(products.price, 0) ELSE 0 END) as abandoned_value',
                [
                    Order::STATUS_PENDING,
                    Order::STATUS_PENDING,
                    Order::STATUS_PENDING, $abandonedBefore,
                    Order::STATUS_PENDING, $abandonedBefore,
                ]
            )
            ->groupBy($column)
            ->get()
            ->keyBy('id');
    }
}
