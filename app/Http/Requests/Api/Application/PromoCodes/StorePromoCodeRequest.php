<?php

namespace Pterodactyl\Http\Requests\Api\Application\PromoCodes;

use Illuminate\Support\Str;
use Pterodactyl\Models\PromoCode;
use Pterodactyl\Http\Requests\Api\Application\ApplicationApiRequest;

class StorePromoCodeRequest extends ApplicationApiRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([ 'code' => Str::upper(trim((string) $this->input('code'))) ]);
    }

    public function rules(): array
    {
        $rules = collect(PromoCode::getRules())->only([
            'code', 'percent_off', 'amount_off', 'duration', 'duration_in_months', 'product_id', 'max_redemptions', 'expires_at', 'is_active',
        ])->toArray();

        $rules['code'] .= '|unique:promo_codes,code';
        // Exactly one kind of discount, and a month count whenever the duration needs one.
        $rules['percent_off'] = 'required_without:amount_off|prohibits:amount_off|nullable|integer|between:1,99';
        $rules['amount_off'] = 'required_without:percent_off|prohibits:percent_off|nullable|numeric|gt:0';
        $rules['duration_in_months'] = 'required_if:duration,repeating|nullable|integer|between:1,36';

        return $rules;
    }
}
