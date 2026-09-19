<?php

namespace Pterodactyl\Services\Categories;

use Pterodactyl\Models\Category;

class CategoryUpdateService
{
    /**
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     */
    public function handle(Category $category, array $data): Category
    {
        $category->update($data);

        return $category;
    }
}
