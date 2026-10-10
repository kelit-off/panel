<?php

namespace Pterodactyl\Transformers\Api\Application;

use Pterodactyl\Models\PromoCode;
use Pterodactyl\Transformers\Api\Transformer;

class PromoCodeTransformer extends Transformer
{
    public function getResourceName(): string
    {
        return PromoCode::RESOURCE_NAME;
    }

    public function transform(PromoCode $model): array
    {
        return [
            'id' => $model->id,
            'code' => $model->code,
            'percent_off' => $model->percent_off,
            'amount_off' => $model->amount_off,
            'duration' => $model->duration,
            'duration_in_months' => $model->duration_in_months,
            'product_id' => $model->product_id,
            'max_redemptions' => $model->max_redemptions,
            'times_redeemed' => $model->redeemedOrders()->count(),
            'expires_at' => self::formatTimestamp($model->expires_at),
            'is_active' => $model->is_active,
            $model->getUpdatedAtColumn() => self::formatTimestamp($model->updated_at),
            $model->getCreatedAtColumn() => self::formatTimestamp($model->created_at),
        ];
    }
}
