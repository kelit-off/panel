<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeProductsEggToNest extends Migration
{
    /**
     * Run the migrations.
     *
     * Plans are sold per game (nest), not per server-software variant (egg) —
     * switching between egg flavours (e.g. Vanilla to Forge) is an admin-only
     * action on an already-provisioned server, not something a customer picks.
     * Existing rows are cleared since they were keyed to eggs and don't map
     * cleanly onto nests without duplication.
     *
     * @return void
     */
    public function up()
    {
        DB::table('products')->delete();

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign([ 'egg_id' ]);
            $table->dropColumn('egg_id');

            $table->unsignedInteger('nest_id')->after('id');
            $table->foreign('nest_id')->references('id')->on('nests')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::table('products')->delete();

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign([ 'nest_id' ]);
            $table->dropColumn('nest_id');

            $table->unsignedInteger('egg_id')->after('id');
            $table->foreign('egg_id')->references('id')->on('eggs')->onDelete('cascade');
        });
    }
}
