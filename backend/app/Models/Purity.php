<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purity extends Model
{
    use HasFactory;

    protected $fillable = [
        'metal_type_id',
        'name',
        'code',
        'purity_fraction',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'purity_fraction' => 'float',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function metalType()
    {
        return $this->belongsTo(MetalType::class);
    }

    public function finishes()
    {
        return $this->belongsToMany(Finish::class, 'finish_purities')
            ->withPivot('is_active')
            ->withTimestamps();
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function productFinishPurities()
    {
        return $this->hasMany(ProductFinishPurity::class);
    }
}
