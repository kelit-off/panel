<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('egg_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('memory')->unsigned();
            $table->integer('swap')->unsigned()->default(0);
            $table->integer('disk')->unsigned();
            $table->integer('io')->unsigned()->default(500);
            $table->integer('cpu')->unsigned()->default(0);
            $table->integer('databases')->unsigned()->default(0);
            $table->integer('backups')->unsigned()->default(0);
            $table->integer('allocations')->unsigned()->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('egg_id')->references('id')->on('eggs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('products');
    }
}
