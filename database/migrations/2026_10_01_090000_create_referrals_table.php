<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateReferralsTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code', 16)->nullable()->unique()->after('uuid');
        });

        Schema::create('referrals', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('referrer_id');
            // One referrer per customer, ever: the unique key is what stops a second code being claimed.
            $table->unsignedInteger('referee_id')->unique();
            $table->string('status', 20)->default('pending');
            $table->json('paid_invoice_ids')->nullable();
            $table->unsignedInteger('discount_order_id')->nullable();
            $table->decimal('reward_amount', 8, 2)->nullable();
            $table->timestamp('rewarded_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index('referrer_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('referrals');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('referral_code');
        });
    }
}
