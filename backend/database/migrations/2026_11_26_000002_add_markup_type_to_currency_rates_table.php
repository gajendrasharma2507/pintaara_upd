<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('currency_rates') && !Schema::hasColumn('currency_rates', 'markup_type')) {
            Schema::table('currency_rates', function (Blueprint $table) {
                $table->string('markup_type', 20)->default('flat')->after('country_markup');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('currency_rates') && Schema::hasColumn('currency_rates', 'markup_type')) {
            Schema::table('currency_rates', function (Blueprint $table) {
                $table->dropColumn('markup_type');
            });
        }
    }
};
