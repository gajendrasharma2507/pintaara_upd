<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GemOption;
use App\Models\MetalPurity;
use App\Models\Product;
use App\Services\JewelryPricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PricingApiController extends Controller
{
    protected JewelryPricingService $pricingService;

    public function __construct(JewelryPricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    public function calculate(Request $request): JsonResponse
    {
        $request->validate([
            'weight_grams' => 'required|numeric|min:0.01',
            'purity' => 'nullable|string', // e.g. "22KT", "18KT", "14KT", "925 Silver"
            'purity_fraction' => 'nullable|numeric|min:0|max:1',
            'making_charge_flat' => 'nullable|numeric|min:0',
            'making_charge_percent' => 'nullable|numeric|min:0|max:100',
            'wastage_percent' => 'nullable|numeric|min:0|max:100',
            'gem' => 'nullable|string',
            'stone_charge' => 'nullable|numeric|min:0',
            'metal_type' => 'nullable|in:gold,silver',
        ]);

        $weight = (float) $request->weight_grams;
        $metalType = $request->metal_type ?? 'gold';

        // Resolve Purity Fraction
        $fraction = 0.916;
        if ($request->filled('purity_fraction')) {
            $fraction = (float) $request->purity_fraction;
        } elseif ($request->filled('purity')) {
            $purity = MetalPurity::where('name', $request->purity)->first();
            if ($purity) {
                $fraction = (float) $purity->purity_fraction;
                $metalType = $purity->type;
            }
        }

        // Resolve Stone Charge
        $stoneCharge = (float) ($request->stone_charge ?? 0.0);
        if ($stoneCharge === 0.0 && $request->filled('gem') && !in_array(strtolower($request->gem), ['none', 'no stone', ''])) {
            $gem = GemOption::where('stone_type', 'LIKE', "%{$request->gem}%")->first();
            if ($gem) {
                $stoneCharge = (float) $gem->default_stone_charge;
            } else {
                $stone = \App\Models\Stone::where('name', 'LIKE', "%{$request->gem}%")->first();
                if ($stone) {
                    $stoneCharge = (float) $stone->price_delta;
                }
            }
        }

        $breakdown = $this->pricingService->calculatePrice(
            weightGrams: $weight,
            purityFraction: $fraction,
            wastagePercent: (float) ($request->wastage_percent ?? 0.0),
            makingChargeFlat: $request->filled('making_charge_flat') ? (float) $request->making_charge_flat : null,
            makingChargePercent: $request->filled('making_charge_percent') ? (float) $request->making_charge_percent : null,
            stoneCharge: $stoneCharge,
            metalType: $metalType
        );

        return response()->json([
            'status' => 'success',
            'data' => $breakdown,
        ]);
    }
}
