<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('collections_master')) {
            DB::statement("ALTER TABLE collections_master MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active'");
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('collections_master')) {
            DB::statement("ALTER TABLE collections_master MODIFY COLUMN status ENUM('active', 'hidden', 'draft') NOT NULL DEFAULT 'active'");
        }
    }
};
