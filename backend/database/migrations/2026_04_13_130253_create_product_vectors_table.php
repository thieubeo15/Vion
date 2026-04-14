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
       Schema::create('product_vectors', function (Blueprint $table) {
    $table->id('VectorID');
    $table->unsignedBigInteger('ImageID')->unique();
    $table->binary('VectorData'); 

    $table->foreign('ImageID')->references('ImageID')->on('product_images')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_vectors');
    }
};
