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
        if (Schema::hasTable('order_items')) {
            Schema::table('order_items', function (Blueprint $table) {
                if (!Schema::hasColumn('order_items', 'huid')) {
                    $table->string('huid')->nullable()->after('design_code');
                }
                if (!Schema::hasColumn('order_items', 'certificate_url')) {
                    $table->string('certificate_url')->nullable()->after('huid');
                }
                if (!Schema::hasColumn('order_items', 'certificate_number')) {
                    $table->string('certificate_number')->nullable()->after('certificate_url');
                }
            });
        }

        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                if (!Schema::hasColumn('products', 'huid')) {
                    $table->string('huid')->nullable()->after('status');
                }
                if (!Schema::hasColumn('products', 'certificate_url')) {
                    $table->string('certificate_url')->nullable()->after('huid');
                }
                if (!Schema::hasColumn('products', 'certificate_number')) {
                    $table->string('certificate_number')->nullable()->after('certificate_url');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('order_items')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropColumn(['huid', 'certificate_url', 'certificate_number']);
            });
        }

        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn(['huid', 'certificate_url', 'certificate_number']);
            });
        }
    }
};
