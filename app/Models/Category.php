<?php

namespace Pterodactyl\Models;

use Pterodactyl\Models\Concerns\FlushesStorefrontCache;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Illuminate\Database\Eloquent\Collection|\Pterodactyl\Models\Nest[] $nests
 */
class Category extends Model
{
    use FlushesStorefrontCache;

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'category';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'categories';

    /**
     * Fields that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    /**
     * @var array
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    public static array $validationRules = [
        'name' => 'required|string|max:191',
        'description' => 'nullable|string',
        'is_active' => 'sometimes|boolean',
    ];

    /**
     * Gets all nests (games) grouped under this category.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function nests()
    {
        return $this->hasMany(Nest::class);
    }
}
