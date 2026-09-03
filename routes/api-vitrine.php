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

Route::get('/nests/{nest}/products', 'GameController@nestProducts')
    ->withoutMiddleware(RequireTwoFactorAuthentication::class);
