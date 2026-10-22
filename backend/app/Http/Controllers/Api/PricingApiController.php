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

        // Resolve Purity Fraction & Metal Type
        $fraction = 0.916;
        if ($request->filled('purity_fraction')) {
            $fraction = (float) $request->purity_fraction;
        } elseif ($request->filled('purity')) {
            $purityInput = trim($request->purity);
            $purity = MetalPurity::where('name', $purityInput)->first();
            if ($purity) {
                $fraction = (float) $purity->purity_fraction;
                $metalType = $purity->type;
            } elseif (preg_match('/24\s*K/i', $purityInput)) {
                $fraction = 1.0;
                $metalType = 'gold';
            } elseif (preg_match('/22\s*K/i', $purityInput)) {
                $fraction = 0.916;
                $metalType = 'gold';
            } elseif (preg_match('/18\s*K/i', $purityInput)) {
                $fraction = 0.750;
                $metalType = 'gold';
            } elseif (preg_match('/14\s*K/i', $purityInput)) {
                $fraction = 0.585;
                $metalType = 'gold';
            } elseif (preg_match('/925|SILVER/i', $purityInput)) {
                $fraction = 0.925;
                $metalType = 'silver';
            }
        }

        // Resolve Stone Charge from explicit delta or linked database GemOption table
        $stoneCharge = 0.0;
        if ($request->filled('stone_charge') && (float) $request->stone_charge > 0) {
            $stoneCharge = (float) $request->stone_charge;
        } elseif ($request->filled('gem')) {
            $gemStr = trim($request->gem);
            $gemLower = strtolower($gemStr);
            if (!in_array($gemLower, ['none', 'no stone', 'solid gold', 'no stone / solid gold', 'no stone/solid gold', ''])) {
                $gem = GemOption::where('stone_type', 'LIKE', "%{$gemStr}%")
                    ->orWhereRaw('? LIKE CONCAT("%", stone_type, "%")', [$gemStr])
                    ->first();
                if ($gem) {
                    $stoneCharge = (float) $gem->default_stone_charge;
                } else {
                    $stone = \App\Models\Stone::where('name', 'LIKE', "%{$gemStr}%")->first();
                    if ($stone) {
                        $stoneCharge = (float) $stone->price_delta;
                    }
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
