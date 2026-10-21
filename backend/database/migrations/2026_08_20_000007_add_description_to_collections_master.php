<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('collections_master') && !Schema::hasColumn('collections_master', 'description')) {
            Schema::table('collections_master', function (Blueprint $table) {
                $table->text('description')->nullable()->after('image');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('collections_master') && Schema::hasColumn('collections_master', 'description')) {
            Schema::table('collections_master', function (Blueprint $table) {
                $table->dropColumn('description');
            });
        }
    }
};
