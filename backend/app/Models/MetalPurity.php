<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetalPurity extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'purity_fraction',
        'type',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'purity_fraction' => 'float',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function goldRates()
    {
        return $this->hasMany(GoldRate::class, 'base_purity_id');
    }
}
