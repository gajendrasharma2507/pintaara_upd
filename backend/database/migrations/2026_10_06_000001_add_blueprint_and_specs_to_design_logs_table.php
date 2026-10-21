<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('design_logs', function (Blueprint $table) {
            $table->string('blueprint_image')->nullable()->after('product_id');
            $table->string('design_type')->nullable()->after('blueprint_image');
            $table->string('status')->default('UNDER DEVELOPMENT')->after('design_type');
            $table->text('measurements')->nullable()->after('status');
            $table->text('gem_details')->nullable()->after('measurements');
            $table->text('specs')->nullable()->after('gem_details');
        });
    }

    public function down(): void
    {
        Schema::table('design_logs', function (Blueprint $table) {
            $table->dropColumn(['blueprint_image', 'design_type', 'status', 'measurements', 'gem_details', 'specs']);
        });
    }
};
