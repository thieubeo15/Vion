<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('password_reset_otps', function (Blueprint $table) {
            $table->id();
            $table->string('Email')->index();
            $table->string('OTP');
            $table->dateTime('ExpiresAt');
            $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('password_reset_otps');
    }
};
