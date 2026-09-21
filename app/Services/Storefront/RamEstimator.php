<?php

namespace Pterodactyl\Services\Storefront;

/**
 * Rough memory estimate for a Minecraft server.
 *
 * This is a heuristic built from commonly shared community guidance, not a
 * measurement: the constants below are documented on the public tool page
 * (config/storefront.php, ram_tool.method) and must be kept in sync with it.
 */
class RamEstimator
{
    public const LOADERS = [ 'vanilla', 'paper', 'fabric', 'forge' ];
    public const WEIGHTS = [ 'light', 'standard', 'heavy' ];

    /** Sizes a server is typically sold in, in GB. */
    private const TIERS = [ 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, 48, 64 ];

    private const HEADROOM = 1.2;

    private const WEIGHT_FACTORS = [ 'light' => 0.8, 'standard' => 1.0, 'heavy' => 1.25 ];

    /**
     * @return array{
     *     minimum_gb: int,
     *     recommended_gb: int,
     *     estimate_gb: float,
     *     breakdown: array<int, array{label: string, gb: float}>
     * }
     */
    public function estimate(string $loader, int $modsOrPlugins, string $weight, int $players, int $viewDistance): array
    {
        $modded = in_array($loader, [ 'fabric', 'forge' ], true);
        $breakdown = [];

        if ($modded) {
            $mods = $modsOrPlugins > 0 ? 0.31 * pow($modsOrPlugins, 0.579) : 0.0;
            $base = max(1.5, $mods) * self::WEIGHT_FACTORS[$weight];
            $breakdown[] = [ 'label' => $modsOrPlugins > 0 ? "Serveur et {$modsOrPlugins} mods" : 'Serveur moddé sans mod', 'gb' => $base ];
        } else {
            $base = $loader === 'paper' ? 1.5 : 1.0;
            $breakdown[] = [ 'label' => $loader === 'paper' ? 'Serveur Paper ou Spigot' : 'Serveur vanilla', 'gb' => $base ];

            if ($loader === 'paper' && $modsOrPlugins > 0) {
                $breakdown[] = [ 'label' => "{$modsOrPlugins} plugins", 'gb' => $modsOrPlugins * 0.03 ];
            }
        }

        $perPlayer = 0.06 * pow($viewDistance / 10, 1.5) * ($modded ? 1.3 : 1.0);
        $breakdown[] = [ 'label' => "{$players} joueurs, distance d’affichage {$viewDistance}", 'gb' => $players * $perPlayer ];

        $estimate = array_sum(array_column($breakdown, 'gb'));

        return [
            'minimum_gb' => $this->tier($estimate),
            'recommended_gb' => $this->tier($estimate * self::HEADROOM),
            'estimate_gb' => round($estimate, 1),
            'breakdown' => array_map(fn (array $row) => [ 'label' => $row['label'], 'gb' => round($row['gb'], 1) ], $breakdown),
        ];
    }

    /** Smallest usual server size that holds the given amount. */
    private function tier(float $gb): int
    {
        foreach (self::TIERS as $tier) {
            if ($gb <= $tier) {
                return $tier;
            }
        }

        return end(self::TIERS);
    }
}
