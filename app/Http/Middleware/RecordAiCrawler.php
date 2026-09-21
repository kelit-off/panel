<?php

namespace Pterodactyl\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Counts visits from known AI crawlers on the public pages so the admin can see
 * whether assistants actually read the site. Recording must never get in the
 * way of serving the page, hence the swallowed exceptions.
 */
class RecordAiCrawler
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        try {
            $this->record($request, $response->getStatusCode());
        } catch (\Throwable $exception) {
            report($exception);
        }

        return $response;
    }

    private function record(Request $request, int $status): void
    {
        $agent = (string) $request->userAgent();

        // Only pages that exist: crawlers probing random URLs must not grow the table.
        if ($agent === '' || $status >= 400 || !$request->isMethod('GET')) {
            return;
        }

        foreach (config('storefront.ai_bots', []) as $bot) {
            if (!empty($bot['token_only']) || stripos($agent, $bot['name']) === false) {
                continue;
            }

            DB::table('ai_crawler_hits')->upsert(
                [ [ 'bot' => $bot['name'], 'path' => substr('/' . ltrim($request->path(), '/'), 0, 190), 'day' => now()->toDateString(), 'hits' => 1 ] ],
                [ 'bot', 'path', 'day' ],
                [ 'hits' => DB::raw('hits + 1') ]
            );

            return;
        }
    }
}
