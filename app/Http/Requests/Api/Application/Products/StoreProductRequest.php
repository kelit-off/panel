<?php

namespace Pterodactyl\Http\Requests\Api\Application\Products;

use Pterodactyl\Models\Product;
use Pterodactyl\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreProductRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return collect(Product::getRules())->only([
            'nest_id',
            'name',
            'description',
            'price',
            'stripe_price_id',
            'memory',
            'swap',
            'disk',
            'io',
            'cpu',
            'databases',
            'backups',
            'allocations',
            'is_active',
        ])->toArray();
    }
}
