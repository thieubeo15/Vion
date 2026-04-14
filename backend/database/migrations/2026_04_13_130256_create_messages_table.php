<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('messages', function (Blueprint $table) {
    $table->id('MessageID');
    $table->unsignedBigInteger('SessionID');
    $table->string('Sender', 20);
    $table->longText('Content');
    $table->dateTime('SentAt');

    $table->foreign('SessionID')->references('SessionID')->on('chat_sessions')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
