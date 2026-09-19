<?php

namespace Pterodactyl\Services\Products;

use Pterodactyl\Models\Product;

class ProductCreationService
{
    /**
     * Create a new store product.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     */
    public function handle(array $data): Product
    {
        return Product::query()->create($data);
    }
}
