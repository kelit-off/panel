<?php

namespace Pterodactyl\Http\Controllers\Api\Application\Overview;

use Carbon\Carbon;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Order;
use Pterodactyl\Models\Server;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Models\SupportTicket;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Pterodactyl\Http\Requests\Api\Application\Overview\GetAnalyticsRequest;

class AnalyticsController extends ApplicationApiController
{
    /**
     * Sales figures are estimated from local orders and the price of the offer
     * they were bought with; the Stripe dashboard stays the source of truth
     * for what was actually collected.
     */
    public function index(GetAnalyticsRequest $request): JsonResponse
    {
        $range = (int) $request->query('range', 30);

        $end = Carbon::now();
        $start = Carbon::today()->subDays($range - 1);
        $previousStart = $start->copy()->subDays($range);

        // "Pending" orders were never paid, so they count neither as sales nor as customers won.
        $sold = fn () => Order::query()->where('orders.status', '!=', Order::STATUS_PENDING);
        $price = 'COALESCE(products.price, 0)';

        $ordersByDay = $sold()
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->where('orders.created_at', '>=', $start)
            ->selectRaw("DATE(orders.created_at) as day, COUNT(*) as orders, SUM($price) as sold")
            ->groupBy('day')
            ->get()
            ->keyBy('day');

        $customersByDay = User::query()
            ->where('root_admin', false)
            ->where('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as day, COUNT(*) as customers')
            ->groupBy('day')
            ->get()
            ->keyBy('day');

        $series = [];
        for ($i = 0; $i < $range; ++$i) {
            $day = $start->copy()->addDays($i)->toDateString();
            $series[] = [
                'date' => $day,
                'customers' => (int) ($customersByDay[$day]->customers ?? 0),
                'orders' => (int) ($ordersByDay[$day]->orders ?? 0),
                'sold' => round((float) ($ordersByDay[$day]->sold ?? 0), 2),
            ];
        }

        $soldBetween = fn (Carbon $from, Carbon $to) => (float) $sold()
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->whereBetween('orders.created_at', [ $from, $to ])
            ->sum(DB::raw($price));
        $ordersBetween = fn (Carbon $from, Carbon $to) => $sold()->whereBetween('orders.created_at', [ $from, $to ])->count();
        $customersBetween = fn (Carbon $from, Carbon $to) => User::query()->where('root_admin', false)->whereBetween('created_at', [ $from, $to ])->count();
        $endedBetween = fn (Carbon $from, Carbon $to) => Order::query()
            ->whereIn('status', [ Order::STATUS_CANCELLED, Order::STATUS_TERMINATED ])
            ->whereBetween('updated_at', [ $from, $to ])
            ->count();

        $recurring = fn (string $status) => Order::query()
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->where('orders.status', $status);

        $mrr = round((float) $recurring(Order::STATUS_ACTIVE)->sum(DB::raw($price)), 2);
        $payingCustomers = $recurring(Order::STATUS_ACTIVE)->distinct()->count('orders.user_id');

        $byProduct = $recurring(Order::STATUS_ACTIVE)
            ->selectRaw("orders.product_id as product_id, COALESCE(products.name, 'Offre supprimée') as name, COUNT(*) as services, SUM($price) as mrr")
            ->groupBy('orders.product_id', 'products.name')
            ->orderByDesc('mrr')
            ->get()
            ->map(fn ($row) => [ 'name' => $row->name, 'services' => (int) $row->services, 'mrr' => round((float) $row->mrr, 2) ])
            ->values();

        $orderStatuses = Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn ($total) => (int) $total);

        $allocated = Server::query()
            ->selectRaw('node_id, SUM(memory) as memory, SUM(disk) as disk, COUNT(*) as servers')
            ->groupBy('node_id')
            ->get()
            ->keyBy('node_id');

        $nodes = Node::query()->orderBy('name')->get()->map(function (Node $node) use ($allocated) {
            $row = $allocated[$node->id] ?? null;

            return [
                'id' => $node->id,
                'name' => $node->name,
                'servers' => (int) ($row->servers ?? 0),
                'memory' => [
                    'used' => (int) ($row->memory ?? 0),
                    'limit' => (int) round($node->memory * (1 + ($node->memory_overallocate / 100))),
                ],
                'disk' => [
                    'used' => (int) ($row->disk ?? 0),
                    'limit' => (int) round($node->disk * (1 + ($node->disk_overallocate / 100))),
                ],
            ];
        })->values();

        return response()->json([
            'range' => $range,
            'kpis' => [
                'mrr' => $mrr,
                'mrr_at_risk' => round((float) $recurring(Order::STATUS_SUSPENDED)->sum(DB::raw($price)), 2),
                'average_revenue_per_customer' => $payingCustomers > 0 ? round($mrr / $payingCustomers, 2) : 0,
                'sold' => round($soldBetween($start, $end), 2),
                'sold_previous' => round($soldBetween($previousStart, $start->copy()->subSecond()), 2),
                'orders' => $ordersBetween($start, $end),
                'orders_previous' => $ordersBetween($previousStart, $start->copy()->subSecond()),
                'customers' => $customersBetween($start, $end),
                'customers_previous' => $customersBetween($previousStart, $start->copy()->subSecond()),
                'ended' => $endedBetween($start, $end),
                'ended_previous' => $endedBetween($previousStart, $start->copy()->subSecond()),
                'services_active' => (int) ($orderStatuses[Order::STATUS_ACTIVE] ?? 0),
                'services_suspended' => (int) ($orderStatuses[Order::STATUS_SUSPENDED] ?? 0),
                'tickets_waiting' => SupportTicket::query()
                    ->whereIn('status', [ SupportTicket::STATUS_OPEN, SupportTicket::STATUS_CUSTOMER_REPLY ])
                    ->count(),
            ],
            'series' => $series,
            'by_product' => $byProduct,
            'order_statuses' => $orderStatuses,
            'nodes' => $nodes,
        ]);
    }
}
