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
        Schema::create('order_details', function (Blueprint $table) {
    $table->id('OrderDetailID');
    $table->unsignedBigInteger('OrderID');
    $table->unsignedBigInteger('VariantID')->nullable();
    $table->integer('Quantity');
    $table->decimal('Price', 18, 2);

    $table->foreign('OrderID')->references('OrderID')->on('orders')->onDelete('cascade');
    $table->foreign('VariantID')->references('VariantID')->on('product_variants')->onDelete('set null');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_details');
    }
};
