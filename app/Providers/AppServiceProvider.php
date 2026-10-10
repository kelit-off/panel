<?php

namespace Pterodactyl\Providers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Cashier\Cashier;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Sanctum;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Subuser;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Pterodactyl\Observers\UserObserver;
use Pterodactyl\Observers\ServerObserver;
use Pterodactyl\Observers\SubuserObserver;
use Pterodactyl\Models\PersonalAccessToken;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        Schema::defaultStringLength(191);

        $this->configureRateLimiting();

        Cashier::useCustomerModel(User::class);

        User::observe(UserObserver::class);
        Server::observe(ServerObserver::class);
        Subuser::observe(SubuserObserver::class);

        /*
         * @see https://laravel.com/docs/8.x/sanctum#overriding-default-models
         */
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);

        // If the APP_URL value is set with https:// make sure we force it here. Theoretically
        // this should just work with the proxy logic, but there are a lot of cases where it
        // doesn't, and it triggers a lot of support requests, so lets just head it off here.
        //
        // @see https://github.com/pterodactyl/panel/issues/3623
        if (Str::startsWith(config('app.url') ?? '', 'https://')) {
            URL::forceScheme('https');
        }
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // Authentication rate limiting. For login and checkpoint endpoints we'll apply
        // a limit of 10 requests per minute, for the forgot password endpoint apply a
        // limit of two per minute for the requester so that there is less ability to
        // trigger email spam.
        RateLimiter::for('authentication', function (Request $request) {
            if ($request->route()->named('auth.post.forgot-password')) {
                return Limit::perMinute(2)->by($request->ip());
            }

            return Limit::perMinute(10);
        });

        // Configure the throttles for both the application and client APIs below.
        // This is configurable per-instance in "config/http.php". By default this
        // limiter will be tied to the specific request user, and falls back to the
        // request IP if there is no request user present for the key.
        //
        // This means that an authenticated API user cannot use IP switching to get
        // around the limits.
        RateLimiter::for('api.client', function (Request $request) {
            $key = optional($request->user())->uuid ?: $request->ip();

            return Limit::perMinutes(
                config('http.rate_limit.client_period'),
                config('http.rate_limit.client')
            )->by($key);
        });

        RateLimiter::for('api.application', function (Request $request) {
            $key = optional($request->user())->uuid ?: $request->ip();

            return Limit::perMinutes(
                config('http.rate_limit.application_period'),
                config('http.rate_limit.application')
            )->by($key);
        });

        RateLimiter::for('pull', function () {
            return Limit::perMinute(10);
        });
    }

    /**
     * Register application service providers.
     */
    public function register()
    {
        // Only load the settings service provider if the environment
        // is configured to allow it.
        if (!config('pterodactyl.load_environment_only', false) && $this->app->environment() !== 'testing') {
            $this->app->register(SettingsServiceProvider::class);
        }
    }
}
