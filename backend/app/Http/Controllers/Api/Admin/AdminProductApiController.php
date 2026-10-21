<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CollectionMaster;
use App\Models\DesignLog;
use App\Models\MetalPurity;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use App\Services\JewelryPricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminProductApiController extends Controller
{
    protected JewelryPricingService $pricingService;

    public function __construct(JewelryPricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Default Master Categories dictionary with preset options (name, text, image, defaultEnabled).
     */
    public static function getDefaultOptionMasters(): array
    {
        return [
            [
                'id' => 'metal_purity',
                'name' => 'METAL PURITY (KT)',
                'description' => 'Select precious metal standard and purity hallmark.',
                'icon' => '🪙',
                'default_enabled' => true,
                'values' => [
                    ['value' => '24KT (99.9% Pure Gold)', 'image' => 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=200&auto=format&fit=crop', 'enabled' => true],
                    ['value' => '22KT (91.6% Royal Gold)', 'image' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=200&auto=format&fit=crop', 'enabled' => true],
                    ['value' => '18KT (75.0% Fine Gold)', 'image' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200&auto=format&fit=crop', 'enabled' => true],
                    ['value' => '14KT (58.5% Modern Gold)', 'image' => 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=200&auto=format&fit=crop', 'enabled' => false],
                    ['value' => 'PT950 (Platinum)', 'image' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&auto=format&fit=crop', 'enabled' => false],
                    ['value' => '925 Sterling Silver', 'image' => 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=200&auto=format&fit=crop', 'enabled' => false],
                ],
            ],
            [
                'id' => 'finish_options',
                'name' => 'FINISH OPTIONS',
                'description' => 'Surface gold tone and artisanal luster finish.',
                'icon' => '✨',
                'default_enabled' => true,
                'values' => [
                    ['value' => 'Yellow Gold', 'image' => '/images/products/pendant.png', 'enabled' => true],
                    ['value' => 'Rose Gold', 'image' => '/images/concept-hero1.png', 'enabled' => true],
                    ['value' => 'White Gold', 'image' => '/images/concept-designlog.png', 'enabled' => true],
                    ['value' => 'Matte Satin Gold', 'image' => '/images/concept-philosophy.png', 'enabled' => false],
                    ['value' => 'Antique Black Gold', 'image' => '/images/concept-enter.png', 'enabled' => false],
                ],
            ],
            [
                'id' => 'size',
                'name' => 'SIZE',
                'description' => 'Dimensional sizing for rings, bangles, or chain lengths.',
                'icon' => '📏',
                'default_enabled' => false,
                'values' => [
                    ['value' => 'Ring Size 10', 'image' => '', 'enabled' => true],
                    ['value' => 'Ring Size 12', 'image' => '', 'enabled' => true],
                    ['value' => 'Ring Size 14', 'image' => '', 'enabled' => true],
                    ['value' => 'Ring Size 16', 'image' => '', 'enabled' => true],
                    ['value' => 'Ring Size 18', 'image' => '', 'enabled' => false],
                    ['value' => 'Bangle 2.4', 'image' => '', 'enabled' => false],
                    ['value' => 'Bangle 2.6', 'image' => '', 'enabled' => false],
                    ['value' => 'Bangle 2.8', 'image' => '', 'enabled' => false],
                    ['value' => 'Chain 16"', 'image' => '', 'enabled' => false],
                    ['value' => 'Chain 18"', 'image' => '', 'enabled' => false],
                    ['value' => 'Chain 20"', 'image' => '', 'enabled' => false],
                ],
            ],
            [
                'id' => 'gem_stone_options',
                'name' => 'GEM / STONE OPTIONS',
                'description' => 'Precious gemstone and certified diamond accents.',
                'icon' => '💎',
                'default_enabled' => true,
                'values' => [
                    ['value' => 'Natural Diamond (VVS-VS)', 'image' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200&auto=format&fit=crop', 'enabled' => true],
                    ['value' => 'Zambian Emerald', 'image' => 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=200&auto=format&fit=crop', 'enabled' => false],
                    ['value' => 'Ceylon Blue Sapphire', 'image' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&auto=format&fit=crop', 'enabled' => false],
                    ['value' => 'Burmese Ruby', 'image' => 'https://images.unsplash.com/photo-1611591475155-42a92b23a9b1?q=80&w=200&auto=format&fit=crop', 'enabled' => false],
                    ['value' => 'No Stone / Solid Gold', 'image' => '', 'enabled' => true],
                ],
            ],
            [
                'id' => 'chain_type',
                'name' => 'CHAIN TYPE',
                'description' => 'Chain link style accompanying pendants and talismans.',
                'icon' => '⛓️',
                'default_enabled' => false,
                'values' => [
                    ['value' => 'Box Chain (18")', 'image' => '/images/products/chain.png', 'enabled' => true],
                    ['value' => 'Cable Chain (18")', 'image' => '/images/concept-hero1.png', 'enabled' => true],
                    ['value' => 'Rope Chain (20")', 'image' => '/images/products/necklace.png', 'enabled' => false],
                    ['value' => 'Wheat Chain (18")', 'image' => '/images/products/bracelet.png', 'enabled' => false],
                    ['value' => 'Pendant Only (No Chain)', 'image' => '', 'enabled' => true],
                ],
            ],
        ];
    }

    /**
     * Endpoint to fetch the default 5 Customization Master categories.
     */
    public function optionMasters(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => self::getDefaultOptionMasters(),
        ]);
    }

    /**
     * Sync dynamic options and option values for a product.
     */
    protected function syncProductOptions(Product $product, ?array $optionsData): void
    {
        if ($optionsData === null) {
            return;
        }

        // Delete existing options and cascade values
        $product->options()->each(function ($opt) {
            $opt->values()->delete();
            $opt->delete();
        });

        $sortOrder = 1;
        foreach ($optionsData as $opt) {
            if (empty($opt['name'])) {
                continue;
            }
            if (isset($opt['enabled']) && !$opt['enabled']) {
                continue;
            }

            $productOption = ProductOption::create([
                'product_id' => $product->id,
                'name' => trim($opt['name']),
                'sort_order' => $sortOrder++,
            ]);

            if (!empty($opt['values']) && is_array($opt['values'])) {
                $valOrder = 1;
                foreach ($opt['values'] as $val) {
                    $vText = '';
                    $vImg = null;
                    $isEnabled = true;

                    if (is_array($val)) {
                        if (isset($val['enabled']) && !$val['enabled']) {
                            continue;
                        }
                        $vText = $val['value'] ?? '';
                        $vImg = $val['image'] ?? null;
                    } else {
                        $vText = (string) $val;
                    }

                    if (trim($vText)) {
                        ProductOptionValue::create([
                            'product_option_id' => $productOption->id,
                            'value' => trim($vText),
                            'image' => $vImg ? trim($vImg) : null,
                            'sort_order' => $valOrder++,
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Display a listing of jewelry products for admin management.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['collectionMaster', 'primaryImage', 'images', 'options.values']);

        // Search query
        if ($request->filled('search')) {
            $s = trim($request->search);
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('design_code', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%")
                  ->orWhere('designed_by', 'like', "%{$s}%");
            });
        }

        // Collection filter
        if ($request->filled('collection_id')) {
            $query->where('collection_master_id', $request->collection_id);
        } elseif ($request->filled('collection')) {
            $slug = $request->collection;
            $query->whereHas('collectionMaster', function ($q) use ($slug) {
                $q->where('slug', $slug);
            });
        }

        // Tier filter
        if ($request->filled('tier') && $request->tier !== 'all') {
            $query->where('tier', $request->tier);
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Order
        $sort = $request->query('sort', 'latest');
        if ($sort === 'weight_desc') {
            $query->orderBy('base_weight_grams', 'desc');
        } elseif ($sort === 'weight_asc') {
            $query->orderBy('base_weight_grams', 'asc');
        } elseif ($sort === 'name_asc') {
            $query->orderBy('name', 'asc');
        } else {
            $query->latest();
        }

        $products = $query->get();

        $data = $products->map(function ($product) {
            $pricing = $this->pricingService->calculateProductPrice($product);
            $primaryImg = $product->primaryImage?->url ?? $product->images->first()?->url ?? '/images/concept-hero1.png';
            $imageUrls = $product->images->pluck('url')->toArray();
            if (empty($imageUrls)) {
                $imageUrls = [$primaryImg];
            }

            return [
                'id' => $product->id,
                'design_code' => $product->design_code,
                'sku' => $product->design_code,
                'name' => $product->name,
                'tier' => $product->tier,
                'collection_master_id' => $product->collection_master_id,
                'collection' => $product->collectionMaster ? [
                    'id' => $product->collectionMaster->id,
                    'name' => $product->collectionMaster->name,
                    'slug' => $product->collectionMaster->slug,
                ] : null,
                'collection_name' => $product->collectionMaster?->name ?? 'Unassigned',
                'description' => $product->description ?? '',
                'model_3d_url' => $product->model_3d_url,
                'base_weight_grams' => (float) $product->base_weight_grams,
                'weight' => (float) $product->base_weight_grams . 'g',
                'making_charge' => $product->making_charge !== null ? (float) $product->making_charge : null,
                'making_charge_percent' => $product->making_charge_percent !== null ? (float) $product->making_charge_percent : null,
                'wastage_percent' => (float) ($product->wastage_percent ?? 0.0),
                'status' => $product->status,
                'designed_by' => $product->designed_by ?? 'Darshit Soni',
                'release_date' => $product->release_date?->format('Y-m-d'),
                'huid' => $product->huid,
                'certificate_number' => $product->certificate_number,
                'certificate_url' => $product->certificate_url,
                'image' => $primaryImg,
                'primary_image' => $primaryImg,
                'images' => $imageUrls,
                'calculated_price' => $pricing,
                'price' => '₹' . number_format($pricing['total_price'] ?? 0),
                'total_price' => $pricing['total_price'] ?? 0,
                'options' => $product->options->map(fn($o) => [
                    'id' => $o->id,
                    'name' => $o->name,
                    'enabled' => true,
                    'values' => $o->values->map(fn($v) => [
                        'id' => $v->id,
                        'value' => $v->value,
                        'image' => $v->image,
                        'enabled' => true,
                    ]),
                ]),
                'created_at' => $product->created_at?->toIso8601String(),
            ];
        });

        // Current spot rates for admin reference
        $baseGoldRate22 = $this->pricingService->getBaseGoldRatePer10g();
        $pureGoldRate24_g = $this->pricingService->calculatePureGoldRatePerGram($baseGoldRate22);

        return response()->json([
            'status' => 'success',
            'count' => $data->count(),
            'spot_rates' => [
                'gold_24k_per_gram' => round($pureGoldRate24_g, 2),
                'gold_22k_per_gram' => round($baseGoldRate22 / 10.0, 2),
                'gold_22k_per_10g' => $baseGoldRate22,
            ],
            'data' => $data,
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'design_code' => 'nullable|string|max:100',
            'tier' => 'nullable|in:Signature,Curated,Heritage',
            'collection_master_id' => 'nullable|exists:collections_master,id',
            'base_weight_grams' => 'required|numeric|min:0.01',
            'making_charge' => 'nullable|numeric|min:0',
            'making_charge_percent' => 'nullable|numeric|min:0|max:100',
            'wastage_percent' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|in:active,draft,archived',
            'designed_by' => 'nullable|string|max:255',
            'release_date' => 'nullable|date',
            'description' => 'nullable|string',
            'model_3d_url' => 'nullable|string',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'options' => 'nullable|array',
            'design_log' => 'nullable|array',
        ]);

        // Auto-generate design_code if empty
        $code = !empty($validated['design_code']) ? strtoupper(trim($validated['design_code'])) : null;
        if (!$code) {
            $prefix = 'PIN';
            if (!empty($validated['collection_master_id'])) {
                $col = CollectionMaster::find($validated['collection_master_id']);
                if ($col) {
                    $prefix = 'PIN-' . strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $col->name), 0, 3));
                }
            }
            $counter = Product::count() + 1;
            do {
                $code = sprintf('%s-%03d', $prefix, $counter);
                $counter++;
            } while (Product::where('design_code', $code)->exists());
        } else {
            if (Product::where('design_code', $code)->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => "A piece with Design Code / SKU '{$code}' already exists.",
                ], 422);
            }
        }

        if (empty($validated['name'])) {
            $validated['name'] = !empty($code) ? "Piece {$code}" : 'Bespoke Jewelry Piece';
        }

        DB::beginTransaction();
        try {
            $product = Product::create([
                'design_code' => $code,
                'name' => $validated['name'],
                'tier' => $validated['tier'] ?? 'Signature',
                'collection_master_id' => $validated['collection_master_id'] ?? null,
                'description' => $validated['description'] ?? '',
                'model_3d_url' => $validated['model_3d_url'] ?? $request->model_3d_url ?? null,
                'base_weight_grams' => (float) $validated['base_weight_grams'],
                'making_charge' => isset($validated['making_charge']) && $validated['making_charge'] !== '' ? (float) $validated['making_charge'] : null,
                'making_charge_percent' => isset($validated['making_charge_percent']) && $validated['making_charge_percent'] !== '' ? (float) $validated['making_charge_percent'] : null,
                'wastage_percent' => (float) ($validated['wastage_percent'] ?? 0.0),
                'status' => $validated['status'] ?? 'active',
                'designed_by' => $validated['designed_by'] ?? 'Darshit Soni',
                'release_date' => $validated['release_date'] ?? now()->toDateString(),
                'huid' => $request->huid ?? null,
                'certificate_number' => $request->certificate_number ?? null,
                'certificate_url' => $request->certificate_url ?? null,
            ]);

            // Handle images
            $imagesList = [];
            if (!empty($validated['images']) && is_array($validated['images'])) {
                $imagesList = $validated['images'];
            } elseif (!empty($validated['image'])) {
                $imagesList = [$validated['image']];
            } else {
                $imagesList = ['/images/concept-hero1.png'];
            }

            foreach ($imagesList as $index => $imgItem) {
                $imgUrl = is_array($imgItem) ? ($imgItem['url'] ?? '') : (string) $imgItem;
                if (trim($imgUrl)) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'url' => trim($imgUrl),
                        'sort_order' => $index,
                        'is_primary' => $index === 0,
                    ]);
                }
            }

            // Handle Dynamic Option Masters
            if (isset($validated['options']) && is_array($validated['options'])) {
                $this->syncProductOptions($product, $validated['options']);
            }

            // Handle Design Log
            if (isset($validated['design_log']) && is_array($validated['design_log'])) {
                $dlData = $validated['design_log'];
                DesignLog::updateOrCreate(
                    ['product_id' => $product->id],
                    [
                        'blueprint_image' => $dlData['blueprint_image'] ?? null,
                        'design_type' => $dlData['design_type'] ?? null,
                        'status' => $dlData['status'] ?? 'UNDER DEVELOPMENT',
                        'inspired_by' => $dlData['inspired_by'] ?? null,
                        'release_date' => $dlData['release_date'] ?? null,
                        'measurements' => $dlData['measurements'] ?? null,
                        'gem_details' => $dlData['gem_details'] ?? null,
                        'specs' => $dlData['specs'] ?? null,
                        'idea_image' => $dlData['idea_image'] ?? null,
                        'idea_note' => $dlData['idea_note'] ?? null,
                        'cad_image' => $dlData['cad_image'] ?? null,
                        'cad_note' => $dlData['cad_note'] ?? null,
                        'craft_image' => $dlData['craft_image'] ?? null,
                        'craft_note' => $dlData['craft_note'] ?? null,
                        'creation_image' => $dlData['creation_image'] ?? null,
                        'creation_note' => $dlData['creation_note'] ?? null,
                    ]
                );
            }

            DB::commit();

            $pricing = $this->pricingService->calculateProductPrice($product);
            $product->load(['collectionMaster', 'primaryImage', 'images', 'options.values', 'designLog']);

            return response()->json([
                'status' => 'success',
                'message' => "Jewelry piece '{$product->name}' ({$product->design_code}) created successfully.",
                'data' => [
                    'id' => $product->id,
                    'design_code' => $product->design_code,
                    'sku' => $product->design_code,
                    'name' => $product->name,
                    'tier' => $product->tier,
                    'collection_master_id' => $product->collection_master_id,
                    'collection_name' => $product->collectionMaster?->name ?? 'Unassigned',
                    'base_weight_grams' => (float) $product->base_weight_grams,
                    'making_charge' => $product->making_charge,
                    'making_charge_percent' => $product->making_charge_percent,
                    'wastage_percent' => (float) $product->wastage_percent,
                    'status' => $product->status,
                    'image' => $product->primaryImage?->url ?? $imagesList[0],
                    'images' => $product->images->pluck('url')->toArray(),
                    'calculated_price' => $pricing,
                    'price' => '₹' . number_format($pricing['total_price'] ?? 0),
                    'options' => $product->options->map(fn($o) => [
                        'id' => $o->id,
                        'name' => $o->name,
                        'enabled' => true,
                        'values' => $o->values->map(fn($v) => [
                            'id' => $v->id,
                            'value' => $v->value,
                            'image' => $v->image,
                            'enabled' => true,
                        ]),
                    ]),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create product: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified product with complete details and pricing breakdown.
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['collectionMaster', 'images', 'options.values', 'variants', 'designLog'])
            ->findOrFail($id);

        $pricing = $this->pricingService->calculateProductPrice($product);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $product->id,
                'design_code' => $product->design_code,
                'sku' => $product->design_code,
                'name' => $product->name,
                'tier' => $product->tier,
                'collection_master_id' => $product->collection_master_id,
                'collection' => $product->collectionMaster ? [
                    'id' => $product->collectionMaster->id,
                    'name' => $product->collectionMaster->name,
                    'slug' => $product->collectionMaster->slug,
                ] : null,
                'description' => $product->description,
                'base_weight_grams' => (float) $product->base_weight_grams,
                'making_charge' => $product->making_charge,
                'making_charge_percent' => $product->making_charge_percent,
                'wastage_percent' => (float) $product->wastage_percent,
                'status' => $product->status,
                'huid' => $product->huid,
                'certificate_number' => $product->certificate_number,
                'certificate_url' => $product->certificate_url,
                'designed_by' => $product->designed_by,
                'release_date' => $product->release_date?->format('Y-m-d'),
                'primary_image' => $product->primaryImage?->url ?? $product->images->first()?->url,
                'model_3d_url' => $product->model_3d_url,
                'images' => $product->images->pluck('url')->toArray(),
                'calculated_price' => $pricing,
                'options' => $product->options->map(fn($o) => [
                    'id' => $o->id,
                    'name' => $o->name,
                    'enabled' => true,
                    'values' => $o->values->map(fn($v) => [
                        'id' => $v->id,
                        'value' => $v->value,
                        'image' => $v->image,
                        'enabled' => true,
                    ]),
                ]),
                'created_at' => $product->created_at?->toIso8601String(),
                'design_log' => $product->designLog,
            ],
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'design_code' => 'nullable|string|max:100',
            'tier' => 'nullable|in:Signature,Curated,Heritage',
            'collection_master_id' => 'nullable|exists:collections_master,id',
            'base_weight_grams' => 'required|numeric|min:0.01',
            'making_charge' => 'nullable|numeric|min:0',
            'making_charge_percent' => 'nullable|numeric|min:0|max:100',
            'wastage_percent' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|in:active,draft,archived',
            'designed_by' => 'nullable|string|max:255',
            'release_date' => 'nullable|date',
            'description' => 'nullable|string',
            'model_3d_url' => 'nullable|string',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'options' => 'nullable|array',
            'design_log' => 'nullable|array',
        ]);

        if (array_key_exists('name', $validated) && empty($validated['name'])) {
            $validated['name'] = !empty($product->design_code) ? "Piece {$product->design_code}" : 'Bespoke Jewelry Piece';
        }

        if (!empty($validated['design_code']) && strtoupper(trim($validated['design_code'])) !== $product->design_code) {
            $newCode = strtoupper(trim($validated['design_code']));
            if (Product::where('design_code', $newCode)->where('id', '!=', $product->id)->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Design Code '{$newCode}' is already taken by another product.",
                ], 422);
            }
            $product->design_code = $newCode;
        }

        DB::beginTransaction();
        try {
            $product->name = $validated['name'];
            $product->tier = $validated['tier'] ?? $product->tier;
            $product->collection_master_id = array_key_exists('collection_master_id', $validated) ? $validated['collection_master_id'] : $product->collection_master_id;
            $product->description = $validated['description'] ?? $product->description;
            if ($request->has('model_3d_url')) {
                $product->model_3d_url = $request->model_3d_url;
            }
            $product->base_weight_grams = (float) $validated['base_weight_grams'];
            $product->making_charge = isset($validated['making_charge']) && $validated['making_charge'] !== '' ? (float) $validated['making_charge'] : null;
            $product->making_charge_percent = isset($validated['making_charge_percent']) && $validated['making_charge_percent'] !== '' ? (float) $validated['making_charge_percent'] : null;
            $product->wastage_percent = (float) ($validated['wastage_percent'] ?? $product->wastage_percent);
            $product->status = $validated['status'] ?? $product->status;
            $product->designed_by = $validated['designed_by'] ?? $product->designed_by;
            if ($request->has('huid')) {
                $product->huid = $request->huid;
            }
            if ($request->has('certificate_number')) {
                $product->certificate_number = $request->certificate_number;
            }
            if ($request->has('certificate_url')) {
                $product->certificate_url = $request->certificate_url;
            }
            if (!empty($validated['release_date'])) {
                $product->release_date = $validated['release_date'];
            }
            $product->save();

            // Update images if provided
            if (isset($validated['images']) || isset($validated['image'])) {
                $imagesList = [];
                if (!empty($validated['images']) && is_array($validated['images'])) {
                    $imagesList = $validated['images'];
                } elseif (!empty($validated['image'])) {
                    $imagesList = [$validated['image']];
                }

                if (!empty($imagesList)) {
                    $product->images()->delete();
                    foreach ($imagesList as $index => $imgItem) {
                        $imgUrl = is_array($imgItem) ? ($imgItem['url'] ?? '') : (string) $imgItem;
                        if (trim($imgUrl)) {
                            ProductImage::create([
                                'product_id' => $product->id,
                                'url' => trim($imgUrl),
                                'sort_order' => $index,
                                'is_primary' => $index === 0,
                            ]);
                        }
                    }
                }
            }

            // Sync Dynamic Option Masters
            if (array_key_exists('options', $validated)) {
                $this->syncProductOptions($product, $validated['options']);
            }

            // Sync Design Log
            if (array_key_exists('design_log', $validated) && is_array($validated['design_log'])) {
                $dlData = $validated['design_log'];
                DesignLog::updateOrCreate(
                    ['product_id' => $product->id],
                    [
                        'blueprint_image' => $dlData['blueprint_image'] ?? null,
                        'design_type' => $dlData['design_type'] ?? null,
                        'status' => $dlData['status'] ?? 'UNDER DEVELOPMENT',
                        'inspired_by' => $dlData['inspired_by'] ?? null,
                        'release_date' => $dlData['release_date'] ?? null,
                        'measurements' => $dlData['measurements'] ?? null,
                        'gem_details' => $dlData['gem_details'] ?? null,
                        'specs' => $dlData['specs'] ?? null,
                        'idea_image' => $dlData['idea_image'] ?? null,
                        'idea_note' => $dlData['idea_note'] ?? null,
                        'cad_image' => $dlData['cad_image'] ?? null,
                        'cad_note' => $dlData['cad_note'] ?? null,
                        'craft_image' => $dlData['craft_image'] ?? null,
                        'craft_note' => $dlData['craft_note'] ?? null,
                        'creation_image' => $dlData['creation_image'] ?? null,
                        'creation_note' => $dlData['creation_note'] ?? null,
                    ]
                );
            }

            DB::commit();

            $pricing = $this->pricingService->calculateProductPrice($product);
            $product->load(['collectionMaster', 'primaryImage', 'images', 'options.values', 'designLog']);

            return response()->json([
                'status' => 'success',
                'message' => "Piece '{$product->name}' updated successfully.",
                'data' => [
                    'id' => $product->id,
                    'design_code' => $product->design_code,
                    'sku' => $product->design_code,
                    'name' => $product->name,
                    'tier' => $product->tier,
                    'collection_master_id' => $product->collection_master_id,
                    'collection_name' => $product->collectionMaster?->name ?? 'Unassigned',
                    'base_weight_grams' => (float) $product->base_weight_grams,
                    'making_charge' => $product->making_charge,
                    'making_charge_percent' => $product->making_charge_percent,
                    'wastage_percent' => (float) $product->wastage_percent,
                    'status' => $product->status,
                    'image' => $product->primaryImage?->url ?? '/images/concept-hero1.png',
                    'images' => $product->images->pluck('url')->toArray(),
                    'calculated_price' => $pricing,
                    'price' => '₹' . number_format($pricing['total_price'] ?? 0),
                    'design_log' => $product->designLog,
                    'options' => $product->options->map(fn($o) => [
                        'id' => $o->id,
                        'name' => $o->name,
                        'enabled' => true,
                        'values' => $o->values->map(fn($v) => [
                            'id' => $v->id,
                            'value' => $v->value,
                            'image' => $v->image,
                            'enabled' => true,
                        ]),
                    ]),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update product: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found.',
            ], 404);
        }

        $code = $product->design_code;
        $name = $product->name;
        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Product '{$name}' ({$code}) was deleted from the catalog.",
        ]);
    }

    /**
     * Preview dynamic pricing calculations for hypothetical product parameters.
     */
    public function previewPrice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'weight_grams' => 'required|numeric|min:0.01',
            'purity' => 'nullable|string',
            'purity_fraction' => 'nullable|numeric|min:0.1|max:1.0',
            'wastage_percent' => 'nullable|numeric|min:0|max:100',
            'making_charge' => 'nullable|numeric|min:0',
            'making_charge_percent' => 'nullable|numeric|min:0|max:100',
            'stone_charge' => 'nullable|numeric|min:0',
            'metal_type' => 'nullable|string',
        ]);

        $weight = (float) $validated['weight_grams'];
        $wastage = (float) ($validated['wastage_percent'] ?? 0.0);
        $makingFlat = isset($validated['making_charge']) ? (float) $validated['making_charge'] : 0.0;
        $makingPct = isset($validated['making_charge_percent']) ? (float) $validated['making_charge_percent'] : null;
        $stone = (float) ($validated['stone_charge'] ?? 0.0);
        $metalType = $validated['metal_type'] ?? 'gold';

        // Resolve purity fraction
        $purityFraction = $validated['purity_fraction'] ?? null;
        if (!$purityFraction && !empty($validated['purity'])) {
            $mp = MetalPurity::where('name', $validated['purity'])->first();
            if ($mp) {
                $purityFraction = (float) $mp->purity_fraction;
                $metalType = $mp->type;
            }
        }
        if (!$purityFraction) {
            $purityFraction = 0.916; // default 22KT
        }

        $breakdown = $this->pricingService->calculatePrice(
            weightGrams: $weight,
            purityFraction: (float) $purityFraction,
            wastagePercent: $wastage,
            makingChargeFlat: $makingFlat,
            makingChargePercent: $makingPct,
            stoneCharge: $stone,
            metalType: $metalType
        );

        return response()->json([
            'status' => 'success',
            'data' => $breakdown,
        ]);
    }

    /**
     * Upload product media file (Images, Videos, 3D Models) to public storage.
     */
    public function uploadMedia(Request $request): JsonResponse
    {
        $request->validate([
            'media' => 'required|file|max:51200', // max 50MB
        ]);

        $file = $request->file('media');
        $ext = strtolower($file->getClientOriginalExtension());
        $mime = $file->getMimeType() ?: '';

        $type = 'image';
        if (str_starts_with($mime, 'video/') || in_array($ext, ['mp4', 'webm', 'mov', 'm4v'])) {
            $type = 'video';
        } elseif (in_array($ext, ['glb', 'gltf', 'usdz', 'obj'])) {
            $type = 'model';
        }

        $folder = 'products/' . ($type === 'video' ? 'videos' : ($type === 'model' ? 'models' : 'images'));
        $fileName = 'media_' . time() . '_' . Str::random(8) . '.' . $ext;
        $file->storeAs($folder, $fileName, 'public');

        $url = url('storage/' . $folder . '/' . $fileName);

        return response()->json([
            'status' => 'success',
            'url' => $url,
            'type' => $type,
            'name' => $file->getClientOriginalName(),
        ]);
    }
}
