<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CurrencyRate;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Services\JewelryPricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PayPalApiController extends Controller
{
    protected JewelryPricingService $pricingService;

    /**
     * Currencies natively supported by PayPal REST Orders v2 API.
     * Any other international currency (e.g. AED) falls back to USD for PayPal processing.
     */
    private const PAYPAL_SUPPORTED_CURRENCIES = [
        'AUD', 'BRL', 'CAD', 'CNY', 'CZK', 'DKK', 'EUR', 'HKD', 'HUF',
        'ILS', 'JPY', 'MYR', 'MXN', 'TWD', 'NZD', 'NOK', 'PHP', 'PLN',
        'GBP', 'RUB', 'SGD', 'SEK', 'CHF', 'THB', 'USD',
    ];

    public function __construct(JewelryPricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    private function getCredentials(): array
    {
        $env = Setting::get('paypal_env', env('PAYPAL_ENV', 'sandbox')) === 'live' ? 'live' : 'sandbox';
        $clientId = trim((string) Setting::get('paypal_client_id', env('PAYPAL_CLIENT_ID', '')));
        $clientSecret = trim((string) Setting::get('paypal_client_secret', env('PAYPAL_CLIENT_SECRET', '')));
        $baseUrl = $env === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        return compact('env', 'clientId', 'clientSecret', 'baseUrl');
    }

    private function getAccessToken(array $creds): string
    {
        $response = Http::asForm()
            ->withBasicAuth($creds['clientId'], $creds['clientSecret'])
            ->post($creds['baseUrl'] . '/v1/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        if (!$response->successful()) {
            throw new \RuntimeException('PayPal authentication failed: ' . ($response->json('error_description') ?? $response->body()));
        }

        $token = $response->json('access_token');
        if (empty($token)) {
            throw new \RuntimeException('PayPal access token missing from response.');
        }

        return $token;
    }

    public function configInfo(): JsonResponse
    {
        $creds = $this->getCredentials();
        $isConfigured = !empty($creds['clientId']) && !empty($creds['clientSecret']);
        $isEnabled = Setting::get('paypal_enabled', '1') !== '0';
        $internationalEnabled = Setting::get('paypal_international_enabled', '1') !== '0';

        return response()->json([
            'status' => 'success',
            'data' => [
                'enabled' => $isConfigured && $isEnabled,
                'international_enabled' => $internationalEnabled,
                'configured' => $isConfigured,
                'env' => $creds['env'],
                'client_id' => $creds['clientId'],
            ],
        ]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $request->validate([
            'currency' => 'nullable|string|max:10',
            'items' => 'nullable|array',
            'amount' => 'nullable|numeric|min:0.01',
        ]);

        $creds = $this->getCredentials();
        if (Setting::get('paypal_enabled', '1') === '0' || Setting::get('paypal_international_enabled', '1') === '0') {
            return response()->json([
                'status' => 'error',
                'message' => 'PayPal is currently disabled for international checkout in Admin Settings.',
            ], 422);
        }

        if (empty($creds['clientId']) || empty($creds['clientSecret'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'PayPal is not configured. Please add PayPal Client ID and Secret in Admin Settings.',
            ], 422);
        }

        $requestedCurrency = strtoupper(trim((string) ($request->currency ?? 'USD')));
        if ($requestedCurrency === 'INR') {
            $requestedCurrency = 'USD';
        }

        // Authoritative INR pricing from backend
        $pricing = null;
        if (!empty($request->items) && is_array($request->items)) {
            $pricing = $this->pricingService->calculateCartPrice($request->items);
            $amountInr = (float) ($pricing['total_amount'] ?? 0);
        } else {
            $amountInr = (float) ($request->amount ?? 1.0);
        }

        // Convert to requested foreign currency using CurrencyRate table
        $currencyRate = CurrencyRate::where('currency_code', $requestedCurrency)
            ->where('is_enabled', true)
            ->first();

        // If currency is not supported natively by PayPal (e.g., AED), charge in USD equivalent
        $paypalCurrency = in_array($requestedCurrency, self::PAYPAL_SUPPORTED_CURRENCIES, true)
            ? $requestedCurrency
            : 'USD';

        $chargeCurrencyModel = ($paypalCurrency === $requestedCurrency && $currencyRate)
            ? $currencyRate
            : CurrencyRate::where('currency_code', $paypalCurrency)->first();

        $rate = $chargeCurrencyModel ? (float) $chargeCurrencyModel->exchange_rate : 0.012;
        $markup = $chargeCurrencyModel ? (float) $chargeCurrencyModel->country_markup : 0.0;
        $markupType = $chargeCurrencyModel->markup_type ?? 'flat';

        $converted = $amountInr * $rate;
        $chargeAmount = $markupType === 'percent'
            ? round($converted * (1 + ($markup / 100)), 2)
            : round($converted + $markup, 2);

        $decimals = in_array($paypalCurrency, ['JPY', 'HUF', 'TWD'], true) ? 0 : 2;
        $formattedValue = $decimals === 0
            ? (string) round($chargeAmount)
            : number_format($chargeAmount, 2, '.', '');

        try {
            $accessToken = $this->getAccessToken($creds);

            $orderResponse = Http::withToken($accessToken)
                ->post($creds['baseUrl'] . '/v2/checkout/orders', [
                    'intent' => 'CAPTURE',
                    'purchase_units' => [
                        [
                            'description' => 'PINTAARA Fine Jewelry Order',
                            'amount' => [
                                'currency_code' => $paypalCurrency,
                                'value' => $formattedValue,
                            ],
                        ],
                    ],
                ]);

            if (!$orderResponse->successful()) {
                $err = $orderResponse->json('details.0.description')
                    ?? $orderResponse->json('message')
                    ?? $orderResponse->body();
                Log::error('PayPal createOrder error: ' . $err);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to create PayPal order: ' . $err,
                ], 500);
            }

            $ppData = $orderResponse->json();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'order_id' => $ppData['id'] ?? null,
                    'client_id' => $creds['clientId'],
                    'env' => $creds['env'],
                    'currency' => $paypalCurrency,
                    'requested_currency' => $requestedCurrency,
                    'amount' => $formattedValue,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('PayPal createOrder exception: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'PayPal initialization failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function captureOrder(Request $request): JsonResponse
    {
        $request->validate([
            'paypal_order_id' => 'required|string',
            'currency' => 'nullable|string|max:10',
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'shipping_address' => 'nullable|string|max:1000',
            'items' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $creds = $this->getCredentials();
        if (Setting::get('paypal_enabled', '1') === '0' || Setting::get('paypal_international_enabled', '1') === '0') {
            return response()->json([
                'status' => 'error',
                'message' => 'PayPal is currently disabled for international checkout in Admin Settings.',
            ], 422);
        }

        if (empty($creds['clientId']) || empty($creds['clientSecret'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'PayPal credentials are not configured.',
            ], 422);
        }

        $paypalOrderId = trim((string) $request->paypal_order_id);

        try {
            $accessToken = $this->getAccessToken($creds);

            $captureResponse = Http::withToken($accessToken)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($creds['baseUrl'] . "/v2/checkout/orders/{$paypalOrderId}/capture", (object) []);

            if (!$captureResponse->successful()) {
                $err = $captureResponse->json('details.0.description')
                    ?? $captureResponse->json('message')
                    ?? $captureResponse->body();
                Log::error('PayPal capture error: ' . $err);
                return response()->json([
                    'status' => 'error',
                    'success' => false,
                    'message' => 'PayPal capture failed: ' . $err,
                ], 400);
            }

            $captureData = $captureResponse->json();
            $ppStatus = strtoupper((string) ($captureData['status'] ?? ''));
            if ($ppStatus !== 'COMPLETED') {
                return response()->json([
                    'status' => 'error',
                    'success' => false,
                    'message' => "PayPal payment status is {$ppStatus}, expected COMPLETED.",
                ], 400);
            }

            $captureId = $captureData['purchase_units'][0]['payments']['captures'][0]['id'] ?? $paypalOrderId;
            $paidValue = $captureData['purchase_units'][0]['payments']['captures'][0]['amount']['value'] ?? null;
            $paidCurrency = strtoupper((string) ($captureData['purchase_units'][0]['payments']['captures'][0]['amount']['currency_code'] ?? ($request->currency ?? 'USD')));
        } catch (\Throwable $e) {
            Log::error('PayPal capture exception: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'success' => false,
                'message' => 'PayPal capture error: ' . $e->getMessage(),
            ], 500);
        }

        // Authoritative server-side INR pricing calculation
        if (!empty($request->items) && is_array($request->items)) {
            $pricing = $this->pricingService->calculateCartPrice($request->items);
            $totalAmount = $pricing['total_amount'];
            $subtotal = $pricing['subtotal'];
            $gstAmount = $pricing['gst_amount'];
            $goldRateSnapshot = $pricing['gold_rate_snapshot'];
            $validatedItems = $pricing['items'];
        } else {
            $totalAmount = (float) ($request->total_amount ?? 0);
            $subtotal = round($totalAmount / 1.03, 2);
            $gstAmount = round($totalAmount - $subtotal, 2);
            $goldRateSnapshot = [
                'gold_22kt_per_10g' => $this->pricingService->getBaseGoldRatePer10g(),
                'gold_24kt_per_g' => round($this->pricingService->calculatePureGoldRatePerGram(), 2),
                'silver_per_10g' => $this->pricingService->getBaseSilverRatePer10g(),
                'locked_at' => now()->toIso8601String(),
            ];
            $validatedItems = [];
        }

        $currencyModel = CurrencyRate::where('currency_code', $paidCurrency)->first();
        $goldRateSnapshot['currency'] = [
            'code' => $paidCurrency,
            'symbol' => $currencyModel->currency_symbol ?? $paidCurrency,
            'exchange_rate' => (float) ($currencyModel->exchange_rate ?? 1),
            'country_markup' => (float) ($currencyModel->country_markup ?? 0),
            'markup_type' => $currencyModel->markup_type ?? 'flat',
        ];

        $user = $request->user('sanctum') ?? $request->user();
        if (!$user && !empty($request->customer_email)) {
            $user = \App\Models\User::whereRaw('LOWER(TRIM(email)) = ?', [strtolower(trim($request->customer_email))])->first();
        }

        DB::beginTransaction();
        try {
            $orderNumber = 'PT-' . date('Y') . '-' . strtoupper(Str::random(6));
            $currSym = $goldRateSnapshot['currency']['symbol'];
            $displayPaid = $paidValue ?? number_format($totalAmount * $goldRateSnapshot['currency']['exchange_rate'], 2, '.', '');

            $timeline = [
                [
                    'id' => (int) (microtime(true) * 1000),
                    'title' => "Payment of {$currSym}{$displayPaid} {$paidCurrency} captured via PayPal. (Capture ID: {$captureId})",
                    'collapsible' => false,
                    'time' => 'Just now',
                ],
                [
                    'id' => (int) (microtime(true) * 1000) + 1,
                    'title' => "Order #{$orderNumber} confirmed from online checkout.",
                    'collapsible' => false,
                    'time' => 'Just now',
                ],
            ];

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user?->id,
                'customer_name' => $request->customer_name ?? $user?->name ?? 'Valued Patron',
                'customer_email' => $request->customer_email ?? $user?->email ?? 'customer@pintaara.com',
                'customer_phone' => $request->customer_phone ?? $user?->phone ?? '',
                'subtotal' => $subtotal,
                'gst_amount' => $gstAmount,
                'total_amount' => $totalAmount,
                'status' => 'confirmed',
                'payment_method' => 'PayPal',
                'payment_status' => 'paid',
                'fulfillment_status' => 'unfulfilled',
                'shipping_address' => $request->shipping_address ?? 'Address on file',
                'gold_rate_snapshot' => $goldRateSnapshot,
                'locked_gold_rate_24kt' => $goldRateSnapshot['gold_24kt_per_g'] ?? null,
                'locked_gold_rate_22kt' => $goldRateSnapshot['gold_22kt_per_10g'] ?? null,
                'locked_silver_rate' => $goldRateSnapshot['silver_per_10g'] ?? null,
                'razorpay_order_id' => $paypalOrderId,
                'razorpay_payment_id' => $captureId,
                'timeline' => $timeline,
                'notes' => $request->notes ?? "Paid via PayPal Capture ID: {$captureId}",
            ]);

            if (!empty($validatedItems)) {
                foreach ($validatedItems as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'product_name' => $item['product_name'],
                        'design_code' => $item['design_code'],
                        'metal_purity' => $item['metal_purity'],
                        'finish' => $item['finish'],
                        'size' => $item['size'],
                        'gem' => $item['gem'],
                        'chain' => $item['chain'],
                        'weight_used' => $item['weight_used'],
                        'gold_rate_locked' => $item['gold_rate_locked'],
                        'metal_value' => $item['metal_value'],
                        'wastage_value' => $item['wastage_value'],
                        'making_charge' => $item['making_charge'],
                        'stone_charge' => $item['stone_charge'],
                        'gst_amount' => $item['gst_amount'],
                        'price' => $item['unit_price'],
                        'quantity' => $item['quantity'],
                        'total' => $item['total'],
                    ]);

                    $prod = !empty($item['product_id'])
                        ? Product::find($item['product_id'])
                        : (!empty($item['design_code']) ? Product::whereRaw('UPPER(design_code) = UPPER(?)', [$item['design_code']])->first() : null);
                    if ($prod && ($prod->is_limited_edition ?? true)) {
                        $pQty = (int) ($item['quantity'] ?? 1);
                        $pCurr = (int) ($prod->edition_current ?? 1);
                        $pLim = (int) ($prod->edition_limit ?? 50);
                        $prod->update(['edition_current' => min($pLim, $pCurr + $pQty)]);
                    }
                }
            }

            AuditLog::log('order_placed', 'Order', $order->id, null, [
                'order_number' => $orderNumber,
                'total_amount' => $totalAmount,
                'payment_method' => 'PayPal',
                'user_id' => $user?->id,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'success' => true,
                'message' => 'PayPal payment captured and order confirmed successfully.',
                'order_number' => $orderNumber,
                'order_id' => $order->id,
                'total_amount' => $totalAmount,
                'payment_id' => $captureId,
                'payment_method' => 'PayPal',
                'payment_date' => now()->format('d F Y'),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('PayPal failed to save order: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'success' => false,
                'message' => 'Failed to save order: ' . $e->getMessage(),
            ], 500);
        }
    }
}
