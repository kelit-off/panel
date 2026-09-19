<?php

namespace Pterodactyl\Listeners;

use Pterodactyl\Models\Order;
use Laravel\Cashier\Events\WebhookReceived;
use Pterodactyl\Services\Orders\OrderLifecycleService;

/**
 * Counterpart of ProvisionServerOnSubscriptionActivated for the end of a
 * subscription's life: failed payments, cancellations and recoveries.
 */
class SuspendServerOnSubscriptionEnded
{
    public function __construct(private OrderLifecycleService $lifecycleService)
    {
    }

    public function handle(WebhookReceived $event): void
    {
        // Cashier only verifies Stripe's signature when a secret is configured; without one
        // anybody could POST a fake event and suspend or delete a customer's server.
        if (empty(config('cashier.webhook.secret'))) {
            return;
        }

        $type = $event->payload['type'] ?? null;
        $object = $event->payload['data']['object'] ?? [];

        switch ($type) {
            case 'customer.subscription.deleted':
                $this->withOrder($this->findOrder($object['id'] ?? null, $object), fn (Order $order) => $this->lifecycleService->subscriptionEnded($order));
                break;

            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($object);
                break;

            case 'invoice.payment_failed':
                $subscriptionId = $object['subscription'] ?? $object['parent']['subscription_details']['subscription'] ?? null;
                $this->withOrder($this->findOrder($subscriptionId), fn (Order $order) => $this->lifecycleService->paymentFailed($order));
                break;
        }
    }

    private function handleSubscriptionUpdated(array $subscription): void
    {
        $order = $this->findOrder($subscription['id'] ?? null, $subscription);

        switch ($subscription['status'] ?? null) {
            case 'past_due':
            case 'unpaid':
                $this->withOrder($order, fn (Order $order) => $this->lifecycleService->paymentFailed($order));
                break;

            case 'canceled':
            case 'incomplete_expired':
                $this->withOrder($order, fn (Order $order) => $this->lifecycleService->subscriptionEnded($order));
                break;

            case 'active':
                $this->withOrder($order, fn (Order $order) => $this->lifecycleService->paymentRecovered($order));
                break;
        }
    }

    private function findOrder(?string $subscriptionId, array $subscription = []): ?Order
    {
        $order = is_null($subscriptionId)
            ? null
            : Order::query()->where('stripe_subscription_id', $subscriptionId)->first();

        if (is_null($order) && isset($subscription['metadata']['order_id'])) {
            $order = Order::query()->find($subscription['metadata']['order_id']);
        }

        return $order;
    }

    private function withOrder(?Order $order, callable $callback): void
    {
        if (!is_null($order)) {
            $callback($order);
        }
    }
}
