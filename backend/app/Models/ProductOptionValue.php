<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductOptionValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'product_option_id',
        'value',
        'code',
        'color_code',
        'image',
        'price_delta',
        'sku',
        'stock_qty',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price_delta' => 'float',
        'stock_qty' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function group()
    {
        return $this->belongsTo(ProductOptionGroup::class, 'group_id');
    }

    public function option()
    {
        return $this->belongsTo(ProductOption::class, 'product_option_id');
    }

    public function variants()
    {
        return $this->belongsToMany(ProductVariant::class, 'product_variant_option_values', 'product_option_value_id', 'variant_id');
    }
}
