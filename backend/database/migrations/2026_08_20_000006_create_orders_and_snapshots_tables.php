<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0.00);
            $table->decimal('gst_amount', 12, 2)->default(0.00);
            $table->decimal('total_amount', 12, 2);
            
            // 5-step status workflow: confirmed -> in_production -> inspection -> shipped -> delivered (or cancelled)
            $table->string('status')->default('confirmed'); 
            $table->string('payment_method')->default('card');
            $table->string('payment_status')->default('paid');
            $table->text('shipping_address')->nullable();
            $table->json('gold_rate_snapshot')->nullable(); // Locks the daily rates for audit
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->string('product_name');
            $table->string('design_code')->nullable();
            $table->string('metal_purity')->default('22KT');
            $table->string('finish')->nullable();
            $table->string('size')->nullable();
            $table->string('gem')->nullable();
            $table->string('chain')->nullable();
            
            // Weight and Price Snapshots (Frozen at order time)
            $table->decimal('weight_used', 6, 3);
            $table->decimal('gold_rate_locked', 10, 2); // Effective rate per 10g for purity
            $table->decimal('metal_value', 12, 2);
            $table->decimal('wastage_value', 12, 2)->default(0.00);
            $table->decimal('making_charge', 12, 2)->default(0.00);
            $table->decimal('stone_charge', 12, 2)->default(0.00);
            $table->decimal('gst_amount', 12, 2)->default(0.00);
            $table->decimal('price', 12, 2); // Final unit price
            $table->integer('quantity')->default(1);
            $table->decimal('total', 12, 2); // line total
            $table->json('price_breakdown')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
