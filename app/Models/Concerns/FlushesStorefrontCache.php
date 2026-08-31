<?php

namespace Pterodactyl\Models\Concerns;

use Illuminate\Support\Facades\Cache;

/**
 * Flushes the storefront's cached category/nest/pricing tree whenever a model
 * using this trait is saved or deleted, so admin changes (toggling is_active,
 * editing a price, ...) show up on the public site immediately instead of
 * waiting out the cache TTL.
 */
trait FlushesStorefrontCache
{
    public static function bootFlushesStorefrontCache()
    {
        static::saved(function () {
            Cache::forget('landing.categories');
        });

        static::deleted(function () {
            Cache::forget('landing.categories');
        });
    }
}
