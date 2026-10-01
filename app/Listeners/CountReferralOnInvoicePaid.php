<?php

namespace Pterodactyl\Listeners;

use Laravel\Cashier\Events\WebhookReceived;
use Pterodactyl\Services\Referrals\ReferralService;

/**
 * Feeds Stripe's "invoice.paid" webhooks to the referral programme, which
 * rewards a referrer once their filleul has paid enough months.
 */
class CountReferralOnInvoicePaid
{
    public function __construct(private ReferralService $referrals)
    {
    }

    public function handle(WebhookReceived $event): void
    {
        // Without a signature secret anybody could forge paid invoices and farm credit.
        if (empty(config('cashier.webhook.secret')) || ($event->payload['type'] ?? null) !== 'invoice.paid') {
            return;
        }

        $this->referrals->recordPaidInvoice($event->payload['data']['object'] ?? []);
    }
}
