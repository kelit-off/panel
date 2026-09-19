<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSupportTicketRepliesTable extends Migration
{
    /**
     * A single message in a support ticket's thread. is_staff records
     * whether the author was a staff member at the time of posting — kept
     * as its own column (rather than re-checking the user's current
     * root_admin flag) so the thread's history stays accurate even if a
     * staff member's permissions change later.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('support_ticket_replies', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('ticket_id');
            $table->unsignedInteger('user_id');
            $table->boolean('is_staff')->default(false);
            $table->text('message');
            $table->timestamps();

            $table->foreign('ticket_id')->references('id')->on('support_tickets')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('support_ticket_replies');
    }
}
