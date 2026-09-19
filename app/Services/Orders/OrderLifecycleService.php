<?php

namespace Pterodactyl\Services\Orders;

use Throwable;
use Laravel\Cashier\Cashier;
use Pterodactyl\Models\Order;
use Stripe\Exception\InvalidRequestException;
use Pterodactyl\Services\Servers\SuspensionService;
use Pterodactyl\Services\Servers\ServerDeletionService;

/**
 * Handles what happens to a provisioned server once its subscription stops
 * being paid: suspension first, then deletion after a grace period.
 *
 * The order status is the source of truth. Suspension is re-attempted by
 * enforce() if Wings was unreachable when the webhook came in, so a failing
 * node never lets an unpaid server keep running.
 */
class OrderLifecycleService
{
    public function __construct(
        private SuspensionService $suspensionService,
        private ServerDeletionService $serverDeletionService
    ) {
    }

    /**
     * A renewal payment failed: suspend the server and start the deletion countdown.
     */
    public function paymentFailed(Order $order): void
    {
        if ($order->status !== Order::STATUS_ACTIVE) {
            return;
        }

        $order->update([
            'status' => Order::STATUS_SUSPENDED,
            'suspended_at' => now(),
            'terminate_at' => now()->addDays(config('billing.suspension_grace_days')),
        ]);

        $this->suspendServer($order);
    }

    /**
     * The subscription is over (cancelled by the customer, or by Stripe after
     * failed retries): suspend the server and delete it after a short delay.
     */
    public function subscriptionEnded(Order $order): void
    {
        if (in_array($order->status, [ Order::STATUS_CANCELLED, Order::STATUS_TERMINATED ], true)) {
            return;
        }

        if (is_null($order->server)) {
            $order->update([ 'status' => Order::STATUS_CANCELLED, 'terminate_at' => null ]);

            return;
        }

        $deadline = now()->addDays(config('billing.cancellation_grace_days'));
        if (!is_null($order->terminate_at) && $order->terminate_at->lt($deadline)) {
            $deadline = $order->terminate_at;
        }

        $order->update([
            'status' => Order::STATUS_CANCELLED,
            'suspended_at' => $order->suspended_at ?? now(),
            'terminate_at' => $deadline,
        ]);

        $this->suspendServer($order);
    }

    /**
     * A previously failed payment went through: give the server back. Errors
     * are deliberately not caught so that the webhook fails and Stripe retries
     * it, rather than leaving a paid customer with a suspended server.
     *
     * @throws \Throwable
     */
    public function paymentRecovered(Order $order): void
    {
        if ($order->status !== Order::STATUS_SUSPENDED) {
            return;
        }

        if (!is_null($order->server)) {
            $this->suspensionService->toggle($order->server, SuspensionService::ACTION_UNSUSPEND);
        }

        $order->update([
            'status' => Order::STATUS_ACTIVE,
            'suspended_at' => null,
            'terminate_at' => null,
            'error' => null,
        ]);
    }

    /**
     * Run periodically: re-suspends servers that should be suspended but are
     * not, and deletes the ones whose grace period is over.
     */
    public function enforce(): void
    {
        Order::query()
            ->whereIn('status', [ Order::STATUS_SUSPENDED, Order::STATUS_CANCELLED ])
            ->whereNotNull('server_id')
            ->with('server')
            ->each(function (Order $order) {
                if (is_null($order->server)) {
                    return;
                }

                if (!is_null($order->terminate_at) && $order->terminate_at->isPast()) {
                    $this->terminate($order);

                    return;
                }

                $this->suspendServer($order);
            });
    }

    /**
     * Ends the Stripe subscription if it is still running (so a card that
     * recovers later is not charged for a server that no longer exists), then
     * deletes the server. On any failure the order is left as is and retried
     * by the next enforce() run.
     */
    public function terminate(Order $order): void
    {
        $server = $order->server;

        try {
            if (!is_null($server)) {
                $this->cancelStripeSubscription($order);
                $this->serverDeletionService->handle($server);
            }
        } catch (Throwable $exception) {
            report($exception);
            $order->update([ 'error' => 'Suppression impossible : ' . $exception->getMessage() ]);

            return;
        }

        $order->update([
            'status' => Order::STATUS_TERMINATED,
            'server_id' => null,
            'error' => null,
        ]);
    }

    private function suspendServer(Order $order): void
    {
        if (is_null($order->server)) {
            return;
        }

        try {
            $this->suspensionService->toggle($order->server, SuspensionService::ACTION_SUSPEND);

            if (!is_null($order->error)) {
                $order->update([ 'error' => null ]);
            }
        } catch (Throwable $exception) {
            report($exception);
            $order->update([ 'error' => 'Suspension impossible : ' . $exception->getMessage() ]);
        }
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
