<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('appointments') && !Schema::hasColumn('appointments', 'booking_url')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->string('booking_url', 1000)->nullable()->after('time');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('appointments') && Schema::hasColumn('appointments', 'booking_url')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->dropColumn('booking_url');
            });
        }
    }
};
