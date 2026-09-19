<?php

namespace Pterodactyl\Http\Requests\Api\Application\Categories;

use Pterodactyl\Models\Category;

class UpdateCategoryRequest extends StoreCategoryRequest
{
    public function rules(): array
    {
        $categoryId = $this->route()->parameter('category')->id;

        return collect(Category::getRulesForUpdate($categoryId))->only([
            'name',
            'description',
            'is_active',
        ])->toArray();
    }
}
