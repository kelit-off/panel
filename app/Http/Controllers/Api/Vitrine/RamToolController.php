<?php

namespace Pterodactyl\Http\Controllers\Api\Vitrine;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Services\Storefront\Catalog;
use Pterodactyl\Services\Storefront\RamEstimator;
use Pterodactyl\Services\Storefront\RamToolGuide;
use Pterodactyl\Http\Controllers\Controller;

class RamToolController extends Controller
{
    public function estimate(Request $request, RamEstimator $estimator, Catalog $catalog): JsonResponse
    {
        $data = $request->validate([
            'loader' => [ 'required', Rule::in(RamEstimator::LOADERS) ],
            'mods' => [ 'nullable', 'integer', 'min:0', 'max:600' ],
            'weight' => [ 'nullable', Rule::in(RamEstimator::WEIGHTS) ],
            'players' => [ 'required', 'integer', 'min:1', 'max:500' ],
            'view' => [ 'required', 'integer', 'min:2', 'max:32' ],
        ]);

        $result = $estimator->estimate(
            $data['loader'],
            (int) ($data['mods'] ?? 0),
            $data['weight'] ?? 'standard',
            (int) $data['players'],
            (int) $data['view']
        );

        $plan = fn (int $gb) => ($found = $catalog->minecraftPlanFor($gb)) ? [
            'id' => $found['id'],
            'name' => $found['name'],
            'ram' => $found['specs']['RAM'],
            'priceLabel' => $found['priceLabel'],
            'game' => $found['game'],
            'gameSlug' => $found['gameSlug'],
        ] : null;

        return response()->json($result + [
            'plans' => [
                'minimum' => $plan($result['minimum_gb']),
                'recommended' => $plan($result['recommended_gb']),
            ],
        ]);
    }

    public function guide(RamToolGuide $guide): JsonResponse
    {
        return response()->json($guide->data());
    }
}
