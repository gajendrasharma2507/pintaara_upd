<?php

namespace App\Services;

use App\Models\Finish;
use App\Models\FinishPurity;
use App\Models\MetalType;
use App\Models\Product;
use App\Models\ProductFinishPurity;
use App\Models\ProductVariant;
use App\Models\Purity;
use App\Models\Size;
use App\Models\Stone;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class JewelryConfigurationService
{
    /**
     * Get allowed purities for a specific finish.
     * Evaluates product-level override if product_id is provided,
     * otherwise falls back to global finish_purities matrix.
     */
    public function getAvailablePuritiesForFinish(int $finishId, ?int $productId = null): Collection
    {
        // 1. If product_id is supplied, check for product-level overrides
        if ($productId) {
            $productOverrides = ProductFinishPurity::where('product_id', $productId)
                ->where('finish_id', $finishId)
                ->where('is_available', true)
                ->with(['purity' => function ($q) {
                    $q->where('is_active', true)->orderBy('sort_order', 'asc');
                }])
                ->get();

            if ($productOverrides->isNotEmpty()) {
                $purityIds = $productOverrides->pluck('purity_id')->filter()->unique();
                return Purity::whereIn('id', $purityIds)
                    ->where('is_active', true)
                    ->orderBy('sort_order', 'asc')
                    ->get();
            }

            // Also check if product has variants for this finish
            $variantPurityIds = ProductVariant::where('product_id', $productId)
                ->where('finish_id', $finishId)
                ->where('status', 'active')
                ->pluck('purity_id')
                ->unique();

            if ($variantPurityIds->isNotEmpty()) {
                return Purity::whereIn('id', $variantPurityIds)
                    ->where('is_active', true)
                    ->orderBy('sort_order', 'asc')
                    ->get();
            }
        }

        // 2. Global finish_purities matrix
        return Purity::whereHas('finishes', function ($q) use ($finishId) {
            $q->where('finishes.id', $finishId)
              ->where('finish_purities.is_active', true);
        })
        ->where('is_active', true)
        ->orderBy('sort_order', 'asc')
        ->get();
    }

    /**
     * Get all dynamic configurations for a product:
     * - Finishes available
     * - Allowed purities mapped per finish
     * - Sizes available
     * - Stones available
     * - Active variants matrix
     */
    public function getProductConfiguration(Product $product): array
    {
        // Check product-specific finishes or global active finishes
        $productFinishIds = ProductFinishPurity::where('product_id', $product->id)
            ->where('is_available', true)
            ->pluck('finish_id')
            ->unique();

        if ($productFinishIds->isEmpty()) {
            $productFinishIds = ProductVariant::where('product_id', $product->id)
                ->where('status', 'active')
                ->pluck('finish_id')
                ->filter()
                ->unique();
        }

        $finishesQuery = Finish::where('is_active', true)->orderBy('sort_order', 'asc');
        if ($productFinishIds->isNotEmpty()) {
            $finishesQuery->whereIn('id', $productFinishIds);
        }
        $finishes = $finishesQuery->get();

        // Map allowed purities for each finish
        $finishPurityMap = [];
        foreach ($finishes as $finish) {
            $purities = $this->getAvailablePuritiesForFinish($finish->id, $product->id);
            $finishPurityMap[$finish->id] = [
                'finish' => [
                    'id' => $finish->id,
                    'name' => $finish->name,
                    'code' => $finish->code,
                    'hex_color' => $finish->hex_color,
                ],
                'allowed_purities' => $purities->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'code' => $p->code,
                    'purity_fraction' => $p->purity_fraction,
                ]),
            ];
        }

        // Sizes (Product variants sizes or global active sizes)
        $productSizeIds = ProductVariant::where('product_id', $product->id)
            ->where('status', 'active')
            ->pluck('size_id')
            ->filter()
            ->unique();

        $sizesQuery = Size::where('is_active', true)->orderBy('sort_order', 'asc');
        if ($productSizeIds->isNotEmpty()) {
            $sizesQuery->whereIn('id', $productSizeIds);
        }
        $sizes = $sizesQuery->get();

        // Stones (Product variants stones or global active stones)
        $productStoneIds = ProductVariant::where('product_id', $product->id)
            ->where('status', 'active')
            ->pluck('stone_id')
            ->filter()
            ->unique();

        $stonesQuery = Stone::where('is_active', true)->orderBy('sort_order', 'asc');
        if ($productStoneIds->isNotEmpty()) {
            $stonesQuery->whereIn('id', $productStoneIds);
        }
        $stones = $stonesQuery->get();

        // Product variants with relational models
        $variants = ProductVariant::where('product_id', $product->id)
            ->where('status', 'active')
            ->with(['metalType', 'finish', 'purity', 'size', 'stone'])
            ->get()
            ->map(fn($v) => [
                'id' => $v->id,
                'sku' => $v->sku,
                'metal_type_id' => $v->metal_type_id,
                'finish_id' => $v->finish_id,
                'purity_id' => $v->purity_id,
                'size_id' => $v->size_id,
                'stone_id' => $v->stone_id,
                'weight' => $v->weight,
                'price' => $v->price,
                'order_mode' => 'made_to_order',
                'availability' => $v->status === 'active' ? 'Available to Craft' : 'Unavailable',
                'lead_time' => 'Handcrafted to order (Dispatched in 10–14 business days)',
                'in_stock' => $v->status === 'active',
                'status' => $v->status,
            ]);

        return [
            'product_id' => $product->id,
            'design_code' => $product->design_code,
            'name' => $product->name,
            'finishes' => $finishes,
            'finish_purity_matrix' => array_values($finishPurityMap),
            'sizes' => $sizes,
            'stones' => $stones,
            'variants' => $variants,
        ];
    }

    /**
     * Validate an exact combination of finish, purity, size, stone for a product.
     * Throws ValidationException with HTTP 422 if invalid.
     */
    public function validateAndFindVariant(
        int $productId,
        int $finishId,
        int $purityId,
        ?int $sizeId = null,
        ?int $stoneId = null
    ): ProductVariant {
        // 1. Verify Finish exists and is active
        $finish = Finish::where('id', $finishId)->where('is_active', true)->first();
        if (!$finish) {
            $this->throwCombinationError();
        }

        // 2. Verify Purity exists and is active
        $purity = Purity::where('id', $purityId)->where('is_active', true)->first();
        if (!$purity) {
            $this->throwCombinationError();
        }

        // 3. Verify Size if provided
        if ($sizeId !== null) {
            $size = Size::where('id', $sizeId)->where('is_active', true)->first();
            if (!$size) {
                $this->throwCombinationError();
            }
        }

        // 4. Verify Stone if provided
        if ($stoneId !== null) {
            $stone = Stone::where('id', $stoneId)->where('is_active', true)->first();
            if (!$stone) {
                $this->throwCombinationError();
            }
        }

        // 5. Verify that this finish -> purity pairing is allowed
        $allowedPurities = $this->getAvailablePuritiesForFinish($finishId, $productId);
        if (!$allowedPurities->contains('id', $purityId)) {
            $this->throwCombinationError();
        }

        // 6. Look up matching variant in product_variants
        $variantQuery = ProductVariant::where('product_id', $productId)
            ->where('finish_id', $finishId)
            ->where('purity_id', $purityId)
            ->where('status', 'active');

        if ($sizeId !== null) {
            $variantQuery->where('size_id', $sizeId);
        }

        if ($stoneId !== null) {
            $variantQuery->where('stone_id', $stoneId);
        }

        $variant = $variantQuery->with(['metalType', 'finish', 'purity', 'size', 'stone'])->first();

        if (!$variant) {
            $this->throwCombinationError();
        }

        return $variant;
    }

    /**
     * Standard error throw matching requirement 9:
     * HTTP 422 with "This combination is not available."
     */
    protected function throwCombinationError(): void
    {
        throw ValidationException::withMessages([
            'combination' => ['This combination is not available.'],
        ])->status(422);
    }
}
