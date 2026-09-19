<?php

namespace Pterodactyl\Services\Categories;

use Pterodactyl\Models\Category;

class CategoryCreationService
{
    /**
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     */
    public function handle(array $data): Category
    {
        return Category::query()->create($data);
    }
}
