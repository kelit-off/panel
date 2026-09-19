<?php

namespace Pterodactyl\Http\Controllers\Api\Application\Categories;

use Illuminate\Http\Response;
use Pterodactyl\Models\Category;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Pterodactyl\Services\Categories\CategoryUpdateService;
use Pterodactyl\Services\Categories\CategoryCreationService;
use Pterodactyl\Services\Categories\CategoryDeletionService;
use Pterodactyl\Transformers\Api\Application\CategoryTransformer;
use Pterodactyl\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Pterodactyl\Http\Requests\Api\Application\Categories\GetCategoryRequest;
use Pterodactyl\Http\Requests\Api\Application\Categories\GetCategoriesRequest;
use Pterodactyl\Http\Requests\Api\Application\Categories\StoreCategoryRequest;
use Pterodactyl\Http\Requests\Api\Application\Categories\DeleteCategoryRequest;
use Pterodactyl\Http\Requests\Api\Application\Categories\UpdateCategoryRequest;

class CategoryController extends ApplicationApiController
{
    private CategoryCreationService $creationService;
    private CategoryDeletionService $deletionService;
    private CategoryUpdateService $updateService;

    public function __construct(
        CategoryCreationService $creationService,
        CategoryDeletionService $deletionService,
        CategoryUpdateService $updateService
    ) {
        parent::__construct();

        $this->creationService = $creationService;
        $this->deletionService = $deletionService;
        $this->updateService = $updateService;
    }

    /**
     * Return all of the store categories currently registered on the Panel.
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function index(GetCategoriesRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '10');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $categories = QueryBuilder::for(Category::query())
            ->allowedFilters(['name'])
            ->allowedSorts(['id', 'name'])
            ->paginate($perPage);

        return $this->fractal->collection($categories)
            ->transformWith(CategoryTransformer::class)
            ->toArray();
    }

    /**
     * Return a single store category.
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function view(GetCategoryRequest $request, Category $category): array
    {
        return $this->fractal->item($category)
            ->transformWith(CategoryTransformer::class)
            ->toArray();
    }

    /**
     * Store a new category on the Panel and return a HTTP/201 response code with
     * the new category attached.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->creationService->handle($request->validated());

        return $this->fractal->item($category)
            ->transformWith(CategoryTransformer::class)
            ->respond(201);
    }

    /**
     * Update a category on the Panel and return the updated record to the user.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function update(UpdateCategoryRequest $request, Category $category): array
    {
        $category = $this->updateService->handle($category, $request->validated());

        return $this->fractal->item($category)
            ->transformWith(CategoryTransformer::class)
            ->toArray();
    }

    /**
     * Delete a category from the Panel.
     */
    public function delete(DeleteCategoryRequest $request, Category $category): Response
    {
        $this->deletionService->handle($category);

        return $this->returnNoContent();
    }
}
