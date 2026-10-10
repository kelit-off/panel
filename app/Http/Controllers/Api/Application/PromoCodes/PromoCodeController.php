<?php

namespace Pterodactyl\Http\Controllers\Api\Application\PromoCodes;

use Illuminate\Http\Response;
use Pterodactyl\Models\PromoCode;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Pterodactyl\Transformers\Api\Application\PromoCodeTransformer;
use Pterodactyl\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Pterodactyl\Http\Requests\Api\Application\PromoCodes\GetPromoCodesRequest;
use Pterodactyl\Http\Requests\Api\Application\PromoCodes\StorePromoCodeRequest;
use Pterodactyl\Http\Requests\Api\Application\PromoCodes\DeletePromoCodeRequest;
use Pterodactyl\Http\Requests\Api\Application\PromoCodes\UpdatePromoCodeRequest;

class PromoCodeController extends ApplicationApiController
{
    public function index(GetPromoCodesRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '10');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $codes = QueryBuilder::for(PromoCode::query())
            ->allowedFilters(...['code'])
            ->allowedSorts(...['id', 'code', 'created_at'])
            ->paginate($perPage);

        return $this->fractal->collection($codes)
            ->transformWith(PromoCodeTransformer::class)
            ->toArray();
    }

    public function store(StorePromoCodeRequest $request): JsonResponse
    {
        $data = $request->validated();
        // The month count only means something for a repeating coupon.
        if (($data['duration'] ?? null) !== PromoCode::DURATION_REPEATING) {
            $data['duration_in_months'] = null;
        }

        return $this->fractal->item(PromoCode::query()->create($data))
            ->transformWith(PromoCodeTransformer::class)
            ->respond(201);
    }

    public function update(UpdatePromoCodeRequest $request, PromoCode $promoCode): array
    {
        $promoCode->update($request->validated());

        return $this->fractal->item($promoCode)
            ->transformWith(PromoCodeTransformer::class)
            ->toArray();
    }

    public function delete(DeletePromoCodeRequest $request, PromoCode $promoCode): Response
    {
        $promoCode->delete();

        return $this->returnNoContent();
    }
}
