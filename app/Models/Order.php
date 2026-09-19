<?php

namespace Pterodactyl\Models;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $product_id
 * @property int|null $nest_id
 * @property string|null $name
 * @property int|null $server_id
 * @property string|null $stripe_checkout_session_id
 * @property string|null $stripe_subscription_id
 * @property string $status
 * @property string|null $error
 * @property \Carbon\Carbon|null $suspended_at
 * @property \Carbon\Carbon|null $terminate_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Pterodactyl\Models\User $user
 * @property \Pterodactyl\Models\Product|null $product
 * @property \Pterodactyl\Models\Nest|null $nest
 * @property \Pterodactyl\Models\Server|null $server
 */
class Order extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_SUSPENDED = 'suspended';
    public const STATUS_TERMINATED = 'terminated';

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'order';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'orders';

    /**
     * Fields that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'nest_id',
        'name',
        'server_id',
        'stripe_checkout_session_id',
        'stripe_subscription_id',
        'status',
        'error',
        'suspended_at',
        'terminate_at',
    ];

    /**
     * @var array
     */
    protected $casts = [
        'suspended_at' => 'datetime',
        'terminate_at' => 'datetime',
        'user_id' => 'integer',
        'product_id' => 'integer',
        'nest_id' => 'integer',
        'server_id' => 'integer',
    ];

    public static array $validationRules = [
        'user_id' => 'required|numeric|exists:users,id',
        'product_id' => 'sometimes|nullable|numeric|exists:products,id',
        'nest_id' => 'sometimes|nullable|numeric|exists:nests,id',
        'name' => 'sometimes|nullable|string|between:1,191',
        'server_id' => 'sometimes|nullable|numeric|exists:servers,id',
        'stripe_checkout_session_id' => 'sometimes|nullable|string',
        'stripe_subscription_id' => 'sometimes|nullable|string',
        'status' => 'sometimes|string',
        'error' => 'sometimes|nullable|string',
        'suspended_at' => 'sometimes|nullable|date',
        'terminate_at' => 'sometimes|nullable|date',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function nest()
    {
        return $this->belongsTo(Nest::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function server()
    {
        return $this->belongsTo(Server::class);
    }
}
