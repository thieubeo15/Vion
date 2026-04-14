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
       Schema::create('product_variants', function (Blueprint $table) {
    $table->id('VariantID');
    $table->unsignedBigInteger('ProductID');
    $table->string('Size', 20);
    $table->string('Color', 50);
    $table->decimal('Price', 18, 2);
    $table->integer('Stock');

    $table->foreign('ProductID')->references('ProductID')->on('products')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
