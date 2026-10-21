<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('docket_number')->nullable()->after('fulfillment_status');
            $table->string('courier_partner')->nullable()->default('Sequel 247')->after('docket_number');
            $table->string('pickup_token')->nullable()->after('courier_partner');
            $table->string('estimated_delivery_date')->nullable()->after('pickup_token');
            $table->string('logistics_status')->nullable()->after('estimated_delivery_date');
            $table->json('tracking_data')->nullable()->after('logistics_status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'docket_number',
                'courier_partner',
                'pickup_token',
                'estimated_delivery_date',
                'logistics_status',
                'tracking_data',
            ]);
        });
    }
};
