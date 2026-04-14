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
       Schema::create('reviews', function (Blueprint $table) {
    $table->id('ReviewID');
    $table->unsignedBigInteger('UserID')->nullable();
    $table->unsignedBigInteger('ProductID');
    $table->integer('Rating');
    $table->longText('Content')->nullable();
    $table->string('Image', 255)->nullable();

    $table->foreign('UserID')->references('UserID')->on('users')->onDelete('set null');
    $table->foreign('ProductID')->references('ProductID')->on('products')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
