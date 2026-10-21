<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomizationMasterValue extends Model
{
    use HasFactory;

    protected $table = 'customization_master_values';

    protected $fillable = [
        'master_id',
        'value',
        'code',
        'image',
        'price_delta',
        'hex_color',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'price_delta' => 'float',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function master()
    {
        return $this->belongsTo(CustomizationMaster::class, 'master_id');
    }
}
