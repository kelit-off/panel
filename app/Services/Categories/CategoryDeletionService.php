<?php

namespace Pterodactyl\Services\Categories;

use Pterodactyl\Models\Category;

class CategoryDeletionService
{
    /**
     * Delete a category. Nests assigned to it keep existing, just uncategorized
     * (nests.category_id is nullable-on-delete), so this is always safe.
     */
    public function handle(Category $category): ?bool
    {
        return $category->delete();
    }
}
