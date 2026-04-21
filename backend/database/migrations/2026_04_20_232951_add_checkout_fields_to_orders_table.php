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
    Schema::table('orders', function (Blueprint $table) {
        // Chỉ thêm nếu cột CHƯA tồn tại
        if (!Schema::hasColumn('orders', 'FullName')) {
            $table->string('FullName')->after('UserID');
        }
        if (!Schema::hasColumn('orders', 'Phone')) {
            $table->string('Phone')->after('FullName');
        }
        if (!Schema::hasColumn('orders', 'Address')) {
            $table->text('Address')->after('Phone');
        }
        if (!Schema::hasColumn('orders', 'PaymentMethod')) {
            $table->string('PaymentMethod')->default('COD')->after('Status');
        }
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['FullName', 'Phone', 'Address', 'PaymentMethod']);
        });
    }
};
