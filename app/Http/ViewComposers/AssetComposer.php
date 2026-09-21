<?php

namespace Pterodactyl\Http\ViewComposers;

use Illuminate\View\View;
use Pterodactyl\Services\Storefront\Catalog;
use Pterodactyl\Services\Helpers\AssetHashService;

class AssetComposer
{
    /**
     * @var \Pterodactyl\Services\Helpers\AssetHashService
     */
    private $assetHashService;

    private Catalog $catalog;

    /**
     * AssetComposer constructor.
     */
    public function __construct(AssetHashService $assetHashService, Catalog $catalog)
    {
        $this->assetHashService = $assetHashService;
        $this->catalog = $catalog;
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
            // Tree of categories -> games for the storefront navigation. Plans are
            // fetched on demand once a visitor picks a specific game.
            'categories' => $this->catalog->categories(),
            'hero' => config('storefront.hero'),
            'faqs' => config('storefront.faqs'),
            'inclusions' => config('storefront.inclusions'),
        ]);
    }
}
