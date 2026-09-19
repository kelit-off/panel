<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddBillingLifecycleToOrdersTable extends Migration
{
    /**
     * suspended_at: when the server was suspended for non-payment.
     * terminate_at: after this moment the server is deleted for good unless
     * the subscription has been paid again in the meantime.
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('suspended_at')->nullable()->after('error');
            $table->timestamp('terminate_at')->nullable()->after('suspended_at');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([ 'suspended_at', 'terminate_at' ]);
        });
    }
}
