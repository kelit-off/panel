<?php

namespace Pterodactyl\Models;

/**
 * @property int $id
 * @property int $user_id
 * @property string $subject
 * @property string $priority
 * @property string $status
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Pterodactyl\Models\User $user
 * @property \Illuminate\Database\Eloquent\Collection|\Pterodactyl\Models\SupportTicketReply[] $replies
 */
class SupportTicket extends Model
{
    public const STATUS_OPEN = 'open';
    public const STATUS_ANSWERED = 'answered';
    public const STATUS_CUSTOMER_REPLY = 'customer-reply';
    public const STATUS_CLOSED = 'closed';

    public const PRIORITY_LOW = 'low';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_HIGH = 'high';

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'ticket';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'support_tickets';

    /**
     * Fields that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'subject',
        'priority',
        'status',
    ];

    public static array $validationRules = [
        'user_id' => 'required|numeric|exists:users,id',
        'subject' => 'required|string|between:1,191',
        'priority' => 'sometimes|string|in:low,medium,high',
        'status' => 'sometimes|string|in:open,answered,customer-reply,closed',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function replies()
    {
        return $this->hasMany(SupportTicketReply::class, 'ticket_id')->orderBy('created_at');
    }
}
