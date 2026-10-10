<?php

namespace Pterodactyl\Http\Controllers\Vitrine;

use Laravel\Cashier\Cashier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Order;
use Pterodactyl\Models\Product;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Referrals\ReferralService;
use Pterodactyl\Services\PromoCodes\PromoCodeService;
use Pterodactyl\Exceptions\DisplayException;

class CheckoutController extends Controller
{
    public function __construct(private ReferralService $referrals, private PromoCodeService $promoCodes)
    {
    }

    /**
     * Returns the current status of an order so the post-checkout page can
     * show the visitor whether their server is ready yet.
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json([ 'error' => 'Not found.' ], 404);
        }

        // $order->error holds the raw internal exception message for admin
        // diagnostics only — never expose it to the customer.
        return response()->json([
            'status' => $order->status,
            'server' => $order->server ? [ 'id' => $order->server->id, 'uuid' => $order->server->uuid ] : null,
        ]);
    }

    /**
     * Name and price of a plan, shown on the checkout consent step before an
     * order exists yet — the same information already public on its game page.
     */
    public function product(Request $request, Product $product): JsonResponse
    {
        if (!$product->is_active) {
            return response()->json([ 'error' => "Cette offre n'est plus disponible." ], 404);
        }

        return response()->json([
            'name' => $product->name,
            'price' => $product->price,
            'discount_percent' => $request->user() ? $this->referrals->discountPercent($request->user()) : null,
        ]);
    }

    /**
     * Checks a promo code against a plan so the checkout can show the new price
     * before any order or Stripe subscription is created.
     */
    public function promo(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([ 'code' => ['required', 'string', 'max:40'] ]);

        try {
            $promo = $this->promoCodes->validate($data['code'], $request->user(), $product);
        } catch (DisplayException $exception) {
            return response()->json([ 'error' => $exception->getMessage() ], 422);
        }

        return response()->json([
            'code' => $promo->code,
            'percent_off' => $promo->percent_off,
            'amount_off' => $promo->amount_off,
            'duration' => $promo->duration,
            'duration_in_months' => $promo->duration_in_months,
            'discounted_price' => number_format($this->promoCodes->discountedPrice($promo, $product), 2, '.', ''),
        ]);
    }

    /**
     * Starts a subscription in Stripe's "incomplete" state and returns the
     * PaymentIntent client secret so the frontend can collect card details
     * with Stripe Elements on our own page, without redirecting to a
     * Stripe-hosted checkout page. The subscription only becomes active once
     * the PaymentElement confirms payment; our webhook listener reacts to
     * that transition to kick off server provisioning.
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        if (!$product->is_active) {
            return response()->json([ 'error' => "Cette offre n'est plus disponible." ], 422);
        }

        if (empty($product->stripe_price_id)) {
            return response()->json([ 'error' => "Cette offre n'est pas encore configurée pour la vente." ], 422);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'between:1,60'],
            // Required and must be true: the server is created the instant payment is
            // confirmed, which is only lawful before the 14-day withdrawal period ends if
            // the customer expressly asked for it (Code de la consommation, art. L221-28 1°).
            'immediate_start' => ['required', 'accepted'],
            'promo_code' => ['nullable', 'string', 'max:40'],
        ]);

        $promo = null;
        if (!empty($data['promo_code'])) {
            try {
                $promo = $this->promoCodes->validate($data['promo_code'], $request->user(), $product);
            } catch (DisplayException $exception) {
                return response()->json([ 'error' => $exception->getMessage() ], 422);
            }
        }

        $order = Order::query()->create([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
            'promo_code_id' => $promo?->id,
            'nest_id' => $product->nest_id,
            'name' => $data['name'],
            'status' => Order::STATUS_PENDING,
            'immediate_start_consented_at' => now(),
        ]);

        $customer = $request->user()->createOrGetStripeCustomer();

        // An explicit promo code wins over the automatic referral discount, which is
        // then left untouched for a later order (Stripe takes a single coupon here).
        if ($promo) {
            $couponId = $this->promoCodes->couponId($promo);
            $discountPercent = null;
        } else {
            $couponId = $this->referrals->claimDiscount($request->user(), $order);
            $discountPercent = $couponId ? $this->referrals->discountPercent($request->user()) : null;
        }

        $subscription = Cashier::stripe()->subscriptions->create([
            'customer' => $customer->id,
            'items' => [[ 'price' => $product->stripe_price_id ]],
            'payment_behavior' => 'default_incomplete',
            'payment_settings' => [ 'save_default_payment_method' => 'on_subscription' ],
            'expand' => [ 'latest_invoice.payment_intent' ],
            'metadata' => [ 'order_id' => $order->id ],
        ] + ($couponId ? [ 'discounts' => [[ 'coupon' => $couponId ]] ] : []));

        $order->update([ 'stripe_subscription_id' => $subscription->id ]);

        return response()->json([
            'order' => [ 'id' => $order->id ],
            'product' => [ 'name' => $product->name, 'price' => $product->price, 'discount_percent' => $discountPercent, 'promo_price' => $promo ? number_format($this->promoCodes->discountedPrice($promo, $product), 2, '.', '') : null ],
            'publishableKey' => config('cashier.key'),
            'clientSecret' => $subscription->latest_invoice->payment_intent->client_secret,
        ]);
    }
}
