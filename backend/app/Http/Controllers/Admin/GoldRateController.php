<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GoldRate;
use App\Models\MetalPurity;
use App\Services\JewelryPricingService;
use Illuminate\Http\Request;

class GoldRateController extends Controller
{
    protected JewelryPricingService $pricingService;

    public function __construct(JewelryPricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    public function index()
    {
        $rates = GoldRate::with(['basePurity', 'creator'])->latest('effective_date')->latest('id')->paginate(20);
        $currentGold22 = $this->pricingService->getBaseGoldRatePer10g();
        $currentPure24 = $this->pricingService->calculatePureGoldRatePerGram($currentGold22);
        $currentSilver10 = $this->pricingService->getBaseSilverRatePer10g();
        $purityRates = $this->pricingService->getAllPurityRates();

        return view('admin.gold-rates.index', compact(
            'rates',
            'currentGold22',
            'currentPure24',
            'currentSilver10',
            'purityRates'
        ));
    }

    public function store(Request $request)
    {
        $request->validate([
            'gold_rate_22kt' => 'required|numeric|min:1000',
            'silver_rate_10g' => 'nullable|numeric|min:10',
            'effective_date' => 'required|date',
        ]);

        $gold22kt = MetalPurity::where('name', '22KT')->first() 
            ?? MetalPurity::firstOrCreate(['name' => '22KT'], ['purity_fraction' => 0.916, 'type' => 'gold']);

        $silver925 = MetalPurity::where('type', 'silver')->first()
            ?? MetalPurity::firstOrCreate(['name' => '925 Silver'], ['purity_fraction' => 0.925, 'type' => 'silver']);

        // Gold rate entry
        GoldRate::create([
            'metal_type' => 'gold',
            'rate_per_10g' => (float) $request->gold_rate_22kt,
            'base_purity_id' => $gold22kt->id,
            'effective_date' => $request->effective_date,
            'source' => 'manual',
            'created_by' => auth()->id() ?? 1,
        ]);

        // Silver rate entry if provided
        if ($request->filled('silver_rate_10g')) {
            GoldRate::create([
                'metal_type' => 'silver',
                'rate_per_10g' => (float) $request->silver_rate_10g,
                'base_purity_id' => $silver925->id,
                'effective_date' => $request->effective_date,
                'source' => 'manual',
                'created_by' => auth()->id() ?? 1,
            ]);
        }

        return redirect()->back()->with('success', 'Market spot rates updated successfully. All product catalog prices recalculated automatically!');
    }
}
