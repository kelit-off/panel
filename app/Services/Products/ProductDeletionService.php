<?php

namespace Pterodactyl\Services\Products;

use Pterodactyl\Models\Product;

class ProductDeletionService
{
    /**
     * Delete a store product. Existing orders keep pointing at it as a
     * historical record (orders.product_id is nullable-on-delete), so this
     * is always safe to do.
     */
    public function handle(Product $product): ?bool
    {
        return $product->delete();
    }
}
