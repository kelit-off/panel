<?php

namespace Pterodactyl\Models;

/**
 * @property int $id
 * @property int $referrer_id
 * @property int $referee_id
 * @property string $status
 * @property array|null $paid_invoice_ids
 * @property int|null $discount_order_id
 * @property float|null $reward_amount
 * @property \Carbon\Carbon|null $rewarded_at
 * @property string|null $ip_address
 * @property \Pterodactyl\Models\User $referrer
 * @property \Pterodactyl\Models\User $referee
 */
class Referral extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_REWARDED = 'rewarded';
    public const STATUS_REJECTED = 'rejected';

    public const RESOURCE_NAME = 'referral';

    protected $table = 'referrals';

    protected $fillable = [
        'referrer_id',
        'referee_id',
        'status',
        'paid_invoice_ids',
        'discount_order_id',
        'reward_amount',
        'rewarded_at',
        'ip_address',
    ];

    protected $casts = [
        'referrer_id' => 'integer',
        'referee_id' => 'integer',
        'discount_order_id' => 'integer',
        'paid_invoice_ids' => 'array',
        'reward_amount' => 'float',
        'rewarded_at' => 'datetime',
    ];

    public static array $validationRules = [
        'referrer_id' => 'required|numeric|exists:users,id',
        'referee_id' => 'required|numeric|exists:users,id',
        'status' => 'sometimes|string',
        'paid_invoice_ids' => 'sometimes|nullable|array',
        'discount_order_id' => 'sometimes|nullable|numeric',
        'reward_amount' => 'sometimes|nullable|numeric',
        'rewarded_at' => 'sometimes|nullable|date',
        'ip_address' => 'sometimes|nullable|string|max:45',
    ];

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referee()
    {
        return $this->belongsTo(User::class, 'referee_id');
    }
}
