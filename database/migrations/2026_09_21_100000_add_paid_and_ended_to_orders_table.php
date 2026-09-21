<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPaidAndEndedToOrdersTable extends Migration
{
    /**
     * paid_at: when payment was first confirmed, so revenue and churn can be
     * dated precisely instead of relying on created_at (checkout start).
     * ended_at: when the subscription was cancelled or the server terminated.
     * Existing rows are backfilled with the closest timestamp available.
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('paid_at')->nullable()->after('terminate_at');
            $table->timestamp('ended_at')->nullable()->after('paid_at');
        });

        DB::table('orders')->where('status', '!=', 'pending')->update([ 'paid_at' => DB::raw('created_at') ]);
        DB::table('orders')->whereIn('status', [ 'cancelled', 'terminated' ])->update([ 'ended_at' => DB::raw('updated_at') ]);
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([ 'paid_at', 'ended_at' ]);
        });
    }
}
