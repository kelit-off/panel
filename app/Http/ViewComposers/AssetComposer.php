<?php

namespace Pterodactyl\Http\ViewComposers;

use Illuminate\View\View;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Category;
use Pterodactyl\Services\Helpers\AssetHashService;

class AssetComposer
{
    /**
     * @var \Pterodactyl\Services\Helpers\AssetHashService
     */
    private $assetHashService;

    /**
     * AssetComposer constructor.
     */
    public function __construct(AssetHashService $assetHashService)
    {
        $this->assetHashService = $assetHashService;
    }

    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view)
    {
        $view->with('asset', $this->assetHashService);
        $view->with('siteConfiguration', [
            'name' => config('app.name') ?? 'Pterodactyl',
            'locale' => config('app.locale') ?? 'en',
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
            'analytics' => config('app.analytics') ?? '',
            'features' => [
                'pullFiles' => config('features.pull_files'),
            ],
            'categories' => $this->getCategories(),
        ]);
    }

    /**
     * Cached, lightweight tree of categories -> nests (games) so the public
     * landing page can build its "Jeux" navigation directly from the storefront
     * structure configured in the admin panel. Plans are fetched on demand once
     * a visitor picks a specific game.
     */
    private function getCategories(): array
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
                            // Cheapest active plan for this game, used as the "starting from"
                            // price shown in the storefront navigation.
                            'fromPrice' => $nest->products()
                                ->where('is_active', true)
                                ->orderBy('price')
                                ->value('price'),
                        ])
                        ->values(),
                ])
                // A category with every nest hidden shouldn't show up as an empty entry.
                ->filter(fn (array $category) => $category['nests']->isNotEmpty())
                ->values()
                ->toArray();
        });
    }
}
