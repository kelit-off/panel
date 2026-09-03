<?php

namespace Pterodactyl\Http\Controllers\Vitrine;

use Pterodactyl\Http\Controllers\Controller;

class IndexController extends Controller {
    public function index() {
        return view('templates.vitrine.core');
    }
}
