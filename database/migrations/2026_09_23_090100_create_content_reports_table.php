<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateContentReportsTable extends Migration
{
    /**
     * Illicit-content reports (LCEN art. 6-I-5 and DSA art. 16): anyone can
     * flag a hosted service without an account, we acknowledge receipt, and an
     * admin records a reasoned response — the paper trail both laws require.
     */
    public function up()
    {
        Schema::create('content_reports', function (Blueprint $table) {
            $table->increments('id');
            $table->string('reporter_name');
            $table->string('reporter_email');
            $table->string('category');
            $table->string('target', 500);
            $table->text('description');
            $table->string('status')->default('open');
            $table->text('admin_response')->nullable();
            $table->unsignedInteger('handled_by')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->foreign('handled_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('content_reports');
    }
}
