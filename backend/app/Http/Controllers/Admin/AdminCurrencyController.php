<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CurrencyRate;
use App\Models\Setting;
use App\Services\CurrencyExchangeService;
use Illuminate\Http\Request;

class AdminCurrencyController extends Controller
{
    public function index()
    {
        CurrencyRate::ensureDefaultsExist();

        $currencies = CurrencyRate::orderByRaw("CASE WHEN currency_code = 'INR' THEN 0 ELSE 1 END")
            ->orderBy('currency_code')
            ->get();

        $apiStatus = Setting::get('frankfurter_api_status', 'pending');
        $lastSuccessAt = Setting::get('frankfurter_last_success_at', '');
        $lastError = Setting::get('frankfurter_last_error', '');

        return view('admin.currencies.index', compact(
            'currencies',
            'apiStatus',
            'lastSuccessAt',
            'lastError'
        ));
    }

    public function sync(CurrencyExchangeService $service)
    {
        $result = $service->syncEnabledCurrencies();

        if ($result['success']) {
            return redirect()->route('admin.currencies')->with('success', $result['message']);
        }

        return redirect()->route('admin.currencies')->with('warning', $result['message']);
    }

    public function update(Request $request)
    {
        $items = $request->input('currencies', []);
        foreach ($items as $id => $data) {
            $currency = CurrencyRate::find($id);
            if (!$currency) {
                continue;
            }
            $markupType = ($data['markup_type'] ?? 'flat') === 'percent' ? 'percent' : 'flat';
            $currency->update([
                'country_name' => trim((string) ($data['country_name'] ?? $currency->country_name)),
                'currency_symbol' => trim((string) ($data['currency_symbol'] ?? $currency->currency_symbol)),
                'country_markup' => max(0, (float) ($data['country_markup'] ?? 0)),
                'markup_type' => $markupType,
                'is_enabled' => $currency->currency_code === 'INR' ? true : !empty($data['is_enabled']),
            ]);
        }

        // Optional: add a new storefront currency code
        $newCode = strtoupper(trim((string) $request->input('new_currency_code', '')));
        if ($newCode !== '' && preg_match('/^[A-Z]{3,5}$/', $newCode)) {
            CurrencyRate::firstOrCreate(
                ['currency_code' => $newCode],
                [
                    'currency_name' => trim((string) $request->input('new_currency_name', $newCode)),
                    'currency_symbol' => trim((string) $request->input('new_currency_symbol', $newCode)),
                    'country_name' => trim((string) $request->input('new_country_name', '')),
                    'exchange_rate' => 1.0,
                    'country_markup' => max(0, (float) $request->input('new_country_markup', 0)),
                    'is_enabled' => true,
                ]
            );
        }

        return redirect()->route('admin.currencies')->with('success', 'Currency & country markup settings saved.');
    }
}
