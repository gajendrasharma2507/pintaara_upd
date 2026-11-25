<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceMovementLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'metal_type',
        'purity',
        'old_rate_per_10g',
        'new_rate_per_10g',
        'old_rate_per_gram',
        'new_rate_per_gram',
        'market_spot_10g',
        'step_gap',
        'direction',
        'difference_10g',
        'reason',
    ];

    protected $casts = [
        'old_rate_per_10g' => 'float',
        'new_rate_per_10g' => 'float',
        'old_rate_per_gram' => 'float',
        'new_rate_per_gram' => 'float',
        'market_spot_10g' => 'float',
        'step_gap' => 'float',
        'difference_10g' => 'float',
    ];
}

