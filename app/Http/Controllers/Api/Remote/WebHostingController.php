<?php

namespace Pterodactyl\Http\Controllers\Api\Remote;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\WebHosting\CaddyConfigurationService;

class WebHostingController extends Controller
{
    public function __construct(private CaddyConfigurationService $caddyConfigurationService)
    {
    }

    /**
     * Returns the Caddy configuration for the requesting node. Pulled by the
     * node's ptero-web-sync timer and authenticated with the Wings token.
     */
    public function caddy(Request $request): JsonResponse
    {
        /** @var \Pterodactyl\Models\Node $node */
        $node = $request->attributes->get('node');

        return new JsonResponse(
            $this->caddyConfigurationService->handle($node),
            JsonResponse::HTTP_OK,
            [],
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
        );
    }
}
