<?php

namespace Pterodactyl\Services\WebHosting;

use Carbon\CarbonImmutable;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\ServerDomain;
use Pterodactyl\Exceptions\DisplayException;

class ServerDomainService
{
    public static function isWebsite(Server $server): bool
    {
        return in_array(config('webhosting.egg_feature'), $server->egg->inherit_features ?? [], true);
    }

    /**
     * Attaches a domain to a website and immediately checks its DNS, so a
     * correctly configured domain goes live without a second click.
     *
     * @throws \Pterodactyl\Exceptions\DisplayException
     */
    public function create(Server $server, string $input): ServerDomain
    {
        if (!self::isWebsite($server)) {
            throw new DisplayException('Ce service n\'est pas un site web : les domaines ne sont pas disponibles.');
        }

        $domain = $this->normalize($input);

        if ($server->domains()->count() >= config('webhosting.domain_limit')) {
            throw new DisplayException(sprintf('Ce site a atteint la limite de %d domaines.', config('webhosting.domain_limit')));
        }

        if (ServerDomain::query()->where('domain', $domain)->exists()) {
            throw new DisplayException('Ce domaine est déjà utilisé par un autre site.');
        }

        /** @var \Pterodactyl\Models\ServerDomain $model */
        $model = $server->domains()->create(['domain' => $domain]);

        return $this->verify($model);
    }

    /**
     * Marks the domain as verified when its DNS points at the node hosting the
     * website. A domain that stops pointing at us is not un-verified here: the
     * owner may be migrating DNS, and Caddy simply fails to renew in that case.
     */
    public function verify(ServerDomain $domain): ServerDomain
    {
        $resolved = $this->resolve($domain->domain);
        $expected = $this->nodeAddresses($domain->server->node);

        $domain->last_checked_at = CarbonImmutable::now();
        if (count(array_intersect($resolved, $expected)) > 0) {
            $domain->verified_at = $domain->verified_at ?? CarbonImmutable::now();
        }
        $domain->save();

        return $domain;
    }

    /**
     * Public addresses a domain must resolve to for it to be served by this node.
     *
     * @return string[]
     */
    public function nodeAddresses(Node $node): array
    {
        return array_values(array_unique(array_merge(
            $this->resolve($node->fqdn),
            config('webhosting.extra_ips', [])
        )));
    }

    /**
     * @throws \Pterodactyl\Exceptions\DisplayException
     */
    private function normalize(string $input): string
    {
        $domain = strtolower(trim($input));
        $domain = preg_replace('#^[a-z]+://#', '', $domain);
        $domain = rtrim(explode('/', $domain, 2)[0], '.');

        if (function_exists('idn_to_ascii') && preg_match('/[^\x20-\x7e]/', $domain)) {
            $domain = idn_to_ascii($domain, IDNA_DEFAULT, INTL_IDNA_VARIANT_UTS46) ?: $domain;
        }

        if (strlen($domain) > 253 || !preg_match('/^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))*\.[a-z]{2,63}$/', $domain)) {
            throw new DisplayException('Ce nom de domaine n\'est pas valide (exemple : monsite.fr ou www.monsite.fr).');
        }

        // Never let a customer route the panel's or a node's own hostname to their site.
        $reserved = Node::query()->pluck('fqdn')->map(fn ($fqdn) => strtolower($fqdn))->all();
        $reserved[] = strtolower((string) parse_url(config('app.url'), PHP_URL_HOST));
        if (in_array($domain, $reserved, true)) {
            throw new DisplayException('Ce domaine est réservé.');
        }

        return $domain;
    }

    /**
     * @return string[]
     */
    private function resolve(string $host): array
    {
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return [$host];
        }

        $records = @dns_get_record($host, DNS_A | DNS_AAAA) ?: [];
        $ips = array_map(fn (array $record) => $record['ip'] ?? $record['ipv6'] ?? null, $records);

        return array_values(array_unique(array_filter(array_merge($ips, @gethostbynamel($host) ?: []))));
    }
}
