<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('OrderID');
            $table->unsignedBigInteger('UserID')->nullable();
            $table->string('FullName');
            $table->string('Phone');
            $table->text('Address');
            $table->string('SpecificAddress')->nullable();
            $table->string('Province')->nullable();
            $table->string('District')->nullable();
            $table->string('Ward')->nullable();
            $table->string('PaymentMethod')->default('COD');
            $table->string('VoucherCode')->nullable();
            $table->decimal('DiscountAmount', 12, 2)->default(0);
            $table->dateTime('OrderDate');
            $table->decimal('TotalAmount', 18, 2);
            $table->string('Status', 50)->default('Pending');
            $table->text('CancelReason')->nullable();
            $table->timestamps();

            $table->foreign('UserID')->references('UserID')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
