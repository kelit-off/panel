<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\SupportTicket;
use Pterodactyl\Models\SupportTicketReply;
use Pterodactyl\Http\Requests\Api\Client\AccountApiRequest;

class TicketController extends ClientApiController
{
    /**
     * Returns every ticket the authenticated user has opened, most recent first.
     */
    public function index(AccountApiRequest $request): JsonResponse
    {
        $tickets = SupportTicket::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'data' => $tickets->map(fn (SupportTicket $ticket) => $this->transformTicket($ticket))->values(),
        ]);
    }

    /**
     * Opens a new ticket with its first message.
     */
    public function store(AccountApiRequest $request): JsonResponse
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'between:1,191'],
            'priority' => ['sometimes', 'string', 'in:low,medium,high'],
            'message' => ['required', 'string', 'between:1,10000'],
        ]);

        $ticket = SupportTicket::query()->create([
            'user_id' => $request->user()->id,
            'subject' => $data['subject'],
            'priority' => $data['priority'] ?? SupportTicket::PRIORITY_MEDIUM,
            'status' => SupportTicket::STATUS_OPEN,
        ]);

        $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'is_staff' => false,
            'message' => $data['message'],
        ]);

        return response()->json([ 'data' => $this->transformTicket($ticket->fresh('replies')) ], 201);
    }

    /**
     * Returns a single ticket with its full reply thread. The route binding
     * only resolves tickets owned by the authenticated user.
     */
    public function show(AccountApiRequest $request, SupportTicket $ticket): JsonResponse
    {
        return response()->json([ 'data' => $this->transformTicket($ticket->load('replies.user')) ]);
    }

    /**
     * Adds a customer reply to one of the authenticated user's own tickets.
     * A customer reply always puts the ball back in staff's court.
     */
    public function reply(AccountApiRequest $request, SupportTicket $ticket): JsonResponse
    {
        if ($ticket->status === SupportTicket::STATUS_CLOSED) {
            return response()->json([ 'error' => 'Ce ticket est fermé.' ], 422);
        }

        $data = $request->validate([
            'message' => ['required', 'string', 'between:1,10000'],
        ]);

        $reply = $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'is_staff' => false,
            'message' => $data['message'],
        ]);

        $ticket->update([ 'status' => SupportTicket::STATUS_CUSTOMER_REPLY ]);

        return response()->json([ 'data' => $this->transformReply($reply->load('user')) ], 201);
    }

    /**
     * Lets the customer close their own ticket.
     */
    public function close(AccountApiRequest $request, SupportTicket $ticket): JsonResponse
    {
        $ticket->update([ 'status' => SupportTicket::STATUS_CLOSED ]);

        return response()->json([ 'data' => $this->transformTicket($ticket) ]);
    }

    private function transformTicket(SupportTicket $ticket): array
    {
        return [
            'id' => $ticket->id,
            'subject' => $ticket->subject,
            'priority' => $ticket->priority,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at->toIso8601String(),
            'updated_at' => $ticket->updated_at->toIso8601String(),
            'replies' => $ticket->relationLoaded('replies')
                ? $ticket->replies->map(fn (SupportTicketReply $reply) => $this->transformReply($reply))->values()
                : null,
        ];
    }

    private function transformReply(SupportTicketReply $reply): array
    {
        return [
            'id' => $reply->id,
            'message' => $reply->message,
            'is_staff' => $reply->is_staff,
            'author' => $reply->relationLoaded('user') ? $reply->user->username : null,
            'created_at' => $reply->created_at->toIso8601String(),
        ];
    }
}
