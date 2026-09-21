<?php

namespace Pterodactyl\Http\Controllers\Vitrine;

use Pterodactyl\Services\Storefront\Seo;
use Pterodactyl\Http\Controllers\Controller;

class IndexController extends Controller
{
    /**
     * Shell for storefront routes that carry no public content of their own
     * (checkout, order confirmation, unknown paths): kept out of search results.
     */
    public function index(Seo $seo)
    {
        return view('templates.vitrine.core', [ 'seo' => $seo->hidden() ]);
    }
}
