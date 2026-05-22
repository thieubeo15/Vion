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
            $table->string('SpecificAddress')->nullable()->after('Address');
            $table->string('Province')->nullable()->after('SpecificAddress');
            $table->string('District')->nullable()->after('Province');
            $table->string('Ward')->nullable()->after('District');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['SpecificAddress', 'Province', 'District', 'Ward']);
        });
    }
};
