<?php

namespace Pterodactyl\Http\Controllers\Api\Vitrine;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Product;
use Pterodactyl\Http\Controllers\Controller;

class GameController extends Controller
{
    public function nestProducts(string $slug): JsonResponse
    {
        $nest = Nest::query()->get()->first(fn (Nest $nest) => Str::slug($nest->name) === $slug);
        abort_if($nest === null, 404);

        return response()->json([
            'nest' => [
                'id' => $nest->id,
                'name' => $nest->name,
                'description' => $nest->description,
            ],
            'products' => $nest->products()
                ->where('is_active', true)
                ->orderBy('price')
                ->get()
                ->map(fn (Product $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => $product->price,
                    'memory' => $product->memory,
                    'disk' => $product->disk,
                    'cpu' => $product->cpu,
                    'databases' => $product->databases,
                    'backups' => $product->backups,
                    'allocations' => $product->allocations,
                ])
                ->values(),
        ]);
    }
}
