<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'design_code',
        'name',
        'tier',
        'collection_master_id',
        'description',
        'model_3d_url',
        'base_weight_grams',
        'making_charge',
        'making_charge_percent',
        'wastage_percent',
        'status',
        'designed_by',
        'release_date',
        'huid',
        'certificate_url',
        'certificate_number',
        'certificates',
    ];

    protected $casts = [
        'base_weight_grams' => 'float',
        'making_charge' => 'float',
        'making_charge_percent' => 'float',
        'wastage_percent' => 'float',
        'release_date' => 'date:Y-m-d',
        'certificates' => 'array',
    ];

    public function collectionMaster()
    {
        return $this->belongsTo(CollectionMaster::class, 'collection_master_id');
    }

    public function options()
    {
        return $this->hasMany(ProductOption::class)->orderBy('sort_order', 'asc');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order', 'asc');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function designLog()
    {
        return $this->hasOne(DesignLog::class);
    }

    public function productFinishPurities()
    {
        return $this->hasMany(ProductFinishPurity::class);
    }
}
