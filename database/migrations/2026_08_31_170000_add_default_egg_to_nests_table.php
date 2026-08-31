<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDefaultEggToNestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * A nest is what the customer buys, but provisioning a real Pterodactyl
     * server requires a specific egg (docker image, install script). This is
     * the egg used automatically at checkout time; switching flavours
     * afterwards (Vanilla to Forge, say) stays an admin-only action on the
     * already-provisioned server.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('nests', function (Blueprint $table) {
            $table->unsignedInteger('default_egg_id')->nullable()->after('category_id');

            $table->foreign('default_egg_id')->references('id')->on('eggs')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('nests', function (Blueprint $table) {
            $table->dropForeign([ 'default_egg_id' ]);
            $table->dropColumn('default_egg_id');
        });
    }
}
