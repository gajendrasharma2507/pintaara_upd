<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoldRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'metal_type',
        'rate_per_10g',
        'base_purity_id',
        'effective_date',
        'source',
        'created_by',
    ];

    protected $casts = [
        'rate_per_10g' => 'float',
        'effective_date' => 'date:Y-m-d',
    ];

    public function basePurity()
    {
        return $this->belongsTo(MetalPurity::class, 'base_purity_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
