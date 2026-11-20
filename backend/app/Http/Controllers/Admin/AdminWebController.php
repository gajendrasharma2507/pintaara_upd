<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CollectionMaster;
use App\Models\CustomizationMaster;
use App\Models\DesignLog;
use App\Models\FinishOption;
use App\Models\GemOption;
use App\Models\GoldRate;
use App\Models\MetalPurity;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PriceMovementLog;
use App\Models\Product;
use App\Models\ProductOptionGroup;
use App\Models\ProductOptionValue;
use App\Models\ProductOptionAssignment;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\CustomerNotificationService;
use App\Services\JewelryPricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminWebController extends Controller
{
    protected JewelryPricingService $pricingService;

    public function __construct(JewelryPricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    public function showLogin()
    {
        $adminRoles = ['super_admin', 'admin', 'manager', 'operations', 'production', 'finance', 'logistics'];
        if (Auth::check() && in_array(strtolower(Auth::user()->role ?? ''), $adminRoles)) {
            return redirect()->route('admin.dashboard');
        }
        return view('admin.auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();
            $adminRoles = ['super_admin', 'admin', 'manager', 'operations', 'production', 'finance', 'logistics'];
            if (in_array(strtolower($user->role ?? ''), $adminRoles)) {
                return redirect()->intended(route('admin.dashboard'));
            }
            Auth::logout();
            return back()->withErrors(['email' => 'Access denied: Admin credentials required.']);
        }

        return back()->withErrors(['email' => 'Invalid email or password.']);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('admin.login');
    }

    public function dashboard()
    {
        // 1. Live Gold Rates
        $rates = $this->pricingService->getAllPurityRates();
        $gold24k = $rates['gold_24kt_pure_per_gram'] ?? 7280;
        $gold22k = round(($rates['gold_base_22kt_per_10g'] ?? 66750) / 10, 2);

        // 2. Real Counts
        $totalOrdersCount = Order::count();
        $totalRevenue = (float) Order::sum('total_amount');
        $totalUsersCount = User::count();
        $productsCount = Product::count();
        $collectionsCount = CollectionMaster::count();

        // 3. Real Recent Orders
        $recentOrders = Order::with('items')->latest()->take(6)->get()->map(function ($order) {
            $firstItem = $order->items->first();
            $itemDesc = $firstItem ? $firstItem->product_name : 'Custom Jewelry';
            if ($firstItem && $firstItem->metal_purity) {
                $itemDesc .= ' (' . $firstItem->metal_purity . ')';
            }

            $statusVariant = 'warning';
            if (in_array($order->status, ['delivered', 'paid'])) {
                $statusVariant = 'success';
            } elseif (in_array($order->status, ['shipped', 'inspection'])) {
                $statusVariant = 'info';
            }

            return [
                'id' => $order->order_number ?: ('#PIN-' . $order->id),
                'order_db_id' => $order->id,
                'client' => $order->customer_name ?: 'PINTAARA Patron',
                'email' => $order->customer_email ?: '',
                'product' => $itemDesc,
                'amount' => '₹' . number_format($order->total_amount, 2),
                'status' => $order->status_label ?: ucfirst(str_replace('_', ' ', $order->status)),
                'statusVariant' => $statusVariant,
                'date' => $order->created_at ? $order->created_at->format('d M, h:i A') : 'Today',
            ];
        });

        // 4. Monthly Trend Aggregation (Real database orders)
        $chartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        $monthlySales = array_fill(0, 12, 0);
        $monthlyRevenue = array_fill(0, 12, 0);

        foreach (Order::all() as $o) {
            if ($o->created_at) {
                $monthIndex = (int) $o->created_at->format('n') - 1;
                if ($monthIndex >= 0 && $monthIndex < 12) {
                    $monthlySales[$monthIndex] += 1;
                    $monthlyRevenue[$monthIndex] += round((float) $o->total_amount / 1000, 1);
                }
            }
        }

        // Real Customer Patrons count (excluding administrative accounts)
        $realCustomersCount = User::where('role', 'customer')->count();

        // 5. Real Month-over-Month Comparisons
        $startThisMonth = now()->startOfMonth();
        $endThisMonth = now()->endOfMonth();
        $startLastMonth = now()->subMonth()->startOfMonth();
        $endLastMonth = now()->subMonth()->endOfMonth();

        $thisMonthRevenue = (float) Order::whereBetween('created_at', [$startThisMonth, $endThisMonth])->sum('total_amount');
        $lastMonthRevenue = (float) Order::whereBetween('created_at', [$startLastMonth, $endLastMonth])->sum('total_amount');

        $revGrowthText = 'Real-time';
        $revGrowthPositive = true;
        if ($lastMonthRevenue > 0) {
            $diffPct = round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1);
            $revGrowthText = ($diffPct >= 0 ? '+' : '') . $diffPct . '% ' . ($diffPct >= 0 ? '↑' : '↓');
            $revGrowthPositive = ($diffPct >= 0);
        } elseif ($thisMonthRevenue > 0) {
            $revGrowthText = '100% ↑ launch';
            $revGrowthPositive = true;
        }

        $thisMonthOrders = Order::whereBetween('created_at', [$startThisMonth, $endThisMonth])->count();
        $thisMonthUsers = User::where('role', 'customer')->whereBetween('created_at', [$startThisMonth, $endThisMonth])->count();

        $stats = [
            'total_views' => [
                'title' => 'Catalog Pieces',
                'value' => (string) $productsCount,
                'change' => $collectionsCount . ' collections',
                'is_positive' => true,
            ],
            'total_profit' => [
                'title' => 'Total Revenue',
                'value' => '₹' . number_format($totalRevenue, 2),
                'change' => $revGrowthText,
                'is_positive' => $revGrowthPositive,
            ],
            'total_order' => [
                'title' => 'Total Orders',
                'value' => (string) $totalOrdersCount,
                'change' => '+' . $thisMonthOrders . ' this month',
                'is_positive' => true,
            ],
            'total_orders' => [
                'title' => 'Total Orders',
                'value' => (string) $totalOrdersCount,
                'change' => '+' . $thisMonthOrders . ' this month',
                'is_positive' => true,
            ],
            'total_user' => [
                'title' => 'Total Patrons',
                'value' => (string) $realCustomersCount,
                'change' => '+' . $thisMonthUsers . ' this month',
                'is_positive' => true,
            ],
            'total_users' => [
                'title' => 'Total Patrons',
                'value' => (string) $realCustomersCount,
                'change' => '+' . $thisMonthUsers . ' this month',
                'is_positive' => true,
            ],
        ];

        $salesAmount = '₹' . number_format($totalRevenue, 2);
        $revenueAmount = '₹' . number_format($totalRevenue, 2);

        return view('admin.dashboard', compact(
            'stats',
            'salesAmount',
            'revenueAmount',
            'chartMonths',
            'monthlySales',
            'monthlyRevenue',
            'recentOrders',
            'gold24k',
            'gold22k',
            'productsCount',
            'collectionsCount',
            'totalOrdersCount',
            'totalUsersCount'
        ));
    }

    public function globalSearch(Request $request)
    {
        $q = trim($request->get('q', ''));
        if (strlen($q) < 1) {
            return response()->json([
                'query' => $q,
                'total' => 0,
                'categories' => []
            ]);
        }

        $term = '%' . $q . '%';

        // 1. Jewelry Pieces / Products
        $products = Product::where(function ($sub) use ($term) {
                $sub->where('name', 'like', $term)
                    ->orWhere('design_code', 'like', $term)
                    ->orWhere('huid', 'like', $term)
                    ->orWhere('description', 'like', $term);
            })
            ->latest()
            ->take(5)
            ->get(['id', 'name', 'design_code', 'huid', 'tier', 'status'])
            ->map(function ($p) {
                $meta = [];
                if ($p->design_code) $meta[] = 'Code: ' . $p->design_code;
                if ($p->huid) $meta[] = 'HUID: ' . $p->huid;
                if ($p->tier) $meta[] = $p->tier;
                return [
                    'id' => $p->id,
                    'title' => $p->name,
                    'subtitle' => implode(' • ', $meta) ?: 'Jewelry Piece',
                    'url' => route('admin.products.edit', $p->id),
                    'badge' => $p->tier ?: 'Product',
                    'badge_color' => '#B8860B',
                    'type' => 'product'
                ];
            });

        // 2. Orders & Invoices
        $orders = Order::where(function ($sub) use ($term) {
                $sub->where('order_number', 'like', $term)
                    ->orWhere('customer_name', 'like', $term)
                    ->orWhere('customer_email', 'like', $term)
                    ->orWhere('customer_phone', 'like', $term);
            })
            ->orWhereHas('items', function ($sub) use ($term) {
                $sub->where('huid', 'like', $term)
                    ->orWhere('design_code', 'like', $term)
                    ->orWhere('product_name', 'like', $term);
            })
            ->latest()
            ->take(5)
            ->get(['id', 'order_number', 'customer_name', 'total_amount', 'status', 'created_at'])
            ->map(function ($o) {
                $statusBadge = strtoupper($o->status);
                $badgeColor = match(strtolower($o->status)) {
                    'delivered' => '#10B981',
                    'cancelled' => '#EF4444',
                    'in_production', 'production' => '#F59E0B',
                    'shipped' => '#3B82F6',
                    default => '#6B7280'
                };
                return [
                    'id' => $o->id,
                    'title' => '#' . $o->order_number . ($o->customer_name ? ' — ' . $o->customer_name : ''),
                    'subtitle' => '₹' . number_format($o->total_amount, 2) . ' • ' . $o->created_at->format('d M, Y'),
                    'url' => route('admin.orders.show', $o->id),
                    'badge' => $statusBadge,
                    'badge_color' => $badgeColor,
                    'type' => 'order'
                ];
            });

        // 3. Design Logs & Blueprints
        $designLogs = DesignLog::with('product')
            ->where(function ($sub) use ($term) {
                $sub->where('design_code', 'like', $term)
                    ->orWhere('design_type', 'like', $term)
                    ->orWhere('inspired_by', 'like', $term)
                    ->orWhere('status', 'like', $term)
                    ->orWhereHas('product', function ($pq) use ($term) {
                        $pq->where('name', 'like', $term)
                           ->orWhere('design_code', 'like', $term);
                    });
            })
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($d) {
                $prodName = $d->product ? $d->product->name : ($d->design_code ?: 'Design Piece');
                $meta = [];
                if ($d->design_type) $meta[] = $d->design_type;
                if ($d->inspired_by) $meta[] = 'Inspired by ' . $d->inspired_by;
                if ($d->status) $meta[] = $d->status;
                return [
                    'id' => $d->id,
                    'title' => ($d->design_code ? '[' . $d->design_code . '] ' : '') . $prodName,
                    'subtitle' => implode(' • ', $meta) ?: 'Atelier Documentation',
                    'url' => route('admin.design-logs.show', $d->id),
                    'badge' => $d->status ?: 'Design Log',
                    'badge_color' => '#8B5CF6',
                    'type' => 'design_log'
                ];
            });

        // 4. Clients & Customers
        $customers = User::where(function ($sub) use ($term) {
                $sub->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term);
            })
            ->latest()
            ->take(5)
            ->get(['id', 'name', 'email', 'phone', 'role'])
            ->map(function ($u) {
                $meta = [];
                if ($u->email) $meta[] = $u->email;
                if ($u->phone) $meta[] = $u->phone;
                return [
                    'id' => $u->id,
                    'title' => $u->name ?: 'Customer #' . $u->id,
                    'subtitle' => implode(' • ', $meta) ?: 'Registered Client',
                    'url' => route('admin.customers') . '?search=' . urlencode($u->email ?: $u->name),
                    'badge' => ucfirst($u->role ?: 'Client'),
                    'badge_color' => '#3B82F6',
                    'type' => 'customer'
                ];
            });

        $categories = [];
        if ($products->isNotEmpty()) {
            $categories[] = [
                'name' => 'Jewelry Pieces & Products',
                'type' => 'product',
                'items' => $products
            ];
        }
        if ($orders->isNotEmpty()) {
            $categories[] = [
                'name' => 'Orders & Invoices',
                'type' => 'order',
                'items' => $orders
            ];
        }
        if ($designLogs->isNotEmpty()) {
            $categories[] = [
                'name' => 'Design Logs & Blueprints',
                'type' => 'design_log',
                'items' => $designLogs
            ];
        }
        if ($customers->isNotEmpty()) {
            $categories[] = [
                'name' => 'Clients & Customers',
                'type' => 'customer',
                'items' => $customers
            ];
        }

        return response()->json([
            'query' => $q,
            'total' => $products->count() + $orders->count() + $designLogs->count() + $customers->count(),
            'categories' => $categories
        ]);
    }

    public function orders(Request $request)
    {
        $query = Order::with('items')->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('order_number', 'like', $term)
                  ->orWhere('customer_name', 'like', $term)
                  ->orWhere('customer_email', 'like', $term);
            });
        }

        $orders = $query->paginate(15);
        return view('admin.orders.index', compact('orders'));
    }

    public function orderDetail($id)
    {
        $order = Order::with('items.product')->where('id', $id)->orWhere('order_number', $id)->firstOrFail();
        return view('admin.orders.show', compact('order'));
    }

    public function orderInvoice($id)
    {
        $order = Order::with('items.product')->where('id', $id)->orWhere('order_number', $id)->firstOrFail();
        return view('admin.orders.invoice', compact('order'));
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $order = Order::with('items.product')->findOrFail($id);
        $oldStatus = $order->status;
        $order->status = $request->input('status', $order->status);
        if (in_array($order->status, ['shipped', 'delivered'])) {
            $order->fulfillment_status = 'fulfilled';
        }
        $order->save();

        if ($request->boolean('notify_customer', true) && $oldStatus !== $order->status) {
            match ($order->status) {
                'confirmed' => CustomerNotificationService::sendOrderConfirmation($order),
                'in_production' => CustomerNotificationService::sendManufacturingInitiated($order),
                'shipped' => CustomerNotificationService::sendOrderDispatched($order),
                'delivered' => CustomerNotificationService::sendOrderDelivered($order),
                'cancelled' => CustomerNotificationService::sendOrderCancelled($order),
                default => null,
            };
        }

        return back()->with('success', 'Order status updated successfully' . ($oldStatus !== $order->status ? ' and customer notification dispatched.' : '.'));
    }

    public function sendOrderEmail(Request $request, $id)
    {
        $order = Order::with('items.product')->findOrFail($id);
        $emailType = $request->input('email_type');
        $success = false;
        $label = 'Customer Notification';

        switch ($emailType) {
            case 'confirmation':
                $success = CustomerNotificationService::sendOrderConfirmation($order);
                $label = 'Order Confirmation (A-1)';
                break;
            case 'manufacturing_initiated':
                $success = CustomerNotificationService::sendManufacturingInitiated($order);
                $label = 'Manufacturing Initiated (A-2)';
                break;
            case 'dispatched':
                $courier = $request->input('courier_name') ?: $order->courier_partner;
                $tracking = $request->input('tracking_number') ?: $order->docket_number;
                $est = $request->input('estimated_delivery') ?: $order->estimated_delivery_date;
                $success = CustomerNotificationService::sendOrderDispatched($order, $courier, $tracking, $est);
                $label = 'Order Dispatched (A-3)';
                break;
            case 'delivered':
                $success = CustomerNotificationService::sendOrderDelivered($order);
                $label = 'Order Delivered (A-4)';
                break;
            case 'cancelled':
                $success = CustomerNotificationService::sendOrderCancelled($order);
                $label = 'Order Cancelled (A-5)';
                break;
            case 'refund_processed':
                $amount = $request->input('refund_amount');
                $ref = $request->input('refund_reference');
                $date = $request->input('refund_date');
                $success = CustomerNotificationService::sendRefundProcessed($order, $amount, $ref, $date);
                $label = 'Refund Processed (A-6)';
                break;
            case 'delay_update':
                $reason = $request->input('delay_reason');
                $revised = $request->input('revised_completion_date');
                $success = CustomerNotificationService::sendOrderDelay($order, $reason, $revised);
                $label = 'Manufacturing/Delivery Delay (A-7)';
                break;
            default:
                return back()->with('error', 'Invalid notification email type.');
        }

        return back()->with(
            $success ? 'success' : 'warning',
            $success ? "{$label} email dispatched successfully to {$order->customer_email}." : "Attempted to dispatch {$label}, please check system logs."
        );
    }

    public function previewOrderEmail($id, string $type)
    {
        $order = Order::with('items.product')->findOrFail($id);
        return match ($type) {
            'confirmation' => (new \App\Mail\OrderConfirmationMail($order))->render(),
            'manufacturing_initiated' => (new \App\Mail\ManufacturingInitiatedMail($order))->render(),
            'dispatched' => (new \App\Mail\OrderDispatchedMail($order))->render(),
            'delivered' => (new \App\Mail\OrderDeliveredMail($order))->render(),
            'cancelled' => (new \App\Mail\OrderCancelledMail($order))->render(),
            'refund_processed' => (new \App\Mail\RefundProcessedMail($order))->render(),
            'delay_update' => (new \App\Mail\OrderDelayMail($order, 'We are meticulously hand-setting the diamond accents to ensure perfect symmetry.'))->render(),
            default => abort(404, 'Email template not found.'),
        };
    }

    public function products(Request $request)
    {
        $query = Product::with(['collection', 'images', 'variants'])->latest();

        if ($request->filled('collection') && $request->collection !== 'all') {
            $query->where('collection_master_id', $request->collection);
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                  ->orWhere('design_code', 'like', $term);
            });
        }

        $products = $query->paginate(20);
        $collections = CollectionMaster::orderBy('sort_order')->get();
        $rates = $this->pricingService->getAllPurityRates();

        return view('admin.products.index', compact('products', 'collections', 'rates'));
    }

    public function createProduct()
    {
        $collections = CollectionMaster::orderBy('sort_order')->get();
        $purities = MetalPurity::orderBy('sort_order')->get();
        $finishes = FinishOption::orderBy('sort_order')->get();
        $optionGroups = ProductOptionGroup::with(['values' => function ($q) {
            $q->orderBy('sort_order', 'asc');
        }])->orderBy('sort_order', 'asc')->get();
        $rates = $this->pricingService->getAllPurityRates();
        $gstPercent = (float) Setting::get('gst_percent', 3.0);
        return view('admin.products.create', compact('collections', 'purities', 'finishes', 'optionGroups', 'rates', 'gstPercent'));
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'design_code' => 'required|string|max:100|unique:products,design_code',
            'collection_master_id' => 'required|exists:collections_master,id',
            'base_weight_grams' => 'required|numeric|min:0.001',
            'making_charge_percent' => 'nullable|numeric|min:0',
            'brand_markup_percent' => 'nullable|numeric|min:0',
            'available_purities' => 'nullable|array',
            'available_purities.*' => 'nullable|string',
            'available_finishes' => 'nullable|array',
            'available_finishes.*' => 'nullable|string',
            'other_charges' => 'nullable|numeric|min:0',
            'silver_weight_grams' => 'nullable|numeric|min:0',
            'silver_making_charge_percent' => 'nullable|numeric|min:0',
            'silver_brand_markup_percent' => 'nullable|numeric|min:0',
            'silver_other_charges' => 'nullable|numeric|min:0',
            'making_charge' => 'nullable|numeric|min:0',
            'wastage_percent' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'delivery_return' => 'nullable|string',
            'custom_sections' => 'nullable',
            'tier' => 'nullable|string',
            'is_limited_edition' => 'nullable',
            'edition_prefix' => 'nullable|string|max:100',
            'edition_limit' => 'nullable|integer|min:1',
            'edition_current' => 'nullable|integer|min:0',
            'finish_images_json' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
            'primary_image' => 'nullable|string',
        ]);

        $validated['is_limited_edition'] = $request->boolean('is_limited_edition', true);
        $rawSections = $request->input('custom_sections_json') ?: $request->input('custom_sections');
        $cleanedSections = $this->cleanCustomSections($rawSections);
        $validated['custom_sections'] = $cleanedSections;
        $foundDesc = null;
        $foundDeliv = null;
        foreach ($cleanedSections as $sec) {
            $t = strtolower(trim($sec['title'] ?? ''));
            if ($t === 'description' && $foundDesc === null) {
                $foundDesc = $sec['content'] ?? '';
            }
            if ((str_contains($t, 'delivery') || str_contains($t, 'return')) && $foundDeliv === null) {
                $foundDeliv = $sec['content'] ?? '';
            }
        }
        if ($foundDesc !== null) {
            $validated['description'] = $foundDesc;
        } elseif (!empty($cleanedSections)) {
            $validated['description'] = $cleanedSections[0]['content'] ?? '';
        }
        if ($foundDeliv !== null) {
            $validated['delivery_return'] = $foundDeliv;
        }
        $product = Product::create($validated);

        $this->syncFinishImages($product, $request);
        $this->syncProductOptionsAndVariants($product, $request);

        return redirect()->route('admin.products')->with('success', 'Product created successfully.');
    }

    public function editProduct($id)
    {
        $product = Product::with([
            'collection', 
            'images', 
            'designLog', 
            'optionAssignments.group.values',
            'variants.optionValues'
        ])->findOrFail($id);
        $collections = CollectionMaster::orderBy('sort_order')->get();
        $purities = MetalPurity::orderBy('sort_order')->get();
        $finishes = FinishOption::orderBy('sort_order')->get();
        $optionGroups = ProductOptionGroup::with(['values' => function ($q) {
            $q->orderBy('sort_order', 'asc');
        }])->orderBy('sort_order', 'asc')->get();
        $rates = $this->pricingService->getAllPurityRates();
        $gstPercent = (float) Setting::get('gst_percent', 3.0);
        return view('admin.products.edit', compact('product', 'collections', 'purities', 'finishes', 'optionGroups', 'rates', 'gstPercent'));
    }

    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'collection_master_id' => 'required|exists:collections_master,id',
            'base_weight_grams' => 'required|numeric|min:0.001',
            'making_charge_percent' => 'nullable|numeric|min:0',
            'brand_markup_percent' => 'nullable|numeric|min:0',
            'available_purities' => 'nullable|array',
            'available_purities.*' => 'nullable|string',
            'available_finishes' => 'nullable|array',
            'available_finishes.*' => 'nullable|string',
            'other_charges' => 'nullable|numeric|min:0',
            'silver_weight_grams' => 'nullable|numeric|min:0',
            'silver_making_charge_percent' => 'nullable|numeric|min:0',
            'silver_brand_markup_percent' => 'nullable|numeric|min:0',
            'silver_other_charges' => 'nullable|numeric|min:0',
            'making_charge' => 'nullable|numeric|min:0',
            'wastage_percent' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'delivery_return' => 'nullable|string',
            'custom_sections' => 'nullable',
            'tier' => 'nullable|string',
            'status' => 'nullable|string',
            'is_limited_edition' => 'nullable',
            'edition_prefix' => 'nullable|string|max:100',
            'edition_limit' => 'nullable|integer|min:1',
            'edition_current' => 'nullable|integer|min:0',
            'finish_images_json' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
            'primary_image' => 'nullable|string',
        ]);

        $validated['is_limited_edition'] = $request->boolean('is_limited_edition');
        $rawSections = $request->input('custom_sections_json') ?: $request->input('custom_sections');
        $cleanedSections = $this->cleanCustomSections($rawSections);
        $validated['custom_sections'] = $cleanedSections;
        $foundDesc = null;
        $foundDeliv = null;
        foreach ($cleanedSections as $sec) {
            $t = strtolower(trim($sec['title'] ?? ''));
            if ($t === 'description' && $foundDesc === null) {
                $foundDesc = $sec['content'] ?? '';
            }
            if ((str_contains($t, 'delivery') || str_contains($t, 'return')) && $foundDeliv === null) {
                $foundDeliv = $sec['content'] ?? '';
            }
        }
        if ($foundDesc !== null) {
            $validated['description'] = $foundDesc;
        } elseif (!empty($cleanedSections)) {
            $validated['description'] = $cleanedSections[0]['content'] ?? '';
        }
        if ($foundDeliv !== null) {
            $validated['delivery_return'] = $foundDeliv;
        }
        $product->update($validated);

        $this->syncFinishImages($product, $request);
        $this->syncProductOptionsAndVariants($product, $request);

        return redirect()->route('admin.products')->with('success', 'Product updated successfully.');
    }

    private function cleanCustomSections($rawSections): array
    {
        if (is_string($rawSections)) {
            $decoded = json_decode($rawSections, true);
            if (is_array($decoded)) {
                $rawSections = $decoded;
            }
        }
        $cleaned = [];
        if (is_array($rawSections)) {
            foreach ($rawSections as $sec) {
                if (!is_array($sec)) continue;
                $t = trim($sec['title'] ?? '');
                $c = trim($sec['content'] ?? '');
                if ($t !== '' || $c !== '') {
                    $cleaned[] = [
                        'title' => $t,
                        'content' => $c,
                    ];
                }
            }
        }
        return $cleaned;
    }

    private function syncFinishImages(Product $product, Request $request): void
    {
        $hasFinishJson = $request->filled('finish_images_json');
        $hasFinishImagesArray = $request->has('finish_images') && is_array($request->input('finish_images'));
        $hasLegacyImages = $request->has('images') || $request->hasFile('image_files') || $request->hasFile('image_file') || $request->filled('image_url');

        if (!$hasFinishJson && !$hasFinishImagesArray && !$hasLegacyImages) {
            return;
        }

        $items = [];

        // 1. If JSON payload is submitted
        if ($hasFinishJson) {
            $decoded = json_decode($request->input('finish_images_json'), true);
            if (is_array($decoded)) {
                foreach ($decoded as $item) {
                    if (is_array($item) && !empty($item['url'])) {
                        $fKey = !empty($item['finish_key']) && $item['finish_key'] !== 'default' ? trim($item['finish_key']) : 'YG';
                        $items[] = [
                            'url' => trim($item['url']),
                            'finish_key' => $fKey,
                            'is_primary' => !empty($item['is_primary']),
                            'sort_order' => isset($item['sort_order']) ? (int)$item['sort_order'] : count($items) + 1,
                        ];
                    }
                }
            }
        }

        // 2. If finish_images array is submitted e.g. finish_images[YG][] = url
        if (empty($items) && $hasFinishImagesArray) {
            $finishArrays = $request->input('finish_images');
            $primaryUrl = $request->input('primary_image');
            foreach ($finishArrays as $finishKey => $urls) {
                if (is_array($urls)) {
                    $fKey = $finishKey && $finishKey !== 'default' ? $finishKey : 'YG';
                    foreach (array_values(array_filter($urls)) as $idx => $url) {
                        $items[] = [
                            'url' => trim($url),
                            'finish_key' => $fKey,
                            'is_primary' => ($url === $primaryUrl),
                            'sort_order' => $idx + 1,
                        ];
                    }
                }
            }
        }

        // 3. Fallback to legacy single array / direct files if items is still empty
        if (empty($items) && $hasLegacyImages) {
            $legacyUrls = $request->input('images', []);
            if (!is_array($legacyUrls)) {
                $legacyUrls = $legacyUrls ? [$legacyUrls] : [];
            }
            if ($request->hasFile('image_files')) {
                foreach ($request->file('image_files') as $file) {
                    if ($file && $file->isValid()) {
                        $legacyUrls[] = $this->saveUploadedFile($file, 'product');
                    }
                }
            } elseif ($request->hasFile('image_file')) {
                $legacyUrls[] = $this->saveUploadedFile($request->file('image_file'), 'product');
            } elseif ($request->filled('image_url')) {
                $legacyUrls[] = $request->image_url;
            }

            $legacyUrls = array_values(array_filter($legacyUrls));
            $primaryUrl = $request->input('primary_image', $legacyUrls[0] ?? null);

            foreach ($legacyUrls as $idx => $url) {
                $items[] = [
                    'url' => trim($url),
                    'finish_key' => 'YG',
                    'is_primary' => ($url === $primaryUrl || ($idx === 0 && !$primaryUrl)),
                    'sort_order' => $idx + 1,
                ];
            }
        }

        // Build finish ID lookup
        $finishKeyToId = [
            'YG' => 1,
            'yellow_gold' => 1,
            'WG' => 2,
            'white_gold' => 2,
            'RG' => 3,
            'rose_gold' => 3,
            'BLK' => 4,
            'BG' => 4,
            'black_gold' => 4,
            'black_ruthenium' => 4,
        ];

        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('finish_options')) {
                $dbFinishes = \App\Models\FinishOption::all();
                foreach ($dbFinishes as $f) {
                    $slug = strtolower(str_replace(' ', '_', $f->name));
                    $finishKeyToId[$slug] = $f->id;
                    if (str_contains($slug, 'yellow')) $finishKeyToId['YG'] = $f->id;
                    if (str_contains($slug, 'white')) $finishKeyToId['WG'] = $f->id;
                    if (str_contains($slug, 'rose')) $finishKeyToId['RG'] = $f->id;
                    if (str_contains($slug, 'black')) {
                        $finishKeyToId['BLK'] = $f->id;
                        $finishKeyToId['BG'] = $f->id;
                    }
                }
            }
        } catch (\Throwable $e) {
            // Ignore if table lookup fails
        }

        // Delete existing images and re-insert
        if (!empty($items)) {
            $product->images()->delete();

            $hasAnyPrimary = false;
            foreach ($items as $idx => $item) {
                $fKey = !empty($item['finish_key']) && $item['finish_key'] !== 'default' ? $item['finish_key'] : 'YG';
                $fId = $finishKeyToId[$fKey] ?? 1;
                $isPrim = !empty($item['is_primary']);
                if ($isPrim) {
                    $hasAnyPrimary = true;
                }

                $product->images()->create([
                    'url' => $item['url'],
                    'finish_key' => $fKey,
                    'finish_id' => $fId,
                    'is_primary' => $isPrim,
                    'sort_order' => $item['sort_order'] ?? ($idx + 1),
                ]);
            }

            // Ensure at least one image has is_primary = true
            if (!$hasAnyPrimary && $product->images()->count() > 0) {
                $first = $product->images()->first();
                $first->update(['is_primary' => true]);
            }
        }
    }

    private function syncProductOptionsAndVariants(Product $product, Request $request): void
    {
        // 1. Sync Option Group Assignments
        $rawAssignments = $request->input('option_assignments_json') ?: $request->input('option_assignments');
        if ($rawAssignments) {
            $assignments = is_string($rawAssignments) ? json_decode($rawAssignments, true) : $rawAssignments;
            if (is_array($assignments)) {
                ProductOptionAssignment::where('product_id', $product->id)->delete();
                foreach ($assignments as $idx => $item) {
                    if (empty($item['group_id'])) continue;
                    ProductOptionAssignment::create([
                        'product_id' => $product->id,
                        'group_id' => $item['group_id'],
                        'display_type' => $item['display_type'] ?? null,
                        'is_required' => !empty($item['is_required']),
                        'selected_values' => !empty($item['selected_values']) ? (array)$item['selected_values'] : null,
                        'value_prices' => !empty($item['value_prices']) ? (array)$item['value_prices'] : null,
                        'sort_order' => (int)($item['sort_order'] ?? ($idx + 1)),
                    ]);
                }
            }
        }

        // 2. Sync Variants Matrix
        $rawVariants = $request->input('variants_matrix_json') ?: $request->input('variants');
        if ($rawVariants) {
            $variants = is_string($rawVariants) ? json_decode($rawVariants, true) : $rawVariants;
            if (is_array($variants)) {
                $existingIds = [];
                foreach ($variants as $v) {
                    $variantId = $v['id'] ?? null;
                    $sku = !empty($v['sku']) ? trim($v['sku']) : ($product->design_code . '-' . strtoupper(substr(md5(uniqid()), 0, 6)));
                    $priceOverride = (isset($v['price_override']) && $v['price_override'] !== '') ? (float)$v['price_override'] : null;
                    $stockQty = isset($v['stock_qty']) ? (int)$v['stock_qty'] : 10;
                    $enabled = isset($v['enabled']) ? (bool)$v['enabled'] : true;
                    $combination = $v['combination'] ?? null;
                    $variantImg = $v['variant_image'] ?? null;

                    $variant = null;
                    if ($variantId) {
                        $variant = ProductVariant::where('product_id', $product->id)->find($variantId);
                    }
                    if (!$variant) {
                        $variant = new ProductVariant();
                        $variant->product_id = $product->id;
                    }

                    $variant->sku = $sku;
                    $variant->price_override = $priceOverride;
                    $variant->price = $priceOverride ?? 0;
                    $variant->stock_qty = $stockQty;
                    $variant->stock = $stockQty;
                    $variant->enabled = $enabled;
                    $variant->status = $enabled ? 'active' : 'inactive';
                    $variant->variant_image = $variantImg;
                    $variant->option_combination = $combination;
                    $variant->save();

                    $existingIds[] = $variant->id;

                    // Link option value IDs to pivot
                    if (!empty($v['option_value_ids']) && is_array($v['option_value_ids'])) {
                        $variant->optionValues()->sync($v['option_value_ids']);
                    }
                }

                // If variants were submitted, clean up variants not in matrix
                if (!empty($existingIds)) {
                    ProductVariant::where('product_id', $product->id)
                        ->whereNotIn('id', $existingIds)
                        ->delete();
                }
            }
        }
    }

    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return redirect()->route('admin.products')->with('success', 'Product deleted successfully.');
    }

    public function collections()
    {
        $collections = CollectionMaster::withCount('products')->orderBy('sort_order')->get();
        return view('admin.collections.index', compact('collections'));
    }

    public function storeCollection(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:100|unique:collections_master,slug',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $this->saveUploadedFile($request->file('image_file'), 'collection');
        }

        CollectionMaster::create($validated);
        return back()->with('success', 'Collection created successfully.');
    }

    public function updateCollection(Request $request, $id)
    {
        $col = CollectionMaster::findOrFail($id);
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:100',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'status' => 'nullable|string',
        ]);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $this->saveUploadedFile($request->file('image_file'), 'collection');
        }

        $col->update(array_filter($validated, fn($v) => !is_null($v)));
        return back()->with('success', 'Collection updated successfully.');
    }

    public function deleteCollection($id)
    {
        $col = CollectionMaster::findOrFail($id);
        $col->delete();
        return back()->with('success', 'Collection deleted successfully.');
    }

    public function customers(Request $request)
    {
        $query = User::withCount('orders')->latest();
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                  ->orWhere('email', 'like', $term)
                  ->orWhere('phone', 'like', $term);
            });
        }
        $customers = $query->paginate(20);
        return view('admin.customers.index', compact('customers'));
    }

    public function goldRates()
    {
        $liveData = $this->pricingService->fetchAaravLiveRates(true);
        $rates = $this->pricingService->getAllPurityRates();
        $history = GoldRate::latest('effective_date')->latest('id')->take(10)->get();
        $movementLogs = PriceMovementLog::latest('id')->take(25)->get();

        $settings = [
            'gold_step_gap'       => (float) Setting::get('gold_step_gap', 5000),
            'silver_step_gap'     => (float) Setting::get('silver_step_gap', 50),
            'gold_extra_offset'   => (float) Setting::get('gold_rate_extra_offset', 0),
            'silver_extra_offset' => (float) Setting::get('silver_rate_extra_offset', 0),
            'gold_min_floor'      => (float) Setting::get('gold_rate_min_floor', 0),
            'silver_min_floor'    => (float) Setting::get('silver_rate_min_floor', 0),
        ];

        return view('admin.gold-rates.index', compact('rates', 'history', 'liveData', 'settings', 'movementLogs'));
    }

    public function liveGoldRatesFeed(Request $request)
    {
        $force = $request->boolean('realtime', true);
        $liveData = $this->pricingService->fetchAaravLiveRates($force);
        $rates = $this->pricingService->getAllPurityRates();

        $settings = [
            'gold_step_gap'       => (float) Setting::get('gold_step_gap', 5000),
            'silver_step_gap'     => (float) Setting::get('silver_step_gap', 50),
            'gold_extra_offset'   => (float) Setting::get('gold_rate_extra_offset', 0),
            'silver_extra_offset' => (float) Setting::get('silver_rate_extra_offset', 0),
            'gold_min_floor'      => (float) Setting::get('gold_rate_min_floor', 0),
            'silver_min_floor'    => (float) Setting::get('silver_rate_min_floor', 0),
        ];

        // Track live step transitions (Up / Down)
        $currentStepped24k = (float) ($rates['gold_24kt_pure_per_10g'] ?? 0);
        $prevStepped24k = (float) \Illuminate\Support\Facades\Cache::get('tracked_stepped_gold_24k', $currentStepped24k);
        $rawSpot24k = (float) ($liveData['gold_24kt_per_10g'] ?? 0);
        $goldGap = (float) ($settings['gold_step_gap'] ?? 0);

        if ($currentStepped24k > 0 && $prevStepped24k > 0 && abs($currentStepped24k - $prevStepped24k) >= 1) {
            $dir = ($currentStepped24k > $prevStepped24k) ? 'up' : 'down';
            $diff = $currentStepped24k - $prevStepped24k;
            $verb = $dir === 'up' ? 'stepped UP' : 'stepped DOWN';
            PriceMovementLog::create([
                'metal_type' => 'gold',
                'purity' => '24KT Gold',
                'old_rate_per_10g' => $prevStepped24k,
                'new_rate_per_10g' => $currentStepped24k,
                'old_rate_per_gram' => round($prevStepped24k / 10, 2),
                'new_rate_per_gram' => round($currentStepped24k / 10, 2),
                'market_spot_10g' => $rawSpot24k,
                'step_gap' => $goldGap,
                'direction' => $dir,
                'difference_10g' => $diff,
                'reason' => "Aarav live tick {$verb} across ₹" . number_format($goldGap) . " bracket",
            ]);
            \Illuminate\Support\Facades\Cache::forever('tracked_stepped_gold_24k', $currentStepped24k);
        } elseif (!\Illuminate\Support\Facades\Cache::has('tracked_stepped_gold_24k')) {
            \Illuminate\Support\Facades\Cache::forever('tracked_stepped_gold_24k', $currentStepped24k);
        }

        $movementLogs = PriceMovementLog::latest('id')->take(25)->get();

        return response()->json([
            'status' => 'success',
            'connected' => $liveData !== null,
            'feed' => 'aarav-bullion',
            'rates' => $rates,
            'liveData' => $liveData,
            'settings' => $settings,
            'movementLogs' => $movementLogs,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function updateGoldRates(Request $request)
    {
        $oldGap = (float) Setting::get('gold_step_gap', 5000);
        $ratesBefore = $this->pricingService->getAllPurityRates();

        if ($request->has('gold_step_gap')) {
            Setting::set('gold_step_gap', max(0, (float) $request->gold_step_gap), 'number', 'Locks gold store prices into step slabs');
        }
        if ($request->has('silver_step_gap')) {
            Setting::set('silver_step_gap', max(0, (float) $request->silver_step_gap), 'number', 'Locks silver store prices into step slabs');
        }
        if ($request->has('gold_extra_offset')) {
            Setting::set('gold_rate_extra_offset', (float) $request->gold_extra_offset, 'number', 'Extra offset added to gold rate');
        }
        if ($request->has('silver_extra_offset')) {
            Setting::set('silver_rate_extra_offset', (float) $request->silver_rate_extra_offset, 'number', 'Extra offset added to silver rate');
        }
        if ($request->has('gold_min_floor')) {
            Setting::set('gold_rate_min_floor', (float) $request->gold_min_floor, 'number', 'Minimum floor for gold rate');
        }
        if ($request->has('silver_min_floor')) {
            Setting::set('silver_rate_min_floor', (float) $request->silver_min_floor, 'number', 'Minimum floor for silver rate');
        }

        // Check if new step gap caused a rate step transition
        $newGap = (float) Setting::get('gold_step_gap', 5000);
        $ratesAfter = $this->pricingService->getAllPurityRates();
        $old24k = (float) ($ratesBefore['gold_24kt_pure_per_10g'] ?? 0);
        $new24k = (float) ($ratesAfter['gold_24kt_pure_per_10g'] ?? 0);

        if ($oldGap !== $newGap || $old24k !== $new24k) {
            $dir = ($new24k > $old24k) ? 'up' : ($new24k < $old24k ? 'down' : 'initial');
            $diff = $new24k - $old24k;
            $live = $this->pricingService->fetchAaravLiveRates(false);
            PriceMovementLog::create([
                'metal_type' => 'gold',
                'purity' => '24KT Gold',
                'old_rate_per_10g' => $old24k,
                'new_rate_per_10g' => $new24k,
                'old_rate_per_gram' => round($old24k / 10, 2),
                'new_rate_per_gram' => round($new24k / 10, 2),
                'market_spot_10g' => (float) ($live['gold_24kt_per_10g'] ?? 0),
                'step_gap' => $newGap,
                'direction' => $dir,
                'difference_10g' => $diff,
                'reason' => "Gold Step Gap adjusted to ₹" . number_format($newGap) . " (Rate moved from ₹" . number_format($old24k) . " to ₹" . number_format($new24k) . ")",
            ]);
            \Illuminate\Support\Facades\Cache::forever('tracked_stepped_gold_24k', $new24k);
        }

        if ($request->filled('gold_22k_per_10g')) {
            $goldPurity = MetalPurity::where('name', '22KT')->first();
            if ($goldPurity) {
                GoldRate::create([
                    'metal_type' => 'gold',
                    'rate_per_10g' => (float) $request->gold_22k_per_10g,
                    'base_purity_id' => $goldPurity->id,
                    'effective_date' => now()->toDateString(),
                    'source' => 'manual',
                    'created_by' => Auth::id() ?: 1,
                ]);
            }
        }

        if ($request->filled('silver_per_10g')) {
            $silverPurity = MetalPurity::where('type', 'silver')->first();
            GoldRate::create([
                'metal_type' => 'silver',
                'rate_per_10g' => (float) $request->silver_per_10g,
                'base_purity_id' => $silverPurity ? $silverPurity->id : null,
                'effective_date' => now()->toDateString(),
                'source' => 'manual',
                'created_by' => Auth::id() ?: 1,
            ]);
        }

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Pricing rules & step brackets updated successfully.',
            ]);
        }

        return back()->with('success', 'Pricing rules & step brackets updated successfully.');
    }

    public function masters()
    {
        $purities = MetalPurity::orderBy('sort_order')->get();
        $finishes = FinishOption::orderBy('sort_order')->get();
        $gems = GemOption::orderBy('sort_order')->get();
        return view('admin.masters.index', compact('purities', 'finishes', 'gems'));
    }

    public function settings()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return view('admin.settings.index', compact('settings'));
    }

    public function updateSettings(Request $request)
    {
        $passwordKeys = ['mail_password', 'razorpay_key_secret', 'razorpay_webhook_secret'];
        foreach ($request->except('_token') as $key => $val) {
            if (in_array($key, $passwordKeys) && ($val === null || $val === '')) {
                continue;
            }
            Setting::set($key, $val);
        }
        return back()->with('success', 'Global settings saved successfully.');
    }

    public function designLogs(Request $request)
    {
        $query = DesignLog::with(['product.collection'])->latest();
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->whereHas('product', function ($q) use ($term) {
                $q->where('name', 'like', $term)->orWhere('design_code', 'like', $term);
            })->orWhere('design_type', 'like', $term)
              ->orWhere('inspired_by', 'like', $term);
        }
        $logs = $query->paginate(12);
        return view('admin.design-logs.index', compact('logs'));
    }

    public function createDesignLog()
    {
        $products = Product::orderBy('name')->get();
        return view('admin.design-logs.create', compact('products'));
    }

    public function storeDesignLog(Request $request)
    {
        $validated = $request->validate([
            'design_code' => 'required|string|max:100',
            'product_id' => 'nullable|exists:products,id|unique:design_logs,product_id',
            'blueprint_image' => 'nullable|string',
            'design_type' => 'nullable|string',
            'material_options' => 'nullable|string',
            'finish_options' => 'nullable|string',
            'size_options' => 'nullable|string',
            'gem_options' => 'nullable|string',
            'inspired_by' => 'nullable|string',
            'inspired_by_label' => 'nullable|string|max:100',
            'designed_by' => 'nullable|string',
            'status' => 'nullable|string',
            'collection' => 'nullable|string',
            'release' => 'nullable|string',
            'release_date' => 'nullable|date',
            'idea_image' => 'nullable|string',
            'idea_note' => 'nullable|string',
            'cad_image' => 'nullable|string',
            'cad_note' => 'nullable|string',
            'craft_image' => 'nullable|string',
            'craft_note' => 'nullable|string',
            'creation_image' => 'nullable|string',
            'creation_note' => 'nullable|string',
        ]);

        if ($request->hasFile('blueprint_file')) {
            $validated['blueprint_image'] = $this->saveUploadedFile($request->file('blueprint_file'), 'blueprint');
        }
        if ($request->hasFile('idea_file')) {
            $validated['idea_image'] = $this->saveUploadedFile($request->file('idea_file'), 'idea');
        }
        if ($request->hasFile('cad_file')) {
            $validated['cad_image'] = $this->saveUploadedFile($request->file('cad_file'), 'cad');
        }
        if ($request->hasFile('craft_file')) {
            $validated['craft_image'] = $this->saveUploadedFile($request->file('craft_file'), 'craft');
        }
        if ($request->hasFile('creation_file')) {
            $validated['creation_image'] = $this->saveUploadedFile($request->file('creation_file'), 'creation');
        }

        $specs = [
            'design_code' => $validated['design_code'],
            'type' => $request->input('design_type', 'BESPOKE DESIGN'),
            'material_options' => $request->input('material_options', '24KT Solid Gold, 22KT Solid Gold, 18KT Solid Gold'),
            'finish_options' => $request->input('finish_options', 'Yellow Gold, Rose Gold, White Gold'),
            'size_options' => $request->input('size_options', '10, 12, 14, 16'),
            'gem_options' => $request->input('gem_options', 'Natural Diamond (VVS-VS), Zambian Emerald, Ceylon Blue Sapphire, Burmese Ruby, No Stone / Solid Gold'),
            'inspired_by' => $request->input('inspired_by', 'Dewdrop physics and morning horizon light'),
            'inspired_by_label' => $request->input('inspired_by_label', 'INSPIRED BY') ?: 'INSPIRED BY',
            'designed_by' => $request->input('designed_by', 'DARSHIT SONI'),
            'brand_origin' => 'A PINTAARA™ ORIGINAL',
            'status' => $request->input('status', 'UNDER DEVELOPMENT'),
            'collection' => $request->input('collection', 'SIGNATURE'),
            'release' => $request->input('release', 'OCTOBER 2026'),
        ];

        $log = DesignLog::create([
            'design_code' => $validated['design_code'],
            'product_id' => ($validated['product_id'] ?? null) ?: null,
            'blueprint_image' => ($validated['blueprint_image'] ?? null) ?: '/images/design-log/RG-SG-OR-002.JPG',
            'design_type' => $specs['type'],
            'status' => $specs['status'],
            'inspired_by' => $specs['inspired_by'],
            'release_date' => ($validated['release_date'] ?? null) ?: now()->toDateString(),
            'specs' => $specs,
            'idea_image' => $validated['idea_image'] ?? null,
            'idea_note' => $validated['idea_note'] ?? null,
            'cad_image' => $validated['cad_image'] ?? null,
            'cad_note' => $validated['cad_note'] ?? null,
            'craft_image' => $validated['craft_image'] ?? null,
            'craft_note' => $validated['craft_note'] ?? null,
            'creation_image' => $validated['creation_image'] ?? null,
            'creation_note' => $validated['creation_note'] ?? null,
        ]);

        return redirect()->route('admin.design-logs')->with('success', 'Design specification created successfully.');
    }

    public function showDesignLog($id)
    {
        return redirect()->route('admin.design-logs.edit', $id);
    }

    public function editDesignLog($id)
    {
        $log = DesignLog::with(['product'])->findOrFail($id);
        $products = Product::orderBy('name')->get();
        return view('admin.design-logs.edit', compact('log', 'products'));
    }

    public function updateDesignLog(Request $request, $id)
    {
        $log = DesignLog::findOrFail($id);
        $validated = $request->validate([
            'design_code' => 'required|string|max:100',
            'product_id' => 'nullable|exists:products,id|unique:design_logs,product_id,' . $id,
            'blueprint_image' => 'nullable|string',
            'design_type' => 'nullable|string',
            'material_options' => 'nullable|string',
            'finish_options' => 'nullable|string',
            'size_options' => 'nullable|string',
            'gem_options' => 'nullable|string',
            'inspired_by' => 'nullable|string',
            'inspired_by_label' => 'nullable|string|max:100',
            'designed_by' => 'nullable|string',
            'status' => 'nullable|string',
            'collection' => 'nullable|string',
            'release' => 'nullable|string',
            'release_date' => 'nullable|date',
            'idea_image' => 'nullable|string',
            'idea_note' => 'nullable|string',
            'cad_image' => 'nullable|string',
            'cad_note' => 'nullable|string',
            'craft_image' => 'nullable|string',
            'craft_note' => 'nullable|string',
            'creation_image' => 'nullable|string',
            'creation_note' => 'nullable|string',
        ]);

        if ($request->hasFile('blueprint_file')) {
            $validated['blueprint_image'] = $this->saveUploadedFile($request->file('blueprint_file'), 'blueprint');
        }
        if ($request->hasFile('idea_file')) {
            $validated['idea_image'] = $this->saveUploadedFile($request->file('idea_file'), 'idea');
        }
        if ($request->hasFile('cad_file')) {
            $validated['cad_image'] = $this->saveUploadedFile($request->file('cad_file'), 'cad');
        }
        if ($request->hasFile('craft_file')) {
            $validated['craft_image'] = $this->saveUploadedFile($request->file('craft_file'), 'craft');
        }
        if ($request->hasFile('creation_file')) {
            $validated['creation_image'] = $this->saveUploadedFile($request->file('creation_file'), 'creation');
        }

        $specs = [
            'design_code' => $validated['design_code'],
            'type' => $request->input('design_type', $log->design_type ?: 'BESPOKE DESIGN'),
            'material_options' => $request->input('material_options', $log->specs['material_options'] ?? '24KT Solid Gold, 22KT Solid Gold, 18KT Solid Gold'),
            'finish_options' => $request->input('finish_options', $log->specs['finish_options'] ?? 'Yellow Gold, Rose Gold, White Gold'),
            'size_options' => $request->input('size_options', $log->specs['size_options'] ?? '10, 12, 14, 16'),
            'gem_options' => $request->input('gem_options', $log->specs['gem_options'] ?? 'Natural Diamond (VVS-VS), Zambian Emerald, Ceylon Blue Sapphire, Burmese Ruby, No Stone / Solid Gold'),
            'inspired_by' => $request->input('inspired_by', $log->inspired_by ?: 'Dewdrop physics and morning horizon light'),
            'inspired_by_label' => $request->input('inspired_by_label', $log->specs['inspired_by_label'] ?? 'INSPIRED BY') ?: 'INSPIRED BY',
            'designed_by' => $request->input('designed_by', $log->specs['designed_by'] ?? 'DARSHIT SONI'),
            'brand_origin' => $request->input('brand_origin', 'A PINTAARA™ ORIGINAL'),
            'status' => $request->input('status', $log->status ?: 'UNDER DEVELOPMENT'),
            'collection' => $request->input('collection', $log->specs['collection'] ?? 'SIGNATURE'),
            'release' => $request->input('release', $log->specs['release'] ?? 'OCTOBER 2026'),
        ];

        $log->update([
            'design_code' => $validated['design_code'],
            'product_id' => ($validated['product_id'] ?? null) ?: null,
            'blueprint_image' => ($validated['blueprint_image'] ?? null) ?: $log->blueprint_image,
            'design_type' => $specs['type'],
            'status' => $specs['status'],
            'inspired_by' => $specs['inspired_by'],
            'release_date' => ($validated['release_date'] ?? null) ?: ($log->release_date ?: now()->toDateString()),
            'specs' => $specs,
            'idea_image' => $validated['idea_image'] ?? $log->idea_image,
            'idea_note' => $validated['idea_note'] ?? $log->idea_note,
            'cad_image' => $validated['cad_image'] ?? $log->cad_image,
            'cad_note' => $validated['cad_note'] ?? $log->cad_note,
            'craft_image' => $validated['craft_image'] ?? $log->craft_image,
            'craft_note' => $validated['craft_note'] ?? $log->craft_note,
            'creation_image' => $validated['creation_image'] ?? $log->creation_image,
            'creation_note' => $validated['creation_note'] ?? $log->creation_note,
        ]);

        return redirect()->route('admin.design-logs')->with('success', 'Design specification updated successfully.');
    }

    public function deleteDesignLog($id)
    {
        $log = DesignLog::findOrFail($id);
        $log->delete();
        return redirect()->route('admin.design-logs')->with('success', 'Design specification deleted successfully.');
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|file|image|mimes:jpeg,png,jpg,webp,svg,gif|max:20480',
        ]);

        $prefix = $request->input('folder', 'upload');
        $url = $this->saveUploadedFile($request->file('image'), $prefix);

        return response()->json([
            'status' => 'success',
            'url' => $url,
            'name' => $request->file('image')->getClientOriginalName(),
        ]);
    }

    private function saveUploadedFile($file, $prefix = 'upload')
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = uniqid('atelier_' . $prefix . '_') . '.' . $extension;

        // Ensure target directory exists in active public directory (supports both public_html and public)
        $publicDir = is_dir(base_path('public_html')) ? base_path('public_html') : public_path();
        $destPath = $publicDir . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'uploads';
        if (!file_exists($destPath)) {
            @mkdir($destPath, 0777, true);
        }

        $file->move($destPath, $filename);
        @chmod($destPath . DIRECTORY_SEPARATOR . $filename, 0666);

        $url = '/images/uploads/' . $filename;

        // Also mirror to base_path('public/images/uploads') if public exists and is different from publicDir
        $altDir = base_path('public' . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'uploads');
        if ($altDir !== $destPath && is_dir(base_path('public'))) {
            if (!file_exists($altDir)) {
                @mkdir($altDir, 0777, true);
            }
            @copy($destPath . DIRECTORY_SEPARATOR . $filename, $altDir . DIRECTORY_SEPARATOR . $filename);
            @chmod($altDir . DIRECTORY_SEPARATOR . $filename, 0666);
        }

        // Mirror to root public/images/uploads for Next.js if root folder exists (e.g. in local monorepo)
        $rootDest = base_path('../public/images/uploads');
        if (file_exists(base_path('../public/images'))) {
            if (!file_exists($rootDest)) {
                @mkdir($rootDest, 0777, true);
            }
            @copy($destPath . DIRECTORY_SEPARATOR . $filename, $rootDest . DIRECTORY_SEPARATOR . $filename);
            @chmod($rootDest . DIRECTORY_SEPARATOR . $filename, 0666);
        }

        return $url;
    }
}

