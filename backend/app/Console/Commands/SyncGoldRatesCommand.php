<?php

namespace App\Console\Commands;

use App\Models\GoldRate;
use App\Models\MetalPurity;
use App\Models\Setting;
use App\Services\JewelryPricingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SyncGoldRatesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rates:sync {--force : Force sync even if already recorded today}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync daily real-time spot rates from Aarav Bullion live feed and update product pricing engine';

    /**
     * Execute the console command.
     */
    public function handle(JewelryPricingService $pricingService): int
    {
        $this->info('Connecting to Aarav Bullion live stream...');

        try {
            $liveData = $pricingService->fetchAaravLiveRates(true);

            if (!$liveData || empty($liveData['gold_24kt_per_10g'])) {
                $this->error('Failed to fetch or parse Aarav Bullion live feed.');
                Log::error('[RatesSync] Failed to fetch or parse Aarav Bullion feed.');
                return self::FAILURE;
            }

            $rawGold24k   = (float) $liveData['gold_24kt_per_10g'];
            $rawGold22k   = (float) $liveData['gold_22kt_per_10g'];
            $rawSilverKg  = (float) $liveData['silver_per_kg'];
            $rawSilver10g = (float) $liveData['silver_per_10g'];

            // Admin configured markup and floor rules (defaults: 0 for 100% Aarav parity)
            $goldOffset   = (float) Setting::get('gold_rate_extra_offset', 0);
            $goldFloor    = (float) Setting::get('gold_rate_min_floor', 0);
            $silverOffset = (float) Setting::get('silver_rate_extra_offset', 0);
            $silverFloor  = (float) Setting::get('silver_rate_min_floor', 0);

            // Effective rates
            $effectiveGold24k = $rawGold24k + $goldOffset;
            if ($goldFloor > 0 && $effectiveGold24k < $goldFloor) {
                $effectiveGold24k = $goldFloor;
            }

            $pure24kPerGram   = $effectiveGold24k / 10.0;
            $effectiveGold22k = round(($effectiveGold24k / 10.0) * 0.916 * 10, 2);
            $gold22kPerGram   = $effectiveGold22k / 10.0;
            $gold18kPerGram   = $pure24kPerGram * 0.750;
            $gold14kPerGram   = $pure24kPerGram * 0.585;

            $effectiveSilverKg = $rawSilverKg + ($silverOffset * 100);
            if ($silverFloor > 0 && $effectiveSilverKg < ($silverFloor * 100)) {
                $effectiveSilverKg = $silverFloor * 100;
            }
            $effectiveSilver10g = round($effectiveSilverKg / 100.0, 2);
            $silverPerGram      = $effectiveSilverKg / 1000.0;
            $silver925PerGram   = $silverPerGram * 0.925;

            $today = now()->toDateString();

            $gold22ktPurity = MetalPurity::where('name', '22KT')->first()
                ?? MetalPurity::firstOrCreate(['name' => '22KT'], ['purity_fraction' => 0.916, 'type' => 'gold']);
            $silver925Purity = MetalPurity::where('type', 'silver')->first()
                ?? MetalPurity::firstOrCreate(['name' => '925 Silver'], ['purity_fraction' => 0.925, 'type' => 'silver']);

            // Persist Gold Rate for today
            $goldRecord = GoldRate::where('metal_type', 'gold')
                ->where('effective_date', $today)
                ->first();

            if (!$goldRecord) {
                GoldRate::create([
                    'metal_type'     => 'gold',
                    'rate_per_10g'   => $effectiveGold22k,
                    'base_purity_id' => $gold22ktPurity->id,
                    'effective_date' => $today,
                    'source'         => 'api',
                ]);
                $this->info("✓ Created new gold rate record for {$today}");
            } else {
                $goldRecord->update([
                    'rate_per_10g'   => $effectiveGold22k,
                    'base_purity_id' => $gold22ktPurity->id,
                    'source'         => 'api',
                ]);
                $this->info("✓ Updated existing gold rate record for {$today}");
            }

            // Persist Silver Rate for today
            $silverRecord = GoldRate::where('metal_type', 'silver')
                ->where('effective_date', $today)
                ->first();

            if (!$silverRecord) {
                GoldRate::create([
                    'metal_type'     => 'silver',
                    'rate_per_10g'   => $effectiveSilver10g,
                    'base_purity_id' => $silver925Purity->id,
                    'effective_date' => $today,
                    'source'         => 'api',
                ]);
                $this->info("✓ Created new silver rate record for {$today}");
            } else {
                $silverRecord->update([
                    'rate_per_10g'   => $effectiveSilver10g,
                    'base_purity_id' => $silver925Purity->id,
                    'source'         => 'api',
                ]);
                $this->info("✓ Updated existing silver rate record for {$today}");
            }

            // Clear framework config & route caches
            Cache::forget('aarav_rates_persisted_' . $today);

            // Display table summary
            $this->newLine();
            $goldRowInfo = ($liveData['gold_row']['name'] ?? 'GOLD 999') . ' (Row ' . ($liveData['gold_row']['id'] ?? '2148') . ')';
            $silverRowInfo = ($liveData['silver_row']['name'] ?? 'SILVER 999 1KG') . ' (Row ' . ($liveData['silver_row']['id'] ?? '2259') . ')';

            $this->info("⚡ Aarav Bullion Spot Stream: {$goldRowInfo} = ₹" . number_format($rawGold24k, 2) . " / 10g | {$silverRowInfo} = ₹" . number_format($rawSilverKg, 2) . " / kg");
            if ($goldOffset > 0) {
                $this->info("✦ Admin Extra Offset: +₹" . number_format($goldOffset, 2));
            }
            if ($goldFloor > 0) {
                $this->info("🛡 Minimum Floor Protection: ₹" . number_format($goldFloor, 2) . " / 10g");
            }
            $this->table(
                ['Metal / Hallmark', 'Standard', 'Raw Spot (₹/g)', 'Admin Offset', 'Effective Rate (₹/g)', 'Effective Rate / 10g (₹)'],
                [
                    ['24KT Pure Gold', 'Benchmark 999 (Aarav Spot)', '₹' . number_format($rawGold24k / 10.0, 2), '+₹' . number_format($goldOffset / 10.0, 2), '₹' . number_format($pure24kPerGram, 2), '₹' . number_format($effectiveGold24k, 2)],
                    ['22KT Royal Gold', 'Standard Hallmark (91.6%)', '₹' . number_format($rawGold22k / 10.0, 2), '+₹' . number_format(($goldOffset / 10.0) * 0.916, 2), '₹' . number_format($gold22kPerGram, 2), '₹' . number_format($effectiveGold22k, 2)],
                    ['18KT Fine Gold', '75.0% Fine (Diamond)', '₹' . number_format(($rawGold24k / 10.0) * 0.75, 2), '+₹' . number_format(($goldOffset / 10.0) * 0.75, 2), '₹' . number_format($gold18kPerGram, 2), '₹' . number_format($gold18kPerGram * 10, 2)],
                    ['14KT Modern Gold', '58.5% Fine', '₹' . number_format(($rawGold24k / 10.0) * 0.585, 2), '+₹' . number_format(($goldOffset / 10.0) * 0.585, 2), '₹' . number_format($gold14kPerGram, 2), '₹' . number_format($gold14kPerGram * 10, 2)],
                    ['Silver 999 Pure', 'Bullion Standard (1KG)', '₹' . number_format($rawSilverKg / 1000.0, 2), '+₹' . number_format($silverOffset / 10.0, 2), '₹' . number_format($silverPerGram, 2), '₹' . number_format($silverPerGram * 10, 2)],
                    ['925 Sterling Silver', '92.5% Fine (Atelier)', '₹' . number_format(($rawSilverKg / 1000.0) * 0.925, 2), '+₹' . number_format(($silverOffset / 10.0) * 0.925, 2), '₹' . number_format($silver925PerGram, 2), '₹' . number_format($silver925PerGram * 10, 2)],
                ]
            );

            $this->info("★ All product prices across Pintaara are dynamically synced to these rates.");
            Log::info("[RatesSync] Live bullion rates synced successfully for {$today}. 24KT 999: ₹{$rawGold24k}, 22KT: ₹{$effectiveGold22k}, Silver 1KG: ₹{$rawSilverKg}");

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Error syncing rates: ' . $e->getMessage());
            Log::error('[RatesSync] Exception during sync: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
