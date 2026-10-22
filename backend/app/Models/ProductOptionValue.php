<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductOptionValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_option_id',
        'value',
        'image',
        'price_delta',
        'sort_order',
    ];

    protected $casts = [
        'price_delta' => 'float',
        'sort_order' => 'integer',
    ];

    public function option()
    {
        return $this->belongsTo(ProductOption::class, 'product_option_id');
    }

    public function variants()
    {
        return $this->belongsToMany(ProductVariant::class, 'product_variant_option_values', 'product_option_value_id', 'variant_id');
    }
}
