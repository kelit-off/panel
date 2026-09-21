<?php

namespace Pterodactyl\Services\Storefront;

/**
 * Everything the public RAM calculator page says besides the interactive form:
 * the method, the FAQ and worked examples. The examples are computed with the
 * same estimator as the tool, so the page can never contradict its own results.
 */
class RamToolGuide
{
    private const SCENARIOS = [
        [ 'label' => 'Serveur vanilla entre amis', 'loader' => 'vanilla', 'mods' => 0, 'weight' => 'standard', 'players' => 5, 'view' => 10 ],
        [ 'label' => 'Serveur communautaire Paper', 'loader' => 'paper', 'mods' => 25, 'weight' => 'standard', 'players' => 30, 'view' => 10 ],
        [ 'label' => 'Modpack léger Fabric', 'loader' => 'fabric', 'mods' => 60, 'weight' => 'light', 'players' => 8, 'view' => 10 ],
        [ 'label' => 'Modpack de 150 mods', 'loader' => 'forge', 'mods' => 150, 'weight' => 'standard', 'players' => 10, 'view' => 10 ],
        [ 'label' => 'Modpack technique de 300 mods', 'loader' => 'forge', 'mods' => 300, 'weight' => 'heavy', 'players' => 10, 'view' => 10 ],
    ];

    private const LOADER_LABELS = [ 'vanilla' => 'Vanilla', 'paper' => 'Paper ou Spigot', 'fabric' => 'Fabric', 'forge' => 'Forge ou NeoForge' ];

    public function __construct(private RamEstimator $estimator, private Catalog $catalog)
    {
    }

    public function data(): array
    {
        $tool = config('storefront.ram_tool');

        return [
            'title' => $tool['title'],
            'intro' => $tool['intro'],
            'method' => $tool['method'],
            'disclaimer' => $tool['disclaimer'],
            'faqs' => $tool['faqs'],
            'scenarios' => array_map(function (array $scenario) {
                $result = $this->estimator->estimate($scenario['loader'], $scenario['mods'], $scenario['weight'], $scenario['players'], $scenario['view']);
                $plan = $this->catalog->minecraftPlanFor($result['recommended_gb']);
                $modded = in_array($scenario['loader'], [ 'fabric', 'forge' ], true);

                return [
                    'label' => $scenario['label'],
                    'summary' => self::LOADER_LABELS[$scenario['loader']]
                        . ($scenario['mods'] > 0 ? ', ' . $scenario['mods'] . ($modded ? ' mods' : ' plugins') : '')
                        . ', ' . $scenario['players'] . ' joueurs',
                    'minimumGb' => $result['minimum_gb'],
                    'recommendedGb' => $result['recommended_gb'],
                    'plan' => $plan ? [ 'id' => $plan['id'], 'name' => $plan['name'], 'priceLabel' => $plan['priceLabel'] ] : null,
                ];
            }, self::SCENARIOS),
        ];
    }
}
