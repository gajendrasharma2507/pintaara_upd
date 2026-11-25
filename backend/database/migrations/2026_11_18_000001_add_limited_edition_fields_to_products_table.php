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
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                if (!Schema::hasColumn('products', 'is_limited_edition')) {
                    $table->boolean('is_limited_edition')->default(true)->after('release_date');
                }
                if (!Schema::hasColumn('products', 'edition_prefix')) {
                    $table->string('edition_prefix', 100)->default('LIMITED EDITION')->nullable()->after('is_limited_edition');
                }
                if (!Schema::hasColumn('products', 'edition_limit')) {
                    $table->unsignedInteger('edition_limit')->default(50)->nullable()->after('edition_prefix');
                }
                if (!Schema::hasColumn('products', 'edition_current')) {
                    $table->unsignedInteger('edition_current')->default(1)->nullable()->after('edition_limit');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                if (Schema::hasColumn('products', 'edition_current')) {
                    $table->dropColumn('edition_current');
                }
                if (Schema::hasColumn('products', 'edition_limit')) {
                    $table->dropColumn('edition_limit');
                }
                if (Schema::hasColumn('products', 'edition_prefix')) {
                    $table->dropColumn('edition_prefix');
                }
                if (Schema::hasColumn('products', 'is_limited_edition')) {
                    $table->dropColumn('is_limited_edition');
                }
            });
        }
    }
};
