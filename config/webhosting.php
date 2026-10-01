<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Web Hosting
    |--------------------------------------------------------------------------
    |
    | Servers whose egg declares this feature are treated as websites: they get
    | a "Domaines" tab and their verified domains are routed by the Caddy
    | reverse proxy running on their node (see webhosting/README.md).
    */
    'egg_feature' => 'web',

    // Maximum number of domains a single website can have.
    'domain_limit' => (int) env('WEBHOSTING_DOMAIN_LIMIT', 5),

    // Email given to Let's Encrypt for certificate expiry notices.
    'acme_email' => env('WEBHOSTING_ACME_EMAIL'),

    // Extra public IPs that count as "pointing to us" when verifying a domain's
    // DNS, comma separated. The IPs the node FQDN resolves to are always
    // accepted; list more here if a node has several public addresses.
    'extra_ips' => array_values(array_filter(array_map('trim', explode(',', (string) env('WEBHOSTING_EXTRA_IPS', ''))))),
];
