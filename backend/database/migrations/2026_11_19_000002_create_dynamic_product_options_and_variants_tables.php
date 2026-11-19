<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create product_option_groups table
        if (!Schema::hasTable('product_option_groups')) {
            Schema::create('product_option_groups', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code')->unique();
                $table->string('display_type')->default('dropdown'); // image_swatch, text_button, dropdown
                $table->boolean('is_required')->default(false);
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // 2. Extend product_option_values table
        if (Schema::hasTable('product_option_values')) {
            Schema::table('product_option_values', function (Blueprint $table) {
                if (!Schema::hasColumn('product_option_values', 'group_id')) {
                    $table->unsignedBigInteger('group_id')->nullable()->after('id')->index();
                }
                if (!Schema::hasColumn('product_option_values', 'code')) {
                    $table->string('code')->nullable()->after('value');
                }
                if (!Schema::hasColumn('product_option_values', 'color_code')) {
                    $table->string('color_code')->nullable()->after('code');
                }
                if (!Schema::hasColumn('product_option_values', 'price_delta')) {
                    $table->decimal('price_delta', 12, 2)->default(0)->after('color_code');
                }
                if (!Schema::hasColumn('product_option_values', 'sku')) {
                    $table->string('sku')->nullable()->after('price_delta');
                }
                if (!Schema::hasColumn('product_option_values', 'stock_qty')) {
                    $table->integer('stock_qty')->default(0)->after('sku');
                }
                if (!Schema::hasColumn('product_option_values', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('stock_qty');
                }
            });

            // Make product_option_id nullable so values can belong directly to global group
            try {
                DB::statement('ALTER TABLE product_option_values MODIFY product_option_id BIGINT UNSIGNED NULL');
            } catch (\Exception $e) {
                // If already nullable or dialect differs
            }
        }

        // 3. Create product_option_assignments table
        if (!Schema::hasTable('product_option_assignments')) {
            Schema::create('product_option_assignments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('product_id')->index();
                $table->unsignedBigInteger('group_id')->index();
                $table->string('display_type')->nullable(); // override group display type per product if set
                $table->boolean('is_required')->default(false);
                $table->json('selected_values')->nullable(); // array of option value IDs
                $table->integer('sort_order')->default(0);
                $table->timestamps();

                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
                $table->foreign('group_id')->references('id')->on('product_option_groups')->onDelete('cascade');
            });
        }

        // 4. Extend product_variants table
        if (Schema::hasTable('product_variants')) {
            Schema::table('product_variants', function (Blueprint $table) {
                if (!Schema::hasColumn('product_variants', 'variant_image')) {
                    $table->string('variant_image')->nullable()->after('sku');
                }
                if (!Schema::hasColumn('product_variants', 'price_override')) {
                    $table->decimal('price_override', 12, 2)->nullable()->after('price');
                }
                if (!Schema::hasColumn('product_variants', 'option_combination')) {
                    $table->json('option_combination')->nullable()->after('price_override');
                }
            });
        }

        // 5. Seed initial option groups & values from customization_masters if empty
        if (Schema::hasTable('customization_masters') && Schema::hasTable('product_option_groups')) {
            $existingGroups = DB::table('product_option_groups')->count();
            if ($existingGroups === 0) {
                $masters = DB::table('customization_masters')->orderBy('sort_order')->get();
                foreach ($masters as $m) {
                    $displayType = 'dropdown';
                    if ($m->input_type === 'swatch_image' || $m->input_type === 'color_swatch') {
                        $displayType = 'image_swatch';
                    } elseif ($m->input_type === 'text_button') {
                        $displayType = 'text_button';
                    }

                    $groupId = DB::table('product_option_groups')->insertGetId([
                        'name' => $m->name,
                        'code' => $m->code,
                        'display_type' => $displayType,
                        'is_required' => (bool)$m->is_required,
                        'is_active' => (bool)$m->is_active,
                        'sort_order' => $m->sort_order,
                        'description' => $m->description,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Copy values
                    if (Schema::hasTable('customization_master_values')) {
                        $mValues = DB::table('customization_master_values')
                            ->where('master_id', $m->id)
                            ->orderBy('sort_order')
                            ->get();

                        foreach ($mValues as $mv) {
                            DB::table('product_option_values')->insert([
                                'group_id' => $groupId,
                                'product_option_id' => null,
                                'value' => $mv->value,
                                'code' => $mv->code,
                                'color_code' => $mv->hex_color ?? null,
                                'image' => $mv->image ?? null,
                                'price_delta' => $mv->price_delta ?? 0,
                                'sku' => null,
                                'stock_qty' => 10,
                                'is_active' => (bool)$mv->is_active,
                                'sort_order' => $mv->sort_order,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_option_assignments');
        if (Schema::hasTable('product_option_values')) {
            Schema::table('product_option_values', function (Blueprint $table) {
                if (Schema::hasColumn('product_option_values', 'group_id')) {
                    $table->dropColumn(['group_id', 'code', 'color_code', 'price_delta', 'sku', 'stock_qty', 'is_active']);
                }
            });
        }
        Schema::dropIfExists('product_option_groups');
        if (Schema::hasTable('product_variants')) {
            Schema::table('product_variants', function (Blueprint $table) {
                if (Schema::hasColumn('product_variants', 'variant_image')) {
                    $table->dropColumn(['variant_image', 'price_override', 'option_combination']);
                }
            });
        }
    }
};
