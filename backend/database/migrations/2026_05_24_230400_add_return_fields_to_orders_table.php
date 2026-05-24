<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->text('ReturnReason')->nullable()->after('CancelReason');
            $table->string('RefundMethod', 50)->nullable()->after('ReturnReason');
            $table->text('RefundDetails')->nullable()->after('RefundMethod');
            $table->text('ReturnAdminNote')->nullable()->after('RefundDetails');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['ReturnReason', 'RefundMethod', 'RefundDetails', 'ReturnAdminNote']);
        });
    }
};
