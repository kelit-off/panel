<?php

namespace Pterodactyl\Http\Controllers\Api\Application\Overview;

use Pterodactyl\Models\Node;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Order;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Product;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\SupportTicket;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Pterodactyl\Http\Requests\Api\Application\Overview\GetOverviewRequest;

class OverviewController extends ApplicationApiController
{
    /**
     * Key numbers and recent activity for the admin dashboard.
     */
    public function index(GetOverviewRequest $request): JsonResponse
    {
        $needsReply = [ SupportTicket::STATUS_OPEN, SupportTicket::STATUS_CUSTOMER_REPLY ];

        return response()->json([
            'counts' => [
                'customers' => User::query()->where('root_admin', false)->count(),
                'servers' => Server::query()->count(),
                'nodes' => Node::query()->count(),
                'products' => Product::query()->where('is_active', true)->count(),
                'orders' => Order::query()->count(),
                'orders_active' => Order::query()->where('status', Order::STATUS_ACTIVE)->count(),
                'orders_failed' => Order::query()->where('status', Order::STATUS_FAILED)->count(),
                'tickets_waiting' => SupportTicket::query()->whereIn('status', $needsReply)->count(),
            ],
            'recent_tickets' => SupportTicket::query()
                ->with('user')
                ->orderByDesc('updated_at')
                ->limit(5)
                ->get()
                ->map(fn (SupportTicket $ticket) => [
                    'id' => $ticket->id,
                    'subject' => $ticket->subject,
                    'status' => $ticket->status,
                    'customer' => $ticket->user?->email,
                    'updated_at' => $ticket->updated_at->toIso8601String(),
                ])->values(),
            'recent_orders' => Order::query()
                ->with('user', 'product')
                ->orderByDesc('created_at')
                ->limit(5)
                ->get()
                ->map(fn (Order $order) => [
                    'id' => $order->id,
                    'status' => $order->status,
                    'product' => $order->product?->name,
                    'customer' => $order->user?->email,
                    'created_at' => $order->created_at->toIso8601String(),
                ])->values(),
        ]);
    }
}
