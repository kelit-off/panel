<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Illuminate\Http\Request;
use Pterodactyl\Models\Order;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Services\Orders\OrderCancellationService;

/**
 * Lets a customer manage their own subscriptions: see them, cancel one
 * ("résiliation en trois clics", mandatory for B2C under Code de la
 * consommation art. L215-1-1), or withdraw within the 14-day legal window
 * for a pro-rated refund (art. L221-18 s.).
 */
class OrderController extends ClientApiController
{
    public function __construct(private OrderCancellationService $cancellationService)
    {
        parent::__construct();
    }

    private const VISIBLE_STATUSES = [
        Order::STATUS_ACTIVE, Order::STATUS_SUSPENDED, Order::STATUS_FAILED, Order::STATUS_CANCELLED,
    ];

    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('status', self::VISIBLE_STATUSES)
            ->with('product', 'server')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $orders->map(fn (Order $order) => $this->transform($order))->values(),
        ]);
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOwner($request, $order);

        try {
            $this->cancellationService->cancel($order);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([ 'error' => "La résiliation n'a pas pu être transmise à notre prestataire de paiement, merci de réessayer ou d'ouvrir un ticket." ], 502);
        }

        return response()->json([ 'data' => $this->transform($order->fresh()) ]);
    }

    public function withdraw(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOwner($request, $order);

        if (!$this->cancellationService->canWithdraw($order)) {
            return response()->json([ 'error' => 'Le délai de rétractation de 14 jours est dépassé pour cette commande.' ], 422);
        }

        try {
            $refund = $this->cancellationService->withdraw($order);
        } catch (DisplayException $exception) {
            return response()->json([ 'error' => $exception->getMessage() ], 422);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([ 'error' => "La rétractation n'a pas pu être traitée, merci d'ouvrir un ticket pour qu'on s'en occupe manuellement." ], 502);
        }

        return response()->json([ 'data' => $this->transform($order->fresh()), 'refunded' => $refund ]);
    }

    private function authorizeOwner(Request $request, Order $order): void
    {
        abort_if($order->user_id !== $request->user()->id, 404);
    }

    private function transform(Order $order): array
    {
        return [
            'id' => $order->id,
            'name' => $order->name,
            'status' => $order->status,
            'product' => $order->product ? [ 'name' => $order->product->name, 'price' => $order->product->price ] : null,
            'server_id' => $order->server_id,
            'paid_at' => $order->paid_at?->toIso8601String(),
            'can_withdraw' => $this->cancellationService->canWithdraw($order),
            'withdrawal_deadline' => $order->paid_at?->copy()->addDays(14)->toIso8601String(),
        ];
    }
}
