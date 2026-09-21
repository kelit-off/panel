<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Vitrine API Routes
|--------------------------------------------------------------------------
|
| Endpoint: /api/vitrine
|
*/

Route::get('/nests/{slug}/products', 'GameController@nestProducts')
    ->withoutMiddleware(RequireTwoFactorAuthentication::class);

Route::get('/tools/minecraft-ram', 'RamToolController@estimate')
    ->middleware('throttle:120,1')
    ->withoutMiddleware(RequireTwoFactorAuthentication::class);

Route::get('/tools/minecraft-ram/guide', 'RamToolController@guide')
    ->withoutMiddleware(RequireTwoFactorAuthentication::class);

Route::post('/track', 'TrackController@store')
    ->middleware('throttle:60,1')
    ->withoutMiddleware(RequireTwoFactorAuthentication::class);
