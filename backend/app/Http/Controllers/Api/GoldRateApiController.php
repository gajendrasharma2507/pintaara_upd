<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\JewelryPricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoldRateApiController extends Controller
{
    protected JewelryPricingService $pricingService;

    public function __construct(JewelryPricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Fetch real-time live gold & silver spot rates directly from Aarav Bullion stream.
     * Supports ?realtime=1 or ?fresh=1 or ?t={ms} to bypass all caches for instant live tick.
     */
    public function today(?\Illuminate\Http\Request $request = null): JsonResponse
    {
        $req = $request ?? request();
        $forceRefresh = $req ? ($req->boolean('realtime') || $req->has('refresh') || $req->has('fresh') || $req->has('t')) : false;
        $liveRates = $this->pricingService->fetchAaravLiveRates($forceRefresh);

        $rates = $this->pricingService->getAllPurityRates();
        $history = \App\Models\GoldRate::latest('effective_date')->latest('id')->take(10)->get();

        $goldCap = $rates['gold_cap'];
        $silverCap = $rates['silver_cap'];
        $rate22k10g = $rates['gold_base_22kt_per_10g'];
        $rate22kGram = $rates['gold_22kt_rate_per_gram'];
        $rate18kGram = $rates['gold_18kt_rate_per_gram'];
        $rate14kGram = $rates['gold_14kt_rate_per_gram'];
        $rate925Gram = $rates['silver_925_per_gram'];
        $silver10g = $rates['silver_base_per_10g'];

        $goldOffset   = (float) \App\Models\Setting::get('gold_extra_offset', 0);
        $goldFloor    = (float) \App\Models\Setting::get('gold_min_floor', 0);
        $silverOffset = (float) \App\Models\Setting::get('silver_extra_offset', 0);
        $silverFloor  = (float) \App\Models\Setting::get('silver_min_floor', 0);

        $goldOffset = (float) \App\Models\Setting::get('gold_extra_offset', 0);
        $goldFloor = (float) \App\Models\Setting::get('gold_min_floor', 0);
        $silverOffset = (float) \App\Models\Setting::get('silver_extra_offset', 0);
        $silverFloor = (float) \App\Models\Setting::get('silver_min_floor', 0);

        if ($liveRates) {
            // Persist live rate to DB
            $this->persistLiveRatesToDb([
                'gold_22kt_per_10g' => $rate22k10g,
                'silver_per_10g'    => $silver10g,
                'silver_per_kg'     => $silverCap,
            ]);
        }

        return response()->json([
            'status'                     => 'success',
            'source'                     => $rates['gold_rate_mode'] === 'manual' ? 'manual' : ($liveRates ? 'live' : 'database'),
            'feed'                       => 'aarav-bullion',
            'effective_date'             => now()->toDateString(),
            'refreshed_at'               => now()->toIso8601String(),
            // Spreadsheet CAP values
            'gold_cap'                   => $goldCap,
            'silver_cap'                 => $silverCap,
            'gold_rate_mode'             => $rates['gold_rate_mode'],
            'silver_rate_mode'           => $rates['silver_rate_mode'],
            'gold_step_gap'              => $rates['gold_step_gap'],
            'silver_step_gap'            => $rates['silver_step_gap'],
            // Purity Rates Per Gram
            'gold_22kt_rate_per_gram'    => $rate22kGram,
            'gold_18kt_rate_per_gram'    => $rate18kGram,
            'gold_14kt_rate_per_gram'    => $rate14kGram,
            'silver_925_per_gram'        => $rate925Gram,
            // 24KT Benchmark (Matches Gold Rate CAP)
            'pure_24kt_rate_per_10g'     => $goldCap,
            'pure_24kt_rate_per_gram'    => round($goldCap / 10.0, 2),
            // 22KT Standard Jewellery Hallmark
            'base_22kt_rate_per_10g'     => $rate22k10g,
            'base_22kt_rate_per_gram'    => $rate22kGram,
            // Silver 999 & 925
            'silver_per_kg'              => $silverCap,
            'silver_base_per_10g'        => $silver10g,
            'silver_925_per_10g'         => round($silver10g, 2),
            // Raw market spot rates
            'market_raw_24kt_per_10g'    => $rates['live_gold_rate'],
            'market_raw_pure_24kt_per_g' => round($rates['live_gold_rate'] / 10.0, 2),
            'market_raw_22kt_per_10g'    => round($rates['live_gold_rate'] * 0.916, 2),
            'market_raw_silver_per_kg'   => $rates['live_silver_rate'],
            'market_raw_silver_per_10g'  => round($rates['live_silver_rate'] / 100.0, 2),
            // Telemetry from live stream
            'feed_telemetry'             => [
                'endpoint'        => JewelryPricingService::AARAV_FEED_URL,
                'gold_row_id'     => $liveRates['gold_row']['id'] ?? '2148',
                'gold_row_name'   => $liveRates['gold_row']['name'] ?? 'GOLD 999 IMP LBMA (AMD)',
                'silver_row_id'   => $liveRates['silver_row']['id'] ?? '2259',
                'silver_row_name' => $liveRates['silver_row']['name'] ?? 'SILVER 999 1KG (AMD)',
            ],
            'purities'                   => $rates['purities'],
            // Admin configured rules
            'gold_extra_offset'          => $goldOffset,
            'gold_min_floor'             => $goldFloor,
            'silver_extra_offset'        => $silverOffset,
            'silver_min_floor'           => $silverFloor,
            'purities'                   => $rates['purities'],
            'stream_items'               => $liveRates['stream_items'] ?? [],
            'history'                    => $history,
            'raw_live'                   => $liveRates,
        ]);
    }

    /**
     * Admin: configure rate extra offset, floor limits or manual override.
     */
    public function updateRates(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'gold_extra_offset'   => 'nullable|numeric|min:0',
            'silver_extra_offset' => 'nullable|numeric|min:0',
            'gold_min_floor'      => 'nullable|numeric|min:0',
            'silver_min_floor'    => 'nullable|numeric|min:0',
            'rate_22k_per_10g'    => 'nullable|numeric|min:1000',
            'rate_24k_per_g'      => 'nullable|numeric|min:100',
            'rate_silver_per_10g' => 'nullable|numeric|min:10',
        ]);

        if ($request->has('gold_extra_offset')) {
            \App\Models\Setting::set('gold_rate_extra_offset', (float) $request->gold_extra_offset, 'number', 'Admin extra offset added to gold rate');
        }
        if ($request->has('silver_extra_offset')) {
            \App\Models\Setting::set('silver_rate_extra_offset', (float) $request->silver_extra_offset, 'number', 'Admin extra offset added to silver rate');
        }
        if ($request->has('gold_min_floor')) {
            \App\Models\Setting::set('gold_rate_min_floor', (float) $request->gold_min_floor, 'number', 'Admin minimum floor for gold rate');
        }
        if ($request->has('silver_min_floor')) {
            \App\Models\Setting::set('silver_rate_min_floor', (float) $request->silver_min_floor, 'number', 'Admin minimum floor for silver rate');
        }

        $base22k = $request->rate_22k_per_10g;
        if (!$base22k && $request->rate_24k_per_g) {
            $base22k = ($request->rate_24k_per_g * 0.916) * 10;
        }

        $gold22kt = \App\Models\MetalPurity::where('name', '22KT')->first() 
            ?? \App\Models\MetalPurity::firstOrCreate(['name' => '22KT'], ['purity_fraction' => 0.916, 'type' => 'gold']);
        $silver925 = \App\Models\MetalPurity::where('type', 'silver')->first()
            ?? \App\Models\MetalPurity::firstOrCreate(['name' => '925 Silver'], ['purity_fraction' => 0.925, 'type' => 'silver']);

        if ($base22k) {
            \App\Models\GoldRate::create([
                'metal_type'     => 'gold',
                'rate_per_10g'   => $base22k,
                'base_purity_id' => $gold22kt->id,
                'effective_date' => now()->toDateString(),
                'source'         => 'manual',
            ]);
        }

        if ($request->rate_silver_per_10g) {
            \App\Models\GoldRate::create([
                'metal_type'     => 'silver',
                'rate_per_10g'   => $request->rate_silver_per_10g,
                'base_purity_id' => $silver925->id,
                'effective_date' => now()->toDateString(),
                'source'         => 'manual',
            ]);
        }

        // Clear cached live rates so next request pulls fresh data with updated rules
        Cache::forget('aarav_live_rates');

        return $this->today($request);
    }

    /**
     * Persist live rates to the gold_rates table (once per day, avoids flood).
     */
    private function persistLiveRatesToDb(array $liveRates): void
    {
        $today = now()->toDateString();

        $cacheKey = 'aarav_rates_persisted_' . $today;
        if (Cache::has($cacheKey)) {
            return; // already saved today
        }

        try {
            $gold22kt = \App\Models\MetalPurity::where('name', '22KT')->first() 
                ?? \App\Models\MetalPurity::firstOrCreate(['name' => '22KT'], ['purity_fraction' => 0.916, 'type' => 'gold']);
            $silver925 = \App\Models\MetalPurity::where('type', 'silver')->first()
                ?? \App\Models\MetalPurity::firstOrCreate(['name' => '925 Silver'], ['purity_fraction' => 0.925, 'type' => 'silver']);

            \App\Models\GoldRate::updateOrCreate(
                ['metal_type' => 'gold', 'effective_date' => $today],
                [
                    'rate_per_10g'   => $liveRates['gold_22kt_per_10g'],
                    'base_purity_id' => $gold22kt->id,
                    'source'         => 'api',
                ]
            );

            \App\Models\GoldRate::updateOrCreate(
                ['metal_type' => 'silver', 'effective_date' => $today],
                [
                    'rate_per_10g'   => $liveRates['silver_per_10g'],
                    'base_purity_id' => $silver925->id,
                    'source'         => 'api',
                ]
            );

            Cache::put($cacheKey, true, 86400); // 24-hour flag
        } catch (\Exception $e) {
            Log::warning('[GoldRate] Failed to persist live rates to DB: ' . $e->getMessage());
        }
    }
}
