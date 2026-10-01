<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateServerDomainsTable extends Migration
{
    /**
     * Domains attached to website servers. A domain is only routed by the
     * node's reverse proxy once its DNS has been verified to point at the node,
     * so nobody can claim a domain they do not control.
     */
    public function up()
    {
        Schema::create('server_domains', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('server_id');
            // Domains are stored normalized to ASCII (IDNs as punycode), which also keeps
            // the unique index under MySQL's 1000-byte key limit.
            $table->string('domain', 253)->charset('ascii')->collation('ascii_general_ci')->unique();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamps();

            $table->foreign('server_id')->references('id')->on('servers')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('server_domains');
    }
}
