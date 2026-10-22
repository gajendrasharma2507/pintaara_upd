<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\JewelryPricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderApiController extends Controller
{
    protected JewelryPricingService $pricingService;

    public function __construct(JewelryPricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->has('items') && is_array($request->items)) {
            $normalizedItems = array_map(function ($item) {
                if (!isset($item['product_name']) && isset($item['name'])) {
                    $item['product_name'] = $item['name'];
                }
                if (!isset($item['weight_used'])) {
                    $item['weight_used'] = isset($item['weight']) ? (float)$item['weight'] : 8.5;
                }
                return $item;
            }, $request->items);
            $request->merge(['items' => $normalizedItems]);
        }

        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'shipping_address' => 'required|string|max:1000',
            'payment_method' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable',
            'items.*.design_code' => 'nullable|string',
            'items.*.product_name' => 'required|string',
            'items.*.metal_purity' => 'nullable|string',
            'items.*.finish' => 'nullable|string',
            'items.*.size' => 'nullable|string',
            'items.*.gem' => 'nullable|string',
            'items.*.chain' => 'nullable|string',
            'items.*.weight_used' => 'nullable|numeric',
            'items.*.quantity' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $gold22ktRate = $this->pricingService->getBaseGoldRatePer10g();
            $pure24ktRate = $this->pricingService->calculatePureGoldRatePerGram($gold22ktRate);
            $silverRate = $this->pricingService->getBaseSilverRatePer10g();

            $goldRateSnapshot = [
                'gold_22kt_per_10g' => $gold22ktRate,
                'gold_24kt_per_g' => round($pure24ktRate, 2),
                'silver_per_10g' => $silverRate,
                'locked_at' => now()->toIso8601String(),
            ];

            $orderNumber = 'PT-' . date('Y') . '-' . strtoupper(Str::random(6));
            $user = $request->user('sanctum') ?? $request->user();
            if (!$user && !empty($request->customer_email)) {
                $user = \App\Models\User::whereRaw('LOWER(TRIM(email)) = ?', [strtolower(trim($request->customer_email))])->first();
            }

            $paymentMethod = $request->payment_method ?? 'cod';
            $paymentStatus = (strtolower($paymentMethod) === 'cod') ? 'pending' : 'paid';

            $order = Order::create([
                'user_id' => $user?->id,
                'order_number' => $orderNumber,
                'customer_name' => $request->customer_name,
                'customer_email' => $user ? $user->email : $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'subtotal' => 0,
                'gst_amount' => 0,
                'total_amount' => 0,
                'status' => 'confirmed',
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'fulfillment_status' => 'unfulfilled',
                'shipping_address' => $request->shipping_address,
                'locked_gold_rate_24kt' => round($pure24ktRate, 2),
                'locked_gold_rate_22kt' => $gold22ktRate,
                'locked_silver_rate' => $silverRate,
                'gold_rate_snapshot' => $goldRateSnapshot,
                'notes' => $request->notes,
                'timeline' => [
                    [
                        'id' => (int) (microtime(true) * 1000),
                        'title' => (strtolower($paymentMethod) === 'cod')
                            ? "Order placed via Cash on Delivery (COD). Payment to be collected upon delivery."
                            : "Order placed and confirmed via " . strtoupper($paymentMethod) . ".",
                        'collapsible' => false,
                        'time' => 'Just now',
                    ]
                ],
            ]);

            $totalSubtotal = 0;
            $totalGst = 0;
            $grandTotal = 0;

            foreach ($request->items as $itemData) {
                $product = !empty($itemData['product_id']) ? Product::find($itemData['product_id']) : null;
                $weight = (float) $itemData['weight_used'];
                $qty = (int) ($itemData['quantity'] ?? 1);
                $purity = $itemData['metal_purity'] ?? '22KT';
                $gem = $itemData['gem'] ?? null;

                // Calculate exact live pricing for this line item
                $priceBreakdown = $this->pricingService->calculatePrice(
                    weightGrams: $weight,
                    purityFraction: str_contains($purity, '18') ? 0.750 : (str_contains($purity, '14') ? 0.585 : 0.916),
                    wastagePercent: (float) ($product?->wastage_percent ?? 0.0),
                    makingChargeFlat: $product?->making_charge,
                    makingChargePercent: $product?->making_charge_percent,
                    stoneCharge: (!empty($gem) && strtolower($gem) !== 'none') ? 45000 : 0.0,
                    metalType: str_contains($purity, 'Silver') ? 'silver' : 'gold'
                );

                $unitPrice = $priceBreakdown['total_price'];
                $lineTotal = round($unitPrice * $qty, 2);

                $totalSubtotal += ($priceBreakdown['subtotal'] * $qty);
                $totalGst += ($priceBreakdown['gst_amount'] * $qty);
                $grandTotal += $lineTotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product?->id,
                    'variant_id' => $itemData['variant_id'] ?? null,
                    'product_name' => $itemData['product_name'],
                    'design_code' => $itemData['design_code'] ?? $product?->design_code,
                    'metal_purity' => $purity,
                    'finish' => $itemData['finish'] ?? null,
                    'size' => $itemData['size'] ?? null,
                    'gem' => $gem,
                    'chain' => $itemData['chain'] ?? null,
                    'weight_used' => $weight,
                    'gold_rate_locked' => $gold22ktRate,
                    'metal_value' => $priceBreakdown['metal_value'],
                    'wastage_value' => $priceBreakdown['wastage_value'],
                    'making_charge' => $priceBreakdown['making_charge'],
                    'stone_charge' => $priceBreakdown['stone_charge'],
                    'gst_amount' => $priceBreakdown['gst_amount'],
                    'price' => $unitPrice,
                    'quantity' => $qty,
                    'total' => $lineTotal,
                    'price_breakdown' => $priceBreakdown,
                ]);
            }

            $order->update([
                'subtotal' => round($totalSubtotal, 2),
                'gst_amount' => round($totalGst, 2),
                'total_amount' => round($grandTotal, 2),
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'success' => true,
                'order_number' => $orderNumber,
                'message' => 'Order created and gold rate snapshot locked successfully.',
                'order' => $order->fresh(['items']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(string $orderNumber, Request $request): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['items.product.primaryImage'])
            ->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        // IDOR Prevention: If a user is logged in, ensure they own the order or have admin privileges
        $user = $request->user();
        if ($user && !$user->isAdmin()) {
            $isOwner = ($order->user_id === $user->id || strtolower($order->customer_email ?? '') === strtolower($user->email ?? ''));
            if (!$isOwner) {
                return response()->json([
                    'status' => 'error',
                    'success' => false,
                    'message' => 'Unauthorized access to this order.',
                ], 403);
            }
        }

        $statusSteps = [

            'confirmed' => ['step' => 1, 'label' => 'Order Confirmed', 'desc' => 'Gold rate locked & invoice generated'],
            'in_production' => ['step' => 2, 'label' => 'In Production', 'desc' => 'Cast, forged & hand-crafted at atelier'],
            'inspection' => ['step' => 3, 'label' => 'Quality Inspection', 'desc' => 'Gemological audit & hallmarking'],
            'shipped' => ['step' => 4, 'label' => 'Armored Transit', 'desc' => 'Dispatched with tamper-proof seal'],
            'delivered' => ['step' => 5, 'label' => 'Delivered', 'desc' => 'Hand-delivered to patron'],
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'order_number' => $order->order_number,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'current_step' => $statusSteps[$order->status]['step'] ?? 1,
                'status_steps' => $statusSteps,
                'created_at' => $order->created_at->toIso8601String(),
                'customer' => [
                    'name' => $order->customer_name,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone,
                    'shipping_address' => $order->shipping_address,
                    'billing_address' => $order->billing_address,
                ],
                'shipping_address' => $order->shipping_address,
                'billing_address' => $order->billing_address,
                'pricing' => [
                    'subtotal' => $order->subtotal,
                    'gst_amount' => $order->gst_amount,
                    'total_amount' => $order->total_amount,
                    'gold_rate_snapshot' => $order->gold_rate_snapshot,
                ],
                'payment_method' => $order->payment_method ?? 'Gpay',
                'payment_status' => $order->payment_status ?? 'paid',
                'payment_id' => $order->razorpay_payment_id ?? $order->payment_id,
                'razorpay_payment_id' => $order->razorpay_payment_id,
                'payment_date' => $order->created_at ? $order->created_at->toIso8601String() : now()->toIso8601String(),
                'items' => $order->items->map(fn($item) => [
                    'product_name' => $item->product_name,
                    'design_code' => $item->design_code,
                    'metal_purity' => $item->metal_purity,
                    'finish' => $item->finish,
                    'size' => $item->size,
                    'gem' => $item->gem,
                    'huid' => $item->huid,
                    'certificate_url' => $item->certificate_url,
                    'certificate_number' => $item->certificate_number,
                    'weight_used' => $item->weight_used,
                    'metal_value' => $item->metal_value,
                    'unit_price' => $item->price,
                    'quantity' => $item->quantity,
                    'total' => $item->total,
                    'ledger_breakdown' => $item->price_breakdown,
                ]),
            ],
        ]);
    }

    public function adminIndex(): JsonResponse
    {
        $orders = Order::with('items')->latest()->get()->map(function ($order) {
            $firstItem = $order->items->first();
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'payment_method' => $order->payment_method ?? 'card',
                'payment_status' => $order->payment_status ?? 'paid',
                'total_amount' => $order->total_amount,
                'item_summary' => $firstItem ? $firstItem->product_name : 'Jewelry Piece',
                'items_count' => $order->items->count(),
                'created_at' => $order->created_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $orders,
        ]);
    }

    public function adminShow(string|int $id): JsonResponse
    {
        $order = Order::where('id', $id)
            ->orWhere('order_number', $id)
            ->with(['items.product.primaryImage', 'user'])
            ->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'payment_status' => $order->payment_status ?? 'paid',
                'payment_method' => $order->payment_method ?? 'card',
                'fulfillment_status' => in_array($order->status, ['shipped', 'delivered']) ? 'fulfilled' : 'unfulfilled',
                'created_at' => $order->created_at?->toIso8601String(),
                'created_at_formatted' => $order->created_at ? $order->created_at->format('F j, Y \a\t g:i a') : 'October 6, 2026 at 8:23 am',
                'customer' => [
                    'name' => $order->customer_name,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone,
                    'orders_count' => 1,
                    'shipping_address' => $order->shipping_address,
                    'billing_address' => $order->shipping_address,
                ],
                'pricing' => [
                    'subtotal' => (float) $order->subtotal,
                    'tax_rate_label' => 'CGST 9%',
                    'gst_amount' => (float) $order->gst_amount,
                    'total_amount' => (float) $order->total_amount,
                    'paid_amount' => (float) $order->total_amount,
                ],
                'notes' => $order->notes,
                'docket_number' => $order->docket_number,
                'courier_partner' => $order->courier_partner ?? 'Sequel 247 Logistics',
                'pickup_token' => $order->pickup_token,
                'estimated_delivery_date' => $order->estimated_delivery_date,
                'logistics_status' => $order->logistics_status,
                'tracking_data' => $order->tracking_data,
                'items' => $order->items->map(fn($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'design_code' => $item->design_code,
                    'metal_purity' => $item->metal_purity,
                    'finish' => $item->finish,
                    'size' => $item->size,
                    'gem' => $item->gem,
                    'huid' => $item->huid,
                    'certificate_url' => $item->certificate_url,
                    'certificate_number' => $item->certificate_number,
                    'certificates' => $item->certificates ?: [],
                    'unit_price' => (float) $item->price,
                    'quantity' => (int) $item->quantity,
                    'total' => (float) $item->total,
                    'image' => $item->product?->primaryImage?->image_url ?? null,
                ]),
                'timeline' => $order->timeline ?? [
                    [
                        'id' => 1,
                        'title' => 'You updated the customer for this order.',
                        'collapsible' => true,
                        'time' => 'Just now',
                    ],
                    [
                        'id' => 2,
                        'title' => "You manually marked ₹" . number_format($order->total_amount, 2) . " INR as paid for this order.",
                        'collapsible' => true,
                        'time' => 'Just now',
                    ],
                    [
                        'id' => 3,
                        'title' => 'Confirmation #' . strtoupper(substr(md5($order->id), 0, 9)) . ' was generated for this order.',
                        'collapsible' => false,
                        'time' => 'Just now',
                    ],
                    [
                        'id' => 4,
                        'title' => 'You created this order from draft order #D1.',
                        'collapsible' => false,
                        'time' => 'Just now',
                    ],
                ],
            ],
        ]);
    }

    public function updateStatus(Request $request, int|string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:confirmed,in_production,inspection,shipped,delivered,cancelled',
        ]);

        $order = Order::where('id', $id)->orWhere('order_number', $id)->firstOrFail();
        $order->status = $request->status;
        if (in_array($request->status, ['shipped', 'delivered'])) {
            $order->fulfillment_status = 'fulfilled';
        }
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => "Order {$order->order_number} status updated to {$order->status}",
            'data' => $order,
        ]);
    }

    public function updateFulfillment(Request $request, int|string $id): JsonResponse
    {
        $request->validate([
            'fulfillment_status' => 'required|string|in:fulfilled,unfulfilled',
        ]);

        $order = Order::where('id', $id)->orWhere('order_number', $id)->firstOrFail();
        $order->fulfillment_status = $request->fulfillment_status;
        if ($request->fulfillment_status === 'fulfilled') {
            $order->status = 'delivered';
        } else {
            $order->status = 'confirmed';
        }

        $currentTimeline = $order->timeline ?? [];
        $actionText = $request->fulfillment_status === 'fulfilled' ? 'You marked 1 item as fulfilled.' : 'You marked this order as unfulfilled.';
        array_unshift($currentTimeline, [
            'id' => (int) (microtime(true) * 1000),
            'title' => $actionText,
            'collapsible' => false,
            'time' => 'Just now',
        ]);
        $order->timeline = $currentTimeline;
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Fulfillment status updated',
            'fulfillment_status' => $order->fulfillment_status,
            'timeline' => $order->timeline,
            'data' => $order,
        ]);
    }

    public function addComment(Request $request, int|string $id): JsonResponse
    {
        $request->validate([
            'comment' => 'required|string|max:2000',
        ]);

        $order = Order::where('id', $id)->orWhere('order_number', $id)->firstOrFail();
        $currentTimeline = $order->timeline ?? [];
        array_unshift($currentTimeline, [
            'id' => (int) (microtime(true) * 1000),
            'title' => $request->comment,
            'author' => 'ZS',
            'collapsible' => false,
            'time' => 'Just now',
        ]);
        $order->timeline = $currentTimeline;
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Comment added to timeline',
            'timeline' => $order->timeline,
        ]);
    }

    public function updateNotes(Request $request, int|string $id): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:5000',
        ]);

        $order = Order::where('id', $id)->orWhere('order_number', $id)->firstOrFail();
        $order->notes = $request->notes ?? '';
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Notes saved successfully',
            'notes' => $order->notes,
        ]);
    }

    public function updateShippingAddress(Request $request, int|string $id): JsonResponse
    {
        $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'shipping_address' => 'required|string|max:2000',
        ]);

        $order = Order::where('id', $id)->orWhere('order_number', $id)->firstOrFail();
        if ($request->filled('customer_name')) {
            $order->customer_name = $request->customer_name;
        }
        if ($request->filled('customer_phone')) {
            $order->customer_phone = $request->customer_phone;
        }
        $order->shipping_address = $request->shipping_address;
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Shipping address updated successfully',
            'data' => [
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'shipping_address' => $order->shipping_address,
            ],
        ]);
    }

    public function userOrders(Request $request): JsonResponse
    {
        $user = $request->user();

        // Strict Sanctum Authorization: Never trust query param emails or client IDs
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'success' => false,
                'message' => 'Unauthenticated. Valid customer token required.',
            ], 401);
        }

        $orders = Order::with('items')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereRaw('LOWER(TRIM(customer_email)) = ?', [strtolower(trim($user->email))]);
            })
            ->latest()
            ->get();

        $formatted = $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'total_amount' => $order->total_amount,
                'created_at' => $order->created_at?->toIso8601String(),
                'items' => $order->items->map(fn($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'design_code' => $item->design_code,
                    'metal_purity' => $item->metal_purity,
                    'finish' => $item->finish,
                    'huid' => $item->huid,
                    'certificate_url' => $item->certificate_url,
                    'certificate_number' => $item->certificate_number,
                    'certificates' => $item->certificates ?: [],
                    'gold_rate_locked' => (float) ($item->gold_rate_locked ?: 0),
                    'weight_used' => (float) ($item->weight_used ?: 0),
                    'price_breakdown' => $item->price_breakdown,
                    'unit_price' => (float) ($item->price ?: 0),
                    'quantity' => (int) ($item->quantity ?: 1),
                    'total' => (float) ($item->total ?: 0),
                ]),
            ];
        });

        return response()->json([
            'status' => 'success',
            'success' => true,
            'data' => $formatted,
        ]);
    }

    public function userCollection(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated',
            ], 401);
        }

        $orders = Order::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereRaw('LOWER(TRIM(customer_email)) = ?', [strtolower(trim($user->email))]);
            })
            ->whereNotIn('status', ['cancelled'])
            ->with(['items.product.primaryImage', 'items.product.images'])
            ->latest()
            ->get();

        $collectionPieces = [];

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $product = $item->product;
                $imageUrl = $product?->primaryImage?->url
                    ?: ($product?->images?->first()?->url
                    ?: ($product?->primaryImage?->image_url
                    ?: ($item->image ?: null)));
                
                $itemCerts = $item->certificates;
                if (!is_array($itemCerts) || empty($itemCerts)) {
                    $itemCerts = [];
                    $certUrl = $item->certificate_url ?: ($product?->certificate_url ?: null);
                    $certNum = $item->certificate_number ?: ($product?->certificate_number ?: null);
                    if (!empty($certUrl) && !str_contains($certUrl, 'sample-certificate.pdf')) {
                        $itemCerts[] = [
                            'id' => 'cert_1',
                            'name' => 'Certificate',
                            'certificate_number' => $certNum ?: 'BIS-CERT',
                            'certificate_url' => $certUrl,
                            'verification_url' => 'https://www.manakonline.in/MANAK/hallmarkHuidVerification',
                        ];
                    }
                } else {
                    $itemCerts = array_values(array_filter($itemCerts, function ($c) {
                        $u = $c['certificate_url'] ?? ($c['url'] ?? '');
                        return !empty($u) && !str_contains($u, 'sample-certificate.pdf');
                    }));
                }

                $itemPrice = (float) ($item->price > 0 ? $item->price : ($item->total > 0 ? $item->total : ($product?->final_price ?: $product?->base_price ?: 0)));
                $itemTotal = (float) ($item->total > 0 ? $item->total : $itemPrice);
                $goldRateLocked = (float) ($item->gold_rate_locked > 0 ? $item->gold_rate_locked : ($order->gold_rate_snapshot['gold_22kt_per_10g'] ?? 0));
                $weightUsed = (float) ($item->weight_used > 0 ? $item->weight_used : ($product?->weight_g ?: 0));

                $collectionPieces[] = [
                    'id' => $item->id,
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'piece_code' => $item->design_code ?: ($product?->design_code ?: 'PD-SD-OR-001'),
                    'name' => $item->product_name ?: ($product?->name ?: 'Pintaara Piece'),
                    'metal_purity' => $item->metal_purity ?: '18KT',
                    'finish' => $item->finish ?: 'Yellow Gold',
                    'gem' => $item->gem,
                    'size' => $item->size,
                    'chain' => $item->chain,
                    'price' => $itemPrice,
                    'total' => $itemTotal,
                    'quantity' => (int) ($item->quantity ?: 1),
                    'gold_rate_locked' => $goldRateLocked,
                    'weight_used' => $weightUsed,
                    'metal_value' => (float) ($item->metal_value ?: 0),
                    'making_charge' => (float) ($item->making_charge ?: 0),
                    'stone_charge' => (float) ($item->stone_charge ?: 0),
                    'gst_amount' => (float) ($item->gst_amount ?: 0),
                    'price_breakdown' => $item->price_breakdown,
                    'acquired_at' => $order->created_at ? $order->created_at->format('d M Y') : now()->format('d M Y'),
                    'payment_date' => $order->created_at ? $order->created_at->format('d F Y') : now()->format('d F Y'),
                    'payment_method' => $order->payment_method ?: 'Gpay',
                    'razorpay_payment_id' => $order->razorpay_payment_id ?: null,
                    'payment_id' => $order->razorpay_payment_id ?: null,
                    'customer_name' => $order->customer_name,
                    'customer_phone' => $order->customer_phone,
                    'customer_email' => $order->customer_email,
                    'shipping_address' => $order->shipping_address,
                    'huid' => $item->huid ?: ($product?->huid ?: null),
                    'gov_portal_url' => 'https://www.manakonline.in/MANAK/hallmarkHuidVerification',
                    'certificate_url' => $item->certificate_url ?: ($product?->certificate_url ?: null),
                    'certificate_number' => $item->certificate_number ?: ($product?->certificate_number ?: null),
                    'certificates' => $itemCerts,
                    'image' => $imageUrl,
                    'status' => $order->status,
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $collectionPieces,
            'count' => count($collectionPieces),
        ]);
    }

    public function updateOrderItemCertificate(Request $request, string|int $orderId, int $itemId): JsonResponse
    {
        $item = OrderItem::find($itemId);
        if (!$item) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order item not found',
            ], 404);
        }

        $validated = $request->validate([
            'huid' => 'nullable|string|max:100',
            'certificate_url' => 'nullable|string|max:1000',
            'certificate_number' => 'nullable|string|max:100',
            'certificates' => 'nullable|array',
        ]);

        $certificates = $request->has('certificates') ? $request->certificates : $item->certificates;
        $firstCertUrl = $request->certificate_url;
        $firstCertNum = $request->certificate_number;
        if (is_array($certificates) && count($certificates) > 0) {
            $firstCert = $certificates[0];
            if (empty($firstCertUrl) && !empty($firstCert['certificate_url'])) {
                $firstCertUrl = $firstCert['certificate_url'];
            }
            if (empty($firstCertNum) && !empty($firstCert['certificate_number'])) {
                $firstCertNum = $firstCert['certificate_number'];
            }
        }

        $item->update([
            'huid' => $request->has('huid') ? $request->huid : $item->huid,
            'certificate_url' => $firstCertUrl !== null ? $firstCertUrl : $item->certificate_url,
            'certificate_number' => $firstCertNum !== null ? $firstCertNum : $item->certificate_number,
            'certificates' => $certificates,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'HUID and certificates updated successfully.',
            'data' => $item,
        ]);
    }

    public function uploadCertificate(Request $request): JsonResponse
    {
        $request->validate([
            'certificate' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:15360',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:15360',
        ]);

        $file = $request->file('certificate') ?? $request->file('file');
        if (!$file) {
            return response()->json([
                'status' => 'error',
                'message' => 'No certificate file provided.',
            ], 422);
        }

        $filename = 'cert_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('certificates', $filename, 'public');

        return response()->json([
            'status' => 'success',
            'url' => '/storage/' . $path,
            'filename' => $filename,
        ]);
    }
}


