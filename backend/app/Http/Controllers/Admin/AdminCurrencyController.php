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

    public function update(Request $request, CurrencyExchangeService $service)
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

        // Optional: add a new storefront currency code if submitted via update form
        $newCode = strtoupper(trim((string) $request->input('new_currency_code', '')));
        if ($newCode !== '' && preg_match('/^[A-Z]{3,5}$/', $newCode)) {
            $newMarkupType = ($request->input('new_markup_type', 'flat') === 'percent') ? 'percent' : 'flat';
            CurrencyRate::firstOrCreate(
                ['currency_code' => $newCode],
                [
                    'currency_name' => trim((string) ($request->input('new_currency_name') ?: $newCode)),
                    'currency_symbol' => trim((string) ($request->input('new_currency_symbol') ?: $newCode)),
                    'country_name' => trim((string) ($request->input('new_country_name') ?: '')),
                    'exchange_rate' => max(0.000001, (float) ($request->input('new_exchange_rate') ?: 1.0)),
                    'country_markup' => max(0, (float) $request->input('new_country_markup', 0)),
                    'markup_type' => $newMarkupType,
                    'is_enabled' => true,
                ]
            );
            $service->syncEnabledCurrencies();
        }

        return redirect()->route('admin.currencies')->with('success', 'Currency & country markup settings saved.');
    }

    public function store(Request $request, CurrencyExchangeService $service)
    {
        $request->validate([
            'currency_code' => 'required|string|max:5|regex:/^[A-Za-z]{3,5}$/',
            'currency_name' => 'nullable|string|max:80',
            'currency_symbol' => 'nullable|string|max:12',
            'country_name' => 'required|string|max:80',
            'country_markup' => 'nullable|numeric|min:0',
            'markup_type' => 'nullable|in:flat,percent',
            'exchange_rate' => 'nullable|numeric|min:0.000001',
        ]);

        $code = strtoupper(trim((string) $request->input('currency_code')));
        $markupType = ($request->input('markup_type', 'flat') === 'percent') ? 'percent' : 'flat';
        $manualRate = $request->filled('exchange_rate') ? (float) $request->input('exchange_rate') : 1.0;

        $currency = CurrencyRate::updateOrCreate(
            ['currency_code' => $code],
            [
                'currency_name' => trim((string) ($request->input('currency_name') ?: $code)),
                'currency_symbol' => trim((string) ($request->input('currency_symbol') ?: $code)),
                'country_name' => trim((string) $request->input('country_name')),
                'exchange_rate' => $manualRate,
                'country_markup' => max(0, (float) ($request->input('country_markup') ?? 0)),
                'markup_type' => $markupType,
                'is_enabled' => true,
            ]
        );

        // Immediately sync live FX rate from Frankfurter v2 if supported
        $service->syncEnabledCurrencies();
        $currency->refresh();

        return redirect()->route('admin.currencies')->with(
            'success',
            "{$code} ({$currency->country_name}) added to Storefront Currencies. Rate: " . number_format((float) $currency->exchange_rate, 6)
        );
    }

    public function destroy($id)
    {
        $currency = CurrencyRate::findOrFail($id);
        if (strtoupper($currency->currency_code) === 'INR') {
            return redirect()->route('admin.currencies')->with('warning', 'Base currency INR cannot be removed.');
        }

        $code = $currency->currency_code;
        $currency->delete();

        return redirect()->route('admin.currencies')->with('success', "Currency {$code} removed.");
    }
}
