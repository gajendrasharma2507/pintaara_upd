<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinishOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'hex_color',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];
}
