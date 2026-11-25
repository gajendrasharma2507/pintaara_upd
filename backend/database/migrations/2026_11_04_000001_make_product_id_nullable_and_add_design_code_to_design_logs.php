<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('design_logs', function (Blueprint $table) {
            $table->string('design_code')->nullable()->after('id');
            $table->foreignId('product_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('design_logs', function (Blueprint $table) {
            $table->dropColumn('design_code');
            $table->foreignId('product_id')->nullable(false)->change();
        });
    }
};

