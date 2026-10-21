<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Finish;
use App\Models\FinishPurity;
use App\Models\MetalType;
use App\Models\Product;
use App\Models\ProductFinishPurity;
use App\Models\ProductVariant;
use App\Models\Purity;
use App\Models\Size;
use App\Models\Stone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminJewelryConfigApiController extends Controller
{
    // ==========================================
    // 1. METAL TYPES CRUD
    // ==========================================
    public function indexMetalTypes(): JsonResponse
    {
        $items = MetalType::with(['purities', 'finishes'])->orderBy('sort_order')->get();
        return response()->json(['status' => 'success', 'data' => $items]);
    }

    public function storeMetalType(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:metal_types,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $item = MetalType::create($validated);
        return response()->json(['status' => 'success', 'message' => 'Metal type created.', 'data' => $item], 201);
    }

    public function updateMetalType(Request $request, int $id): JsonResponse
    {
        $item = MetalType::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'code' => "sometimes|required|string|max:50|unique:metal_types,code,{$id}",
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $item->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Metal type updated.', 'data' => $item]);
    }

    public function destroyMetalType(int $id): JsonResponse
    {
        $item = MetalType::findOrFail($id);
        $item->delete();
        return response()->json(['status' => 'success', 'message' => 'Metal type deleted.']);
    }

    // ==========================================
    // 2. PURITIES CRUD
    // ==========================================
    public function indexPurities(): JsonResponse
    {
        $items = Purity::with('metalType')->orderBy('sort_order')->get();
        return response()->json(['status' => 'success', 'data' => $items]);
    }

    public function storePurity(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'metal_type_id' => 'nullable|exists:metal_types,id',
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:50',
            'purity_fraction' => 'required|numeric|between:0.001,1.000',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $item = Purity::create($validated);
        return response()->json(['status' => 'success', 'message' => 'Purity created.', 'data' => $item], 201);
    }

    public function updatePurity(Request $request, int $id): JsonResponse
    {
        $item = Purity::findOrFail($id);
        $validated = $request->validate([
            'metal_type_id' => 'nullable|exists:metal_types,id',
            'name' => 'sometimes|required|string|max:100',
            'code' => 'sometimes|required|string|max:50',
            'purity_fraction' => 'sometimes|numeric|between:0.001,1.000',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $item->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Purity updated.', 'data' => $item]);
    }

    public function destroyPurity(int $id): JsonResponse
    {
        $item = Purity::findOrFail($id);
        $item->delete();
        return response()->json(['status' => 'success', 'message' => 'Purity deleted.']);
    }

    // ==========================================
    // 3. FINISHES CRUD
    // ==========================================
    public function indexFinishes(): JsonResponse
    {
        $items = Finish::with(['metalType', 'purities'])->orderBy('sort_order')->get();
        return response()->json(['status' => 'success', 'data' => $items]);
    }

    public function storeFinish(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'metal_type_id' => 'nullable|exists:metal_types,id',
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:finishes,code',
            'hex_color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'allowed_purity_ids' => 'nullable|array',
            'allowed_purity_ids.*' => 'exists:purities,id',
        ]);

        $finish = Finish::create($validated);

        if (!empty($validated['allowed_purity_ids'])) {
            $finish->purities()->sync($validated['allowed_purity_ids']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Finish created with purity associations.',
            'data' => $finish->load('purities'),
        ], 201);
    }

    public function updateFinish(Request $request, int $id): JsonResponse
    {
        $finish = Finish::findOrFail($id);
        $validated = $request->validate([
            'metal_type_id' => 'nullable|exists:metal_types,id',
            'name' => 'sometimes|required|string|max:100',
            'code' => "sometimes|required|string|max:50|unique:finishes,code,{$id}",
            'hex_color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'allowed_purity_ids' => 'nullable|array',
            'allowed_purity_ids.*' => 'exists:purities,id',
        ]);

        $finish->update($validated);

        if (array_key_exists('allowed_purity_ids', $validated)) {
            $finish->purities()->sync($validated['allowed_purity_ids']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Finish updated.',
            'data' => $finish->load('purities'),
        ]);
    }

    public function destroyFinish(int $id): JsonResponse
    {
        $finish = Finish::findOrFail($id);
        $finish->delete();
        return response()->json(['status' => 'success', 'message' => 'Finish deleted.']);
    }

    // ==========================================
    // 4. GLOBAL FINISH -> PURITY MATRIX CRUD
    // ==========================================
    public function indexFinishPurities(): JsonResponse
    {
        $matrix = Finish::with(['metalType', 'purities'])->get()->map(function ($finish) {
            return [
                'finish_id' => $finish->id,
                'finish_name' => $finish->name,
                'finish_code' => $finish->code,
                'hex_color' => $finish->hex_color,
                'metal_type' => $finish->metalType?->name,
                'allowed_purities' => $finish->purities->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'code' => $p->code,
                    'purity_fraction' => $p->purity_fraction,
                ]),
            ];
        });

        return response()->json(['status' => 'success', 'data' => $matrix]);
    }

    /**
     * Requirement 2: Admin defines which purity is available for each finish.
     * Dynamic configuration.
     * POST /api/admin/config/finish-purities/sync
     * { "finish_id": 1, "purity_ids": [1, 2, 3] }
     */
    public function syncFinishPurities(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'finish_id' => 'required|exists:finishes,id',
            'purity_ids' => 'required|array',
            'purity_ids.*' => 'exists:purities,id',
        ]);

        $finish = Finish::findOrFail($validated['finish_id']);
        $finish->purities()->sync($validated['purity_ids']);

        return response()->json([
            'status' => 'success',
            'message' => "Allowed purities updated for {$finish->name}.",
            'data' => [
                'finish_id' => $finish->id,
                'finish_name' => $finish->name,
                'allowed_purities' => $finish->purities()->get(),
            ],
        ]);
    }

    // ==========================================
    // 5. SIZES & STONES CRUD
    // ==========================================
    public function indexSizes(): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => Size::orderBy('sort_order')->get()]);
    }

    public function storeSize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'category' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $size = Size::create($validated);
        return response()->json(['status' => 'success', 'message' => 'Size created.', 'data' => $size], 201);
    }

    public function updateSize(Request $request, int $id): JsonResponse
    {
        $size = Size::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:50',
            'category' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $size->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Size updated.', 'data' => $size]);
    }

    public function destroySize(int $id): JsonResponse
    {
        $size = Size::findOrFail($id);
        $size->delete();
        return response()->json(['status' => 'success', 'message' => 'Size deleted.']);
    }

    public function indexStones(): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => Stone::orderBy('sort_order')->get()]);
    }

    public function storeStone(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:50',
            'price_delta' => 'numeric|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $stone = Stone::create($validated);
        return response()->json(['status' => 'success', 'message' => 'Stone created.', 'data' => $stone], 201);
    }

    public function updateStone(Request $request, int $id): JsonResponse
    {
        $stone = Stone::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'code' => 'nullable|string|max:50',
            'price_delta' => 'sometimes|numeric|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $stone->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Stone updated.', 'data' => $stone]);
    }

    public function destroyStone(int $id): JsonResponse
    {
        $stone = Stone::findOrFail($id);
        $stone->delete();
        return response()->json(['status' => 'success', 'message' => 'Stone deleted.']);
    }

    // ==========================================
    // 6. PRODUCT-LEVEL FINISH -> PURITY MATRIX (Requirement 5)
    // ==========================================
    public function getProductFinishPurities(int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $overrides = ProductFinishPurity::where('product_id', $productId)
            ->with(['finish', 'purity'])
            ->get();

        return response()->json([
            'status' => 'success',
            'product_id' => $product->id,
            'design_code' => $product->design_code,
            'name' => $product->name,
            'data' => $overrides,
        ]);
    }

    /**
     * Requirement 5: Configure availability at product level.
     * POST /api/admin/products/{id}/finish-purities/sync
     * {
     *   "configurations": [
     *     { "finish_id": 1, "purity_ids": [1, 2] },  // Yellow Gold -> 22KT, 18KT
     *     { "finish_id": 2, "purity_ids": [2] },     // Rose Gold -> 18KT
     *     { "finish_id": 3, "purity_ids": [3] }      // Black Gold -> 14KT
     *   ]
     * }
     */
    public function syncProductFinishPurities(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $validated = $request->validate([
            'configurations' => 'required|array',
            'configurations.*.finish_id' => 'required|exists:finishes,id',
            'configurations.*.purity_ids' => 'required|array',
            'configurations.*.purity_ids.*' => 'exists:purities,id',
        ]);

        DB::transaction(function () use ($productId, $validated) {
            // Remove existing overrides for this product
            ProductFinishPurity::where('product_id', $productId)->delete();

            // Insert new product-specific pairs
            foreach ($validated['configurations'] as $config) {
                $finishId = (int) $config['finish_id'];
                foreach ($config['purity_ids'] as $purityId) {
                    ProductFinishPurity::create([
                        'product_id' => $productId,
                        'finish_id' => $finishId,
                        'purity_id' => (int) $purityId,
                        'is_available' => true,
                    ]);
                }
            }
        });

        $updated = ProductFinishPurity::where('product_id', $productId)
            ->with(['finish', 'purity'])
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Product-level finish and purity availability updated.',
            'data' => $updated,
        ]);
    }

    // ==========================================
    // 7. PRODUCT VARIANTS CRUD (Requirement 8)
    // ==========================================
    public function getProductVariants(int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $variants = ProductVariant::where('product_id', $productId)
            ->with(['metalType', 'finish', 'purity', 'size', 'stone'])
            ->get();

        return response()->json([
            'status' => 'success',
            'product_id' => $product->id,
            'data' => $variants,
        ]);
    }

    public function storeProductVariant(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'metal_type_id' => 'nullable|exists:metal_types,id',
            'finish_id' => 'required|exists:finishes,id',
            'purity_id' => 'required|exists:purities,id',
            'size_id' => 'nullable|exists:sizes,id',
            'stone_id' => 'nullable|exists:stones,id',
            'weight' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'status' => 'required|string|in:active,inactive,out_of_stock',
        ]);

        $validated['product_id'] = $product->id;
        $validated['stock'] = $validated['stock'] ?? 999;
        if (empty($validated['sku'])) {
            $validated['sku'] = strtoupper($product->design_code . '-' . Str::random(6));
        }

        $variant = ProductVariant::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Product variant created.',
            'data' => $variant->load(['metalType', 'finish', 'purity', 'size', 'stone']),
        ], 201);
    }

    public function updateProductVariant(Request $request, int $productId, int $variantId): JsonResponse
    {
        $variant = ProductVariant::where('product_id', $productId)->where('id', $variantId)->firstOrFail();

        $validated = $request->validate([
            'metal_type_id' => 'nullable|exists:metal_types,id',
            'finish_id' => 'sometimes|required|exists:finishes,id',
            'purity_id' => 'sometimes|required|exists:purities,id',
            'size_id' => 'nullable|exists:sizes,id',
            'stone_id' => 'nullable|exists:stones,id',
            'sku' => 'nullable|string|max:100',
            'weight' => 'sometimes|numeric|min:0',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'status' => 'sometimes|string|in:active,inactive,out_of_stock',
        ]);

        $variant->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Product variant updated.',
            'data' => $variant->load(['metalType', 'finish', 'purity', 'size', 'stone']),
        ]);
    }

    public function destroyProductVariant(int $productId, int $variantId): JsonResponse
    {
        $variant = ProductVariant::where('product_id', $productId)->where('id', $variantId)->firstOrFail();
        $variant->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Product variant deleted.',
        ]);
    }
}
