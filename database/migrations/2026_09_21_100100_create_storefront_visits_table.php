<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateStorefrontVisitsTable extends Migration
{
    /**
     * Anonymous storefront page views. "visitor" is a hash that rotates every
     * day and is built from data that is never stored (IP, user agent), so no
     * visitor can be followed across days and no personal data is kept.
     * nest_id/product_id deliberately have no foreign keys: history must
     * survive a game or plan being deleted.
     */
    public function up()
    {
        Schema::create('storefront_visits', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('visitor', 32);
            $table->string('kind', 16);
            $table->unsignedInteger('nest_id')->nullable();
            $table->unsignedInteger('product_id')->nullable();
            $table->string('referrer', 120)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('created_at');
            $table->index([ 'kind', 'created_at' ]);
        });
    }

    public function down()
    {
        Schema::dropIfExists('storefront_visits');
    }
}
