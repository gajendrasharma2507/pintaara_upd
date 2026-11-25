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
                if (!Schema::hasColumn('products', 'brand_markup_percent')) {
                    $table->decimal('brand_markup_percent', 5, 2)->default(0.00)->after('making_charge_percent');
                }
                if (!Schema::hasColumn('products', 'other_charges')) {
                    $table->decimal('other_charges', 10, 2)->default(0.00)->after('brand_markup_percent');
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
                $cols = [];
                if (Schema::hasColumn('products', 'brand_markup_percent')) {
                    $cols[] = 'brand_markup_percent';
                }
                if (Schema::hasColumn('products', 'other_charges')) {
                    $cols[] = 'other_charges';
                }
                if (!empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
    }
};

