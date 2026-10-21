<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'variant_id',
        'product_name',
        'design_code',
        'metal_purity',
        'finish',
        'size',
        'gem',
        'chain',
        'weight_used',
        'gold_rate_locked',
        'metal_value',
        'wastage_value',
        'making_charge',
        'stone_charge',
        'gst_amount',
        'price',
        'quantity',
        'total',
        'price_breakdown',
        'huid',
        'certificate_url',
        'certificate_number',
        'certificates',
    ];

    protected $casts = [
        'weight_used' => 'float',
        'gold_rate_locked' => 'float',
        'metal_value' => 'float',
        'wastage_value' => 'float',
        'making_charge' => 'float',
        'stone_charge' => 'float',
        'gst_amount' => 'float',
        'price' => 'float',
        'quantity' => 'integer',
        'total' => 'float',
        'price_breakdown' => 'array',
        'certificates' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
