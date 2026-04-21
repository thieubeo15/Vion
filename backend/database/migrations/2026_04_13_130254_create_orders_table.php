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
        
        // --- CÁC CỘT CÒN THIẾU CẦN THÊM VÀO ---
        $table->string('FullName'); 
        $table->string('Phone');
        $table->text('Address');
        $table->string('PaymentMethod')->default('COD');
        // --------------------------------------

        $table->dateTime('OrderDate');
        $table->decimal('TotalAmount', 18, 2);
        $table->string('Status', 50)->default('Pending');
        
        $table->timestamps(); // Nên thêm cái này để theo dõi thời gian tạo đơn

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
