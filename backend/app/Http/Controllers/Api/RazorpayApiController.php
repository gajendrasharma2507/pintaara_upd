<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
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

class RazorpayApiController extends Controller
{
    protected string $keyId;
    protected string $keySecret;
    protected string $currency;
    protected string $merchantName;
    protected JewelryPricingService $pricingService;

    public function __construct(JewelryPricingService $pricingService)
    {
        $this->pricingService = $pricingService;

        $mode = Setting::get('razorpay_env', 'test');
        if ($mode === 'live' || $mode === 'production') {
            $liveKey = Setting::get('razorpay_live_key_id');
            $this->keyId = ($liveKey && $liveKey !== 'rzp_test_placeholder') ? $liveKey : config('razorpay.live_key_id', env('RAZORPAY_LIVE_KEY_ID', ''));
            $liveSecret = Setting::get('razorpay_live_key_secret');
            $this->keySecret = ($liveSecret && $liveSecret !== 'placeholder_secret') ? $liveSecret : config('razorpay.live_key_secret', env('RAZORPAY_LIVE_KEY_SECRET', ''));
        } else {
            $testKey = Setting::get('razorpay_test_key_id');
            $this->keyId = ($testKey && $testKey !== 'rzp_test_placeholder') ? $testKey : config('razorpay.test_key_id', env('RAZORPAY_TEST_KEY_ID', env('RAZORPAY_KEY_ID', 'rzp_test_placeholder')));
            $testSecret = Setting::get('razorpay_test_key_secret');
            $this->keySecret = ($testSecret && $testSecret !== 'placeholder_secret') ? $testSecret : config('razorpay.test_key_secret', env('RAZORPAY_TEST_KEY_SECRET', env('RAZORPAY_KEY_SECRET', 'placeholder_secret')));
        }

        $this->currency = Setting::get('currency_code', config('razorpay.currency', 'INR'));
        $this->merchantName = Setting::get('brand_name', config('razorpay.merchant_name', 'PINTAARA'));
    }

    /**
     * Get public Razorpay configuration for frontend.
     */
    public function configInfo(): JsonResponse
    {
        $isLive = str_starts_with($this->keyId, 'rzp_live_');
        $isPlaceholder = ($this->keyId === 'rzp_test_placeholder' || empty($this->keyId));

        return response()->json([
            'status' => 'success',
            'success' => true,
            'data' => [
                'key_id' => $this->keyId,
                'currency' => $this->currency,
                'merchant_name' => $this->merchantName,
                'is_live' => $isLive,
                'is_placeholder' => $isPlaceholder,
            ]
        ]);
    }

    /**
     * Create a Razorpay Order.
     * Enforces authoritative server-side price calculation when items are provided.
     * Endpoint: POST /api/payment/razorpay/order
     */
    public function createOrder(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'nullable|numeric|min:1',
            'items' => 'nullable|array',
            'currency' => 'nullable|string|max:10',
            'receipt' => 'nullable|string|max:100',
            'notes' => 'nullable|array',
        ]);

        // Recalculate price server-side from cart items to prevent client tampering
        if (!empty($request->items) && is_array($request->items)) {
            $pricing = $this->pricingService->calculateCartPrice($request->items);
            $amountInRupees = $pricing['total_amount'];
        } else {
            $amountInRupees = (float) ($request->amount ?? 1);
        }

        $amountInPaise = (int) round($amountInRupees * 100);
        $currency = strtoupper($request->currency ?? $this->currency);
        $receipt = $request->receipt ?? ('rcpt_' . time() . '_' . rand(100, 999));
        $notes = $request->notes ?? [
            'store' => 'PINTAARA Fine Jewelry',
            'created_at' => now()->toDateTimeString(),
        ];

        // Check if real keys are configured
        $isConfigured = !empty($this->keyId) && 
                        !empty($this->keySecret) && 
                        $this->keyId !== 'rzp_test_placeholder' && 
                        $this->keySecret !== 'placeholder_secret';

        if ($isConfigured) {
            try {
                $response = Http::withBasicAuth($this->keyId, $this->keySecret)
                    ->timeout(15)
                    ->post('https://api.razorpay.com/v1/orders', [
                        'amount' => $amountInPaise,
                        'currency' => $currency,
                        'receipt' => $receipt,
                        'notes' => $notes,
                        'payment_capture' => 1,
                    ]);

                if ($response->successful()) {
                    $rzpOrder = $response->json();
                    return response()->json([
                        'status' => 'success',
                        'success' => true,
                        'data' => [
                            'key_id' => $this->keyId,
                            'order_id' => $rzpOrder['id'],
                            'amount' => $rzpOrder['amount'],
                            'currency' => $rzpOrder['currency'],
                            'receipt' => $rzpOrder['receipt'] ?? $receipt,
                            'merchant_name' => $this->merchantName,
                            'is_mock' => false,
                        ]
                    ]);
                }

                Log::warning('Razorpay API returned error: ' . $response->body());
            } catch (\Exception $e) {
                Log::error('Razorpay API connection failed: ' . $e->getMessage());
            }
        }

        // Sandbox/Placeholder fallback for local testing when keys are in test mode
        $mockOrderId = 'order_test_' . Str::random(14);
        return response()->json([
            'status' => 'success',
            'success' => true,
            'message' => 'Development sandbox order created (Placeholder keys active in .env)',
            'data' => [
                'key_id' => $this->keyId,
                'order_id' => $mockOrderId,
                'amount' => $amountInPaise,
                'currency' => $currency,
                'receipt' => $receipt,
                'merchant_name' => $this->merchantName,
                'is_mock' => true,
            ]
        ]);
    }

    /**
     * Verify payment signature and record order in database.
     * Endpoint: POST /api/payment/razorpay/verify
     */
    public function verifyPayment(Request $request): JsonResponse
    {
        $request->validate([
            'razorpay_payment_id' => 'required|string',
            'razorpay_order_id' => 'required|string',
            'razorpay_signature' => 'nullable|string',
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'shipping_address' => 'nullable|string|max:1000',
            'items' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $paymentId = $request->razorpay_payment_id;
        $orderId = $request->razorpay_order_id;
        $signature = $request->razorpay_signature;

        $isConfigured = !empty($this->keyId) && 
                        !empty($this->keySecret) && 
                        $this->keyId !== 'rzp_test_placeholder' && 
                        $this->keySecret !== 'placeholder_secret';

        // Verify HMAC-SHA256 signature if real credentials and signature are provided
        if ($isConfigured && !empty($signature) && !str_starts_with($orderId, 'order_test_')) {
            $expectedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $this->keySecret);
            if (!hash_equals($expectedSignature, $signature)) {
                AuditLog::log('payment_verification_failed', 'Payment', null, null, [
                    'order_id' => $orderId,
                    'payment_id' => $paymentId,
                ]);
                return response()->json([
                    'status' => 'error',
                    'success' => false,
                    'message' => 'Razorpay payment signature verification failed.',
                ], 400);
            }
        }

        // Authoritative server-side price calculation
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

        $user = $request->user('sanctum') ?? $request->user();
        if (!$user && !empty($request->customer_email)) {
            $user = \App\Models\User::whereRaw('LOWER(TRIM(email)) = ?', [strtolower(trim($request->customer_email))])->first();
        }

        DB::beginTransaction();
        try {
            $orderNumber = 'PT-' . date('Y') . '-' . strtoupper(Str::random(6));

            $timeline = [
                [
                    'id' => (int) (microtime(true) * 1000),
                    'title' => "Payment of ₹" . number_format($totalAmount, 2) . " INR verified via Razorpay. (Payment ID: {$paymentId})",
                    'collapsible' => false,
                    'time' => 'Just now',
                ],
                [
                    'id' => (int) (microtime(true) * 1000) + 1,
                    'title' => "Order #{$orderNumber} confirmed from online checkout.",
                    'collapsible' => false,
                    'time' => 'Just now',
                ]
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
                'payment_method' => 'Razorpay',
                'payment_status' => 'paid',
                'fulfillment_status' => 'unfulfilled',
                'shipping_address' => $request->shipping_address ?? 'Address on file',
                'gold_rate_snapshot' => $goldRateSnapshot,
                'locked_gold_rate_24kt' => $goldRateSnapshot['gold_24kt_per_g'] ?? null,
                'locked_gold_rate_22kt' => $goldRateSnapshot['gold_22kt_per_10g'] ?? null,
                'locked_silver_rate' => $goldRateSnapshot['silver_per_10g'] ?? null,
                'razorpay_order_id' => $orderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature,
                'timeline' => $timeline,
                'notes' => $request->notes ?? "Paid via Razorpay ID: {$paymentId}",
            ]);

            // Create order items with locked values
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
                }
            }

            AuditLog::log('order_placed', 'Order', $order->id, null, [
                'order_number' => $orderNumber,
                'total_amount' => $totalAmount,
                'user_id' => $user?->id,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'success' => true,
                'message' => 'Payment verified and order confirmed successfully.',
                'order_number' => $orderNumber,
                'order_id' => $order->id,
                'total_amount' => $totalAmount,
                'payment_id' => $paymentId,
                'razorpay_payment_id' => $paymentId,
                'payment_method' => 'Gpay',
                'payment_date' => now()->format('d F Y'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to save order: " . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'success' => false,
                'message' => 'Failed to save order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Webhook Handler for Razorpay server-to-server notifications.
     * Endpoint: POST /api/payment/razorpay/webhook
     */
    public function webhook(Request $request): JsonResponse
    {
        $webhookSecret = config('razorpay.webhook_secret', env('RAZORPAY_WEBHOOK_SECRET', ''));
        $webhookSignature = $request->header('X-Razorpay-Signature');

        if (!empty($webhookSecret) && !empty($webhookSignature)) {
            $expectedSignature = hash_hmac('sha256', $request->getContent(), $webhookSecret);
            if (!hash_equals($expectedSignature, $webhookSignature)) {
                return response()->json(['status' => 'error', 'message' => 'Invalid webhook signature.'], 400);
            }
        }

        $event = $request->input('event');
        $payload = $request->input('payload');

        Log::info("Razorpay Webhook Event Received: {$event}");

        if ($event === 'payment.captured') {
            $paymentEntity = $payload['payment']['entity'] ?? [];
            $rzpOrderId = $paymentEntity['order_id'] ?? null;

            if ($rzpOrderId) {
                $order = Order::where('razorpay_order_id', $rzpOrderId)->first();
                if ($order && $order->payment_status !== 'paid') {
                    $order->update(['payment_status' => 'paid']);
                    AuditLog::log('webhook_payment_captured', 'Order', $order->id);
                }
            }
        }

        return response()->json(['status' => 'success', 'message' => 'Webhook processed.']);
    }
}
