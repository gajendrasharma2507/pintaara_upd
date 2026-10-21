<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Indexes for fast lookup and IDOR/audit security
            if (!Schema::hasIndex('orders', ['order_number'])) {
                $table->index('order_number');
            }
            if (!Schema::hasIndex('orders', ['customer_email'])) {
                $table->index('customer_email');
            }
            if (!Schema::hasIndex('orders', ['status'])) {
                $table->index('status');
            }
            if (!Schema::hasIndex('orders', ['user_id'])) {
                $table->index('user_id');
            }
            if (Schema::hasColumn('orders', 'razorpay_order_id') && !Schema::hasIndex('orders', ['razorpay_order_id'])) {
                $table->index('razorpay_order_id');
            }
            if (Schema::hasColumn('orders', 'razorpay_payment_id') && !Schema::hasIndex('orders', ['razorpay_payment_id'])) {
                $table->index('razorpay_payment_id');
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'sku') && !Schema::hasIndex('products', ['sku'])) {
                $table->index('sku');
            }
            if (Schema::hasColumn('products', 'design_code') && !Schema::hasIndex('products', ['design_code'])) {
                $table->index('design_code');
            }
            if (Schema::hasColumn('products', 'status') && !Schema::hasIndex('products', ['status'])) {
                $table->index('status');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'phone') && !Schema::hasIndex('users', ['phone'])) {
                $table->index('phone');
            }
            if (Schema::hasColumn('users', 'role') && !Schema::hasIndex('users', ['role'])) {
                $table->index('role');
            }
        });
    }

    public function down(): void
    {
        // Safe rollback
    }
};
