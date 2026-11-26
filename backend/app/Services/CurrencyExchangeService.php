<?php

namespace App\Services;

use App\Models\CurrencyRate;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class CurrencyExchangeService
{
    public const API_ENDPOINT = 'https://api.frankfurter.dev/v2/rates?base=INR';

    /**
     * Fetch exchange rates from Frankfurter API v2 (base=INR) and cache enabled
     * storefront currencies in the `currency_rates` table.
     * On API failure, keeps the last successfully stored rates intact.
     */
    public function syncEnabledCurrencies(): array
    {
        CurrencyRate::ensureDefaultsExist();

        $enabledCurrencies = CurrencyRate::where('is_enabled', true)->get();
        if ($enabledCurrencies->isEmpty()) {
            return [
                'success' => true,
                'status' => 'connected',
                'updated_count' => 0,
                'message' => 'No enabled storefront currencies to sync.',
            ];
        }

        try {
            $response = Http::timeout(15)
                ->acceptJson()
                ->get(self::API_ENDPOINT);

            if (!$response->successful()) {
                throw new \RuntimeException('Frankfurter API returned HTTP ' . $response->status());
            }

            $payload = $response->json();
            if (!is_array($payload) || empty($payload)) {
                throw new \RuntimeException('Frankfurter API returned an empty or invalid payload.');
            }

            // v2 returns a list of objects: [{ date, base, quote, rate }, ...]
            $rateMap = [];
            foreach ($payload as $entry) {
                if (is_array($entry) && isset($entry['quote'], $entry['rate'])) {
                    $code = strtoupper(trim((string) $entry['quote']));
                    $rateMap[$code] = [
                        'rate' => (float) $entry['rate'],
                        'date' => $entry['date'] ?? now()->toDateString(),
                    ];
                }
            }

            // Support v1 fallback structure just in case
            if (empty($rateMap) && isset($payload['rates']) && is_array($payload['rates'])) {
                $fallbackDate = $payload['date'] ?? now()->toDateString();
                foreach ($payload['rates'] as $code => $rate) {
                    $rateMap[strtoupper(trim((string) $code))] = [
                        'rate' => (float) $rate,
                        'date' => $fallbackDate,
                    ];
                }
            }

            if (empty($rateMap)) {
                throw new \RuntimeException('No valid currency rate entries found in Frankfurter response.');
            }

            $now = now();
            $updatedCount = 0;

            foreach ($enabledCurrencies as $currency) {
                $code = strtoupper($currency->currency_code);
                if ($code === 'INR') {
                    $currency->update([
                        'exchange_rate' => 1.0,
                        'rate_date' => $now->toDateString(),
                        'last_synced_at' => $now,
                    ]);
                    $updatedCount++;
                    continue;
                }

                if (isset($rateMap[$code]) && $rateMap[$code]['rate'] > 0) {
                    $currency->update([
                        'exchange_rate' => $rateMap[$code]['rate'],
                        'rate_date' => $rateMap[$code]['date'],
                        'last_synced_at' => $now,
                    ]);
                    $updatedCount++;
                }
            }

            Setting::set('frankfurter_api_status', 'connected', 'string', 'Frankfurter API Connection Status');
            Setting::set('frankfurter_last_success_at', $now->toIso8601String(), 'string', 'Frankfurter API Last Successful Sync');
            Setting::set('frankfurter_last_error', '', 'string', 'Frankfurter API Last Error');

            return [
                'success' => true,
                'status' => 'connected',
                'updated_count' => $updatedCount,
                'last_success_at' => $now->toIso8601String(),
                'message' => "Synced {$updatedCount} enabled currency rate(s) from Frankfurter API.",
            ];
        } catch (Throwable $e) {
            Log::warning('Frankfurter API sync failed; retaining cached currency_rates: ' . $e->getMessage());

            Setting::set('frankfurter_api_status', 'error', 'string', 'Frankfurter API Connection Status');
            Setting::set('frankfurter_last_error', $e->getMessage(), 'string', 'Frankfurter API Last Error');

            return [
                'success' => false,
                'status' => 'error',
                'updated_count' => 0,
                'last_success_at' => Setting::get('frankfurter_last_success_at', ''),
                'message' => 'Frankfurter API unavailable (' . $e->getMessage() . '). Using last successfully stored rates.',
            ];
        }
    }

    /**
     * Return cached enabled currencies and API status for storefront consumption.
     * Never modifies original product INR prices.
     */
    public function getEnabledRatesPayload(): array
    {
        CurrencyRate::ensureDefaultsExist();

        $rates = CurrencyRate::where('is_enabled', true)
            ->orderByRaw("CASE WHEN currency_code = 'INR' THEN 0 ELSE 1 END")
            ->orderBy('currency_code')
            ->get();

        return [
            'base_currency' => 'INR',
            'api_status' => Setting::get('frankfurter_api_status', 'pending'),
            'last_success_at' => Setting::get('frankfurter_last_success_at', null),
            'currencies' => $rates->map(fn(CurrencyRate $c) => [
                'currency_code' => $c->currency_code,
                'currency_name' => $c->currency_name,
                'currency_symbol' => $c->currency_symbol,
                'country_name' => $c->country_name,
                'exchange_rate' => (float) $c->exchange_rate,
                'country_markup' => (float) $c->country_markup,
                'rate_date' => $c->rate_date?->format('Y-m-d'),
                'last_synced_at' => $c->last_synced_at?->toIso8601String(),
            ])->values()->all(),
        ];
    }
}
