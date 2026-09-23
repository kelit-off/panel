<?php

namespace Pterodactyl\Models;

/**
 * @property int $id
 * @property string $reporter_name
 * @property string $reporter_email
 * @property string $category
 * @property string $target
 * @property string $description
 * @property string $status
 * @property string|null $admin_response
 * @property int|null $handled_by
 * @property \Carbon\Carbon|null $responded_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Pterodactyl\Models\User|null $handler
 */
class ContentReport extends Model
{
    public const STATUS_OPEN = 'open';
    public const STATUS_PROCESSED = 'processed';

    public const CATEGORIES = [ 'illicite', 'ddos', 'minage', 'spam', 'propriete_intellectuelle', 'autre' ];

    protected $table = 'content_reports';

    protected $fillable = [
        'reporter_name', 'reporter_email', 'category', 'target', 'description',
        'status', 'admin_response', 'handled_by', 'responded_at',
    ];

    protected $casts = [
        'handled_by' => 'integer',
        'responded_at' => 'datetime',
    ];

    public static array $validationRules = [
        'reporter_name' => 'required|string|between:1,191',
        'reporter_email' => 'required|email',
        'category' => 'required|string|in:illicite,ddos,minage,spam,propriete_intellectuelle,autre',
        'target' => 'required|string|between:1,500',
        'description' => 'required|string|between:1,5000',
        'status' => 'sometimes|string|in:open,processed',
        'admin_response' => 'sometimes|nullable|string',
        'handled_by' => 'sometimes|nullable|numeric|exists:users,id',
        'responded_at' => 'sometimes|nullable|date',
    ];

    public function handler()
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}
