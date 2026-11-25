<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('appointments') && !Schema::hasColumn('appointments', 'email')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->string('email')->nullable()->after('contact');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('appointments') && Schema::hasColumn('appointments', 'email')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->dropColumn('email');
            });
        }
    }
};
