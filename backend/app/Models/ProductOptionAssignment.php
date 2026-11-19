<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductOptionAssignment extends Model
{
    use HasFactory;

    protected $table = 'product_option_assignments';

    protected $fillable = [
        'product_id',
        'group_id',
        'display_type',
        'is_required',
        'selected_values',
        'sort_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'selected_values' => 'array',
        'sort_order' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function group()
    {
        return $this->belongsTo(ProductOptionGroup::class, 'group_id');
    }
}
