<?php

namespace Pterodactyl\Http\Controllers\Api\Application\Products;

use Illuminate\Http\Response;
use Pterodactyl\Models\Product;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Pterodactyl\Services\Products\ProductUpdateService;
use Pterodactyl\Services\Products\ProductCreationService;
use Pterodactyl\Services\Products\ProductDeletionService;
use Pterodactyl\Transformers\Api\Application\ProductTransformer;
use Pterodactyl\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Pterodactyl\Http\Requests\Api\Application\Products\GetProductRequest;
use Pterodactyl\Http\Requests\Api\Application\Products\GetProductsRequest;
use Pterodactyl\Http\Requests\Api\Application\Products\StoreProductRequest;
use Pterodactyl\Http\Requests\Api\Application\Products\DeleteProductRequest;
use Pterodactyl\Http\Requests\Api\Application\Products\UpdateProductRequest;

class ProductController extends ApplicationApiController
{
    private ProductCreationService $creationService;
    private ProductDeletionService $deletionService;
    private ProductUpdateService $updateService;

    public function __construct(
        ProductCreationService $creationService,
        ProductDeletionService $deletionService,
        ProductUpdateService $updateService
    ) {
        parent::__construct();

        $this->creationService = $creationService;
        $this->deletionService = $deletionService;
        $this->updateService = $updateService;
    }

    /**
     * Return all of the store products currently registered on the Panel.
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function index(GetProductsRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '10');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $products = QueryBuilder::for(Product::query())
            ->allowedFilters(['name'])
            ->allowedSorts(['id', 'name', 'price'])
            ->paginate($perPage);

        return $this->fractal->collection($products)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * Return a single store product.
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function view(GetProductRequest $request, Product $product): array
    {
        return $this->fractal->item($product)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * Store a new product on the Panel and return a HTTP/201 response code with
     * the new product attached.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->creationService->handle($request->validated());

        return $this->fractal->item($product)
            ->transformWith(ProductTransformer::class)
            ->respond(201);
    }

    /**
     * Update a product on the Panel and return the updated record to the user.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function update(UpdateProductRequest $request, Product $product): array
    {
        $product = $this->updateService->handle($product, $request->validated());

        return $this->fractal->item($product)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * Delete a product from the Panel.
     */
    public function delete(DeleteProductRequest $request, Product $product): Response
    {
        $this->deletionService->handle($product);

        return $this->returnNoContent();
    }
}
