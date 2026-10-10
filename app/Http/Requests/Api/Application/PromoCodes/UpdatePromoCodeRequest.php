<?php

namespace Pterodactyl\Http\Requests\Api\Application\PromoCodes;

use Pterodactyl\Models\PromoCode;
use Pterodactyl\Http\Requests\Api\Application\ApplicationApiRequest;

/**
 * The discount itself is immutable (it is mirrored by a Stripe coupon, which
 * cannot be edited): only the usage limits and the on/off switch can change.
 */
class UpdatePromoCodeRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return collect(PromoCode::getRules())->only([ 'product_id', 'max_redemptions', 'expires_at', 'is_active' ])->toArray();
    }
}
