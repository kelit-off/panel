<?php

namespace Pterodactyl\Http\Requests\Api\Application\Overview;

use Pterodactyl\Http\Requests\Api\Application\ApplicationApiRequest;

class GetBusinessAnalyticsRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return [
            'range' => 'sometimes|integer|in:7,30,90,365',
        ];
    }
}
