<?php

namespace Pterodactyl\Transformers\Api\Application;

use Pterodactyl\Models\Product;
use Pterodactyl\Transformers\Api\Transformer;

class ProductTransformer extends Transformer
{
    public function getResourceName(): string
    {
        return Product::RESOURCE_NAME;
    }

    public function transform(Product $model): array
    {
        return [
            'id' => $model->id,
            'nest_id' => $model->nest_id,
            'name' => $model->name,
            'description' => $model->description,
            'price' => $model->price,
            'stripe_price_id' => $model->stripe_price_id,
            'memory' => $model->memory,
            'swap' => $model->swap,
            'disk' => $model->disk,
            'io' => $model->io,
            'cpu' => $model->cpu,
            'databases' => $model->databases,
            'backups' => $model->backups,
            'allocations' => $model->allocations,
            'is_active' => $model->is_active,
            $model->getUpdatedAtColumn() => self::formatTimestamp($model->updated_at),
            $model->getCreatedAtColumn() => self::formatTimestamp($model->created_at),
        ];
    }
}
