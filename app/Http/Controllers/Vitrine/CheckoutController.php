<?php

namespace Pterodactyl\Http\Controllers\Vitrine;

use Laravel\Cashier\Cashier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Order;
use Pterodactyl\Models\Product;
use Pterodactyl\Http\Controllers\Controller;

class CheckoutController extends Controller
{
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
    public function product(Product $product): JsonResponse
    {
        if (!$product->is_active) {
            return response()->json([ 'error' => "Cette offre n'est plus disponible." ], 404);
        }

        return response()->json([ 'name' => $product->name, 'price' => $product->price ]);
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
        ]);

        $order = Order::query()->create([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
            'nest_id' => $product->nest_id,
            'name' => $data['name'],
            'status' => Order::STATUS_PENDING,
            'immediate_start_consented_at' => now(),
        ]);

        $customer = $request->user()->createOrGetStripeCustomer();

        $subscription = Cashier::stripe()->subscriptions->create([
            'customer' => $customer->id,
            'items' => [[ 'price' => $product->stripe_price_id ]],
            'payment_behavior' => 'default_incomplete',
            'payment_settings' => [ 'save_default_payment_method' => 'on_subscription' ],
            'expand' => [ 'latest_invoice.payment_intent' ],
            'metadata' => [ 'order_id' => $order->id ],
        ]);

        $order->update([ 'stripe_subscription_id' => $subscription->id ]);

        return response()->json([
            'order' => [ 'id' => $order->id ],
            'product' => [ 'name' => $product->name, 'price' => $product->price ],
            'publishableKey' => config('cashier.key'),
            'clientSecret' => $subscription->latest_invoice->payment_intent->client_secret,
        ]);
    }
}
