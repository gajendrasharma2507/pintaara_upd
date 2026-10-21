<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'price_delta',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price_delta' => 'float',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
