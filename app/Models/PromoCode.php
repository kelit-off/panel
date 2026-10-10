<?php

namespace Pterodactyl\Models;

/**
 * @property int $id
 * @property string $code
 * @property int|null $percent_off
 * @property float|null $amount_off
 * @property string $duration
 * @property int|null $duration_in_months
 * @property int|null $product_id
 * @property int|null $max_redemptions
 * @property \Carbon\Carbon|null $expires_at
 * @property bool $is_active
 * @property string|null $stripe_coupon_id
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Pterodactyl\Models\Product|null $product
 */
class PromoCode extends Model
{
    public const DURATION_ONCE = 'once';
    public const DURATION_REPEATING = 'repeating';
    public const DURATION_FOREVER = 'forever';

    public const RESOURCE_NAME = 'promo_code';

    protected $table = 'promo_codes';

    protected $fillable = [
        'code',
        'percent_off',
        'amount_off',
        'duration',
        'duration_in_months',
        'product_id',
        'max_redemptions',
        'expires_at',
        'is_active',
        'stripe_coupon_id',
    ];

    protected $casts = [
        'percent_off' => 'integer',
        'amount_off' => 'float',
        'duration_in_months' => 'integer',
        'product_id' => 'integer',
        'max_redemptions' => 'integer',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public static array $validationRules = [
        'code' => 'required|string|between:3,40|regex:/^[A-Z0-9_-]+$/',
        'percent_off' => 'nullable|integer|between:1,99',
        'amount_off' => 'nullable|numeric|gt:0',
        'duration' => 'required|in:once,repeating,forever',
        'duration_in_months' => 'nullable|integer|between:1,36',
        'product_id' => 'nullable|numeric|exists:products,id',
        'max_redemptions' => 'nullable|integer|min:1',
        'expires_at' => 'nullable|date',
        'is_active' => 'sometimes|boolean',
        'stripe_coupon_id' => 'sometimes|nullable|string',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Orders that actually paid with this code. Unpaid checkouts do not use up a redemption.
     */
    public function redeemedOrders()
    {
        return Order::query()->where('promo_code_id', $this->id)->whereNotNull('paid_at');
    }
}
