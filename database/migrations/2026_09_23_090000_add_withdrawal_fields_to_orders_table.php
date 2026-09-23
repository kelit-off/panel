<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddWithdrawalFieldsToOrdersTable extends Migration
{
    /**
     * immediate_start_consented_at: proof the customer expressly asked for the
     * service to start right away (Code de la consommation, art. L221-28 1°) —
     * required to run the server before the 14-day withdrawal period ends.
     * refunded_amount: kept for audit when a customer withdraws and is refunded
     * the unused, prorated part of what they paid (art. L221-25).
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('immediate_start_consented_at')->nullable()->after('paid_at');
            $table->decimal('refunded_amount', 8, 2)->nullable()->after('immediate_start_consented_at');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([ 'immediate_start_consented_at', 'refunded_amount' ]);
        });
    }
}
