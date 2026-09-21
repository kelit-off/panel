<?php

namespace Pterodactyl\Http\Controllers\Api\Vitrine;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Http\Response;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Product;
use Pterodactyl\Models\StorefrontVisit;
use Pterodactyl\Http\Controllers\Controller;

class TrackController extends Controller
{
    private const BOT_PATTERN = '/bot|crawl|spider|slurp|headless|lighthouse|curl|wget|python|preview/i';

    /**
     * Records an anonymous page view of the storefront. Nothing that identifies
     * a person is stored: the visitor is a hash that changes every day, built
     * from the IP and user agent, which are then discarded.
     */
    public function store(Request $request): Response
    {
        $userAgent = (string) $request->userAgent();

        if ($request->header('DNT') === '1' || $userAgent === '' || preg_match(self::BOT_PATTERN, $userAgent)) {
            return response()->noContent();
        }

        // Staff browsing their own storefront must not distort the figures.
        if ($request->user() && $request->user()->root_admin) {
            return response()->noContent();
        }

        $data = $request->validate([
            'path' => [ 'required', 'string', 'max:200' ],
            'referrer' => [ 'nullable', 'string', 'max:300' ],
        ]);

        [ $kind, $nestId, $productId ] = $this->classify($data['path']);

        StorefrontVisit::query()->create([
            'visitor' => substr(hash_hmac('sha256', $request->ip() . '|' . $userAgent . '|' . now()->toDateString(), config('app.key')), 0, 32),
            'kind' => $kind,
            'nest_id' => $nestId,
            'product_id' => $productId,
            'referrer' => $this->referrerHost($data['referrer'] ?? null, $request->getHost()),
        ]);

        return response()->noContent();
    }

    /**
     * @return array{0: string, 1: int|null, 2: int|null}
     */
    private function classify(string $path): array
    {
        $path = '/' . trim($path, '/');

        if ($path === '/') {
            return [ StorefrontVisit::KIND_HOME, null, null ];
        }

        if (preg_match('#^/jeu/([^/]+)$#', $path, $matches)) {
            $nest = Nest::query()->get([ 'id', 'name' ])->first(fn (Nest $nest) => Str::slug($nest->name) === $matches[1]);

            return [ StorefrontVisit::KIND_GAME, $nest?->id, null ];
        }

        if (preg_match('#^/commande/(\d+)$#', $path, $matches)) {
            $product = Product::query()->find((int) $matches[1], [ 'id', 'nest_id' ]);

            return [ StorefrontVisit::KIND_CHECKOUT, $product?->nest_id, $product?->id ];
        }

        return [ StorefrontVisit::KIND_OTHER, null, null ];
    }

    private function referrerHost(?string $referrer, string $ownHost): ?string
    {
        if (empty($referrer)) {
            return null;
        }

        $host = parse_url($referrer, PHP_URL_HOST);

        if (!is_string($host) || $host === '' || $host === $ownHost) {
            return null;
        }

        return Str::limit(Str::lower(preg_replace('/^www\./i', '', $host)), 120, '');
    }
}
