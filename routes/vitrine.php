<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Middleware\RecordAiCrawler;
use Pterodactyl\Http\Middleware\RequireTwoFactorAuthentication;

/*
|--------------------------------------------------------------------------
| Vitrine Routes
|--------------------------------------------------------------------------
|
| Endpoint: /
|
*/
// Public pages and the files made for crawlers: visits by known AI bots are counted.
Route::middleware(RecordAiCrawler::class)->group(function () {
    Route::get('/', 'PageController@home')->name('vitrine.index')->fallback();
        // ->withoutMiddleware(RequireTwoFactorAuthentication::class)
        // ->name('account');

    // Markdown twins of the pages, for AI assistants. They must be registered before
    // the HTML routes, which would otherwise read "minecraft.md" as a game slug.
    Route::get('/index.md', 'SeoController@homeMarkdown');
    Route::get('/jeu/{slugJeu}.md', 'SeoController@gameMarkdown')->where('slugJeu', '[^/]+?');
    Route::get(config('storefront.ram_tool.path') . '.md', 'SeoController@toolMarkdown');

    Route::get('/jeu/{slugJeu}', 'PageController@game')->name('vitrine.jeu');

    Route::get(config('storefront.ram_tool.path'), 'PageController@ramTool')->name('vitrine.outils.ram');

    Route::get('/robots.txt', 'SeoController@robots');
    Route::get('/sitemap.xml', 'SeoController@sitemap');
    Route::get('/llms.txt', 'SeoController@llms');
    Route::get('/llms-full.txt', 'SeoController@llmsFull');

    Route::get('/mentions-legales', 'LegalController@mentionsLegales');
    Route::get('/cgv', 'LegalController@cgv');
    Route::get('/cgu', 'LegalController@cgu');
    Route::get('/confidentialite', 'LegalController@confidentialite');
    Route::get('/dpa', 'LegalController@dpa');
    Route::get('/signalement', 'LegalController@reportForm');
    Route::post('/signalement', 'LegalController@reportSubmit')->middleware('throttle:10,1');
});

// Route::get('/locales/{locale}/{namespace}.json', 'LocaleController')
//     ->withoutMiddleware(RequireTwoFactorAuthentication::class)
//     ->where('namespace', '.*');

Route::get('/api/store/products/{product}', 'CheckoutController@product')
    ->middleware(RecordAiCrawler::class);

Route::post('/api/store/products/{product}/checkout', 'CheckoutController@store')
    ->middleware('auth');

Route::get('/api/store/orders/{order}', 'CheckoutController@show')
    ->middleware('auth');

// Catch-all so that React Router paths (e.g. /commande/{id}) resolve to the
// SPA shell on a direct navigation or full-page reload, not a 404. Must stay
// last so the specific routes above are matched first.
Route::get('/{react}', 'IndexController@index')
    ->where('react', '^(?!(\/)?(api|auth|admin|daemon)).+');
