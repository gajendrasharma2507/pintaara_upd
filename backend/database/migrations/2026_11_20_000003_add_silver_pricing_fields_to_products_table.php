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
                if (!Schema::hasColumn('products', 'silver_weight_grams')) {
                    $table->decimal('silver_weight_grams', 8, 3)->nullable()->after('other_charges');
                }
                if (!Schema::hasColumn('products', 'silver_making_charge_percent')) {
                    $table->decimal('silver_making_charge_percent', 5, 2)->nullable()->after('silver_weight_grams');
                }
                if (!Schema::hasColumn('products', 'silver_brand_markup_percent')) {
                    $table->decimal('silver_brand_markup_percent', 5, 2)->nullable()->after('silver_making_charge_percent');
                }
                if (!Schema::hasColumn('products', 'silver_other_charges')) {
                    $table->decimal('silver_other_charges', 10, 2)->nullable()->after('silver_brand_markup_percent');
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
                foreach (['silver_weight_grams', 'silver_making_charge_percent', 'silver_brand_markup_percent', 'silver_other_charges'] as $col) {
                    if (Schema::hasColumn('products', $col)) {
                        $cols[] = $col;
                    }
                }
                if (!empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
    }
};
