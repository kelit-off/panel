<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAiCrawlerHitsTable extends Migration
{
    /**
     * Daily count of visits by known AI crawlers, per public page. Only the
     * crawler name, the page and the day are kept: no IP address, no full user
     * agent. It answers one question: are AI assistants reading the site?
     */
    public function up()
    {
        Schema::create('ai_crawler_hits', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('bot', 40);
            $table->string('path', 190);
            $table->date('day');
            $table->unsignedInteger('hits')->default(1);

            $table->unique([ 'bot', 'path', 'day' ]);
            $table->index('day');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ai_crawler_hits');
    }
}
