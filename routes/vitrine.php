<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Middleware\RequireTwoFactorAuthentication;

/*
|--------------------------------------------------------------------------
| Vitrine Routes
|--------------------------------------------------------------------------
|
| Endpoint: /
|
*/
Route::get('/', 'IndexController@index')->name('vitrine.index')->fallback();
    // ->withoutMiddleware(RequireTwoFactorAuthentication::class)
    // ->name('account');

// Route::get('/locales/{locale}/{namespace}.json', 'LocaleController')
//     ->withoutMiddleware(RequireTwoFactorAuthentication::class)
//     ->where('namespace', '.*');

// Route::post('/api/store/products/{product}/checkout', 'CheckoutController@store')
//     ->middleware('auth')
//     ->withoutMiddleware(RequireTwoFactorAuthentication::class);

// Route::get('/api/store/orders/{order}', 'CheckoutController@show')
//     ->middleware('auth')
//     ->withoutMiddleware(RequireTwoFactorAuthentication::class);

// // Route::get('/{react}', 'IndexController@index')
// //     ->where('react', '^(?!(\/)?(api|auth|admin|daemon)).+');
