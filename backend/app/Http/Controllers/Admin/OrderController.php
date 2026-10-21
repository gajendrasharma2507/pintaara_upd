<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['items.product.primaryImage', 'user']);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('order_number', 'LIKE', "%{$s}%")
                  ->orWhere('customer_name', 'LIKE', "%{$s}%")
                  ->orWhere('customer_email', 'LIKE', "%{$s}%")
                  ->orWhere('customer_phone', 'LIKE', "%{$s}%");
            });
        }

        $orders = $query->latest()->paginate(15);
        $counts = [
            'all' => Order::count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'in_production' => Order::where('status', 'in_production')->count(),
            'inspection' => Order::where('status', 'inspection')->count(),
            'shipped' => Order::where('status', 'shipped')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
        ];

        return view('admin.orders.index', compact('orders', 'counts'));
    }

    public function show($id)
    {
        $order = Order::with(['items.product.primaryImage', 'items.variant', 'user'])->findOrFail($id);
        
        $statusSteps = [
            'confirmed' => ['label' => 'Order Confirmed', 'desc' => 'Payment secured & gold rate locked'],
            'in_production' => ['label' => 'In Production', 'desc' => 'Cast, forged & hallmarked at atelier'],
            'inspection' => ['label' => 'Quality Inspection', 'desc' => 'Gemological audit & finish testing'],
            'shipped' => ['label' => 'Armored Transit', 'desc' => 'Dispatched via insured courier'],
            'delivered' => ['label' => 'Client Delivered', 'desc' => 'Received & signed by client'],
        ];

        $currentStepIndex = array_search($order->status, array_keys($statusSteps));
        if ($currentStepIndex === false) {
            $currentStepIndex = -1;
        }

        return view('admin.orders.show', compact('order', 'statusSteps', 'currentStepIndex'));
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $request->validate([
            'status' => 'required|in:confirmed,in_production,inspection,shipped,delivered,cancelled',
            'notes' => 'nullable|string',
        ]);

        $order->update([
            'status' => $request->status,
            'notes' => $request->filled('notes') ? $request->notes : $order->notes,
        ]);

        return redirect()->back()->with('success', "Order #{$order->order_number} status transitioned to '" . ucfirst(str_replace('_', ' ', $request->status)) . "'.");
    }
}
