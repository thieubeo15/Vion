<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('NotificationID');
            $table->unsignedBigInteger('UserID')->nullable();
            $table->string('Title');
            $table->text('Content');
            $table->string('Type'); 
            $table->string('RedirectUrl')->nullable();
            $table->boolean('IsRead')->default(false);
            $table->boolean('IsAdminNotification')->default(false);
            $table->timestamps();

            $table->foreign('UserID')->references('UserID')->on('users')->onDelete('cascade');
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
