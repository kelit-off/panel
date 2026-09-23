<?php

/*
|--------------------------------------------------------------------------
| Legal identity
|--------------------------------------------------------------------------
|
| Everything here is read into the mentions légales, CGV, CGU and privacy
| policy pages. Values left as "[À COMPLÉTER...]" are shown highlighted on
| those pages so they are easy to spot before the site is opened to the
| public — fill them in via .env, nothing here needs a code change.
|
*/

return [
    'company' => [
        'name' => env('LEGAL_COMPANY_NAME', '[À COMPLÉTER — dénomination sociale]'),
        'form' => env('LEGAL_COMPANY_FORM', 'SASU'),
        'capital' => env('LEGAL_COMPANY_CAPITAL', '[À COMPLÉTER — capital social]'),
        'address' => env('LEGAL_COMPANY_ADDRESS', '[À COMPLÉTER — adresse du siège social]'),
        'rcs' => env('LEGAL_COMPANY_RCS', '[À COMPLÉTER — ville et numéro RCS]'),
        'siren' => env('LEGAL_COMPANY_SIREN', '[À COMPLÉTER — SIREN]'),
        'vat' => env('LEGAL_COMPANY_VAT', '[À COMPLÉTER — numéro de TVA intracommunautaire]'),
        'publication_director' => env('LEGAL_PUBLICATION_DIRECTOR', '[À COMPLÉTER — nom du directeur de la publication]'),
        'contact_email' => env('LEGAL_CONTACT_EMAIL', '[À COMPLÉTER — email de contact]'),
        'contact_phone' => env('LEGAL_CONTACT_PHONE', '[À COMPLÉTER — numéro de téléphone]'),
    ],

    'host' => [
        'name' => 'OVH SAS',
        'address' => '2 rue Kellermann, 59100 Roubaix, France',
        'note' => 'Adresse à vérifier sur ovhcloud.com/fr/mentions-legales avant publication.',
    ],

    'mediator' => [
        // Mandatory for a B2C site (Code de la consommation, art. L616-1) — join a
        // consumer mediator (paid, yearly) and publish their details here.
        'name' => env('LEGAL_MEDIATOR_NAME', '[À COMPLÉTER — nom du médiateur de la consommation, après adhésion]'),
        'url' => env('LEGAL_MEDIATOR_URL', '[À COMPLÉTER]'),
        'address' => env('LEGAL_MEDIATOR_ADDRESS', '[À COMPLÉTER]'),
    ],

    'sla' => [
        'uptime' => env('LEGAL_SLA_UPTIME', '[À COMPLÉTER — engagement de disponibilité, par ex. 99,5 %]'),
    ],

    'report_email' => env('LEGAL_REPORT_EMAIL', env('LEGAL_CONTACT_EMAIL', '[À COMPLÉTER — email de contact]')),

    'dpo_email' => env('LEGAL_DPO_EMAIL', env('LEGAL_CONTACT_EMAIL', '[À COMPLÉTER — email de contact]')),

    // How long identification data is kept after a customer's last order,
    // to satisfy any legal retention obligation. Left blank on purpose —
    // do not invent a duration, confirm it (accounting/tax rules can require
    // longer retention for invoices) before publishing the privacy policy.
    'retention_customer_data' => env('LEGAL_RETENTION_CUSTOMER_DATA', '[À COMPLÉTER — durée exacte, à confirmer]'),
    'retention_connection_logs' => env('LEGAL_RETENTION_CONNECTION_LOGS', '[À COMPLÉTER — durée exacte, à confirmer]'),
];
