<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            if (!Schema::hasColumn('product_images', 'finish_key')) {
                $table->string('finish_key', 50)->nullable()->after('product_id')->index();
            }
            if (!Schema::hasColumn('product_images', 'finish_id')) {
                $table->unsignedBigInteger('finish_id')->nullable()->after('finish_key')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            if (Schema::hasColumn('product_images', 'finish_id')) {
                $table->dropColumn('finish_id');
            }
            if (Schema::hasColumn('product_images', 'finish_key')) {
                $table->dropColumn('finish_key');
            }
        });
    }
};
