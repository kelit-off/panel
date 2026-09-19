<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNameToOrdersTable extends Migration
{
    /**
     * The server name the customer chose at checkout, before the account was
     * even created. Falls back to a generated name in ServerProvisioningService
     * when left blank.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('name')->nullable()->after('nest_id');
        });
    }

    /**
     * @return void
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }
}
