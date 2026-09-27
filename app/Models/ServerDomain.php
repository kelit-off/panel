<?php

namespace Pterodactyl\Models;

/**
 * @property int $id
 * @property int $server_id
 * @property string $domain
 * @property \Carbon\Carbon|null $verified_at
 * @property \Carbon\Carbon|null $last_checked_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Pterodactyl\Models\Server $server
 */
class ServerDomain extends Model
{
    public const RESOURCE_NAME = 'server_domain';

    protected $table = 'server_domains';

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected $casts = [
        'server_id' => 'integer',
        'verified_at' => 'datetime',
        'last_checked_at' => 'datetime',
    ];

    public static array $validationRules = [
        'server_id' => 'required|exists:servers,id',
        'domain' => 'required|string|max:253',
    ];

    public function isVerified(): bool
    {
        return !is_null($this->verified_at);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function server()
    {
        return $this->belongsTo(Server::class);
    }
}
