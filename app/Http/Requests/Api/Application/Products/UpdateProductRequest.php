<?php

namespace Pterodactyl\Http\Requests\Api\Application\Products;

use Pterodactyl\Models\Product;

class UpdateProductRequest extends StoreProductRequest
{
    public function rules(): array
    {
        $productId = $this->route()->parameter('product')->id;

        return collect(Product::getRulesForUpdate($productId))->only([
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
