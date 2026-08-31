<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the seeder to add a sample set of pricing plans (Starter/Pro/Premium)
     * to the Minecraft nest, purely so the storefront has real offers to
     * display while that's the only game being worked on. Plans are sold per
     * nest (game), not per egg — this should be extended (or a new seeder
     * added) once other games need pricing too.
     */
    public function run()
    {
        $nest = Nest::query()->where('name', 'Minecraft')->first();

        if (is_null($nest)) {
            return;
        }

        $this->createPlan($nest, 'Starter', 'Pour démarrer tranquillement', 2.99, 2048, 5120, 100, 1, 1, 1);
        $this->createPlan($nest, 'Pro', 'Pour une communauté active', 5.99, 4096, 10240, 200, 3, 3, 2);
        $this->createPlan($nest, 'Premium', 'Ressources maximales', 10.99, 8192, 20480, 400, 5, 5, 3);
    }

    private function createPlan(
        Nest $nest,
        string $name,
        string $description,
        float $price,
        int $memory,
        int $disk,
        int $cpu,
        int $databases,
        int $backups,
        int $allocations
    ): void {
        Product::firstOrCreate(
            [ 'nest_id' => $nest->id, 'name' => $name ],
            [
                'description' => $description,
                'price' => $price,
                'memory' => $memory,
                'disk' => $disk,
                'cpu' => $cpu,
                'databases' => $databases,
                'backups' => $backups,
                'allocations' => $allocations,
                'is_active' => true,
            ]
        );
    }
}
