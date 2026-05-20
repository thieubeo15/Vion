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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id('VoucherID');
            $table->string('Code', 50)->unique();
            $table->enum('Type', ['fixed', 'percent']);
            $table->decimal('Value', 12, 2);
            $table->decimal('MaxDiscount', 12, 2)->nullable();
            $table->decimal('MinOrderAmount', 12, 2)->default(0);
            $table->integer('UsageLimit')->nullable();
            $table->integer('UsedCount')->default(0);
            $table->integer('PerUserLimit')->default(1);
            $table->dateTime('StartDate');
            $table->dateTime('EndDate');
            $table->boolean('IsActive')->default(true);
            $table->text('Description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
