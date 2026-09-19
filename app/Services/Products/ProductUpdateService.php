<?php

namespace Pterodactyl\Services\Products;

use Pterodactyl\Models\Product;

class ProductUpdateService
{
    /**
     * Update an existing store product.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     */
    public function handle(Product $product, array $data): Product
    {
        $product->update($data);

        return $product;
    }
}
