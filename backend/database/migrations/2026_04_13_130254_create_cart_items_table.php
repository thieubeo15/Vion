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
       Schema::create('cart_items', function (Blueprint $table) {
    $table->id('CartItemID');
    $table->unsignedBigInteger('CartID');
    $table->unsignedBigInteger('VariantID');
    $table->integer('Quantity');

    $table->foreign('CartID')->references('CartID')->on('carts')->onDelete('cascade');
    $table->foreign('VariantID')->references('VariantID')->on('product_variants')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
