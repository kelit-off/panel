<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Grace periods
    |--------------------------------------------------------------------------
    |
    | Number of days a server is kept (suspended) before it is deleted for good.
    | The countdown starts when a renewal payment fails, or when the
    | subscription ends (cancelled by the customer or by Stripe).
    |
    */
    'suspension_grace_days' => (int) env('BILLING_SUSPENSION_GRACE_DAYS', 7),
    'cancellation_grace_days' => (int) env('BILLING_CANCELLATION_GRACE_DAYS', 3),
];
