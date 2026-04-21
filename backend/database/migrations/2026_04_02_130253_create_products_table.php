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
       Schema::create('products', function (Blueprint $table) {
    $table->id('ProductID');
    $table->unsignedBigInteger('CategoryID')->nullable();
    $table->string('Name', 255);
    $table->string('MainImage', 255);
    $table->longText('Description')->nullable();
    $table->integer('sold_count')->default(0);
    $table->timestamps();

    $table->foreign('CategoryID')->references('CategoryID')->on('categories')->onDelete('set null');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
