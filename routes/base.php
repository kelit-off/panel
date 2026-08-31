<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Middleware\RequireTwoFactorAuthentication;

/*
|--------------------------------------------------------------------------
| Base Routes
|--------------------------------------------------------------------------
|
| Endpoint: /
|
*/
Route::get('/', 'IndexController@index');
    // ->withoutMiddleware(RequireTwoFactorAuthentication::class)
    // ->name('account');

Route::get('/locales/{locale}/{namespace}.json', 'LocaleController')
    ->withoutMiddleware(RequireTwoFactorAuthentication::class)
    ->where('namespace', '.*');

Route::get('/api/store/nests/{nest}/products', 'StoreController@nestProducts')
    ->withoutMiddleware(RequireTwoFactorAuthentication::class);

Route::post('/api/store/products/{product}/checkout', 'CheckoutController@store')
    ->middleware('auth')
    ->withoutMiddleware(RequireTwoFactorAuthentication::class);

Route::get('/api/store/orders/{order}', 'CheckoutController@show')
    ->middleware('auth')
    ->withoutMiddleware(RequireTwoFactorAuthentication::class);

// Route::get('/{react}', 'IndexController@index')
//     ->where('react', '^(?!(\/)?(api|auth|admin|daemon)).+');
