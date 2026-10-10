<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Configuration\Exceptions;
use Pterodactyl\Http\Middleware\TrimStrings;
use Pterodactyl\Http\Middleware\TrustProxies;
use Pterodactyl\Http\Middleware\EncryptCookies;
use Pterodactyl\Http\Middleware\Api\IsValidJson;
use Pterodactyl\Http\Middleware\VerifyCsrfToken;
use Pterodactyl\Http\Middleware\VerifyReCaptcha;
use Pterodactyl\Http\Middleware\AdminAuthenticate;
use Pterodactyl\Http\Middleware\MaintenanceMiddleware;
use Pterodactyl\Http\Middleware\RedirectIfAuthenticated;
use Pterodactyl\Http\Middleware\Api\PreventUnboundModels;
use Pterodactyl\Http\Middleware\Api\Daemon\DaemonAuthenticate;
use Pterodactyl\Http\Middleware\RequireTwoFactorAuthentication;
use Pterodactyl\Http\Middleware\Api\Client\SubstituteClientApiBindings;
use Pterodactyl\Http\Middleware\Api\Application\AuthenticateApplicationUser;
use Pterodactyl\Http\Middleware\Api\Application\SubstituteApplicationApiBindings;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance;
use Illuminate\Foundation\Http\Middleware\ValidatePostSize;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\AuthenticateSession;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

$app = Application::configure(basePath: $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__))
    ->withProviders([
        Pterodactyl\Providers\AppServiceProvider::class,
        Pterodactyl\Providers\AuthServiceProvider::class,
        Pterodactyl\Providers\BackupsServiceProvider::class,
        Pterodactyl\Providers\BladeServiceProvider::class,
        Pterodactyl\Providers\EventServiceProvider::class,
        Pterodactyl\Providers\HashidsServiceProvider::class,
        Pterodactyl\Providers\RepositoryServiceProvider::class,
        Pterodactyl\Providers\ViewComposerServiceProvider::class,
    ])
    ->withRouting(
        commands: __DIR__ . '/../routes/console.php',
        then: function () {
            $namespace = 'Pterodactyl\Http\Controllers';

            Route::middleware(['web', 'csrf'])
                ->namespace("$namespace\\Vitrine")
                ->group(base_path('routes/vitrine.php'));

            Route::middleware(['web', 'auth', 'admin', 'csrf'])->prefix('/admin')
                ->namespace("$namespace\\Admin")
                ->group(base_path('routes/admin.php'));

            Route::middleware(['web', 'csrf'])->prefix('/auth')
                ->namespace("$namespace\\Auth")
                ->group(base_path('routes/auth.php'));

            Route::middleware(['web', 'csrf', 'auth', 'server', 'node.maintenance'])
                ->prefix('/api/server/{server}')
                ->namespace("$namespace\\Server")
                ->group(base_path('routes/server.php'));

            Route::middleware(['api', 'throttle:api.application'])
                ->prefix('/api/application')
                ->namespace("$namespace\\Api\\Application")
                ->group(base_path('routes/api-application.php'));

            Route::middleware(['client-api', 'throttle:api.client'])
                ->prefix('/api/client')
                ->namespace("$namespace\\Api\\Client")
                ->group(base_path('routes/api-client.php'));

            Route::middleware(['daemon'])->prefix('/api/remote')
                ->namespace("$namespace\\Api\\Remote")
                ->group(base_path('routes/api-remote.php'));

            Route::middleware(['web', 'csrf'])->prefix('/api/vitrine')
                ->namespace("$namespace\\Api\\Vitrine")
                ->group(base_path('routes/api-vitrine.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        // The panel defines its own complete global stack and groups, so these replace the
        // framework defaults instead of being merged into them.
        $middleware->use([
            TrustProxies::class,
            PreventRequestsDuringMaintenance::class,
            ValidatePostSize::class,
            TrimStrings::class,
            ConvertEmptyStringsToNull::class,
        ]);

        $middleware->group('web', [
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
            AuthenticateSession::class,
            ShareErrorsFromSession::class,
            VerifyCsrfToken::class,
            SubstituteBindings::class,
            RequireTwoFactorAuthentication::class,
        ]);

        $middleware->group('api', [
            IsValidJson::class,
            EnsureFrontendRequestsAreStateful::class,
            'auth:sanctum',
            SubstituteApplicationApiBindings::class,
            PreventUnboundModels::class,
            AuthenticateApplicationUser::class,
            RequireTwoFactorAuthentication::class,
        ]);

        $middleware->group('client-api', [
            IsValidJson::class,
            EnsureFrontendRequestsAreStateful::class,
            'auth:sanctum',
            SubstituteClientApiBindings::class,
            PreventUnboundModels::class,
            // This is perhaps a little backwards with the Client API, but logically you'd be unable
            // to create/get an API key without first enabling 2FA on the account, so I suppose in the
            // end it makes sense.
            //
            // You just wouldn't be authenticating with the API by providing a 2FA token.
            RequireTwoFactorAuthentication::class,
        ]);

        $middleware->group('daemon', [
            SubstituteBindings::class,
            DaemonAuthenticate::class,
        ]);

        $middleware->redirectGuestsTo('/auth/login');
        $middleware->redirectUsersTo('/');

        $middleware->alias([
            'guest' => RedirectIfAuthenticated::class,
            'admin' => AdminAuthenticate::class,
            'csrf' => VerifyCsrfToken::class,
            'recaptcha' => VerifyReCaptcha::class,
            'node.maintenance' => MaintenanceMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Rendering and reporting are handled by the panel's own handler, bound below.
    })
    ->create();

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    Pterodactyl\Exceptions\Handler::class
);

return $app;
