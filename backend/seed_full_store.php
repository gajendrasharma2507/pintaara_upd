<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\CollectionMaster;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use App\Models\ProductVariant;
use App\Models\DesignLog;
use App\Models\MetalPurity;
use App\Models\FinishOption;
use App\Models\GemOption;
use App\Models\GoldRate;
use App\Models\Setting;
use Illuminate\Support\Facades\Hash;

echo "Seeding full store with 100% real data...\n";

// 1. Settings
Setting::set('gst_percent', 3.0, 'number', 'Goods and Services Tax percentage for fine jewelry');
Setting::set('default_wastage_percent', 0.0, 'number', 'Default wastage buffer percentage');
Setting::set('brand_name', 'PINTAARA', 'string', 'Luxury Fine Jewelry Atelier');
Setting::set('currency_symbol', '₹', 'string', 'Currency symbol');
Setting::set('contact_email', 'concierge@pintaara.com', 'string', 'Customer concierge email');
Setting::set('contact_phone', '+91 98765 43210', 'string', 'Concierge VIP hotline');

// 2. Admin & Demo User
$admin = User::firstOrCreate(
    ['email' => 'admin@pintaara.com'],
    [
        'name' => 'Darshit Soni',
        'password' => Hash::make('password'),
        'role' => 'admin',
    ]
);

$customer = User::firstOrCreate(
    ['email' => 'customer@pintaara.com'],
    [
        'name' => 'Darshit Soni',
        'phone' => '+91 95104 00753',
        'password' => Hash::make('password'),
        'role' => 'customer',
    ]
);

// 3. Purities
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

// 4. Finishes
$finishes = [
    ['name' => 'Yellow Gold', 'hex_color' => '#D4AF37', 'sort_order' => 1],
    ['name' => 'White Gold', 'hex_color' => '#E8E8E8', 'sort_order' => 2],
    ['name' => 'Rose Gold', 'hex_color' => '#B76E79', 'sort_order' => 3],
    ['name' => 'Black Ruthenium', 'hex_color' => '#2B2B2B', 'sort_order' => 4],
];
foreach ($finishes as $f) {
    FinishOption::updateOrCreate(['name' => $f['name']], $f);
}

// 5. Gems
$gems = [
    ['stone_type' => 'None', 'carat' => null, 'default_stone_charge' => 0.00, 'sort_order' => 1],
    ['stone_type' => 'Natural Diamond (VVS-VS)', 'carat' => 0.500, 'default_stone_charge' => 45000.00, 'sort_order' => 2],
    ['stone_type' => 'Zambian Emerald', 'carat' => 0.600, 'default_stone_charge' => 32000.00, 'sort_order' => 3],
    ['stone_type' => 'Ceylon Blue Sapphire', 'carat' => 0.550, 'default_stone_charge' => 30000.00, 'sort_order' => 4],
    ['stone_type' => 'Burmese Ruby', 'carat' => 0.700, 'default_stone_charge' => 28000.00, 'sort_order' => 5],
];
foreach ($gems as $g) {
    GemOption::updateOrCreate(['stone_type' => $g['stone_type']], $g);
}

// 6. Gold & Silver Spot Rates for Today
$gold22kt = $purityModels['22KT'];
$silver925 = $purityModels['925 Silver'];
$today = date('Y-m-d');

GoldRate::updateOrCreate(
    ['metal_type' => 'gold', 'effective_date' => $today],
    [
        'rate_per_10g' => 100000.00,
        'base_purity_id' => $gold22kt->id,
        'source' => 'manual',
        'created_by' => $admin->id,
    ]
);

GoldRate::updateOrCreate(
    ['metal_type' => 'silver', 'effective_date' => $today],
    [
        'rate_per_10g' => 950.00,
        'base_purity_id' => $silver925->id,
        'source' => 'manual',
        'created_by' => $admin->id,
    ]
);

// 7. All 8 Collection Masters
$collections = [
    ['name' => 'Pendants', 'slug' => 'pendants', 'image' => '/images/products/pendant.png', 'sort_order' => 1],
    ['name' => 'Rings', 'slug' => 'rings', 'image' => '/images/products/ring.png', 'sort_order' => 2],
    ['name' => 'Bracelets', 'slug' => 'bracelets', 'image' => '/images/products/bracelet.png', 'sort_order' => 3],
    ['name' => 'Earrings', 'slug' => 'earrings', 'image' => '/images/products/earrings.png', 'sort_order' => 4],
    ['name' => 'Chains', 'slug' => 'chains', 'image' => '/images/products/chain.png', 'sort_order' => 5],
    ['name' => 'Necklaces', 'slug' => 'necklaces', 'image' => '/images/products/necklace.png', 'sort_order' => 6],
    ['name' => 'Mangalsutras', 'slug' => 'mangalsutras', 'image' => '/images/products/mangalsutra.png', 'sort_order' => 7],
    ['name' => 'Bangles', 'slug' => 'bangles', 'image' => '/images/products/bangles.png', 'sort_order' => 8],
];

$colModels = [];
foreach ($collections as $c) {
    $colModels[$c['slug']] = CollectionMaster::updateOrCreate(['slug' => $c['slug']], $c);
}

// 8. 32 Complete Real Products (4 per category)
$catalog = [
    // PENDANTS
    [
        'code' => 'PD-SG-OR-001',
        'slug' => 'pendants',
        'name' => 'Butterfly Pendant Origin',
        'tier' => 'Signature',
        'weight' => 8.5,
        'making' => 12500,
        'image' => '/images/products/pendant.png',
        'desc' => 'Signature butterfly pendant embodying sacred geometry, cantilevered wings, and 57-facet brilliant diamond core.',
        'inspiration' => 'Brutalist symmetry and natural metamorphosis',
    ],
    [
        'code' => 'PD-SG-OR-002',
        'slug' => 'pendants',
        'name' => 'Solitaire Drop Pendant',
        'tier' => 'Signature',
        'weight' => 7.8,
        'making' => 11000,
        'image' => '/images/products/pendant.png',
        'desc' => 'Minimalist teardrop setting suspended in pure gold casing with micro-faceted bezel.',
        'inspiration' => 'Dewdrop physics and morning horizon light',
    ],
    [
        'code' => 'PD-SG-FS-003',
        'slug' => 'pendants',
        'name' => 'Geometric Floral Pendant',
        'tier' => 'Curated',
        'weight' => 9.2,
        'making' => 13200,
        'image' => '/images/products/pendant.png',
        'desc' => 'Multi-tier architectural bloom forged from solid metal alloys with hand-satin accents.',
        'inspiration' => 'Sacred lotus geometries and radial balance',
    ],
    [
        'code' => 'PD-SG-MT-004',
        'slug' => 'pendants',
        'name' => 'Mountain Star Astral Pendant',
        'tier' => 'Curated',
        'weight' => 8.0,
        'making' => 11800,
        'image' => '/images/products/pendant.png',
        'desc' => 'Angular celestial star constellation forged with stepped bevel facets and mirror polish.',
        'inspiration' => 'Himalayan night sky constellations and razor peaks',
    ],

    // RINGS
    [
        'code' => 'RG-SG-OR-001',
        'slug' => 'rings',
        'name' => 'Origin Signet Ring',
        'tier' => 'Signature',
        'weight' => 6.2,
        'making' => 7500,
        'image' => '/images/products/ring.png',
        'desc' => 'Architectural signet ring forged from solid gold with precision bevelled facets and comfort-fit shank.',
        'inspiration' => 'Monolithic sculptures and timeless signet tradition',
    ],
    [
        'code' => 'RG-SG-OR-002',
        'slug' => 'rings',
        'name' => 'Duo Bevel Band Ring',
        'tier' => 'Signature',
        'weight' => 6.8,
        'making' => 8200,
        'image' => '/images/products/ring.png',
        'desc' => 'Twin angled facet profile providing dynamic light reflection with refined ergonomics.',
        'inspiration' => 'Dual horizons and structural arch bridges',
    ],
    [
        'code' => 'RG-SG-FS-003',
        'slug' => 'rings',
        'name' => 'Original Forms Arch Ring',
        'tier' => 'Curated',
        'weight' => 7.4,
        'making' => 8900,
        'image' => '/images/products/ring.png',
        'desc' => 'Sculpted cantilever arch ring with floating gem cradle and textured flank channels.',
        'inspiration' => 'Gothic arches and tension-loaded architecture',
    ],
    [
        'code' => 'RG-SG-MT-004',
        'slug' => 'rings',
        'name' => 'Mountain Star Prism Ring',
        'tier' => 'Curated',
        'weight' => 8.1,
        'making' => 9500,
        'image' => '/images/products/ring.png',
        'desc' => 'Prismatic multi-faceted band with hand-burnished edges and diamond bezel crown.',
        'inspiration' => 'Quartz crystals and jagged mountain silhouettes',
    ],

    // BRACELETS
    [
        'code' => 'BR-SG-OR-001',
        'slug' => 'bracelets',
        'name' => 'Origin Link Bracelet',
        'tier' => 'Signature',
        'weight' => 14.5,
        'making' => 16000,
        'image' => '/images/products/bracelet.png',
        'desc' => 'Heavy interlocking geometric links precision-machined and finished with hand-satin brushing.',
        'inspiration' => 'Industrial balance and eternal interconnectedness',
    ],
    [
        'code' => 'BR-SG-OR-002',
        'slug' => 'bracelets',
        'name' => 'Ethereal Rope Cuff Bracelet',
        'tier' => 'Signature',
        'weight' => 15.2,
        'making' => 17500,
        'image' => '/images/products/bracelet.png',
        'desc' => 'Braided Kundan gold filaments laser micro-welded into a seamless ergonomic cuff.',
        'inspiration' => 'Ancient rope filigree and modern atelier metallurgy',
    ],
    [
        'code' => 'BR-SG-FS-003',
        'slug' => 'bracelets',
        'name' => 'Original Forms Braid Bracelet',
        'tier' => 'Curated',
        'weight' => 16.0,
        'making' => 18000,
        'image' => '/images/products/bracelet.png',
        'desc' => 'Triple-weave solid gold braid with magnetic safety clasp and hallmark medallion.',
        'inspiration' => 'Woven river reed textures translated into fine gold',
    ],
    [
        'code' => 'BR-SG-MT-004',
        'slug' => 'bracelets',
        'name' => 'Mountain Star Mesh Bracelet',
        'tier' => 'Curated',
        'weight' => 17.0,
        'making' => 19500,
        'image' => '/images/products/bracelet.png',
        'desc' => 'Articulated geometric mesh bracelet providing liquid-like drape over the wrist.',
        'inspiration' => 'Dragon scale armor and fluid kinetic motion',
    ],

    // EARRINGS
    [
        'code' => 'ER-SG-OR-001',
        'slug' => 'earrings',
        'name' => 'Origin Stud Earrings',
        'tier' => 'Signature',
        'weight' => 5.8,
        'making' => 7200,
        'image' => '/images/products/earrings.png',
        'desc' => 'Minimalist faceted studs with screw back security and 0.5ct diamond centerpiece.',
        'inspiration' => 'Golden ratio nodules and pure elemental points',
    ],
    [
        'code' => 'ER-SG-OR-002',
        'slug' => 'earrings',
        'name' => 'Solitaire Drop Earrings',
        'tier' => 'Signature',
        'weight' => 6.4,
        'making' => 7800,
        'image' => '/images/products/earrings.png',
        'desc' => 'Cascading pendulum drops crafted with ultra-light hollow core engineering.',
        'inspiration' => 'Kinetic pendulums and gravity flow',
    ],
    [
        'code' => 'ER-SG-FS-003',
        'slug' => 'earrings',
        'name' => 'Architectural Hoop Earrings',
        'tier' => 'Curated',
        'weight' => 7.0,
        'making' => 8500,
        'image' => '/images/products/earrings.png',
        'desc' => 'Bold tapered oval hoops with invisible hinge closure and satin inner channel.',
        'inspiration' => 'Bauhaus circular geometry and hollow vessel forging',
    ],
    [
        'code' => 'ER-SG-MT-004',
        'slug' => 'earrings',
        'name' => 'Mountain Star Dangle Earrings',
        'tier' => 'Curated',
        'weight' => 7.5,
        'making' => 9000,
        'image' => '/images/products/earrings.png',
        'desc' => 'Multi-tier starburst drops catching light from every facet angle.',
        'inspiration' => 'Falling meteors and astral refraction',
    ],

    // CHAINS
    [
        'code' => 'CH-SG-OR-001',
        'slug' => 'chains',
        'name' => 'Origin Box Chain',
        'tier' => 'Signature',
        'weight' => 18.0,
        'making' => 12000,
        'image' => '/images/products/chain.png',
        'desc' => 'Square-profile dense solid gold box chain with high durability lobster clasp.',
        'inspiration' => 'Clean cubic foundations and structural purity',
    ],
    [
        'code' => 'CH-SG-OR-002',
        'slug' => 'chains',
        'name' => 'Rope Curb Chain',
        'tier' => 'Signature',
        'weight' => 20.0,
        'making' => 13500,
        'image' => '/images/products/chain.png',
        'desc' => 'Diamond-cut spiral rope chain creating continuous metallic shimmer.',
        'inspiration' => 'Nautical cordage and continuous spirals',
    ],
    [
        'code' => 'CH-SG-FS-003',
        'slug' => 'chains',
        'name' => 'Wheat Weave Chain',
        'tier' => 'Curated',
        'weight' => 22.0,
        'making' => 14800,
        'image' => '/images/products/chain.png',
        'desc' => 'Interwoven four-strand wheat link providing unmatched tensile strength.',
        'inspiration' => 'Golden grain stalks swaying in rhythmic unison',
    ],
    [
        'code' => 'CH-SG-MT-004',
        'slug' => 'chains',
        'name' => 'Heavy Franco Link Chain',
        'tier' => 'Curated',
        'weight' => 24.0,
        'making' => 16000,
        'image' => '/images/products/chain.png',
        'desc' => 'V-shaped chevron interlocking chain with dense heft and flat side bevels.',
        'inspiration' => 'Italian atelier curb techniques and brutalist links',
    ],

    // NECKLACES
    [
        'code' => 'NL-SG-OR-001',
        'slug' => 'necklaces',
        'name' => 'Origin Statement Choker',
        'tier' => 'Heritage',
        'weight' => 32.0,
        'making' => 28000,
        'image' => '/images/products/necklace.png',
        'desc' => 'Rigid collar choker curved precisely to clavicle contour with concealed back hinge.',
        'inspiration' => 'Royal torque collars and regal minimalism',
    ],
    [
        'code' => 'NL-SG-OR-002',
        'slug' => 'necklaces',
        'name' => 'Regal Filigree Necklace',
        'tier' => 'Heritage',
        'weight' => 35.0,
        'making' => 31000,
        'image' => '/images/products/necklace.png',
        'desc' => 'Intricate wire filigree woven into featherweight scalloped neckwear.',
        'inspiration' => 'Baroque lace patterns forged in gold wire',
    ],
    [
        'code' => 'NL-SG-FS-003',
        'slug' => 'necklaces',
        'name' => 'Heritage Royal Collar',
        'tier' => 'Heritage',
        'weight' => 38.0,
        'making' => 34000,
        'image' => '/images/products/necklace.png',
        'desc' => 'Heirloom ceremonial collar set with uncut gem polki accents and hand enamel.',
        'inspiration' => 'Maharaja court treasures and heritage craftsmanship',
    ],
    [
        'code' => 'NL-SG-MT-004',
        'slug' => 'necklaces',
        'name' => 'Mountain Star Grand Necklace',
        'tier' => 'Heritage',
        'weight' => 42.0,
        'making' => 38000,
        'image' => '/images/products/necklace.png',
        'desc' => 'Grand statement necklace with geometric stepped chevron drops and diamonds.',
        'inspiration' => 'Glacial cascades and tiered alpine peaks',
    ],

    // MANGALSUTRAS
    [
        'code' => 'MS-SG-OR-001',
        'slug' => 'mangalsutras',
        'name' => 'Origin Modern Mangalsutra',
        'tier' => 'Heritage',
        'weight' => 9.2,
        'making' => 9500,
        'image' => '/images/products/mangalsutra.png',
        'desc' => 'Contemporary minimalist mangalsutra pairing auspicious black beads with sleek gold bar.',
        'inspiration' => 'Sacred union rituals re-imagined for daily modern life',
    ],
    [
        'code' => 'MS-SG-OR-002',
        'slug' => 'mangalsutras',
        'name' => 'Solitaire Diamond Mangalsutra',
        'tier' => 'Heritage',
        'weight' => 10.0,
        'making' => 10200,
        'image' => '/images/products/mangalsutra.png',
        'desc' => 'Brilliant solitaire diamond suspended between dual-strand obsidian bead chain.',
        'inspiration' => 'Single enduring vow sealed in brilliant stone',
    ],
    [
        'code' => 'MS-SG-FS-003',
        'slug' => 'mangalsutras',
        'name' => 'Heritage Traditional Mangalsutra',
        'tier' => 'Heritage',
        'weight' => 11.5,
        'making' => 11800,
        'image' => '/images/products/mangalsutra.png',
        'desc' => 'Classic Vati cups with filigree repousse detailing and sacred protective motifs.',
        'inspiration' => 'Vedic sacred symbols and generation-spanning blessings',
    ],
    [
        'code' => 'MS-SG-MT-004',
        'slug' => 'mangalsutras',
        'name' => 'Astral Double-Strand Mangalsutra',
        'tier' => 'Heritage',
        'weight' => 12.5,
        'making' => 12500,
        'image' => '/images/products/mangalsutra.png',
        'desc' => 'Geometric chevron pendant paired with double 18K gold and spinel strand.',
        'inspiration' => 'Cosmic alignment of twin stars in eternal orbit',
    ],

    // BANGLES
    [
        'code' => 'BG-SG-OR-001',
        'slug' => 'bangles',
        'name' => 'Origin Solid Gold Bangle',
        'tier' => 'Heritage',
        'weight' => 16.5,
        'making' => 14000,
        'image' => '/images/products/bangles.png',
        'desc' => 'Monolithic solid gold circular bangle with bevelled outer edge and mirror polish.',
        'inspiration' => 'Eternal circular loops and indestructible vows',
    ],
    [
        'code' => 'BG-SG-OR-002',
        'slug' => 'bangles',
        'name' => 'Classic Fluted Kada Bangle',
        'tier' => 'Heritage',
        'weight' => 18.0,
        'making' => 15500,
        'image' => '/images/products/bangles.png',
        'desc' => 'Fluted cylindrical kada with concealed screw-pin lock for comfort and security.',
        'inspiration' => 'Doric columns and classical architectural fluting',
    ],
    [
        'code' => 'BG-SG-FS-003',
        'slug' => 'bangles',
        'name' => 'Heritage Filigree Kada',
        'tier' => 'Heritage',
        'weight' => 20.0,
        'making' => 17000,
        'image' => '/images/products/bangles.png',
        'desc' => 'Ornate floral filigree panels alternating with solid polished gold bands.',
        'inspiration' => 'Royal Mughal garden lattice screens (jaali work)',
    ],
    [
        'code' => 'BG-SG-MT-004',
        'slug' => 'bangles',
        'name' => 'Astral Carved Royal Bangle',
        'tier' => 'Heritage',
        'weight' => 22.0,
        'making' => 18500,
        'image' => '/images/products/bangles.png',
        'desc' => 'Heavy ceremonial bangle carved with celestial starlight motifs and diamond accents.',
        'inspiration' => 'Solar flares and astronomical celestial spheres',
    ],
];

foreach ($catalog as $item) {
    $col = $colModels[$item['slug']];
    $product = Product::updateOrCreate(
        ['design_code' => $item['code']],
        [
            'name' => $item['name'],
            'tier' => $item['tier'],
            'collection_master_id' => $col->id,
            'description' => $item['desc'],
            'base_weight_grams' => $item['weight'],
            'making_charge' => $item['making'],
            'making_charge_percent' => null,
            'wastage_percent' => 0.00,
            'status' => 'active',
            'designed_by' => 'Darshit Soni',
            'release_date' => date('Y-m-d', strtotime('-1 month')),
        ]
    );

    // Primary Image
    ProductImage::updateOrCreate(
        ['product_id' => $product->id, 'sort_order' => 1],
        ['url' => $item['image'], 'is_primary' => true]
    );

    // 1:1 Design Log
    DesignLog::updateOrCreate(
        ['product_id' => $product->id],
        [
            'idea_image' => '/images/design/step1.jpg',
            'idea_note' => "Initial hand-drafted concept exploring: {$item['inspiration']}.",
            'cad_image' => '/images/design/step2.png',
            'cad_note' => "Precision parametric 3D CAD modeling calculated for optimal metal flow and comfort-fit.",
            'craft_image' => '/images/design/step3.png',
            'craft_note' => "Lost-wax micro-casting, multi-stage hand filing, satin flank brushing, and 22KT hallmark stamping.",
            'creation_image' => $item['image'],
            'creation_note' => "Master atelier specimen certified with Bureau of Indian Standards (BIS) hallmark.",
            'inspired_by' => $item['inspiration'],
            'release_date' => date('Y-m-d', strtotime('-1 month')),
        ]
    );

    // Dynamic Product Options (Purity, Finish, Size/Chain, Gem)
    // Clear old options for clean reseed
    $product->options()->delete();

    // 1. Metal Purity
    $optPurity = ProductOption::create(['product_id' => $product->id, 'name' => 'Metal Purity (KT)', 'sort_order' => 1]);
    $p22 = ProductOptionValue::create(['product_option_id' => $optPurity->id, 'value' => '22KT', 'sort_order' => 1]);
    $p18 = ProductOptionValue::create(['product_option_id' => $optPurity->id, 'value' => '18KT', 'sort_order' => 2]);
    $p14 = ProductOptionValue::create(['product_option_id' => $optPurity->id, 'value' => '14KT', 'sort_order' => 3]);
    $pSilver = ProductOptionValue::create(['product_option_id' => $optPurity->id, 'value' => '925 Silver', 'sort_order' => 4]);

    // 2. Finish
    $optFinish = ProductOption::create(['product_id' => $product->id, 'name' => 'Finish Option', 'sort_order' => 2]);
    $fYG = ProductOptionValue::create(['product_option_id' => $optFinish->id, 'value' => 'Yellow Gold', 'sort_order' => 1]);
    $fWG = ProductOptionValue::create(['product_option_id' => $optFinish->id, 'value' => 'White Gold', 'sort_order' => 2]);
    $fRG = ProductOptionValue::create(['product_option_id' => $optFinish->id, 'value' => 'Rose Gold', 'sort_order' => 3]);
    $fBLK = ProductOptionValue::create(['product_option_id' => $optFinish->id, 'value' => 'Black Ruthenium', 'sort_order' => 4]);

    // 3. Size / Chain depending on category
    if (in_array($item['slug'], ['rings', 'bangles', 'bracelets'])) {
        $optSize = ProductOption::create(['product_id' => $product->id, 'name' => 'Size', 'sort_order' => 3]);
        foreach (['10', '12', '14', '16'] as $idx => $sVal) {
            ProductOptionValue::create(['product_option_id' => $optSize->id, 'value' => $sVal, 'sort_order' => $idx + 1]);
        }
    } else {
        $optChain = ProductOption::create(['product_id' => $product->id, 'name' => 'Chain', 'sort_order' => 3]);
        foreach (['Box', 'Cable', 'Rope', 'Wheat', 'None'] as $idx => $cVal) {
            ProductOptionValue::create(['product_option_id' => $optChain->id, 'value' => $cVal, 'sort_order' => $idx + 1]);
        }
    }

    // 4. Gem / Stone Options
    $optGem = ProductOption::create(['product_id' => $product->id, 'name' => 'Gem / Stone Options', 'sort_order' => 4]);
    ProductOptionValue::create(['product_option_id' => $optGem->id, 'value' => 'Natural Diamond', 'sort_order' => 1]);
    ProductOptionValue::create(['product_option_id' => $optGem->id, 'value' => 'Zambian Emerald', 'sort_order' => 2]);
    ProductOptionValue::create(['product_option_id' => $optGem->id, 'value' => 'Ceylon Blue Sapphire', 'sort_order' => 3]);

    // Sample Variant for this product
    $product->variants()->delete();
    $v = ProductVariant::create([
        'product_id' => $product->id,
        'sku' => "{$item['code']}-18KT-YG",
        'weight_override_grams' => $item['weight'],
        'stock_qty' => 10,
        'enabled' => true,
    ]);
    $v->optionValues()->attach([$p18->id, $fYG->id]);
}

echo "Successfully seeded all " . count($catalog) . " real products across all 8 collections!\n";
