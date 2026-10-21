<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Finish extends Model
{
    use HasFactory;

    protected $fillable = [
        'metal_type_id',
        'name',
        'code',
        'hex_color',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function metalType()
    {
        return $this->belongsTo(MetalType::class);
    }

    public function purities()
    {
        return $this->belongsToMany(Purity::class, 'finish_purities')
            ->withPivot('is_active')
            ->wherePivot('is_active', true)
            ->withTimestamps();
    }

    public function allPurities()
    {
        return $this->belongsToMany(Purity::class, 'finish_purities')
            ->withPivot('is_active')
            ->withTimestamps();
    }

    public function finishPurities()
    {
        return $this->hasMany(FinishPurity::class);
    }

    public function productFinishPurities()
    {
        return $this->hasMany(ProductFinishPurity::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
