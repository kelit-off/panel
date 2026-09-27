<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Domains;

use Pterodactyl\Models\Permission;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class StoreDomainRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return Permission::ACTION_DOMAIN_CREATE;
    }

    public function rules(): array
    {
        return [
            'domain' => 'required|string|max:300',
        ];
    }
}
