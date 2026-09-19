<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSupportTicketsTable extends Migration
{
    /**
     * A customer support ticket. Replies live in support_ticket_replies;
     * status tracks whose turn it is to respond ("open"/"customer-reply"
     * mean the customer is waiting on staff, "answered" means staff replied
     * and is waiting on the customer, "closed" ends the conversation).
     *
     * @return void
     */
    public function up()
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->string('subject');
            $table->string('priority')->default('medium');
            $table->string('status')->default('open');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('support_tickets');
    }
}
