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
        Schema::create('voucher_usages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('VoucherID');
            $table->unsignedBigInteger('UserID');
            $table->unsignedBigInteger('OrderID');
            $table->decimal('DiscountAmount', 12, 2);
            $table->timestamps();

            $table->foreign('VoucherID')->references('VoucherID')->on('vouchers')->onDelete('cascade');
            $table->foreign('UserID')->references('UserID')->on('users')->onDelete('cascade');
            $table->foreign('OrderID')->references('OrderID')->on('orders')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_usages');
    }
};
