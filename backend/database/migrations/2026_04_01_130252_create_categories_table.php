<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
       Schema::create('categories', function (Blueprint $table) {
    $table->id('CategoryID');
    $table->string('Name', 255);
    $table->unsignedBigInteger('ParentID')->nullable();
    
    $table->foreign('ParentID')->references('CategoryID')->on('categories')->onDelete('set null');
});
    }

    
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
