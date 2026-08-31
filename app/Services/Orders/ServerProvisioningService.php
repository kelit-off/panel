<?php

namespace Pterodactyl\Services\Orders;

use Throwable;
use Illuminate\Support\Arr;
use Pterodactyl\Models\Order;
use Pterodactyl\Models\Location;
use Pterodactyl\Models\EggVariable;
use Pterodactyl\Models\Objects\DeploymentObject;
use Pterodactyl\Services\Servers\ServerCreationService;

class ServerProvisioningService
{
    public function __construct(private ServerCreationService $serverCreationService)
    {
    }

    /**
     * Attempts to automatically provision a real Pterodactyl server for a paid
     * order. Any failure (no default egg configured, no viable node, daemon
     * unreachable, ...) is caught and recorded on the order rather than thrown,
     * since this runs from a webhook — an admin can see the error and finish
     * the provisioning by hand.
     */
    public function handle(Order $order): void
    {
        $product = $order->product;
        $nest = $order->nest ?? $product?->nest;

        if (is_null($product) || is_null($nest)) {
            $this->markFailed($order, 'Commande sans offre ou jeu associé.');

            return;
        }

        $egg = $nest->defaultEgg;

        if (is_null($egg)) {
            $this->markFailed($order, "Aucun egg par défaut n'est configuré pour le jeu \"{$nest->name}\".");

            return;
        }

        $image = Arr::first($egg->docker_images);

        if (is_null($image)) {
            $this->markFailed($order, "L'egg \"{$egg->name}\" n'a aucune image Docker configurée.");

            return;
        }

        $environment = EggVariable::query()
            ->where('egg_id', $egg->id)
            ->get()
            ->mapWithKeys(fn (EggVariable $variable) => [ $variable->env_variable => $variable->default_value ])
            ->toArray();

        $locationIds = Location::query()->pluck('id')->toArray();

        try {
            $server = $this->serverCreationService->handle([
                'name' => $order->user->username . ' - ' . $nest->name,
                'owner_id' => $order->user_id,
                'egg_id' => $egg->id,
                'nest_id' => $egg->nest_id,
                'memory' => $product->memory,
                'swap' => $product->swap,
                'disk' => $product->disk,
                'io' => $product->io,
                'cpu' => $product->cpu,
                'image' => $image,
                'startup' => $egg->startup,
                'environment' => $environment,
                'database_limit' => $product->databases,
                'allocation_limit' => $product->allocations,
                'backup_limit' => $product->backups,
                'start_on_completion' => true,
            ], (new DeploymentObject())->setLocations($locationIds));

            $order->update([
                'server_id' => $server->id,
                'status' => Order::STATUS_ACTIVE,
                'error' => null,
            ]);
        } catch (Throwable $exception) {
            $this->markFailed($order, $exception->getMessage());
        }
    }

    private function markFailed(Order $order, string $message): void
    {
        $order->update([
            'status' => Order::STATUS_FAILED,
            'error' => $message,
        ]);
    }
}
