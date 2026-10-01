<?php

namespace Pterodactyl\Transformers\Api\Client;

use Pterodactyl\Models\ServerDomain;
use Pterodactyl\Transformers\Api\Transformer;

class ServerDomainTransformer extends Transformer
{
    public function getResourceName(): string
    {
        return ServerDomain::RESOURCE_NAME;
    }

    public function transform(ServerDomain $model): array
    {
        return [
            'id' => $model->id,
            'domain' => $model->domain,
            'is_verified' => $model->isVerified(),
            'verified_at' => self::formatTimestamp($model->verified_at),
            'last_checked_at' => self::formatTimestamp($model->last_checked_at),
            'created_at' => self::formatTimestamp($model->created_at),
        ];
    }
}
