<?php

use Illuminate\Support\Facades\Route;

Route::get('/version', 'VersionController');
Route::get('/overview', [\Pterodactyl\Http\Controllers\Api\Application\Overview\OverviewController::class, 'index']);
Route::get('/analytics', [\Pterodactyl\Http\Controllers\Api\Application\Overview\AnalyticsController::class, 'index']);
Route::get('/analytics/revenue', [\Pterodactyl\Http\Controllers\Api\Application\Overview\BusinessAnalyticsController::class, 'revenue']);
Route::get('/analytics/customers', [\Pterodactyl\Http\Controllers\Api\Application\Overview\BusinessAnalyticsController::class, 'customers']);
Route::get('/analytics/funnel', [\Pterodactyl\Http\Controllers\Api\Application\Overview\BusinessAnalyticsController::class, 'funnel']);
Route::get('/analytics/capacity', [\Pterodactyl\Http\Controllers\Api\Application\Overview\BusinessAnalyticsController::class, 'capacity']);

/*
|--------------------------------------------------------------------------
| Category Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/categories
|
*/
Route::group(['prefix' => '/categories'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Categories\CategoryController::class, 'index']);
    Route::get('/{category}', [\Pterodactyl\Http\Controllers\Api\Application\Categories\CategoryController::class, 'view']);

    Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Categories\CategoryController::class, 'store']);

    Route::patch('/{category}', [\Pterodactyl\Http\Controllers\Api\Application\Categories\CategoryController::class, 'update']);

    Route::delete('/{category}', [\Pterodactyl\Http\Controllers\Api\Application\Categories\CategoryController::class, 'delete']);
});

/*
|--------------------------------------------------------------------------
| Database Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/databases
|
*/
Route::group(['prefix' => '/databases'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Databases\DatabaseController::class, 'index']);
    Route::get('/{databaseHost}', [\Pterodactyl\Http\Controllers\Api\Application\Databases\DatabaseController::class, 'view']);

    Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Databases\DatabaseController::class, 'store']);

    Route::patch('/{databaseHost}', [\Pterodactyl\Http\Controllers\Api\Application\Databases\DatabaseController::class, 'update']);

    Route::delete('/{databaseHost}', [\Pterodactyl\Http\Controllers\Api\Application\Databases\DatabaseController::class, 'delete']);
});

/*
|--------------------------------------------------------------------------
| Egg Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/eggs
|
*/
Route::group(['prefix' => '/eggs'], function () {
    Route::get('/{egg}', [\Pterodactyl\Http\Controllers\Api\Application\Eggs\EggController::class, 'view']);
    Route::get('/{egg}/export', [\Pterodactyl\Http\Controllers\Api\Application\Eggs\EggController::class, 'export']);

    Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Eggs\EggController::class, 'store']);
    Route::post('/{egg}/variables', [\Pterodactyl\Http\Controllers\Api\Application\Eggs\EggVariableController::class, 'store']);

    Route::patch('/{egg}', [\Pterodactyl\Http\Controllers\Api\Application\Eggs\EggController::class, 'update']);
    Route::patch('/{egg}/variables', [\Pterodactyl\Http\Controllers\Api\Application\Eggs\EggVariableController::class, 'update']);

    Route::delete('/{egg}', [\Pterodactyl\Http\Controllers\Api\Application\Eggs\EggController::class, 'delete']);
    Route::delete('/{egg}/variables/{eggVariable}', [\Pterodactyl\Http\Controllers\Api\Application\Eggs\EggVariableController::class, 'delete']);
});

/*
|--------------------------------------------------------------------------
| Invoice Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/invoices
|
*/
Route::group(['prefix' => '/invoices'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Invoices\InvoiceController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| Location Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/locations
|
*/
Route::group(['prefix' => '/locations'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Locations\LocationController::class, 'index']);
    Route::get('/{location}', [\Pterodactyl\Http\Controllers\Api\Application\Locations\LocationController::class, 'view']);

    Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Locations\LocationController::class, 'store']);

    Route::patch('/{location}', [\Pterodactyl\Http\Controllers\Api\Application\Locations\LocationController::class, 'update']);

    Route::delete('/{location}', [\Pterodactyl\Http\Controllers\Api\Application\Locations\LocationController::class, 'delete']);
});

/*
|--------------------------------------------------------------------------
| Mount Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/mounts
|
*/
Route::group(['prefix' => '/mounts'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Mounts\MountController::class, 'index']);
    Route::get('/{mount}', [\Pterodactyl\Http\Controllers\Api\Application\Mounts\MountController::class, 'view']);

    Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Mounts\MountController::class, 'store']);

    Route::put('/{mount}/eggs', [\Pterodactyl\Http\Controllers\Api\Application\Mounts\MountController::class, 'addEggs']);
    Route::put('/{mount}/nodes', [\Pterodactyl\Http\Controllers\Api\Application\Mounts\MountController::class, 'addNodes']);

    Route::patch('/{mount}', [\Pterodactyl\Http\Controllers\Api\Application\Mounts\MountController::class, 'update']);

    Route::delete('/{mount}', [\Pterodactyl\Http\Controllers\Api\Application\Mounts\MountController::class, 'delete']);
    Route::delete('/{mount}/eggs', [\Pterodactyl\Http\Controllers\Api\Application\Mounts\MountController::class, 'deleteEggs']);
    Route::delete('/{mount}/nodes', [\Pterodactyl\Http\Controllers\Api\Application\Mounts\MountController::class, 'deleteNodes']);
});

/*
|--------------------------------------------------------------------------
| Nest Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/nests
|
*/
Route::group(['prefix' => '/nests'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Nests\NestController::class, 'index']);
    Route::get('/{nest}', [\Pterodactyl\Http\Controllers\Api\Application\Nests\NestController::class, 'view']);
    Route::get('/{nest}/eggs', [\Pterodactyl\Http\Controllers\Api\Application\Eggs\EggController::class, 'index']);

    Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Nests\NestController::class, 'store']);
    Route::post('/{nest}/import', [\Pterodactyl\Http\Controllers\Api\Application\Nests\NestController::class, 'import']);

    Route::patch('/{nest}', [\Pterodactyl\Http\Controllers\Api\Application\Nests\NestController::class, 'update']);

    Route::delete('/{nest}', [\Pterodactyl\Http\Controllers\Api\Application\Nests\NestController::class, 'delete']);
});

/*
|--------------------------------------------------------------------------
| Node Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/nodes
|
*/
Route::group(['prefix' => '/nodes'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Nodes\NodeController::class, 'index']);
    Route::get('/deployable', [\Pterodactyl\Http\Controllers\Api\Application\Nodes\NodeDeploymentController::class, '__invoke']);
    Route::get('/{node}', [\Pterodactyl\Http\Controllers\Api\Application\Nodes\NodeController::class, 'view']);
    Route::get('/{node}/configuration', [\Pterodactyl\Http\Controllers\Api\Application\Nodes\NodeConfigurationController::class, '__invoke']);
    Route::get('/{node}/information', [\Pterodactyl\Http\Controllers\Api\Application\Nodes\NodeInformationController::class, '__invoke']);

    Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Nodes\NodeController::class, 'store']);

    Route::patch('/{node}', [\Pterodactyl\Http\Controllers\Api\Application\Nodes\NodeController::class, 'update']);

    Route::delete('/{node}', [\Pterodactyl\Http\Controllers\Api\Application\Nodes\NodeController::class, 'delete']);

    Route::group(['prefix' => '/{node}/allocations'], function () {
        Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Nodes\AllocationController::class, 'index']);
        Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Nodes\AllocationController::class, 'store']);
        Route::delete('/{allocation}', [\Pterodactyl\Http\Controllers\Api\Application\Nodes\AllocationController::class, 'delete']);
    });
});

/*
|--------------------------------------------------------------------------
| Product Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/products
|
*/
Route::group(['prefix' => '/products'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Products\ProductController::class, 'index']);
    Route::get('/{product}', [\Pterodactyl\Http\Controllers\Api\Application\Products\ProductController::class, 'view']);

    Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Products\ProductController::class, 'store']);

    Route::patch('/{product}', [\Pterodactyl\Http\Controllers\Api\Application\Products\ProductController::class, 'update']);

    Route::delete('/{product}', [\Pterodactyl\Http\Controllers\Api\Application\Products\ProductController::class, 'delete']);
});

/*
|--------------------------------------------------------------------------
| Ticket Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/tickets
|
*/
Route::group(['prefix' => '/reports'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Reports\ReportController::class, 'index']);
    Route::post('/{report}/respond', [\Pterodactyl\Http\Controllers\Api\Application\Reports\ReportController::class, 'respond']);
});

Route::group(['prefix' => '/tickets'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Tickets\TicketController::class, 'index']);
    Route::get('/{ticket}', [\Pterodactyl\Http\Controllers\Api\Application\Tickets\TicketController::class, 'view']);
    Route::post('/{ticket}/replies', [\Pterodactyl\Http\Controllers\Api\Application\Tickets\TicketController::class, 'reply']);
    Route::patch('/{ticket}', [\Pterodactyl\Http\Controllers\Api\Application\Tickets\TicketController::class, 'update']);
});

/*
|--------------------------------------------------------------------------
| Role Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/roles
|
*/
Route::group(['prefix' => '/roles'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Roles\RoleController::class, 'index']);
    Route::get('/{role}', [\Pterodactyl\Http\Controllers\Api\Application\Roles\RoleController::class, 'view']);

    Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Roles\RoleController::class, 'store']);

    Route::patch('/{role}', [\Pterodactyl\Http\Controllers\Api\Application\Roles\RoleController::class, 'update']);

    Route::delete('/{role}', [\Pterodactyl\Http\Controllers\Api\Application\Roles\RoleController::class, 'delete']);
});

/*
|--------------------------------------------------------------------------
| Server Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/servers
|
*/
Route::group(['prefix' => '/servers'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Servers\ServerController::class, 'index']);
    Route::get('/{server}', [\Pterodactyl\Http\Controllers\Api\Application\Servers\ServerController::class, 'view']);
    Route::get('/external/{external_id}', [\Pterodactyl\Http\Controllers\Api\Application\Servers\ExternalServerController::class, 'index']);

    Route::patch('/{server}', [\Pterodactyl\Http\Controllers\Api\Application\Servers\ServerController::class, 'update']);
    Route::patch('/{server}/startup', [\Pterodactyl\Http\Controllers\Api\Application\Servers\StartupController::class, 'index']);

    Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Servers\ServerController::class, 'store']);
    Route::post('/{server}/suspend', [\Pterodactyl\Http\Controllers\Api\Application\Servers\ServerManagementController::class, 'suspend']);
    Route::post('/{server}/unsuspend', [\Pterodactyl\Http\Controllers\Api\Application\Servers\ServerManagementController::class, 'unsuspend']);
    Route::post('/{server}/reinstall', [\Pterodactyl\Http\Controllers\Api\Application\Servers\ServerManagementController::class, 'reinstall']);

    Route::delete('/{server}', [\Pterodactyl\Http\Controllers\Api\Application\Servers\ServerController::class, 'delete']);
    Route::delete('/{server}/{force?}', [\Pterodactyl\Http\Controllers\Api\Application\Servers\ServerController::class, 'delete']);

    // Database Management Endpoint
    Route::group(['prefix' => '/{server}/databases'], function () {
        Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Servers\DatabaseController::class, 'index']);
        Route::get('/{database}', [\Pterodactyl\Http\Controllers\Api\Application\Servers\DatabaseController::class, 'view']);

        Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Servers\DatabaseController::class, 'store']);
        Route::post('/{database}/reset-password', [\Pterodactyl\Http\Controllers\Api\Application\Servers\DatabaseController::class, 'resetPassword']);

        Route::delete('/{database}', [\Pterodactyl\Http\Controllers\Api\Application\Servers\DatabaseController::class, 'delete']);
    });
});

/*
|--------------------------------------------------------------------------
| User Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/application/users
|
*/
Route::group(['prefix' => '/users'], function () {
    Route::get('/', [\Pterodactyl\Http\Controllers\Api\Application\Users\UserController::class, 'index']);
    Route::get('/{user}', [\Pterodactyl\Http\Controllers\Api\Application\Users\UserController::class, 'view']);
    Route::get('/external/{external_id}', [\Pterodactyl\Http\Controllers\Api\Application\Users\ExternalUserController::class, 'index']);

    Route::post('/', [\Pterodactyl\Http\Controllers\Api\Application\Users\UserController::class, 'store']);

    Route::patch('/{user}', [\Pterodactyl\Http\Controllers\Api\Application\Users\UserController::class, 'update']);

    Route::delete('/{user}', [\Pterodactyl\Http\Controllers\Api\Application\Users\UserController::class, 'delete']);
});
