<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Plans de démo pour la nest Minecraft.
     * Grille calibrée sur ~1,79 €/Go de coût serveur (OVH Ryzen 5 3600X, 32 Go) :
     * prix au Go dégressif mais toujours au-dessus du coût.
     * Les plans sont vendus par nest (jeu), pas par egg.
     */
    public function run()
    {
        $nest = Nest::query()->where('name', 'Minecraft')->first();

        if (is_null($nest)) {
            return;
        }

        //                    nom        description                        prix   RAM    disque   CPU  DB  bkp  alloc
        $this->createPlan($nest, 'Starter', 'Pour démarrer tranquillement',  4.99,  2048,  15360,  100,  1,  2,  1);
        $this->createPlan($nest, 'Pro',     'Pour une communauté active',    8.99,  4096,  30720,  200,  3,  3,  2);
        $this->createPlan($nest, 'Premium', 'Ressources maximales',         16.99,  8192,  61440,  400,  5,  5,  3);
        $this->createPlan($nest, 'Ultra',   'Gros serveurs moddés',         32.99, 16384, 122880,  800, 10, 10,  5);
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
        // updateOrCreate : relancer le seeder met à jour les plans existants
        Product::updateOrCreate(
            ['nest_id' => $nest->id, 'name' => $name],
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
