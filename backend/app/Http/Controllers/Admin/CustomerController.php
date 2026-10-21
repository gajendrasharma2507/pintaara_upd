<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        // Group unique customers by email from orders and users
        $orders = Order::select('customer_name', 'customer_email', 'customer_phone', 'total_amount', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        $customers = [];
        foreach ($orders as $order) {
            $email = $order->customer_email ?? 'guest@pintaara.com';
            if (!isset($customers[$email])) {
                $customers[$email] = [
                    'name' => $order->customer_name ?? 'VIP Client',
                    'email' => $email,
                    'phone' => $order->customer_phone ?? '—',
                    'orders_count' => 0,
                    'total_spent' => 0,
                    'last_order_at' => $order->created_at,
                ];
            }
            $customers[$email]['orders_count']++;
            $customers[$email]['total_spent'] += $order->total_amount;
        }

        return view('admin.customers.index', compact('customers'));
    }
}
