<?php

namespace Pterodactyl\Models;

use Pterodactyl\Models\Concerns\FlushesStorefrontCache;

/**
 * @property int $id
 * @property int|null $category_id
 * @property int|null $default_egg_id
 * @property string $uuid
 * @property string $author
 * @property string $name
 * @property string|null $description
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Pterodactyl\Models\Category|null $category
 * @property \Pterodactyl\Models\Egg|null $defaultEgg
 * @property \Illuminate\Database\Eloquent\Collection|\Pterodactyl\Models\Server[] $servers
 * @property \Illuminate\Database\Eloquent\Collection|\Pterodactyl\Models\Egg[] $eggs
 * @property \Illuminate\Database\Eloquent\Collection|\Pterodactyl\Models\Product[] $products
 */
class Nest extends Model
{
    use FlushesStorefrontCache;

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'nest';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'nests';

    /**
     * Fields that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'category_id',
        'default_egg_id',
        'name',
        'description',
        'is_active',
    ];

    /**
     * @var array
     */
    protected $casts = [
        'category_id' => 'integer',
        'default_egg_id' => 'integer',
        'is_active' => 'boolean',
    ];

    public static array $validationRules = [
        'category_id' => 'sometimes|nullable|numeric|exists:categories,id',
        'default_egg_id' => 'sometimes|nullable|numeric|exists:eggs,id',
        'author' => 'sometimes|string|email',
        'name' => 'required|string|max:191',
        'description' => 'nullable|string',
        'is_active' => 'sometimes|boolean',
    ];

    /**
     * Gets the storefront category (game genre) this nest belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Gets all eggs associated with this service.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function eggs()
    {
        return $this->hasMany(Egg::class);
    }

    /**
     * Gets the egg used to auto-provision a server when a customer buys a
     * plan for this nest. Admin-only concern — never exposed to customers.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function defaultEgg()
    {
        return $this->belongsTo(Egg::class, 'default_egg_id');
    }

    /**
     * Gets all servers associated with this nest.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function servers()
    {
        return $this->hasMany(Server::class);
    }

    /**
     * Gets all pricing plans sold for this game. Plans are sold per nest, not
     * per egg — switching egg flavours (Vanilla to Forge, say) is an
     * admin-only action on an already-provisioned server.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
