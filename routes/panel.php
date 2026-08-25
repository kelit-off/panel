<?php

use Illuminate\Support\Facades\Route;

Route::get('/panel', 'PanelController@index')->name('panel.index')->fallback();
