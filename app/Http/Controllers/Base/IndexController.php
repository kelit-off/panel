<?php

namespace Pterodactyl\Http\Controllers\Base;

use Illuminate\Support\Facades\Auth;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\ServerRepositoryInterface;

class IndexController extends Controller
{
    public function index()
    {
        return view('templates/base.core');
    }

    /**
     * Renders the public showcase page for guests, or the dashboard SPA
     * shell for authenticated users.
     */
    public function welcome()
    {
        if (Auth::check()) {
            return view('templates/base.core');
        }

        return view('templates/welcome.core');
    }
}
