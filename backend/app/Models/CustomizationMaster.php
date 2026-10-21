<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomizationMaster extends Model
{
    use HasFactory;

    protected $table = 'customization_masters';

    protected $fillable = [
        'name',
        'code',
        'description',
        'icon',
        'input_type',
        'is_required',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function values()
    {
        return $this->hasMany(CustomizationMasterValue::class, 'master_id')->orderBy('sort_order', 'asc');
    }
}
