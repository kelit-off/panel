<?php

namespace Pterodactyl\Http\Controllers\Api\Application\Overview;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Services\Analytics\BusinessAnalyticsService;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Pterodactyl\Http\Requests\Api\Application\Overview\GetBusinessAnalyticsRequest;

class BusinessAnalyticsController extends ApplicationApiController
{
    public function __construct(private BusinessAnalyticsService $analytics)
    {
        parent::__construct();
    }

    public function revenue(GetBusinessAnalyticsRequest $request): JsonResponse
    {
        return response()->json($this->analytics->revenue($this->range($request)));
    }

    public function customers(GetBusinessAnalyticsRequest $request): JsonResponse
    {
        return response()->json($this->analytics->customers($this->range($request)));
    }

    public function funnel(GetBusinessAnalyticsRequest $request): JsonResponse
    {
        return response()->json($this->analytics->funnel($this->range($request)));
    }

    public function capacity(GetBusinessAnalyticsRequest $request): JsonResponse
    {
        return response()->json($this->analytics->capacity());
    }

    private function range(GetBusinessAnalyticsRequest $request): int
    {
        return (int) $request->query('range', 30);
    }
}
