<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;
use Pterodactyl\Models\StorefrontVisit;

// Execute scheduled commands for servers every minute, as if there was a normal cron running.
Schedule::command('p:schedule:process')->everyMinute()->withoutOverlapping();

if (config('backups.prune_age')) {
    // Every 30 minutes, run the backup pruning command so that any abandoned backups can be deleted.
    Schedule::command('p:maintenance:prune-backups')->everyThirtyMinutes();
}

// Suspend unpaid servers that are still running and delete the ones past their grace period.
Schedule::command('p:orders:enforce-billing')->everyFifteenMinutes()->withoutOverlapping();

// Every day cleanup any internal backups of service files.
Schedule::command('p:maintenance:clean-service-backups')->daily();

// Anonymous storefront visits are only useful for recent trends.
Schedule::call(function () {
    StorefrontVisit::query()->where('created_at', '<', now()->subDays(400))->delete();
    DB::table('ai_crawler_hits')->where('day', '<', now()->subDays(400)->toDateString())->delete();
})->daily();
