<?php

namespace Pterodactyl\Services\PromoCodes;

use Illuminate\Support\Str;
use Laravel\Cashier\Cashier;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Product;
use Pterodactyl\Models\PromoCode;
use Stripe\Exception\InvalidRequestException;
use Pterodactyl\Exceptions\DisplayException;

/**
 * Decides whether a customer may use a promo code on a plan, and maps the
 * code to a Stripe coupon. Money only ever moves through Stripe; this class
 * just guards who is entitled to the coupon.
 */
class PromoCodeService
{
    public function normalize(?string $code): string
    {
        return Str::upper(trim((string) $code));
    }

    /**
     * @throws \Pterodactyl\Exceptions\DisplayException with a message safe to show the customer
     */
    public function validate(?string $code, User $user, Product $product): PromoCode
    {
        $promo = PromoCode::query()->where('code', $this->normalize($code))->first();

        // One message for unknown, disabled and expired codes: no hint for guessing.
        if (is_null($promo) || !$promo->is_active || ($promo->expires_at && $promo->expires_at->isPast())) {
            throw new DisplayException("Ce code promo n'est pas valide ou a expiré.");
        }

        if ($promo->product_id && $promo->product_id !== $product->id) {
            throw new DisplayException("Ce code promo ne s'applique pas à cette offre.");
        }

        if ($promo->max_redemptions && $promo->redeemedOrders()->count() >= $promo->max_redemptions) {
            throw new DisplayException("Ce code promo a atteint sa limite d'utilisation.");
        }

        if ($promo->redeemedOrders()->where('user_id', $user->id)->exists()) {
            throw new DisplayException('Tu as déjà utilisé ce code promo.');
        }

        // A 100 % discount would create a subscription without any payment to confirm.
        if ($this->discountedPrice($promo, $product) <= 0) {
            throw new DisplayException("Ce code promo ne s'applique pas à cette offre.");
        }

        return $promo;
    }

    /**
     * Price of a discounted billing period, for display.
     */
    public function discountedPrice(PromoCode $promo, Product $product): float
    {
        $price = (float) $product->price;
        $discounted = $promo->percent_off
            ? $price * (1 - $promo->percent_off / 100)
            : $price - (float) $promo->amount_off;

        return round(max($discounted, 0), 2);
    }

    /**
     * Returns the Stripe coupon id for a code, creating the coupon the first time.
     */
    public function couponId(PromoCode $promo): string
    {
        if ($promo->stripe_coupon_id) {
            return $promo->stripe_coupon_id;
        }

        $id = "promo-{$promo->id}";

        try {
            Cashier::stripe()->coupons->retrieve($id);
        } catch (InvalidRequestException $exception) {
            if ($exception->getStripeCode() !== 'resource_missing') {
                throw $exception;
            }

            $params = [ 'id' => $id, 'name' => "Code promo {$promo->code}", 'duration' => $promo->duration ];
            if ($promo->percent_off) {
                $params['percent_off'] = $promo->percent_off;
            } else {
                $params['amount_off'] = (int) round($promo->amount_off * 100);
                $params['currency'] = config('cashier.currency', 'eur');
            }
            if ($promo->duration === PromoCode::DURATION_REPEATING) {
                $params['duration_in_months'] = $promo->duration_in_months;
            }

            Cashier::stripe()->coupons->create($params);
        }

        $promo->update([ 'stripe_coupon_id' => $id ]);

        return $id;
    }
}
