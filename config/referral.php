<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Referral programme (parrainage)
    |--------------------------------------------------------------------------
    |
    | A referred customer ("filleul") gets a percentage off their first month.
    | The referrer ("parrain") is credited only once the filleul has really paid
    | `required_paid_months` invoices, which also keeps them past the 14-day
    | withdrawal window. The credit is added to the referrer's Stripe customer
    | balance, which Stripe applies on its own to their next invoices.
    |
    */
    'enabled' => (bool) env('REFERRAL_ENABLED', true),
    'referee_discount_percent' => (int) env('REFERRAL_DISCOUNT_PERCENT', 50),
    'reward_amount' => (float) env('REFERRAL_REWARD_AMOUNT', 5.00),
    'required_paid_months' => (int) env('REFERRAL_REQUIRED_PAID_MONTHS', 2),
    // Hard cap of rewarded referrals per referrer, so a leaked or farmed code has a bounded cost.
    'max_rewards_per_user' => (int) env('REFERRAL_MAX_REWARDS', 20),
    'currency' => env('REFERRAL_CURRENCY', 'eur'),
];
