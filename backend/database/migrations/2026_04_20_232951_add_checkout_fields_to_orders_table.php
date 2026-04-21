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
            $table->string('FullName')->after('UserID');
            $table->string('Phone')->after('FullName');
            $table->text('Address')->after('Phone');
            $table->string('PaymentMethod')->default('COD')->after('Address');
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
