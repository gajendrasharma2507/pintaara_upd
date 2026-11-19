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
        if (Schema::hasTable('product_option_assignments')) {
            if (!Schema::hasColumn('product_option_assignments', 'value_prices')) {
                Schema::table('product_option_assignments', function (Blueprint $table) {
                    $table->json('value_prices')->nullable()->after('selected_values');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('product_option_assignments')) {
            if (Schema::hasColumn('product_option_assignments', 'value_prices')) {
                Schema::table('product_option_assignments', function (Blueprint $table) {
                    $table->dropColumn('value_prices');
                });
            }
        }
    }
};
