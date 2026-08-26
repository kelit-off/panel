<?php

namespace Pterodactyl\Http\ViewComposers;

use Illuminate\View\View;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\Models\Nest;
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
            'nests' => $this->getNests(),
        ]);
    }

    /**
     * Cached, lightweight list of nests and their eggs so the public landing
     * page can build its "Jeux" navigation directly from the game categories
     * configured in the admin panel.
     */
    private function getNests(): array
    {
        return Cache::remember('landing.nests', now()->addMinutes(15), function () {
            return Nest::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Nest $nest) => [
                    'id' => $nest->id,
                    'name' => $nest->name,
                    'eggs' => $nest->eggs()
                        ->where('is_active', true)
                        ->orderBy('name')
                        ->get(['id', 'name'])
                        ->map(fn ($egg) => ['id' => $egg->id, 'name' => $egg->name])
                        ->values(),
                ])
                // A nest with every egg hidden shouldn't show up as an empty category.
                ->filter(fn (array $nest) => $nest['eggs']->isNotEmpty())
                ->values()
                ->toArray();
        });
    }
}
