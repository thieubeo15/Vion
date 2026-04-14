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
       Schema::create('payments', function (Blueprint $table) {
    $table->id('PaymentID');
    $table->unsignedBigInteger('OrderID')->unique();
    $table->string('Method', 100);
    $table->string('Status', 50);
    $table->dateTime('PaymentDate')->nullable();

    $table->foreign('OrderID')->references('OrderID')->on('orders')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
