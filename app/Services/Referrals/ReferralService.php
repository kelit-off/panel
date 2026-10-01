<?php

namespace Pterodactyl\Services\Referrals;

use Throwable;
use Illuminate\Support\Str;
use Laravel\Cashier\Cashier;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Order;
use Pterodactyl\Models\Referral;
use Stripe\Exception\InvalidRequestException;

/**
 * Referral programme: a filleul gets a discount on their first month, the
 * parrain gets a credit once the filleul has genuinely paid several months.
 *
 * Money only ever moves through Stripe (discount coupon on the subscription,
 * credit on the referrer's customer balance); this class decides who is
 * entitled to what.
 */
class ReferralService
{
    private const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public function enabled(): bool
    {
        return (bool) config('referral.enabled');
    }

    /**
     * The user's shareable code, generated the first time it is needed.
     */
    public function codeFor(User $user): string
    {
        if (!empty($user->referral_code)) {
            return $user->referral_code;
        }

        do {
            $code = '';
            for ($i = 0; $i < 8; ++$i) {
                $code .= self::CODE_ALPHABET[random_int(0, strlen(self::CODE_ALPHABET) - 1)];
            }
        } while (User::query()->where('referral_code', $code)->exists());

        // Updated straight in the database: going through save() would run the
        // model's full validation for a column that is not user-editable.
        User::query()->whereKey($user->id)->update([ 'referral_code' => $code ]);
        $user->referral_code = $code;

        return $code;
    }

    /**
     * Links a freshly registered customer to the owner of a code. Never
     * throws and never blocks the registration: an unknown or abusive code
     * is simply ignored.
     */
    public function attach(User $referee, ?string $code, ?string $ip): ?Referral
    {
        $code = Str::upper(trim((string) $code));
        if (!$this->enabled() || $code === '') {
            return null;
        }

        $referrer = User::query()->where('referral_code', $code)->first();
        if (is_null($referrer) || $referrer->id === $referee->id) {
            return null;
        }

        // A household or office farming rewards shares one IP with the referrer's earlier filleuls.
        if (!empty($ip) && Referral::query()->where('referrer_id', $referrer->id)->where('ip_address', $ip)->exists()) {
            return null;
        }

        try {
            return Referral::query()->create([
                'referrer_id' => $referrer->id,
                'referee_id' => $referee->id,
                'status' => Referral::STATUS_PENDING,
                'ip_address' => $ip,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }
    }

    /**
     * Percentage taken off the first month of a customer's first paid order,
     * or null when they are not entitled to it.
     */
    public function discountPercent(User $user): ?int
    {
        $percent = (int) config('referral.referee_discount_percent');
        if (!$this->enabled() || $percent <= 0 || is_null($this->discountableReferral($user))) {
            return null;
        }

        return min($percent, 100);
    }

    /**
     * Reserves the discount for a new order and returns the Stripe coupon id.
     * A previous, still unpaid checkout that held the discount is cancelled so
     * that opening several checkouts cannot cash it in more than once.
     */
    public function claimDiscount(User $user, Order $order): ?string
    {
        $percent = $this->discountPercent($user);
        $referral = $this->discountableReferral($user);
        if (is_null($percent) || is_null($referral)) {
            return null;
        }

        $previous = $referral->discount_order_id
            ? Order::query()->find($referral->discount_order_id)
            : null;

        if ($previous && $previous->id !== $order->id) {
            $this->abandon($previous);
        }

        $referral->update([ 'discount_order_id' => $order->id ]);

        return $this->couponId($percent);
    }

    /**
     * Called for every successful subscription invoice. Counts it towards the
     * referral of its customer and pays the referrer once enough months are in.
     *
     * @throws \Throwable when the credit could not be applied, so the webhook is retried
     */
    public function recordPaidInvoice(array $invoice): void
    {
        $invoiceId = $invoice['id'] ?? null;
        $customerId = $invoice['customer'] ?? null;
        $reason = $invoice['billing_reason'] ?? null;

        // A fully discounted or zero invoice is not a month the filleul paid for.
        if (!$this->enabled() || !$invoiceId || !$customerId || ($invoice['amount_paid'] ?? 0) <= 0
            || !in_array($reason, [ 'subscription_create', 'subscription_cycle' ], true)) {
            return;
        }

        $referee = User::query()->where('stripe_id', $customerId)->first();
        $referral = $referee
            ? Referral::query()->where('referee_id', $referee->id)->where('status', Referral::STATUS_PENDING)->first()
            : null;
        if (is_null($referral)) {
            return;
        }

        $paid = $referral->paid_invoice_ids ?? [];
        if (!in_array($invoiceId, $paid, true)) {
            $paid[] = $invoiceId;
            $referral->update([ 'paid_invoice_ids' => $paid ]);
        }

        if (count($paid) >= (int) config('referral.required_paid_months')) {
            $this->reward($referral->fresh());
        }
    }

    /**
     * Credits the referrer. The pending -> rewarded switch is a single atomic
     * UPDATE, so two simultaneous webhooks (or a Stripe retry) cannot pay twice.
     *
     * @throws \Throwable
     */
    private function reward(Referral $referral): void
    {
        $amount = (float) config('referral.reward_amount');
        $referrer = $referral->referrer;

        if (is_null($referrer) || $amount <= 0 || !$this->refereeStillCustomer($referral->referee_id)) {
            return;
        }

        $rewarded = Referral::query()->where('referrer_id', $referrer->id)->where('status', Referral::STATUS_REWARDED)->count();
        if ($rewarded >= (int) config('referral.max_rewards_per_user')) {
            $referral->update([ 'status' => Referral::STATUS_REJECTED ]);

            return;
        }

        $claimed = Referral::query()
            ->whereKey($referral->id)
            ->where('status', Referral::STATUS_PENDING)
            ->update([ 'status' => Referral::STATUS_REWARDED, 'reward_amount' => $amount, 'rewarded_at' => now() ]);
        if ($claimed !== 1) {
            return;
        }

        try {
            $referrer->createOrGetStripeCustomer();
            $referrer->creditBalance(
                (int) round($amount * 100),
                'Parrainage : un filleul a réglé ses premiers mois.',
                [ 'metadata' => [ 'referral_id' => (string) $referral->id ] ]
            );
        } catch (Throwable $exception) {
            Referral::query()->whereKey($referral->id)->update([ 'status' => Referral::STATUS_PENDING, 'reward_amount' => null, 'rewarded_at' => null ]);

            throw $exception;
        }
    }

    /**
     * No reward for a filleul who got refunded through the withdrawal right or
     * whose service has already ended.
     */
    private function refereeStillCustomer(int $refereeId): bool
    {
        $orders = Order::query()->where('user_id', $refereeId)->whereNotNull('paid_at')->get();

        return $orders->isNotEmpty()
            && $orders->every(fn (Order $order) => (float) $order->refunded_amount <= 0)
            && $orders->contains(fn (Order $order) => in_array($order->status, [ Order::STATUS_ACTIVE, Order::STATUS_PAID, Order::STATUS_SUSPENDED ], true));
    }

    /**
     * The referral that still entitles its filleul to the first-month
     * discount: they must not have paid any order yet.
     */
    private function discountableReferral(User $user): ?Referral
    {
        $referral = Referral::query()
            ->where('referee_id', $user->id)
            ->where('status', Referral::STATUS_PENDING)
            ->first();

        if (is_null($referral) || Order::query()->where('user_id', $user->id)->whereNotNull('paid_at')->exists()) {
            return null;
        }

        return $referral;
    }

    /**
     * Fixed id per percentage, so the coupon is created once and reused.
     */
    private function couponId(int $percent): string
    {
        $id = "parrainage-{$percent}-once";

        try {
            Cashier::stripe()->coupons->retrieve($id);
        } catch (InvalidRequestException $exception) {
            if ($exception->getStripeCode() !== 'resource_missing') {
                throw $exception;
            }

            Cashier::stripe()->coupons->create([
                'id' => $id,
                'percent_off' => $percent,
                'duration' => 'once',
                'name' => 'Parrainage : premier mois',
            ]);
        }

        return $id;
    }

    private function abandon(Order $order): void
    {
        if ($order->status !== Order::STATUS_PENDING) {
            return;
        }

        try {
            if ($order->stripe_subscription_id) {
                Cashier::stripe()->subscriptions->cancel($order->stripe_subscription_id);
            }
        } catch (Throwable $exception) {
            report($exception);
        }

        $order->update([ 'status' => Order::STATUS_CANCELLED ]);
    }
}
