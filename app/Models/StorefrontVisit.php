<?php

namespace Pterodactyl\Models;

/**
 * @property int $id
 * @property string $visitor
 * @property string $kind
 * @property int|null $nest_id
 * @property int|null $product_id
 * @property string|null $referrer
 * @property \Carbon\Carbon $created_at
 */
class StorefrontVisit extends Model
{
    public const KIND_HOME = 'home';
    public const KIND_GAME = 'game';
    public const KIND_CHECKOUT = 'checkout';
    public const KIND_OTHER = 'other';

    public const UPDATED_AT = null;

    protected $table = 'storefront_visits';

    protected $fillable = [ 'visitor', 'kind', 'nest_id', 'product_id', 'referrer' ];

    protected $casts = [
        'nest_id' => 'integer',
        'product_id' => 'integer',
    ];
}
