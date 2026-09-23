<?php

namespace Pterodactyl\Services\Orders;

use Carbon\Carbon;
use Laravel\Cashier\Cashier;
use Pterodactyl\Models\Order;
use Stripe\Exception\InvalidRequestException;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Services\Servers\ServerDeletionService;

/**
 * Customer-initiated ways to stop paying: a plain cancellation (Code de la
 * consommation, résiliation en trois clics) and, within the 14-day withdrawal
 * window (art. L221-18 s.), a withdrawal refunded pro rata for the days
 * already used (art. L221-25).
 *
 * Both act on Stripe directly and let the existing webhook listener
 * (SuspendServerOnSubscriptionEnded) do the local suspend/terminate bookkeeping
 * — this service never duplicates that logic, it only triggers it.
 */
class OrderCancellationService
{
    private const WITHDRAWAL_DAYS = 14;

    public function __construct(private ServerDeletionService $serverDeletionService)
    {
    }

    public function canWithdraw(Order $order): bool
    {
        return !is_null($order->paid_at)
            && !in_array($order->status, [ Order::STATUS_CANCELLED, Order::STATUS_TERMINATED ], true)
            && now()->lte($order->paid_at->copy()->addDays(self::WITHDRAWAL_DAYS));
    }

    /**
     * Plain cancellation: takes effect immediately, no refund for the days
     * left in the period already paid for. Cancelling the Stripe subscription
     * fires customer.subscription.deleted, which the webhook listener turns
     * into a suspension followed by deletion after the grace period.
     *
     * @throws \Pterodactyl\Exceptions\DisplayException
     */
    public function cancel(Order $order): void
    {
        if (in_array($order->status, [ Order::STATUS_CANCELLED, Order::STATUS_TERMINATED ], true)) {
            return;
        }

        $this->cancelStripeSubscription($order);
    }

    /**
     * Withdrawal: refunds the unused part of the current period, then ends the
     * subscription and deletes the server right away (unlike a plain
     * cancellation, there is no reason to keep it running once refunded).
     *
     * @throws \Pterodactyl\Exceptions\DisplayException
     */
    public function withdraw(Order $order): float
    {
        if (!$this->canWithdraw($order)) {
            throw new DisplayException('Le délai de rétractation de 14 jours est dépassé pour cette commande.');
        }

        $refund = $this->refundUnusedDays($order);
        $this->cancelStripeSubscription($order);

        if (!is_null($order->server)) {
            try {
                $this->serverDeletionService->handle($order->server);
            } catch (\Throwable $exception) {
                report($exception);
                // The refund and subscription cancellation already went through — the
                // periodic enforce() sweep will retry deleting the server, matching how
                // OrderLifecycleService::terminate() handles the same failure mode.
            }
        }

        $order->update([
            'status' => Order::STATUS_CANCELLED,
            'ended_at' => now(),
            'refunded_amount' => $refund,
            'server_id' => null,
        ]);

        return $refund;
    }

    /**
     * Refunds the price of the plan minus what corresponds to the days already
     * enjoyed since payment, at a flat rate of price / 30. Returns 0 without
     * calling Stripe if nothing is owed back.
     */
    private function refundUnusedDays(Order $order): float
    {
        $price = (float) ($order->product->price ?? 0);
        if ($price <= 0) {
            return 0.0;
        }

        $daysUsed = max(0, Carbon::parse($order->paid_at)->diffInDays(now()));
        $owed = round(($price / 30) * $daysUsed, 2);
        $refund = max(0.0, round($price - $owed, 2));

        if ($refund <= 0) {
            return 0.0;
        }

        $paymentIntent = $this->latestPaymentIntent($order);
        if (is_null($paymentIntent)) {
            // Nothing to refund against (e.g. the first invoice never actually
            // captured a payment) — record no refund rather than fail the withdrawal.
            return 0.0;
        }

        Cashier::stripe()->refunds->create([
            'payment_intent' => $paymentIntent,
            'amount' => (int) round($refund * 100),
            'reason' => 'requested_by_customer',
        ]);

        return $refund;
    }

    private function latestPaymentIntent(Order $order): ?string
    {
        if (is_null($order->stripe_subscription_id)) {
            return null;
        }

        $invoices = Cashier::stripe()->invoices->all([
            'subscription' => $order->stripe_subscription_id,
            'status' => 'paid',
            'limit' => 1,
        ]);

        return $invoices->data[0]->payment_intent ?? null;
    }

    private function cancelStripeSubscription(Order $order): void
    {
        if (is_null($order->stripe_subscription_id)) {
            return;
        }

        try {
            $subscription = Cashier::stripe()->subscriptions->retrieve($order->stripe_subscription_id);

            if ($subscription->status !== 'canceled') {
                Cashier::stripe()->subscriptions->cancel($order->stripe_subscription_id);
            }
        } catch (InvalidRequestException $exception) {
            if ($exception->getStripeCode() !== 'resource_missing') {
                throw $exception;
            }
        }
    }
}
