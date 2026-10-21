<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Order;
use App\Models\OrderItem;

$order = Order::updateOrCreate(
    ['order_number' => '1001'],
    [
        'customer_name' => 'No name provided',
        'customer_email' => null,
        'customer_phone' => null,
        'subtotal' => 500.00,
        'gst_amount' => 45.00,
        'total_amount' => 545.00,
        'status' => 'confirmed',
        'fulfillment_status' => 'unfulfilled',
        'payment_method' => 'card',
        'payment_status' => 'paid',
        'shipping_address' => 'No shipping address provided',
        'notes' => '',
        'timeline' => [
            ['id' => 1, 'title' => 'You updated the customer for this order.', 'collapsible' => true, 'time' => 'Just now'],
            ['id' => 2, 'title' => 'You manually marked ₹545.00 INR as paid for this order.', 'collapsible' => true, 'time' => 'Just now'],
            ['id' => 3, 'title' => 'Confirmation #0WGTD051J was generated for this order.', 'collapsible' => false, 'time' => 'Just now'],
            ['id' => 4, 'title' => 'You created this order from draft order #D1.', 'collapsible' => false, 'time' => 'Just now'],
        ],
    ]
);

// Remove existing items if any and re-create demo item
OrderItem::where('order_id', $order->id)->delete();

OrderItem::create([
    'order_id' => $order->id,
    'product_id' => null,
    'product_name' => 'demo',
    'design_code' => 'DEMO-01',
    'metal_purity' => '18KT',
    'finish' => 'Yellow Gold',
    'weight_used' => 1.0,
    'gold_rate_locked' => 500.0,
    'metal_value' => 500.0,
    'price' => 500.00,
    'quantity' => 1,
    'total' => 500.00,
]);

echo "Order 1001 inserted successfully with ID: " . $order->id . "\n";
