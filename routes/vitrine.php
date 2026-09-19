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

Route::get('/jeu/{idJeu}', 'IndexController@index')->name('vitrine.jeu')->fallback();

// Route::get('/locales/{locale}/{namespace}.json', 'LocaleController')
//     ->withoutMiddleware(RequireTwoFactorAuthentication::class)
//     ->where('namespace', '.*');

Route::post('/api/store/products/{product}/checkout', 'CheckoutController@store')
    ->middleware('auth');

Route::get('/api/store/orders/{order}', 'CheckoutController@show')
    ->middleware('auth');

// Catch-all so that React Router paths (e.g. /commande/{id}) resolve to the
// SPA shell on a direct navigation or full-page reload, not a 404. Must stay
// last so the specific routes above are matched first.
Route::get('/{react}', 'IndexController@index')
    ->where('react', '^(?!(\/)?(api|auth|admin|daemon)).+');
