<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_vouchers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('UserID');
            $table->unsignedBigInteger('VoucherID');
            $table->enum('Source', ['saved', 'gifted', 'birthday', 'event'])->default('saved');
            $table->boolean('IsUsed')->default(false);
            $table->timestamps();
            $table->foreign('UserID')->references('UserID')->on('users')->onDelete('cascade');
            $table->foreign('VoucherID')->references('VoucherID')->on('vouchers')->onDelete('cascade');
            $table->unique(['UserID', 'VoucherID']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_vouchers');
    }
};
