<?php

namespace Pterodactyl\Listeners;

use Pterodactyl\Models\Order;
use Laravel\Cashier\Events\WebhookReceived;
use Pterodactyl\Services\Orders\ServerProvisioningService;

/**
 * Reacts to Stripe's "customer.subscription.created/updated" webhooks: once a
 * subscription (created "incomplete" while the customer confirms payment on
 * our own Stripe Elements page) transitions to "active", marks the matching
 * Order as paid and kicks off automatic server provisioning. Listening on the
 * generic WebhookReceived event (fired for every Stripe event Cashier
 * receives) rather than overriding Cashier's WebhookController keeps all of
 * Cashier's own subscription-state syncing untouched.
 */
class ProvisionServerOnSubscriptionActivated
{
    private const HANDLED_EVENTS = [ 'customer.subscription.created', 'customer.subscription.updated' ];

    public function __construct(private ServerProvisioningService $provisioningService)
    {
    }

    public function handle(WebhookReceived $event): void
    {
        $payload = $event->payload;

        if (!in_array($payload['type'] ?? null, self::HANDLED_EVENTS, true)) {
            return;
        }

        $subscription = $payload['data']['object'] ?? [];

        if (($subscription['status'] ?? null) !== 'active') {
            return;
        }

        $orderId = $subscription['metadata']['order_id'] ?? null;

        if (is_null($orderId)) {
            return;
        }

        /** @var \Pterodactyl\Models\Order|null $order */
        $order = Order::query()->find($orderId);

        if (is_null($order) || $order->status !== Order::STATUS_PENDING) {
            return;
        }

        $order->update([
            'status' => Order::STATUS_PAID,
            'stripe_subscription_id' => $subscription['id'] ?? $order->stripe_subscription_id,
        ]);

        $this->provisioningService->handle($order->fresh());
    }
}
