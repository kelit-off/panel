<?php

namespace Pterodactyl\Extensions\Laravel\Sanctum;

use Pterodactyl\Models\PersonalAccessToken;
use Illuminate\Contracts\Support\Jsonable;
use Illuminate\Contracts\Support\Arrayable;

/**
 * Sanctum 4 types the token on its own NewAccessToken class as Sanctum's model, which
 * the panel's custom PersonalAccessToken model does not extend, so this is standalone.
 */
class NewAccessToken implements Arrayable, Jsonable
{
    public function __construct(public PersonalAccessToken $accessToken, public string $plainTextToken)
    {
    }

    public function toArray(): array
    {
        return [
            'accessToken' => $this->accessToken,
            'plainTextToken' => $this->plainTextToken,
        ];
    }

    public function toJson($options = 0): string
    {
        return json_encode($this->toArray(), $options);
    }
}
