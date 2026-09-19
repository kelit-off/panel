<?php

namespace Pterodactyl\Models;

/**
 * @property int $id
 * @property int $ticket_id
 * @property int $user_id
 * @property bool $is_staff
 * @property string $message
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Pterodactyl\Models\SupportTicket $ticket
 * @property \Pterodactyl\Models\User $user
 */
class SupportTicketReply extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'ticket_reply';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'support_ticket_replies';

    /**
     * Fields that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'ticket_id',
        'user_id',
        'is_staff',
        'message',
    ];

    /**
     * @var array
     */
    protected $casts = [
        'ticket_id' => 'integer',
        'user_id' => 'integer',
        'is_staff' => 'boolean',
    ];

    public static array $validationRules = [
        'ticket_id' => 'required|numeric|exists:support_tickets,id',
        'user_id' => 'required|numeric|exists:users,id',
        'is_staff' => 'sometimes|boolean',
        'message' => 'required|string|between:1,10000',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function ticket()
    {
        return $this->belongsTo(SupportTicket::class, 'ticket_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
