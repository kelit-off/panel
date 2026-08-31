<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the seeder to add the storefront categories and assign the stock
     * nests to them. Existing category assignments are left untouched so this
     * can be re-run safely after an admin has reorganised things.
     */
    public function run()
    {
        $survival = Category::firstOrCreate(
            [ 'name' => 'Survie' ],
            [ 'description' => 'Jeux de survie et de construction', 'is_active' => true ]
        );

        $fps = Category::firstOrCreate(
            [ 'name' => 'FPS' ],
            [ 'description' => 'Jeux de tir à la première personne', 'is_active' => true ]
        );

        $voice = Category::firstOrCreate(
            [ 'name' => 'Communication' ],
            [ 'description' => 'Serveurs vocaux', 'is_active' => true ]
        );

        $this->assignNestToCategory('Minecraft', $survival);
        $this->assignNestToCategory('Rust', $survival);
        $this->assignNestToCategory('Source Engine', $fps);
        $this->assignNestToCategory('Voice Servers', $voice);
    }

    private function assignNestToCategory(string $nestName, Category $category): void
    {
        Nest::query()
            ->where('name', $nestName)
            ->whereNull('category_id')
            ->update([ 'category_id' => $category->id ]);
    }
}
