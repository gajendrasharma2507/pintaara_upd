<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\MetalPurity;
use App\Models\FinishOption;
use App\Models\GemOption;
use App\Models\GoldRate;
use App\Models\CollectionMaster;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\DesignLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Setting;
use App\Services\JewelryPricingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@pintaara.com'],
            [
                'name' => 'Darshit Soni',
                'password' => Hash::make('password'),
            ]
        );

        // 2. Global Settings
        Setting::set('gst_percent', 3.0, 'number', 'Goods and Services Tax percentage for fine jewelry');
        Setting::set('default_wastage_percent', 0.0, 'number', 'Default wastage buffer percentage');
        Setting::set('brand_name', 'PINTAARA', 'string', 'Luxury Fine Jewelry Atelier');
        Setting::set('currency_symbol', '₹', 'string', 'Currency symbol');
        Setting::set('contact_email', 'concierge@pintaara.com', 'string', 'Customer concierge email');
        Setting::set('contact_phone', '+91 98765 43210', 'string', 'Concierge VIP hotline');

        // 3. Metal Purities
        $purities = [
            ['name' => '22KT', 'purity_fraction' => 0.916, 'type' => 'gold', 'sort_order' => 1],
            ['name' => '18KT', 'purity_fraction' => 0.750, 'type' => 'gold', 'sort_order' => 2],
            ['name' => '14KT', 'purity_fraction' => 0.585, 'type' => 'gold', 'sort_order' => 3],
            ['name' => '925 Silver', 'purity_fraction' => 0.925, 'type' => 'silver', 'sort_order' => 4],
        ];
        $purityModels = [];
        foreach ($purities as $p) {
            $purityModels[$p['name']] = MetalPurity::updateOrCreate(['name' => $p['name']], $p);
        }

        // 4. Finish Options
        $finishes = [
            ['name' => 'Yellow Gold', 'hex_color' => '#D4AF37', 'sort_order' => 1],
            ['name' => 'White Gold', 'hex_color' => '#E8E8E8', 'sort_order' => 2],
            ['name' => 'Rose Gold', 'hex_color' => '#B76E79', 'sort_order' => 3],
            ['name' => 'Black Gold', 'hex_color' => '#2B2B2B', 'sort_order' => 4],
        ];
        foreach ($finishes as $f) {
            FinishOption::updateOrCreate(['name' => $f['name']], $f);
        }

        // 5. Gem Options
        $gems = [
            ['stone_type' => 'None', 'carat' => null, 'default_stone_charge' => 0.00, 'sort_order' => 1],
            ['stone_type' => 'Diamond 0.5ct', 'carat' => 0.500, 'default_stone_charge' => 45000.00, 'sort_order' => 2],
            ['stone_type' => 'Ruby 0.7ct', 'carat' => 0.700, 'default_stone_charge' => 28000.00, 'sort_order' => 3],
            ['stone_type' => 'Emerald 0.6ct', 'carat' => 0.600, 'default_stone_charge' => 32000.00, 'sort_order' => 4],
            ['stone_type' => 'Sapphire 0.55ct', 'carat' => 0.550, 'default_stone_charge' => 30000.00, 'sort_order' => 5],
        ];
        foreach ($gems as $g) {
            GemOption::updateOrCreate(['stone_type' => $g['stone_type']], $g);
        }

        // 6. Gold & Silver Spot Rates
        $gold22kt = $purityModels['22KT'];
        $silver925 = $purityModels['925 Silver'];

        GoldRate::create([
            'metal_type' => 'gold',
            'rate_per_10g' => 100000.00, // ₹1,00,000 / 10g base rate
            'base_purity_id' => $gold22kt->id,
            'effective_date' => now()->toDateString(),
            'source' => 'manual',
            'created_by' => $admin->id,
        ]);

        GoldRate::create([
            'metal_type' => 'silver',
            'rate_per_10g' => 950.00, // ₹950 / 10g
            'base_purity_id' => $silver925->id,
            'effective_date' => now()->toDateString(),
            'source' => 'manual',
            'created_by' => $admin->id,
        ]);

        // Historical Gold Rates for audit trail
        GoldRate::create([
            'metal_type' => 'gold',
            'rate_per_10g' => 99200.00,
            'base_purity_id' => $gold22kt->id,
            'effective_date' => now()->subDays(1)->toDateString(),
            'source' => 'manual',
            'created_by' => $admin->id,
        ]);
        GoldRate::create([
            'metal_type' => 'gold',
            'rate_per_10g' => 98500.00,
            'base_purity_id' => $gold22kt->id,
            'effective_date' => now()->subDays(2)->toDateString(),
            'source' => 'manual',
            'created_by' => $admin->id,
        ]);

        // 7. Collections Master
        $collections = [
            ['name' => 'Rings', 'slug' => 'rings', 'image' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', 'sort_order' => 1],
            ['name' => 'Pendants', 'slug' => 'pendants', 'image' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', 'sort_order' => 2],
            ['name' => 'Bracelets', 'slug' => 'bracelets', 'image' => 'https://images.unsplash.com/photo-1611591475155-42a92b23a9b1?q=80&w=800&auto=format&fit=crop', 'sort_order' => 3],
            ['name' => 'Earrings', 'slug' => 'earrings', 'image' => 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop', 'sort_order' => 4],
            ['name' => 'Chains', 'slug' => 'chains', 'image' => 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop', 'sort_order' => 5],
            ['name' => 'Necklaces', 'slug' => 'necklaces', 'image' => 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop', 'sort_order' => 6],
            ['name' => 'Mangalsutras', 'slug' => 'mangalsutras', 'image' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', 'sort_order' => 7],
            ['name' => 'Bangles', 'slug' => 'bangles', 'image' => 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop', 'sort_order' => 8],
        ];

        $colModels = [];
        foreach ($collections as $c) {
            $colModels[$c['slug']] = CollectionMaster::updateOrCreate(['slug' => $c['slug']], $c);
        }

        // 8. Products & Variants Setup
        // Product 1: The Benchmark Origin Ring (8.500g, 22KT, ₹3,000 making charge = ₹90,640)
        $ring = Product::updateOrCreate(
            ['design_code' => 'PD-SG-OR-001'],
            [
                'name' => 'Origin Signet Ring',
                'tier' => 'Signature',
                'collection_master_id' => $colModels['rings']->id,
                'description' => 'Architectural signet ring forged from solid gold with precision bevelled facets and ergonomic comfort-fit shank.',
                'base_weight_grams' => 8.500,
                'making_charge' => 3000.00,
                'making_charge_percent' => null,
                'wastage_percent' => 0.00,
                'status' => 'active',
                'designed_by' => 'Darshit Soni',
                'release_date' => now()->subMonths(1)->toDateString(),
            ]
        );

        // Images for Origin Ring
        ProductImage::updateOrCreate(
            ['product_id' => $ring->id, 'sort_order' => 1],
            ['url' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop', 'is_primary' => true]
        );
        ProductImage::updateOrCreate(
            ['product_id' => $ring->id, 'sort_order' => 2],
            ['url' => 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=1000&auto=format&fit=crop', 'is_primary' => false]
        );

        // 1:1 Design Log for Origin Ring
        DesignLog::updateOrCreate(
            ['product_id' => $ring->id],
            [
                'idea_image' => 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop',
                'idea_note' => 'Original pencil draft exploring geometric balance, monolithic proportions, and tactile weight redistribution.',
                'cad_image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
                'cad_note' => 'Parametric 3D CAD modeling with 0.1mm micro-chamfering along the top table for mirror finish light play.',
                'craft_image' => 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
                'craft_note' => 'Lost-wax casting followed by multi-stage hand filing, satin brushed flanking, and 22KT hallmark stamping.',
                'creation_image' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
                'creation_note' => 'Master piece finalized in atelier with high mirror polish and certified Bureau of Indian Standards (BIS) hallmark.',
                'inspired_by' => 'Brutalist monuments and geometric balance',
                'release_date' => now()->subMonths(1)->toDateString(),
            ]
        );

        // Options for Origin Ring: Purity, Finish, Size
        $optPurity = ProductOption::create(['product_id' => $ring->id, 'name' => 'Metal Purity', 'sort_order' => 1]);
        $val22 = ProductOptionValue::create(['product_option_id' => $optPurity->id, 'value' => '22KT', 'sort_order' => 1]);
        $val18 = ProductOptionValue::create(['product_option_id' => $optPurity->id, 'value' => '18KT', 'sort_order' => 2]);
        $val14 = ProductOptionValue::create(['product_option_id' => $optPurity->id, 'value' => '14KT', 'sort_order' => 3]);

        $optFinish = ProductOption::create(['product_id' => $ring->id, 'name' => 'Finish', 'sort_order' => 2]);
        $valYellow = ProductOptionValue::create(['product_option_id' => $optFinish->id, 'value' => 'Yellow Gold', 'sort_order' => 1]);
        $valRose = ProductOptionValue::create(['product_option_id' => $optFinish->id, 'value' => 'Rose Gold', 'sort_order' => 2]);

        $optSize = ProductOption::create(['product_id' => $ring->id, 'name' => 'Size', 'sort_order' => 3]);
        $valSize14 = ProductOptionValue::create(['product_option_id' => $optSize->id, 'value' => '14', 'sort_order' => 1]);
        $valSize16 = ProductOptionValue::create(['product_option_id' => $optSize->id, 'value' => '16', 'sort_order' => 2]);

        // Generate Sample Variants for Origin Ring
        $v1 = ProductVariant::create([
            'product_id' => $ring->id,
            'sku' => 'PD-SG-OR-001-22KT-YG-14',
            'weight_override_grams' => 8.500,
            'stock_qty' => 15,
            'enabled' => true,
        ]);
        $v1->optionValues()->attach([$val22->id, $valYellow->id, $valSize14->id]);

        $v2 = ProductVariant::create([
            'product_id' => $ring->id,
            'sku' => 'PD-SG-OR-001-18KT-YG-14',
            'weight_override_grams' => 8.000,
            'stock_qty' => 12,
            'enabled' => true,
        ]);
        $v2->optionValues()->attach([$val18->id, $valYellow->id, $valSize14->id]);

        $v3 = ProductVariant::create([
            'product_id' => $ring->id,
            'sku' => 'PD-SG-OR-001-18KT-RG-16',
            'weight_override_grams' => 8.200,
            'stock_qty' => 8,
            'enabled' => true,
        ]);
        $v3->optionValues()->attach([$val18->id, $valRose->id, $valSize16->id]);

        // Product 2: Celestial Solitaire Pendant
        $pendant = Product::updateOrCreate(
            ['design_code' => 'PD-PD-CS-002'],
            [
                'name' => 'Celestial Solitaire Pendant',
                'tier' => 'Curated',
                'collection_master_id' => $colModels['pendants']->id,
                'description' => 'Suspended celestial sphere holding a 0.50ct hand-cut diamond with radiant halo prongs.',
                'base_weight_grams' => 6.200,
                'making_charge' => 4500.00,
                'making_charge_percent' => null,
                'wastage_percent' => 2.00,
                'status' => 'active',
                'designed_by' => 'Darshit Soni',
                'release_date' => now()->subDays(20)->toDateString(),
            ]
        );
        ProductImage::create([
            'product_id' => $pendant->id,
            'url' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop',
            'sort_order' => 1,
            'is_primary' => true,
        ]);
        DesignLog::create([
            'product_id' => $pendant->id,
            'idea_image' => 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop',
            'idea_note' => 'Exploration of sacred geometry and astronomical constellations.',
            'cad_image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
            'cad_note' => 'Micro-prong setting engineering to optimize diamond refraction.',
            'craft_image' => 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
            'craft_note' => 'Hand setting of diamond under 40x stereoscopic microscope.',
            'creation_image' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop',
            'creation_note' => 'Final piece certified with VVS-clarity lab report.',
            'inspired_by' => 'Cosmic alignment and starlight physics',
            'release_date' => now()->subDays(20)->toDateString(),
        ]);

        // Product 3: Ethereal Rope Cuff Bracelet
        $bracelet = Product::updateOrCreate(
            ['design_code' => 'PD-BR-ER-003'],
            [
                'name' => 'Ethereal Rope Cuff Bracelet',
                'tier' => 'Heritage',
                'collection_master_id' => $colModels['bracelets']->id,
                'description' => 'Heavy intertwined gold braid crafted using ancient Kundan filigree and modern laser micro-welding.',
                'base_weight_grams' => 18.500,
                'making_charge' => null,
                'making_charge_percent' => 8.50, // % of metal value
                'wastage_percent' => 3.00,
                'status' => 'active',
                'designed_by' => 'Darshit Soni',
                'release_date' => now()->subDays(10)->toDateString(),
            ]
        );
        ProductImage::create([
            'product_id' => $bracelet->id,
            'url' => 'https://images.unsplash.com/photo-1611591475155-42a92b23a9b1?q=80&w=1000&auto=format&fit=crop',
            'sort_order' => 1,
            'is_primary' => true,
        ]);

        // 9. Sample Orders with Locked Price Snapshots
        $pricingService = new JewelryPricingService();
        $ringPrice = $pricingService->calculatePrice(
            weightGrams: 8.500,
            purityFraction: 0.916,
            wastagePercent: 0.0,
            makingChargeFlat: 3000.0,
            stoneCharge: 0.0,
            metalType: 'gold',
            baseRate: 100000.0,
            gstPercent: 3.0
        );

        $order1 = Order::create([
            'order_number' => 'PT-2026-0801',
            'user_id' => $admin->id,
            'customer_name' => 'Aarav Mehta',
            'customer_email' => 'aarav.mehta@example.com',
            'customer_phone' => '+91 98200 11223',
            'subtotal' => $ringPrice['subtotal'],
            'gst_amount' => $ringPrice['gst_amount'],
            'total_amount' => $ringPrice['total_price'],
            'status' => 'in_production', // 5-step status: confirmed -> in_production -> inspection -> shipped -> delivered
            'payment_method' => 'card',
            'payment_status' => 'paid',
            'shipping_address' => "402, Altamount Towers\nAltamount Road, Cumballa Hill\nMumbai, MH 400026\nIndia",
            'gold_rate_snapshot' => [
                'gold_22kt_per_10g' => 100000.00,
                'gold_24kt_per_g' => 10917.03,
                'silver_per_10g' => 950.00,
                'locked_at' => now()->subDays(2)->toIso8601String(),
            ],
            'notes' => 'Customer requested express delivery with bespoke velvet packaging.',
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $ring->id,
            'variant_id' => $v1->id,
            'product_name' => 'Origin Signet Ring',
            'design_code' => 'PD-SG-OR-001',
            'metal_purity' => '22KT',
            'finish' => 'Yellow Gold',
            'size' => '14',
            'gem' => 'None',
            'chain' => null,
            'weight_used' => 8.500,
            'gold_rate_locked' => 100000.00,
            'metal_value' => $ringPrice['metal_value'],
            'wastage_value' => $ringPrice['wastage_value'],
            'making_charge' => $ringPrice['making_charge'],
            'stone_charge' => $ringPrice['stone_charge'],
            'gst_amount' => $ringPrice['gst_amount'],
            'price' => $ringPrice['total_price'],
            'quantity' => 1,
            'total' => $ringPrice['total_price'],
            'price_breakdown' => $ringPrice,
        ]);

        // Order 2: Delivered Order
        $order2 = Order::create([
            'order_number' => 'PT-2026-0789',
            'customer_name' => 'Radhika Singhania',
            'customer_email' => 'radhika.s@example.com',
            'customer_phone' => '+91 99100 44556',
            'subtotal' => 88000.00,
            'gst_amount' => 2640.00,
            'total_amount' => 90640.00,
            'status' => 'delivered',
            'payment_method' => 'upi',
            'payment_status' => 'paid',
            'shipping_address' => "12, Golf Links\nNew Delhi, DL 110003\nIndia",
            'gold_rate_snapshot' => [
                'gold_22kt_per_10g' => 100000.00,
                'gold_24kt_per_g' => 10917.03,
                'silver_per_10g' => 950.00,
                'locked_at' => now()->subDays(5)->toIso8601String(),
            ],
            'notes' => 'Delivered securely via insured armored courier.',
        ]);

        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => $ring->id,
            'variant_id' => $v1->id,
            'product_name' => 'Origin Signet Ring',
            'design_code' => 'PD-SG-OR-001',
            'metal_purity' => '22KT',
            'finish' => 'Yellow Gold',
            'size' => '14',
            'gem' => 'None',
            'chain' => null,
            'weight_used' => 8.500,
            'gold_rate_locked' => 100000.00,
            'metal_value' => 85000.00,
            'wastage_value' => 0.00,
            'making_charge' => 3000.00,
            'stone_charge' => 0.00,
            'gst_amount' => 2640.00,
            'price' => 90640.00,
            'quantity' => 1,
            'total' => 90640.00,
            'price_breakdown' => $ringPrice,
        ]);
    }
}
