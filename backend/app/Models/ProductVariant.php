<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'metal_type_id',
        'finish_id',
        'purity_id',
        'size_id',
        'stone_id',
        'sku',
        'weight',
        'price',
        'stock',
        'status',
        'weight_override_grams',
        'stock_qty',
        'enabled',
    ];

    protected $casts = [
        'weight' => 'float',
        'price' => 'float',
        'stock' => 'integer',
        'weight_override_grams' => 'float',
        'stock_qty' => 'integer',
        'enabled' => 'boolean',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function metalType()
    {
        return $this->belongsTo(MetalType::class);
    }

    public function finish()
    {
        return $this->belongsTo(Finish::class);
    }

    public function purity()
    {
        return $this->belongsTo(Purity::class);
    }

    public function size()
    {
        return $this->belongsTo(Size::class);
    }

    public function stone()
    {
        return $this->belongsTo(Stone::class);
    }

    // Legacy option values pivot relation (for backward compatibility)
    public function optionValues()
    {
        return $this->belongsToMany(ProductOptionValue::class, 'product_variant_option_values', 'variant_id', 'product_option_value_id')->with('option');
    }

    // Accessors / Mutators to ensure weight and stock stay synchronized with legacy fields if referenced
    public function getWeightAttribute($value)
    {
        return $value !== null && (float)$value > 0 ? (float)$value : (float)($this->attributes['weight_override_grams'] ?? 0);
    }

    public function getStockAttribute($value)
    {
        return $value !== null ? (int)$value : (int)($this->attributes['stock_qty'] ?? 0);
    }
}
