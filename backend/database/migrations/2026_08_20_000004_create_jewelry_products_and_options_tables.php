<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('design_code')->unique(); // e.g. "PD-SG-OR-001"
            $table->string('name'); // e.g. "Origin"
            $table->enum('tier', ['Signature', 'Curated', 'Heritage'])->default('Signature');
            $table->foreignId('collection_master_id')->nullable()->constrained('collections_master')->nullOnDelete();
            $table->text('description')->nullable();
            
            // Weight and Charges for Live Gold-Rate Pricing Engine
            $table->decimal('base_weight_grams', 6, 3)->default(8.500); // in grams
            $table->decimal('making_charge', 10, 2)->nullable(); // Flat ₹
            $table->decimal('making_charge_percent', 5, 2)->nullable(); // % of metal value
            $table->decimal('wastage_percent', 5, 2)->default(0.00); // 0-8%
            
            $table->enum('status', ['draft', 'active', 'archived'])->default('active');
            $table->string('designed_by')->nullable()->default('Darshit Soni');
            $table->date('release_date')->nullable();
            $table->timestamps();
        });

        // Shopify-style Option Groups per product (e.g. Metal Purity, Finish, Size, Gem, Chain)
        Schema::create('product_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // "Metal Purity", "Finish", "Size", "Gem", "Chain"
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Option Values (e.g. "22KT", "18KT", "Yellow Gold", "14", "Diamond 0.5ct")
        Schema::create('product_option_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_option_id')->constrained('product_options')->cascadeOnDelete();
            $table->string('value');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Generated Variants Matrix
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->nullable();
            $table->decimal('weight_override_grams', 6, 3)->nullable();
            $table->integer('stock_qty')->default(10);
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });

        // Pivot: Variant to its Option Values combination
        Schema::create('product_variant_option_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->foreignId('product_option_value_id')->constrained('product_option_values')->cascadeOnDelete();
            $table->timestamps();
        });

        // Product Images Gallery
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_variant_option_values');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_option_values');
        Schema::dropIfExists('product_options');
        Schema::dropIfExists('products');
    }
};
