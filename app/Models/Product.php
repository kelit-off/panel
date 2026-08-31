<?php

namespace Pterodactyl\Models;

use Pterodactyl\Models\Concerns\FlushesStorefrontCache;

/**
 * @property int $id
 * @property int $nest_id
 * @property string $name
 * @property string|null $description
 * @property string $price
 * @property string|null $stripe_price_id
 * @property int $memory
 * @property int $swap
 * @property int $disk
 * @property int $io
 * @property int $cpu
 * @property int $databases
 * @property int $backups
 * @property int $allocations
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Pterodactyl\Models\Nest $nest
 */
class Product extends Model
{
    use FlushesStorefrontCache;

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'product';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'products';

    /**
     * Fields that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'nest_id',
        'name',
        'description',
        'price',
        'stripe_price_id',
        'memory',
        'swap',
        'disk',
        'io',
        'cpu',
        'databases',
        'backups',
        'allocations',
        'is_active',
    ];

    /**
     * @var array
     */
    protected $casts = [
        'nest_id' => 'integer',
        'price' => 'decimal:2',
        'memory' => 'integer',
        'swap' => 'integer',
        'disk' => 'integer',
        'io' => 'integer',
        'cpu' => 'integer',
        'databases' => 'integer',
        'backups' => 'integer',
        'allocations' => 'integer',
        'is_active' => 'boolean',
    ];

    public static array $validationRules = [
        'nest_id' => 'required|bail|numeric|exists:nests,id',
        'name' => 'required|string|max:191',
        'description' => 'nullable|string',
        'price' => 'required|numeric|min:0',
        'stripe_price_id' => 'sometimes|nullable|string',
        'memory' => 'required|numeric|min:0',
        'swap' => 'sometimes|numeric|min:0',
        'disk' => 'required|numeric|min:0',
        'io' => 'sometimes|numeric|min:0',
        'cpu' => 'sometimes|numeric|min:0',
        'databases' => 'sometimes|numeric|min:0',
        'backups' => 'sometimes|numeric|min:0',
        'allocations' => 'sometimes|numeric|min:0',
        'is_active' => 'sometimes|boolean',
    ];

    /**
     * Gets the nest (game) that this product sells a plan for.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function nest()
    {
        return $this->belongsTo(Nest::class);
    }
}
