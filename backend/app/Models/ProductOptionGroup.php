<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductOptionGroup extends Model
{
    use HasFactory;

    protected $table = 'product_option_groups';

    protected $fillable = [
        'name',
        'code',
        'display_type',
        'is_required',
        'is_active',
        'sort_order',
        'description',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function values()
    {
        return $this->hasMany(ProductOptionValue::class, 'group_id')->orderBy('sort_order', 'asc');
    }

    public function activeValues()
    {
        return $this->hasMany(ProductOptionValue::class, 'group_id')
            ->where('is_active', true)
            ->orderBy('sort_order', 'asc');
    }

    public function assignments()
    {
        return $this->hasMany(ProductOptionAssignment::class, 'group_id');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_option_assignments', 'group_id', 'product_id')
            ->withPivot(['display_type', 'is_required', 'selected_values', 'sort_order'])
            ->withTimestamps();
    }
}
