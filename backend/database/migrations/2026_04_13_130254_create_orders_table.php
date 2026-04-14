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
       Schema::create('orders', function (Blueprint $table) {
    $table->id('OrderID');
    $table->unsignedBigInteger('UserID')->nullable();
    $table->dateTime('OrderDate');
    $table->decimal('TotalAmount', 18, 2);
    $table->string('Status', 50);

    $table->foreign('UserID')->references('UserID')->on('users')->onDelete('set null');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
