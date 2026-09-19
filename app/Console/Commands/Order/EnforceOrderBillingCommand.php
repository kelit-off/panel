<?php

namespace Pterodactyl\Console\Commands\Order;

use Illuminate\Console\Command;
use Pterodactyl\Services\Orders\OrderLifecycleService;

class EnforceOrderBillingCommand extends Command
{
    protected $signature = 'p:orders:enforce-billing';

    protected $description = 'Suspend servers whose subscription is unpaid and delete those whose grace period has ended.';

    public function handle(OrderLifecycleService $lifecycleService): int
    {
        $lifecycleService->enforce();

        $this->info('Facturation appliquée.');

        return self::SUCCESS;
    }
}
