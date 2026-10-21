<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\JewelryConfigurationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class JewelryConfigurationApiController extends Controller
{
    protected JewelryConfigurationService $configService;

    public function __construct(JewelryConfigurationService $configService)
    {
        $this->configService = $configService;
    }

    /**
     * Requirement 4:
     * When customer selects a finish, API returns ONLY purities allowed for that finish.
     * Supports optional product_id to evaluate product-level overrides.
     * 
     * GET /api/config/purities-by-finish?finish_id={id}&product_id={optional}
     */
    public function getPuritiesByFinish(Request $request): JsonResponse
    {
        $request->validate([
            'finish_id' => 'required|integer|exists:finishes,id',
            'product_id' => 'nullable|integer|exists:products,id',
        ]);

        $finishId = (int) $request->finish_id;
        $productId = $request->filled('product_id') ? (int) $request->product_id : null;

        $purities = $this->configService->getAvailablePuritiesForFinish($finishId, $productId);

        return response()->json([
            'status' => 'success',
            'finish_id' => $finishId,
            'product_id' => $productId,
            'count' => $purities->count(),
            'data' => $purities->map(fn($p) => [
                'id' => $p->id,
                'metal_type_id' => $p->metal_type_id,
                'name' => $p->name,
                'code' => $p->code,
                'purity_fraction' => $p->purity_fraction,
                'is_active' => $p->is_active,
                'sort_order' => $p->sort_order,
            ]),
        ]);
    }

    /**
     * Requirement 11:
     * Get valid combinations for a product.
     * 
     * GET /api/products/{id}/combinations
     */
    public function getProductCombinations(string $idOrCode): JsonResponse
    {
        $product = Product::where('id', is_numeric($idOrCode) ? (int)$idOrCode : 0)
            ->orWhereRaw('UPPER(design_code) = UPPER(?)', [$idOrCode])
            ->firstOrFail();

        $config = $this->configService->getProductConfiguration($product);

        return response()->json([
            'status' => 'success',
            'data' => $config,
        ]);
    }

    /**
     * Requirement 6, 7, 8, 9:
     * Backend validation for selected combination:
     * Finish + Purity + Size + Stone
     * 
     * If invalid combination: Returns HTTP 422 with:
     * "This combination is not available."
     * 
     * If valid: Returns variant lookup, price, stock, and SKU.
     * 
     * POST /api/products/{id}/validate-combination
     */
    public function validateCombination(Request $request, string $idOrCode): JsonResponse
    {
        $product = Product::where('id', is_numeric($idOrCode) ? (int)$idOrCode : 0)
            ->orWhereRaw('UPPER(design_code) = UPPER(?)', [$idOrCode])
            ->firstOrFail();

        $validated = $request->validate([
            'finish_id' => 'required|integer',
            'purity_id' => 'required|integer',
            'size_id' => 'nullable|integer',
            'stone_id' => 'nullable|integer',
        ]);

        try {
            $variant = $this->configService->validateAndFindVariant(
                $product->id,
                (int) $validated['finish_id'],
                (int) $validated['purity_id'],
                isset($validated['size_id']) ? (int) $validated['size_id'] : null,
                isset($validated['stone_id']) ? (int) $validated['stone_id'] : null
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Combination is valid.',
                'data' => [
                    'variant_id' => $variant->id,
                    'product_id' => $variant->product_id,
                    'sku' => $variant->sku,
                    'weight' => (float) $variant->weight,
                    'price' => (float) $variant->price,
                    'order_mode' => 'made_to_order',
                    'availability' => $variant->status === 'active' ? 'Available to Craft' : 'Unavailable',
                    'lead_time' => 'Handcrafted to order (Dispatched in 10–14 business days)',
                    'in_stock' => $variant->status === 'active',
                    'status' => $variant->status,
                    'metal_type' => $variant->metalType ? [
                        'id' => $variant->metalType->id,
                        'name' => $variant->metalType->name,
                        'code' => $variant->metalType->code,
                    ] : null,
                    'finish' => [
                        'id' => $variant->finish->id,
                        'name' => $variant->finish->name,
                        'code' => $variant->finish->code,
                        'hex_color' => $variant->finish->hex_color,
                    ],
                    'purity' => [
                        'id' => $variant->purity->id,
                        'name' => $variant->purity->name,
                        'code' => $variant->purity->code,
                        'purity_fraction' => (float) $variant->purity->purity_fraction,
                    ],
                    'size' => $variant->size ? [
                        'id' => $variant->size->id,
                        'name' => $variant->size->name,
                        'category' => $variant->size->category,
                    ] : null,
                    'stone' => $variant->stone ? [
                        'id' => $variant->stone->id,
                        'name' => $variant->stone->name,
                        'code' => $variant->stone->code,
                    ] : null,
                ],
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'This combination is not available.',
                'errors' => [
                    'combination' => ['This combination is not available.'],
                ],
            ], 422);
        }
    }
}
