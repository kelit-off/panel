<?php

namespace Pterodactyl\Services\WebHosting;

use Pterodactyl\Models\Node;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\ServerDomain;

/**
 * Builds the complete Caddy JSON configuration for a node. The node's sync
 * script pulls it and loads it into Caddy, which then routes every verified
 * domain on ports 80/443 to the website container behind it and obtains the
 * TLS certificates on its own.
 */
class CaddyConfigurationService
{
    public function handle(Node $node): array
    {
        $domains = ServerDomain::query()
            ->whereNotNull('verified_at')
            ->whereHas('server', fn ($query) => $query->where('node_id', $node->id))
            ->with('server.allocation')
            ->orderBy('domain')
            ->get();

        $routes = $domains->groupBy('server_id')
            ->map(fn ($domains) => $this->route($domains->first()->server, $domains->pluck('domain')->all()))
            ->values()
            ->all();

        // Requests for a host we do not serve.
        $routes[] = [
            'handle' => [$this->staticResponse(404, 'Aucun site n\'est configuré pour ce domaine.')],
        ];

        $config = [
            'admin' => ['listen' => '127.0.0.1:2019'],
            'apps' => [
                'http' => [
                    'servers' => [
                        'sites' => [
                            'listen' => [':443'],
                            'routes' => $routes,
                        ],
                    ],
                ],
            ],
        ];

        if ($email = config('webhosting.acme_email')) {
            $config['apps']['tls'] = [
                'automation' => [
                    'policies' => [['issuers' => [['module' => 'acme', 'email' => $email]]]],
                ],
            ];
        }

        return $config;
    }

    private function route(Server $server, array $hosts): array
    {
        if ($server->isSuspended()) {
            $handle = [$this->staticResponse(503, 'Ce site est temporairement suspendu.')];
        } else {
            $handle = [
                ['handler' => 'encode', 'encodings' => ['zstd' => new \stdClass(), 'gzip' => new \stdClass()], 'prefer' => ['zstd', 'gzip']],
                ['handler' => 'reverse_proxy', 'upstreams' => [['dial' => $this->upstream($server)]]],
            ];
        }

        return [
            'match' => [['host' => $hosts]],
            'handle' => $handle,
            'terminal' => true,
        ];
    }

    /**
     * Website allocations are expected to be bound to 127.0.0.1 so only Caddy
     * can reach them; a wildcard bind is reached through loopback as well.
     */
    private function upstream(Server $server): string
    {
        $ip = $server->allocation->ip;
        if (in_array($ip, ['0.0.0.0', '::'], true)) {
            $ip = '127.0.0.1';
        }

        return sprintf(str_contains($ip, ':') ? '[%s]:%d' : '%s:%d', $ip, $server->allocation->port);
    }

    private function staticResponse(int $status, string $message): array
    {
        return [
            'handler' => 'static_response',
            'status_code' => $status,
            'headers' => ['Content-Type' => ['text/plain; charset=utf-8']],
            'body' => $message,
        ];
    }
}
