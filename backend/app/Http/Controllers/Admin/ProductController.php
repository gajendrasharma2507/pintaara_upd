<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CollectionMaster;
use App\Models\DesignLog;
use App\Models\FinishOption;
use App\Models\GemOption;
use App\Models\MetalPurity;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use App\Models\ProductVariant;
use App\Services\JewelryPricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    protected JewelryPricingService $pricingService;

    public function __construct(JewelryPricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    public function index(Request $request)
    {
        $query = Product::with(['collectionMaster', 'primaryImage', 'variants.optionValues.option', 'designLog']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('name', 'LIKE', "%{$s}%")
                  ->orWhere('design_code', 'LIKE', "%{$s}%")
                  ->orWhere('description', 'LIKE', "%{$s}%");
            });
        }

        if ($request->filled('collection_id')) {
            $query->where('collection_master_id', $request->collection_id);
        }

        if ($request->filled('tier')) {
            $query->where('tier', $request->tier);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $products = $query->latest()->paginate(15);

        // Precompute live pricing breakdowns for each product
        $prices = [];
        foreach ($products as $prod) {
            $prices[$prod->id] = $this->pricingService->calculateProductPrice($prod);
        }

        $collections = CollectionMaster::where('status', 'active')->orderBy('name')->get();
        $currentGold22 = $this->pricingService->getBaseGoldRatePer10g();

        return view('admin.products.index', compact('products', 'prices', 'collections', 'currentGold22'));
    }

    public function create()
    {
        $collections = CollectionMaster::where('status', 'active')->orderBy('sort_order')->get();
        $purities = MetalPurity::where('is_active', true)->orderBy('sort_order')->get();
        $finishes = FinishOption::orderBy('sort_order')->get();
        $gems = GemOption::orderBy('sort_order')->get();
        $currentGold22 = $this->pricingService->getBaseGoldRatePer10g();
        $purityRates = $this->pricingService->getAllPurityRates();

        return view('admin.products.create', compact('collections', 'purities', 'finishes', 'gems', 'currentGold22', 'purityRates'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'design_code' => 'required|string|unique:products,design_code',
            'name' => 'required|string|max:255',
            'tier' => 'required|in:Signature,Curated,Heritage',
            'collection_master_id' => 'nullable|exists:collections_master,id',
            'base_weight_grams' => 'required|numeric|min:0.01',
            'making_charge' => 'nullable|numeric|min:0',
            'making_charge_percent' => 'nullable|numeric|min:0|max:100',
            'wastage_percent' => 'nullable|numeric|min:0|max:100',
            'status' => 'required|in:active,draft,archived',
            'designed_by' => 'nullable|string|max:255',
            'release_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // 1. Create Product
            $product = Product::create([
                'design_code' => strtoupper($request->design_code),
                'name' => $request->name,
                'tier' => $request->tier,
                'collection_master_id' => $request->collection_master_id,
                'description' => $request->description,
                'base_weight_grams' => (float) $request->base_weight_grams,
                'making_charge' => $request->filled('making_charge') ? (float) $request->making_charge : null,
                'making_charge_percent' => $request->filled('making_charge_percent') ? (float) $request->making_charge_percent : null,
                'wastage_percent' => (float) ($request->wastage_percent ?? 0.0),
                'status' => $request->status,
                'designed_by' => $request->designed_by ?? 'Darshit Soni',
                'release_date' => $request->release_date ?? now()->toDateString(),
            ]);

            // 2. Images
            if ($request->filled('image_urls')) {
                $urls = is_array($request->image_urls) ? $request->image_urls : explode("\n", str_replace("\r", "", $request->image_urls));
                $order = 1;
                foreach ($urls as $url) {
                    $url = trim($url);
                    if (!empty($url)) {
                        ProductImage::create([
                            'product_id' => $product->id,
                            'url' => $url,
                            'sort_order' => $order,
                            'is_primary' => $order === 1,
                        ]);
                        $order++;
                    }
                }
            }

            // 3. 1:1 Design Log
            DesignLog::create([
                'product_id' => $product->id,
                'idea_image' => $request->idea_image,
                'idea_note' => $request->idea_note,
                'cad_image' => $request->cad_image,
                'cad_note' => $request->cad_note,
                'craft_image' => $request->craft_image,
                'craft_note' => $request->craft_note,
                'creation_image' => $request->creation_image,
                'creation_note' => $request->creation_note,
                'inspired_by' => $request->inspired_by,
                'release_date' => $request->release_date ?? now()->toDateString(),
            ]);

            // 4. Options & Variants Matrix Builder
            $this->syncOptionsAndVariants($product, $request);

            DB::commit();
            return redirect()->route('admin.products.index')->with('success', "Design '{$product->name}' ({$product->design_code}) created successfully with live pricing matrix.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withInput()->with('error', 'Failed to create product: ' . $e->getMessage());
        }
    }

    public function edit($id)
    {
        $product = Product::with(['collectionMaster', 'images', 'options.values', 'variants.optionValues', 'designLog'])->findOrFail($id);
        $collections = CollectionMaster::where('status', 'active')->orderBy('sort_order')->get();
        $purities = MetalPurity::where('is_active', true)->orderBy('sort_order')->get();
        $finishes = FinishOption::orderBy('sort_order')->get();
        $gems = GemOption::orderBy('sort_order')->get();
        $currentGold22 = $this->pricingService->getBaseGoldRatePer10g();
        $purityRates = $this->pricingService->getAllPurityRates();
        $livePriceBreakdown = $this->pricingService->calculateProductPrice($product);

        // Precompute variant prices
        $variantPrices = [];
        foreach ($product->variants as $variant) {
            $variantPrices[$variant->id] = $this->pricingService->calculateVariantPrice($variant);
        }

        return view('admin.products.edit', compact(
            'product',
            'collections',
            'purities',
            'finishes',
            'gems',
            'currentGold22',
            'purityRates',
            'livePriceBreakdown',
            'variantPrices'
        ));
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'design_code' => "required|string|unique:products,design_code,{$product->id}",
            'name' => 'required|string|max:255',
            'tier' => 'required|in:Signature,Curated,Heritage',
            'collection_master_id' => 'nullable|exists:collections_master,id',
            'base_weight_grams' => 'required|numeric|min:0.01',
            'making_charge' => 'nullable|numeric|min:0',
            'making_charge_percent' => 'nullable|numeric|min:0|max:100',
            'wastage_percent' => 'nullable|numeric|min:0|max:100',
            'status' => 'required|in:active,draft,archived',
            'designed_by' => 'nullable|string|max:255',
            'release_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $product->update([
                'design_code' => strtoupper($request->design_code),
                'name' => $request->name,
                'tier' => $request->tier,
                'collection_master_id' => $request->collection_master_id,
                'description' => $request->description,
                'base_weight_grams' => (float) $request->base_weight_grams,
                'making_charge' => $request->filled('making_charge') ? (float) $request->making_charge : null,
                'making_charge_percent' => $request->filled('making_charge_percent') ? (float) $request->making_charge_percent : null,
                'wastage_percent' => (float) ($request->wastage_percent ?? 0.0),
                'status' => $request->status,
                'designed_by' => $request->designed_by ?? 'Darshit Soni',
                'release_date' => $request->release_date,
            ]);

            // Update Images if provided
            if ($request->filled('image_urls')) {
                $product->images()->delete();
                $urls = is_array($request->image_urls) ? $request->image_urls : explode("\n", str_replace("\r", "", $request->image_urls));
                $order = 1;
                foreach ($urls as $url) {
                    $url = trim($url);
                    if (!empty($url)) {
                        ProductImage::create([
                            'product_id' => $product->id,
                            'url' => $url,
                            'sort_order' => $order,
                            'is_primary' => $order === 1,
                        ]);
                        $order++;
                    }
                }
            }

            // Update 1:1 Design Log
            DesignLog::updateOrCreate(
                ['product_id' => $product->id],
                [
                    'idea_image' => $request->idea_image,
                    'idea_note' => $request->idea_note,
                    'cad_image' => $request->cad_image,
                    'cad_note' => $request->cad_note,
                    'craft_image' => $request->craft_image,
                    'craft_note' => $request->craft_note,
                    'creation_image' => $request->creation_image,
                    'creation_note' => $request->creation_note,
                    'inspired_by' => $request->inspired_by,
                    'release_date' => $request->release_date,
                ]
            );

            // Update Matrix / Options if provided
            if ($request->has('options_json') || $request->has('variants_json')) {
                $this->syncOptionsAndVariants($product, $request);
            }

            DB::commit();
            return redirect()->route('admin.products.edit', $product->id)->with('success', "Design '{$product->name}' updated successfully.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withInput()->with('error', 'Failed to update product: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $name = $product->name;
        $product->delete();

        return redirect()->route('admin.products.index')->with('success', "Product '{$name}' removed.");
    }

    /**
     * Helper to sync Shopify-style option dimensions and matrix rows.
     */
    protected function syncOptionsAndVariants(Product $product, Request $request)
    {
        if ($request->filled('options_json')) {
            $optionsData = json_decode($request->options_json, true);
            if (is_array($optionsData)) {
                $product->options()->delete();
                $product->variants()->delete();

                $valueMap = []; // [option_name => [val_name => id]]

                foreach ($optionsData as $idx => $opt) {
                    if (empty($opt['name']) || empty($opt['values'])) continue;

                    $optionModel = ProductOption::create([
                        'product_id' => $product->id,
                        'name' => trim($opt['name']),
                        'sort_order' => $idx + 1,
                    ]);

                    $vals = is_array($opt['values']) ? $opt['values'] : array_map('trim', explode(',', $opt['values']));
                    foreach ($vals as $vIdx => $valStr) {
                        $valStr = trim($valStr);
                        if (!empty($valStr)) {
                            $valModel = ProductOptionValue::create([
                                'product_option_id' => $optionModel->id,
                                'value' => $valStr,
                                'sort_order' => $vIdx + 1,
                            ]);
                            $valueMap[$opt['name']][$valStr] = $valModel->id;
                        }
                    }
                }

                // If explicit variants submitted
                if ($request->filled('variants_json')) {
                    $variantsData = json_decode($request->variants_json, true);
                    if (is_array($variantsData)) {
                        foreach ($variantsData as $vRow) {
                            $variant = ProductVariant::create([
                                'product_id' => $product->id,
                                'sku' => $vRow['sku'] ?? ($product->design_code . '-' . Str::random(5)),
                                'weight_override_grams' => !empty($vRow['weight']) ? (float) $vRow['weight'] : null,
                                'stock_qty' => !empty($vRow['stock']) ? (int) $vRow['stock'] : 10,
                                'enabled' => isset($vRow['enabled']) ? (bool) $vRow['enabled'] : true,
                            ]);

                            if (!empty($vRow['option_values']) && is_array($vRow['option_values'])) {
                                $valIds = [];
                                foreach ($vRow['option_values'] as $optName => $valName) {
                                    if (isset($valueMap[$optName][$valName])) {
                                        $valIds[] = $valueMap[$optName][$valName];
                                    }
                                }
                                if (!empty($valIds)) {
                                    $variant->optionValues()->sync($valIds);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
