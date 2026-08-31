<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * An order is created the moment a customer starts checkout and tracks
     * the purchase through payment confirmation and automatic server
     * provisioning. product_id/nest_id are kept nullable-on-delete so order
     * history survives a plan being removed later.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('product_id')->nullable();
            $table->unsignedInteger('nest_id')->nullable();
            $table->unsignedInteger('server_id')->nullable();
            $table->string('stripe_checkout_session_id')->nullable()->index();
            $table->string('stripe_subscription_id')->nullable()->index();
            // pending: checkout started, not yet paid.
            // paid: payment confirmed, provisioning not finished yet.
            // active: server successfully provisioned.
            // failed: payment succeeded but provisioning failed — needs admin attention.
            // cancelled: subscription cancelled.
            $table->string('status')->default('pending');
            $table->text('error')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
            $table->foreign('nest_id')->references('id')->on('nests')->onDelete('set null');
            $table->foreign('server_id')->references('id')->on('servers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orders');
    }
}
