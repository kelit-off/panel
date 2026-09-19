<?php

namespace Pterodactyl\Transformers\Api\Application;

use Pterodactyl\Models\Category;
use Pterodactyl\Transformers\Api\Transformer;

class CategoryTransformer extends Transformer
{
    public function getResourceName(): string
    {
        return Category::RESOURCE_NAME;
    }

    public function transform(Category $model): array
    {
        return [
            'id' => $model->id,
            'name' => $model->name,
            'description' => $model->description,
            'is_active' => $model->is_active,
            $model->getUpdatedAtColumn() => self::formatTimestamp($model->updated_at),
            $model->getCreatedAtColumn() => self::formatTimestamp($model->created_at),
        ];
    }
}
