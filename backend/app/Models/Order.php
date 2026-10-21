<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'subtotal',
        'gst_amount',
        'total_amount',
        'status',
        'payment_method',
        'payment_status',
        'shipping_address',
        'gold_rate_snapshot',
        'notes',
        'fulfillment_status',
        'timeline',
        'docket_number',
        'courier_partner',
        'pickup_token',
        'estimated_delivery_date',
        'logistics_status',
        'tracking_data',
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'gst_amount' => 'float',
        'total_amount' => 'float',
        'gold_rate_snapshot' => 'array',
        'timeline' => 'array',
        'tracking_data' => 'array',
    ];

    public static $statuses = [
        'confirmed' => 'Confirmed',
        'in_production' => 'In Production',
        'inspection' => 'Quality Inspection',
        'shipped' => 'Shipped',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getStatusLabelAttribute()
    {
        return self::$statuses[$this->status] ?? ucfirst(str_replace('_', ' ', $this->status));
    }
}
