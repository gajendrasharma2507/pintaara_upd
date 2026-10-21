<?php

namespace Database\Seeders;

use App\Models\Finish;
use App\Models\MetalType;
use App\Models\Product;
use App\Models\ProductFinishPurity;
use App\Models\ProductVariant;
use App\Models\Purity;
use App\Models\Size;
use App\Models\Stone;
use Illuminate\Database\Seeder;

class JewelryConfigurationSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Metal Types
        $gold = MetalType::firstOrCreate(['code' => 'GOLD'], [
            'name' => 'Gold',
            'description' => 'Fine jewellery hallmark gold',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $silver = MetalType::firstOrCreate(['code' => 'SILVER'], [
            'name' => 'Silver',
            'description' => 'Sterling silver 925',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        // 2. Purities
        $p22kt = Purity::firstOrCreate(['code' => '22KT'], [
            'metal_type_id' => $gold->id,
            'name' => '22KT',
            'purity_fraction' => 0.916,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $p18kt = Purity::firstOrCreate(['code' => '18KT'], [
            'metal_type_id' => $gold->id,
            'name' => '18KT',
            'purity_fraction' => 0.750,
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $p14kt = Purity::firstOrCreate(['code' => '14KT'], [
            'metal_type_id' => $gold->id,
            'name' => '14KT',
            'purity_fraction' => 0.585,
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $p925 = Purity::firstOrCreate(['code' => '925'], [
            'metal_type_id' => $silver->id,
            'name' => '925 Silver',
            'purity_fraction' => 0.925,
            'is_active' => true,
            'sort_order' => 4,
        ]);

        // 3. Finishes
        $yellowGold = Finish::firstOrCreate(['code' => 'YG'], [
            'metal_type_id' => $gold->id,
            'name' => 'Yellow Gold',
            'hex_color' => '#D4AF37',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $roseGold = Finish::firstOrCreate(['code' => 'RG'], [
            'metal_type_id' => $gold->id,
            'name' => 'Rose Gold',
            'hex_color' => '#B76E79',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $blackGold = Finish::firstOrCreate(['code' => 'BG'], [
            'metal_type_id' => $gold->id,
            'name' => 'Black Gold',
            'hex_color' => '#2B2B2B',
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $whiteGold = Finish::firstOrCreate(['code' => 'WG'], [
            'metal_type_id' => $gold->id,
            'name' => 'White Gold',
            'hex_color' => '#E8E8E8',
            'is_active' => true,
            'sort_order' => 4,
        ]);

        $silverFinish = Finish::firstOrCreate(['code' => 'SILVER'], [
            'metal_type_id' => $silver->id,
            'name' => 'Silver',
            'hex_color' => '#C0C0C0',
            'is_active' => true,
            'sort_order' => 5,
        ]);

        // 4. Global Finish -> Purity Matrix
        // Example from requirements:
        // Yellow Gold -> 22KT, 18KT, 14KT
        $yellowGold->purities()->sync([$p22kt->id, $p18kt->id, $p14kt->id]);

        // Rose Gold -> 18KT only
        $roseGold->purities()->sync([$p18kt->id]);

        // Black Gold -> 14KT only
        $blackGold->purities()->sync([$p14kt->id]);

        // White Gold -> 22KT, 18KT
        $whiteGold->purities()->sync([$p22kt->id, $p18kt->id]);

        // Silver -> 925 Silver only
        $silverFinish->purities()->sync([$p925->id]);

        // 5. Sizes
        $sizes = [];
        foreach (['10', '12', '14', '16', '18', '20'] as $idx => $sizeName) {
            $sizes[$sizeName] = Size::firstOrCreate(['name' => $sizeName], [
                'category' => 'Ring',
                'is_active' => true,
                'sort_order' => $idx + 1,
            ]);
        }

        // 6. Stones / Gems
        $stoneNone = Stone::firstOrCreate(['name' => 'None'], [
            'code' => 'NONE',
            'price_delta' => 0.00,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $stoneDiamond = Stone::firstOrCreate(['name' => 'Natural Diamond'], [
            'code' => 'DIA',
            'price_delta' => 12500.00,
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $stoneEmerald = Stone::firstOrCreate(['name' => 'Emerald'], [
            'code' => 'EME',
            'price_delta' => 9500.00,
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $stoneSapphire = Stone::firstOrCreate(['name' => 'Blue Sapphire'], [
            'code' => 'SAP',
            'price_delta' => 8800.00,
            'is_active' => true,
            'sort_order' => 4,
        ]);

        // 7. Seed product-level configuration and variants for existing products
        $product = Product::first();
        if ($product) {
            // Configure product-level availability:
            // Product A:
            // Yellow Gold -> 22KT, 18KT (omitting 14KT for this specific product to demo product-level override)
            // Rose Gold -> 18KT
            // Black Gold -> 14KT
            ProductFinishPurity::where('product_id', $product->id)->delete();

            ProductFinishPurity::create(['product_id' => $product->id, 'finish_id' => $yellowGold->id, 'purity_id' => $p22kt->id, 'is_available' => true]);
            ProductFinishPurity::create(['product_id' => $product->id, 'finish_id' => $yellowGold->id, 'purity_id' => $p18kt->id, 'is_available' => true]);
            ProductFinishPurity::create(['product_id' => $product->id, 'finish_id' => $roseGold->id, 'purity_id' => $p18kt->id, 'is_available' => true]);
            ProductFinishPurity::create(['product_id' => $product->id, 'finish_id' => $blackGold->id, 'purity_id' => $p14kt->id, 'is_available' => true]);

            // Create product variants for valid combinations
            $combinations = [
                // Yellow Gold + 22KT
                ['finish' => $yellowGold, 'purity' => $p22kt, 'size' => $sizes['10'], 'stone' => $stoneNone, 'sku' => "{$product->design_code}-YG-22KT-10", 'weight' => 8.5, 'price' => 89571.00, 'stock' => 5],
                ['finish' => $yellowGold, 'purity' => $p22kt, 'size' => $sizes['12'], 'stone' => $stoneNone, 'sku' => "{$product->design_code}-YG-22KT-12", 'weight' => 8.8, 'price' => 92450.00, 'stock' => 8],
                ['finish' => $yellowGold, 'purity' => $p22kt, 'size' => $sizes['10'], 'stone' => $stoneDiamond, 'sku' => "{$product->design_code}-YG-22KT-10-DIA", 'weight' => 8.7, 'price' => 102071.00, 'stock' => 3],
                
                // Yellow Gold + 18KT
                ['finish' => $yellowGold, 'purity' => $p18kt, 'size' => $sizes['10'], 'stone' => $stoneNone, 'sku' => "{$product->design_code}-YG-18KT-10", 'weight' => 7.8, 'price' => 74200.00, 'stock' => 10],

                // Rose Gold + 18KT
                ['finish' => $roseGold, 'purity' => $p18kt, 'size' => $sizes['10'], 'stone' => $stoneNone, 'sku' => "{$product->design_code}-RG-18KT-10", 'weight' => 7.8, 'price' => 75800.00, 'stock' => 6],
                ['finish' => $roseGold, 'purity' => $p18kt, 'size' => $sizes['10'], 'stone' => $stoneEmerald, 'sku' => "{$product->design_code}-RG-18KT-10-EME", 'weight' => 8.0, 'price' => 85300.00, 'stock' => 2],

                // Black Gold + 14KT
                ['finish' => $blackGold, 'purity' => $p14kt, 'size' => $sizes['10'], 'stone' => $stoneNone, 'sku' => "{$product->design_code}-BG-14KT-10", 'weight' => 7.1, 'price' => 61500.00, 'stock' => 4],
            ];

            foreach ($combinations as $combo) {
                ProductVariant::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'finish_id' => $combo['finish']->id,
                        'purity_id' => $combo['purity']->id,
                        'size_id' => $combo['size']->id,
                        'stone_id' => $combo['stone']->id,
                    ],
                    [
                        'metal_type_id' => $combo['finish']->metal_type_id,
                        'sku' => $combo['sku'],
                        'weight' => $combo['weight'],
                        'price' => $combo['price'],
                        'stock' => $combo['stock'],
                        'status' => 'active',
                    ]
                );
            }
        }
    }
}
