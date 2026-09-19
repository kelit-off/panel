<?php

namespace Pterodactyl\Http\Controllers\Api\Application\Tickets;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\SupportTicket;
use Spatie\QueryBuilder\QueryBuilder;
use Pterodactyl\Models\SupportTicketReply;
use Pterodactyl\Http\Requests\Api\Application\Tickets\GetTicketsRequest;
use Pterodactyl\Http\Requests\Api\Application\Tickets\ReplyTicketRequest;
use Pterodactyl\Http\Requests\Api\Application\Tickets\UpdateTicketRequest;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;

class TicketController extends ApplicationApiController
{
    /**
     * Returns every ticket across every customer, most recently updated first.
     */
    public function index(GetTicketsRequest $request): JsonResponse
    {
        $tickets = QueryBuilder::for(SupportTicket::query()->with('user'))
            ->allowedFilters(['status', 'subject'])
            ->allowedSorts(['id', 'updated_at', 'created_at'])
            ->orderByDesc('updated_at')
            ->paginate((int) $request->query('per_page', '25'));

        return response()->json([
            'data' => collect($tickets->items())->map(fn (SupportTicket $ticket) => $this->transformTicket($ticket))->values(),
            'meta' => [
                'current_page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'total' => $tickets->total(),
            ],
        ]);
    }

    /**
     * Returns a single ticket with its full reply thread.
     */
    public function view(GetTicketsRequest $request, SupportTicket $ticket): JsonResponse
    {
        return response()->json([ 'data' => $this->transformTicket($ticket->load('user', 'replies.user')) ]);
    }

    /**
     * Adds a staff reply to a ticket. Answering always flips the status to
     * "answered" so the customer knows it's their turn again.
     */
    public function reply(ReplyTicketRequest $request, SupportTicket $ticket): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'between:1,10000'],
        ]);

        $reply = $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'is_staff' => true,
            'message' => $data['message'],
        ]);

        $ticket->update([ 'status' => SupportTicket::STATUS_ANSWERED ]);

        return response()->json([ 'data' => $this->transformReply($reply->load('user')) ], 201);
    }

    /**
     * Updates a ticket's status and/or priority (e.g. closing or reopening it).
     */
    public function update(UpdateTicketRequest $request, SupportTicket $ticket): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'string', 'in:open,answered,customer-reply,closed'],
            'priority' => ['sometimes', 'string', 'in:low,medium,high'],
        ]);

        $ticket->update($data);

        return response()->json([ 'data' => $this->transformTicket($ticket) ]);
    }

    private function transformTicket(SupportTicket $ticket): array
    {
        return [
            'id' => $ticket->id,
            'subject' => $ticket->subject,
            'priority' => $ticket->priority,
            'status' => $ticket->status,
            'customer' => $ticket->relationLoaded('user') && $ticket->user
                ? [ 'id' => $ticket->user->id, 'username' => $ticket->user->username, 'email' => $ticket->user->email ]
                : null,
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
            'author' => $reply->relationLoaded('user') && $reply->user ? $reply->user->username : null,
            'created_at' => $reply->created_at->toIso8601String(),
        ];
    }
}
