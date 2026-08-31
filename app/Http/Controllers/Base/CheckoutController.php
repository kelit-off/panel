<?php

namespace Pterodactyl\Http\Controllers\Base;

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
     * Starts a Stripe Checkout session (recurring subscription) for the given
     * plan. An Order is created up front in "pending" status so the webhook
     * has something to attach the payment/provisioning outcome to.
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        if (!$product->is_active) {
            return response()->json([ 'error' => "Cette offre n'est plus disponible." ], 422);
        }

        if (empty($product->stripe_price_id)) {
            return response()->json([ 'error' => "Cette offre n'est pas encore configurée pour la vente." ], 422);
        }

        $order = Order::query()->create([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
            'nest_id' => $product->nest_id,
            'status' => Order::STATUS_PENDING,
        ]);

        $checkout = $request->user()->newSubscription('default', $product->stripe_price_id)->checkout([
            'success_url' => url("/commande/succes?order={$order->id}"),
            'cancel_url' => url("/jeu/{$product->nest_id}"),
            'metadata' => [ 'order_id' => $order->id ],
        ]);

        return response()->json([
            'url' => $checkout->asStripeCheckoutSession()->url,
        ]);
    }
}
