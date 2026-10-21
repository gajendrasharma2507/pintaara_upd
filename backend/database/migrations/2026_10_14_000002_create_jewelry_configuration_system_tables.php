<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Metal Types (Gold, Silver, Platinum, etc.)
        if (!Schema::hasTable('metal_types')) {
            Schema::create('metal_types', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // e.g. "Gold", "Silver"
                $table->string('code')->unique(); // e.g. "GOLD", "SILVER"
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // 2. Purities (22KT, 18KT, 14KT, 925 Silver, etc.)
        if (!Schema::hasTable('purities')) {
            Schema::create('purities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('metal_type_id')->nullable()->constrained('metal_types')->nullOnDelete();
                $table->string('name'); // e.g. "22KT", "18KT", "14KT", "925 Silver"
                $table->string('code'); // e.g. "22KT", "18KT", "14KT", "925"
                $table->decimal('purity_fraction', 5, 3)->default(1.000); // 0.916, 0.750, 0.585, 0.925
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // 3. Finishes (Yellow Gold, Rose Gold, Black Gold, White Gold, etc.)
        if (!Schema::hasTable('finishes')) {
            Schema::create('finishes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('metal_type_id')->nullable()->constrained('metal_types')->nullOnDelete();
                $table->string('name'); // e.g. "Yellow Gold", "Rose Gold", "Black Gold", "White Gold"
                $table->string('code')->unique(); // e.g. "YG", "RG", "BG", "WG"
                $table->string('hex_color')->nullable()->default('#D4AF37');
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // 4. Global Finish -> Purity Matrix (Dynamic mapping of allowed purities per finish)
        if (!Schema::hasTable('finish_purities')) {
            Schema::create('finish_purities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('finish_id')->constrained('finishes')->cascadeOnDelete();
                $table->foreignId('purity_id')->constrained('purities')->cascadeOnDelete();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['finish_id', 'purity_id'], 'finish_purity_unique');
            });
        }

        // 5. Sizes (Rings, Bracelets, Chains, etc.)
        if (!Schema::hasTable('sizes')) {
            Schema::create('sizes', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // e.g. "10", "12", "14", "16", "18", "20"
                $table->string('category')->default('Universal'); // e.g. "Ring", "Bracelet", "Chain", "Universal"
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // 6. Stones / Gem Options
        if (!Schema::hasTable('stones')) {
            Schema::create('stones', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // e.g. "None", "Natural Diamond", "Emerald", "Blue Sapphire", "Ruby"
                $table->string('code')->nullable(); // e.g. "NONE", "DIA", "EME", "SAP", "RUB"
                $table->decimal('price_delta', 12, 2)->default(0.00);
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // 7. Product-level Finish -> Purity Matrix (Override/Availability per specific product)
        if (!Schema::hasTable('product_finish_purities')) {
            Schema::create('product_finish_purities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('finish_id')->constrained('finishes')->cascadeOnDelete();
                $table->foreignId('purity_id')->constrained('purities')->cascadeOnDelete();
                $table->boolean('is_available')->default(true);
                $table->timestamps();

                $table->unique(['product_id', 'finish_id', 'purity_id'], 'prod_finish_purity_unique');
            });
        }

        // 8. Add relational columns to product_variants table
        Schema::table('product_variants', function (Blueprint $table) {
            if (!Schema::hasColumn('product_variants', 'metal_type_id')) {
                $table->foreignId('metal_type_id')->nullable()->after('product_id')->constrained('metal_types')->nullOnDelete();
            }
            if (!Schema::hasColumn('product_variants', 'finish_id')) {
                $table->foreignId('finish_id')->nullable()->after('metal_type_id')->constrained('finishes')->nullOnDelete();
            }
            if (!Schema::hasColumn('product_variants', 'purity_id')) {
                $table->foreignId('purity_id')->nullable()->after('finish_id')->constrained('purities')->nullOnDelete();
            }
            if (!Schema::hasColumn('product_variants', 'size_id')) {
                $table->foreignId('size_id')->nullable()->after('purity_id')->constrained('sizes')->nullOnDelete();
            }
            if (!Schema::hasColumn('product_variants', 'stone_id')) {
                $table->foreignId('stone_id')->nullable()->after('size_id')->constrained('stones')->nullOnDelete();
            }
            if (!Schema::hasColumn('product_variants', 'weight')) {
                $table->decimal('weight', 8, 3)->default(0.000)->after('sku');
            }
            if (!Schema::hasColumn('product_variants', 'price')) {
                $table->decimal('price', 12, 2)->default(0.00)->after('weight');
            }
            if (!Schema::hasColumn('product_variants', 'stock')) {
                $table->integer('stock')->default(10)->after('price');
            }
            if (!Schema::hasColumn('product_variants', 'status')) {
                $table->string('status', 30)->default('active')->after('stock');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $columnsToDrop = [
                'status',
                'stock',
                'price',
                'weight',
                'stone_id',
                'size_id',
                'purity_id',
                'finish_id',
                'metal_type_id',
            ];
            foreach ($columnsToDrop as $col) {
                if (Schema::hasColumn('product_variants', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::dropIfExists('product_finish_purities');
        Schema::dropIfExists('stones');
        Schema::dropIfExists('sizes');
        Schema::dropIfExists('finish_purities');
        Schema::dropIfExists('finishes');
        Schema::dropIfExists('purities');
        Schema::dropIfExists('metal_types');
    }
};
