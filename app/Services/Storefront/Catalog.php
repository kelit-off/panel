<?php

namespace Pterodactyl\Services\Storefront;

use Carbon\Carbon;
use Illuminate\Support\Str;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Product;
use Pterodactyl\Models\Category;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Read model of what the public storefront sells: the games shown to visitors
 * and their plans, formatted the same way for HTML, JSON-LD, sitemap and
 * llms.txt so a price is never worded two different ways.
 */
class Catalog
{
    /**
     * Cached tree of categories -> games (nests) configured in the admin panel.
     * The cache key is flushed by FlushesStorefrontCache when the catalog changes.
     */
    public function categories(): array
    {
        return Cache::remember('landing.categories', now()->addMinutes(15), function () {
            return Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'nests' => $category->nests()
                        ->where('is_active', true)
                        ->orderBy('name')
                        ->get(['id', 'name'])
                        ->map(fn (Nest $nest) => [
                            'id' => $nest->id,
                            'name' => $nest->name,
                            'slug' => Str::slug($nest->name),
                            // Cheapest active plan, shown as the "starting from" price.
                            'fromPrice' => $nest->products()
                                ->where('is_active', true)
                                ->orderBy('price')
                                ->value('price'),
                        ])
                        ->values(),
                ])
                // A category with every game hidden shouldn't show up as an empty entry.
                ->filter(fn (array $category) => $category['nests']->isNotEmpty())
                ->values()
                ->toArray();
        });
    }

    /**
     * Games visitors can see, flat and with their category.
     *
     * @return \Illuminate\Support\Collection<int, array{id: int, name: string, slug: string, fromPrice: string|null, category: string}>
     */
    public function games(): Collection
    {
        return collect($this->categories())->flatMap(
            fn (array $category) => collect($category['nests'])->map(fn ($nest) => array_merge($nest, [ 'category' => $category['name'] ]))
        )->values();
    }

    public function game(string $slug): ?array
    {
        return $this->games()->firstWhere('slug', $slug);
    }

    /**
     * @return array<int, array<string, mixed>> active plans of a game, cheapest first, with display strings
     */
    public function plans(int $nestId): array
    {
        return Product::query()
            ->where('nest_id', $nestId)
            ->where('is_active', true)
            ->orderBy('price')
            ->get()
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => (float) $product->price,
                'priceLabel' => self::money((float) $product->price),
                'memoryMb' => $product->memory,
                'specs' => [
                    'RAM' => self::size($product->memory),
                    'CPU' => self::cpu($product->cpu),
                    'Disque' => self::size($product->disk),
                    'Bases de données' => (string) $product->databases,
                    'Sauvegardes' => (string) $product->backups,
                    'Ports' => (string) $product->allocations,
                ],
            ])
            ->all();
    }

    /**
     * A self-contained answer to "what does a {game} server cost?", placed first
     * on the page so that a reader, or an AI assistant quoting the page, gets the
     * facts without needing the rest of the context.
     */
    public static function summary(string $game, array $plans): string
    {
        if (empty($plans)) {
            return "Aucune offre {$game} n’est disponible pour le moment.";
        }

        $count = count($plans);
        $memory = array_column($plans, 'memoryMb');
        $prices = array_column($plans, 'price');

        $range = $count === 1
            ? 'en 1 offre de ' . self::size($memory[0]) . ' de RAM à ' . self::money($prices[0]) . ' par mois'
            : "en {$count} offres, de " . self::size(min($memory)) . ' à ' . self::size(max($memory))
                . ' de RAM, de ' . self::money(min($prices)) . ' à ' . self::money(max($prices)) . ' par mois';

        return "Le serveur {$game} est proposé {$range}. Il est installé automatiquement après le paiement, "
            . 'avec protection anti-DDoS et stockage NVMe inclus sur toutes les offres.';
    }

    /** When the game or any of its plans last changed: the date shown as "prices updated on". */
    public function updatedAt(int $nestId): ?Carbon
    {
        $dates = array_filter([
            Nest::query()->whereKey($nestId)->value('updated_at'),
            Product::query()->where('nest_id', $nestId)->max('updated_at'),
        ]);

        return empty($dates) ? null : collect($dates)->map(fn ($date) => Carbon::parse($date))->max();
    }

    /** The plan a Minecraft server of the given size should buy, if any. */
    public function minecraftPlanFor(int $ramGb): ?array
    {
        $nest = Nest::query()->where('is_active', true)->get(['id', 'name'])
            ->first(fn (Nest $nest) => Str::contains(Str::lower($nest->name), 'minecraft'));

        if (is_null($nest)) {
            return null;
        }

        $plan = collect($this->plans($nest->id))->first(fn (array $plan) => $plan['memoryMb'] >= $ramGb * 1024);

        return is_null($plan) ? null : array_merge($plan, [ 'game' => $nest->name, 'gameSlug' => Str::slug($nest->name) ]);
    }

    public static function size(int $megabytes): string
    {
        if ($megabytes >= 1024) {
            $gb = $megabytes / 1024;

            return rtrim(rtrim(number_format($gb, 1, ',', ''), '0'), ',') . ' Go';
        }

        return $megabytes . ' Mo';
    }

    public static function cpu(int $percent): string
    {
        if ($percent === 0) {
            return 'Illimité';
        }

        $cores = round($percent / 100, 2);

        return str_replace('.', ',', (string) $cores) . ' vCore' . ($cores > 1 ? 's' : '');
    }

    public static function money(float $amount): string
    {
        return number_format($amount, 2, ',', ' ') . ' €';
    }
}
