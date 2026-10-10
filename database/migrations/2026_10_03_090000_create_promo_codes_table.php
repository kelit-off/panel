<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePromoCodesTable extends Migration
{
    public function up()
    {
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->increments('id');
            $table->string('code', 40)->unique();
            // Exactly one of the two is set. Neither can be edited once created: the matching Stripe coupon is immutable.
            $table->unsignedTinyInteger('percent_off')->nullable();
            $table->decimal('amount_off', 8, 2)->nullable();
            $table->string('duration', 20)->default('once');
            $table->unsignedSmallInteger('duration_in_months')->nullable();
            $table->unsignedInteger('product_id')->nullable();
            $table->unsignedInteger('max_redemptions')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('stripe_coupon_id')->nullable();
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('promo_code_id')->nullable()->after('product_id');
            $table->index('promo_code_id');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['promo_code_id']);
            $table->dropColumn('promo_code_id');
        });

        Schema::dropIfExists('promo_codes');
    }
}
