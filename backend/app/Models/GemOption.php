<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GemOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'stone_type',
        'carat',
        'default_stone_charge',
        'sort_order',
    ];

    protected $casts = [
        'carat' => 'float',
        'default_stone_charge' => 'float',
        'sort_order' => 'integer',
    ];
}
