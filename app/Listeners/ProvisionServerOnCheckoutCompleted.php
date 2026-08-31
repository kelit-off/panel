<?php

namespace Pterodactyl\Listeners;

use Pterodactyl\Models\Order;
use Laravel\Cashier\Events\WebhookReceived;
use Pterodactyl\Services\Orders\ServerProvisioningService;

/**
 * Reacts to Stripe's "checkout.session.completed" webhook: marks the matching
 * Order as paid and kicks off automatic server provisioning. Listening on the
 * generic WebhookReceived event (fired for every Stripe event Cashier
 * receives) rather than overriding Cashier's WebhookController keeps all of
 * Cashier's own subscription-state handling untouched.
 */
class ProvisionServerOnCheckoutCompleted
{
    public function __construct(private ServerProvisioningService $provisioningService)
    {
    }

    public function handle(WebhookReceived $event): void
    {
        $payload = $event->payload;

        if (($payload['type'] ?? null) !== 'checkout.session.completed') {
            return;
        }

        $session = $payload['data']['object'] ?? [];
        $orderId = $session['metadata']['order_id'] ?? null;

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
            'stripe_checkout_session_id' => $session['id'] ?? null,
            'stripe_subscription_id' => $session['subscription'] ?? null,
        ]);

        $this->provisioningService->handle($order->fresh());
    }
}
