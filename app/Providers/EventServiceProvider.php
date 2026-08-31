<?php

namespace Pterodactyl\Providers;

use Laravel\Cashier\Events\WebhookReceived;
use Pterodactyl\Events\Server\Installed as ServerInstalledEvent;
use Pterodactyl\Listeners\ProvisionServerOnCheckoutCompleted;
use Pterodactyl\Notifications\ServerInstalled as ServerInstalledNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        ServerInstalledEvent::class => [
            ServerInstalledNotification::class,
        ],
        WebhookReceived::class => [
            ProvisionServerOnCheckoutCompleted::class,
        ],
    ];
}
