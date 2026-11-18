<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinishOption;
use App\Models\GemOption;
use App\Models\MetalPurity;
use App\Models\Product;
use App\Services\JewelryPricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductApiController extends Controller
{
    protected JewelryPricingService $pricingService;

    public function __construct(JewelryPricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Product::where('status', 'active')
            ->with(['collectionMaster', 'primaryImage', 'images', 'options.values']);

        if ($request->filled('collection')) {
            $slug = strtolower($request->collection);
            $query->whereHas('collectionMaster', function($q) use ($slug) {
                $q->whereRaw('LOWER(slug) = ?', [$slug])
                  ->orWhereRaw('LOWER(name) = ?', [$slug]);
            });
        }

        if ($request->filled('tier')) {
            $tier = strtolower($request->tier);
            $query->whereRaw('LOWER(tier) = ?', [$tier]);
        }

        $products = $query->latest()->get();

        // Calculate dynamic live prices for all items
        $data = $products->map(function ($product) {
            $pricing = $this->pricingService->calculateProductPrice($product);
            return [
                'id' => $product->id,
                'design_code' => $product->design_code,
                'name' => $product->name,
                'tier' => $product->tier,
                'collection' => $product->collectionMaster ? [
                    'id' => $product->collectionMaster->id,
                    'name' => $product->collectionMaster->name,
                    'slug' => $product->collectionMaster->slug,
                ] : null,
                'description' => $product->description,
                'delivery_return' => $product->delivery_return ?: \App\Models\Setting::get('default_delivery_return', "- 24-Hour Cancellation Window - Full Refund\n- 10% Deduction of total Value upon return."),
                'custom_sections' => $product->custom_sections ?? [],
                'model_3d_url' => $product->model_3d_url,
                'base_weight_grams' => $product->base_weight_grams,
                'designed_by' => $product->designed_by,
                'is_limited_edition' => (bool) ($product->is_limited_edition ?? true),
                'edition_prefix' => $product->edition_prefix ?? 'LIMITED EDITION',
                'edition_limit' => (int) ($product->edition_limit ?? 50),
                'edition_current' => (int) ($product->edition_current ?? 1),
                'edition_text' => $product->edition_text,
                'is_sold_out' => (bool) $product->is_sold_out,
                'available_purities' => $product->available_purities,
                'available_finishes' => $product->available_finishes ?? ['YG', 'WG', 'RG', 'BLK'],
                'primary_image' => $product->primaryImage?->url ?? $product->images->first()?->url,
                'images' => $product->images->pluck('url'),
                'live_price' => $pricing,
                'options' => $product->options->map(function($o) use ($product) {
                    $isPurity = str_contains(strtolower($o->name), 'purity') || str_contains(strtolower($o->name), 'metal') || str_contains(strtolower($o->name), 'karat');
                    $vals = $o->values;
                    if ($isPurity && !empty($product->available_purities) && is_array($product->available_purities)) {
                        $allowedPurities = array_map(fn($p) => strtoupper(str_replace(' ', '', $p)), $product->available_purities);
                        $vals = $vals->filter(function($v) use ($allowedPurities) {
                            $clean = strtoupper(str_replace(' ', '', $v->value));
                            return in_array($clean, $allowedPurities);
                        });
                    }
                    return [
                        'name' => $o->name,
                        'values' => $vals->pluck('value')->values(),
                    ];
                }),
            ];
        });

        return response()->json([
            'status' => 'success',
            'count' => $data->count(),
            'data' => $data,
        ]);
    }

    public function show(string $designCode): JsonResponse
    {
        $product = Product::whereRaw('UPPER(design_code) = UPPER(?)', [$designCode])
            ->orWhere('id', is_numeric($designCode) ? (int)$designCode : 0)
            ->with([
                'collectionMaster',
                'images',
                'options.values',
                'variants.optionValues.option',
                'designLog',
                'productFinishPurities.finish',
                'productFinishPurities.purity',
            ])
            ->firstOrFail();

        $basePricing = $this->pricingService->calculateProductPrice($product);

        $variantData = $product->variants->map(function ($v) {
            $pricing = $this->pricingService->calculateVariantPrice($v);
            return [
                'id' => $v->id,
                'sku' => $v->sku,
                'weight_override_grams' => $v->weight_override_grams,
                'stock_qty' => $v->stock_qty,
                'enabled' => $v->enabled,
                'option_values' => $v->optionValues->map(fn($ov) => [
                    'option' => $ov->option->name ?? '',
                    'value' => $ov->value,
                ]),
                'calculated_price' => $pricing,
            ];
        });

        $masters = [
            'purities' => MetalPurity::where('is_active', true)->orderBy('sort_order')->get(),
            'finishes' => FinishOption::orderBy('sort_order')->get(),
            'gems' => GemOption::orderBy('sort_order')->get(),
        ];

        $customizationMasters = \App\Models\CustomizationMaster::with(['values' => function($q) {
            $q->where('is_active', true)->orderBy('sort_order');
        }])->where('is_active', true)->orderBy('sort_order')->get();

        $allMasterValues = $customizationMasters->pluck('values')->flatten();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $product->id,
                'design_code' => $product->design_code,
                'name' => $product->name,
                'tier' => $product->tier,
                'collection' => $product->collectionMaster,
                'description' => $product->description,
                'delivery_return' => $product->delivery_return ?: \App\Models\Setting::get('default_delivery_return', "- 24-Hour Cancellation Window - Full Refund\n- 10% Deduction of total Value upon return."),
                'custom_sections' => $product->custom_sections ?? [],
                'model_3d_url' => $product->model_3d_url,
                'base_weight_grams' => $product->base_weight_grams,
                'making_charge' => $product->making_charge,
                'making_charge_percent' => $product->making_charge_percent,
                'wastage_percent' => $product->wastage_percent,
                'designed_by' => $product->designed_by,
                'release_date' => $product->release_date,
                'is_limited_edition' => (bool) ($product->is_limited_edition ?? true),
                'edition_prefix' => $product->edition_prefix ?? 'LIMITED EDITION',
                'edition_limit' => (int) ($product->edition_limit ?? 50),
                'edition_current' => (int) ($product->edition_current ?? 1),
                'edition_text' => $product->edition_text,
                'is_sold_out' => (bool) $product->is_sold_out,
                'available_purities' => $product->available_purities,
                'available_finishes' => $product->available_finishes ?? ['YG', 'WG', 'RG', 'BLK'],
                'images' => $product->images,
                'images_by_finish' => $product->images->groupBy(fn($img) => $img->finish_key ?: 'YG'),
                'base_pricing' => $basePricing,
                'options' => $product->options->map(function ($o) use ($masters, $allMasterValues, $product) {
                    $isPurity = str_contains(strtolower($o->name), 'purity') || str_contains(strtolower($o->name), 'metal') || str_contains(strtolower($o->name), 'karat');
                    $isFinish = str_contains(strtolower($o->name), 'finish') || str_contains(strtolower($o->name), 'tone') || strtoupper($o->name) === 'FINISH';
                    $isGem = str_contains(strtolower($o->name), 'gem') || str_contains(strtolower($o->name), 'stone');
                    $gems = $masters['gems'] ?? collect();

                    $vals = $o->values;
                    if ($isPurity && !empty($product->available_purities) && is_array($product->available_purities)) {
                        $allowedPurities = array_map(fn($p) => strtoupper(str_replace(' ', '', $p)), $product->available_purities);
                        $vals = $vals->filter(function($v) use ($allowedPurities) {
                            $clean = strtoupper(str_replace(' ', '', $v->value));
                            return in_array($clean, $allowedPurities);
                        });
                    }

                    if ($isFinish && !empty($product->available_finishes) && is_array($product->available_finishes)) {
                        $allowedFinishes = $product->available_finishes;
                        $vals = $vals->filter(function($v) use ($allowedFinishes) {
                            $valLower = strtolower($v->value);
                            if (in_array('YG', $allowedFinishes) && str_contains($valLower, 'yellow')) return true;
                            if (in_array('WG', $allowedFinishes) && str_contains($valLower, 'white')) return true;
                            if (in_array('RG', $allowedFinishes) && str_contains($valLower, 'rose')) return true;
                            if ((in_array('BLK', $allowedFinishes) || in_array('BG', $allowedFinishes)) && (str_contains($valLower, 'black') || str_contains($valLower, 'ruthenium'))) return true;
                            return false;
                        });
                    }

                    return [
                        'id' => $o->id,
                        'name' => $o->name,
                        'values' => $vals->values()->map(function ($v) use ($isGem, $gems, $allMasterValues) {
                            $delta = (float) ($v->price_delta ?? 0);
                            $vLower = strtolower(trim($v->value));
                            $isNoStone = in_array($vLower, ['none', 'no stone', 'solid gold', 'no stone / solid gold', 'no stone/solid gold', '']);

                            // Match against Customization Masters for dynamic image and rate resolution
                            $matchedMaster = $allMasterValues->first(function($mv) use ($v, $vLower) {
                                if (!empty($mv->code) && !empty($v->code) && strtoupper($mv->code) === strtoupper($v->code)) {
                                    return true;
                                }
                                $mvLower = strtolower(trim($mv->value));
                                if ($mvLower === $vLower) return true;
                                if (str_contains($mvLower, 'diamond') && str_contains($vLower, 'diamond')) return true;
                                if (str_contains($mvLower, 'emerald') && str_contains($vLower, 'emerald')) return true;
                                if (str_contains($mvLower, 'sapphire') && str_contains($vLower, 'sapphire')) return true;
                                if (str_contains($mvLower, 'ruby') && str_contains($vLower, 'ruby')) return true;
                                return false;
                            });

                            $img = $v->image;
                            if ($matchedMaster && !empty($matchedMaster->image)) {
                                // If master has an image, prefer it over empty/unsplash images or if master was uploaded
                                if (empty($img) || str_contains($img, 'unsplash.com') || str_contains($matchedMaster->image, '/storage/')) {
                                    $img = $matchedMaster->image;
                                }
                            }
                            if ($isNoStone) {
                                $img = null;
                            } elseif (!empty($img) && str_starts_with($img, '/storage/')) {
                                $img = url($img);
                            }

                            if ($delta == 0.0 && $isGem && !$isNoStone) {
                                if ($matchedMaster && (float)$matchedMaster->price_delta > 0) {
                                    $delta = (float) $matchedMaster->price_delta;
                                } else {
                                    $matched = $gems->first(function ($g) use ($v) {
                                        return stripos($v->value, $g->stone_type) !== false || stripos($g->stone_type, $v->value) !== false;
                                    });
                                    if ($matched) {
                                        $delta = (float) $matched->default_stone_charge;
                                    }
                                }
                            }
                            return [
                                'id' => $v->id,
                                'value' => $v->value,
                                'code' => $v->code ?? ($matchedMaster?->code ?? null),
                                'image' => $img,
                                'price_delta' => $delta,
                                'hex_color' => $v->hex_color ?? ($matchedMaster?->hex_color ?? null),
                            ];
                        }),
                    ];
                }),
                'variants' => $variantData,
                'design_log' => $product->designLog,
                'master_options' => $masters,
                'finish_purities' => $product->productFinishPurities->where('is_available', true)->values()->map(fn($fp) => [
                    'finish_id' => $fp->finish_id,
                    'finish_name' => $fp->finish?->name,
                    'finish_code' => $fp->finish?->code,
                    'purity_id' => $fp->purity_id,
                    'purity_name' => $fp->purity?->name,
                    'purity_code' => $fp->purity?->code,
                ]),
                'customization_masters' => $customizationMasters,
            ]
        ]);
    }
}
