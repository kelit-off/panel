<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddStripePriceIdToProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * The Stripe Price object (created in the Stripe dashboard, or via the API
     * later) that this plan checks out against. Nullable because a plan can
     * exist before it's wired up for sale.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('stripe_price_id')->nullable()->after('price');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('stripe_price_id');
        });
    }
}
