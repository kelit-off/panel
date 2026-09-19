<?php

namespace Pterodactyl\Http\Requests\Api\Application\Categories;

use Pterodactyl\Models\Category;
use Pterodactyl\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreCategoryRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return collect(Category::getRules())->only([
            'name',
            'description',
            'is_active',
        ])->toArray();
    }
}
