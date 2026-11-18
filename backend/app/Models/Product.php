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
        'delivery_return',
        'custom_sections',
        'model_3d_url',
        'base_weight_grams',
        'making_charge',
        'making_charge_percent',
        'brand_markup_percent',
        'available_purities',
        'available_finishes',
        'other_charges',
        'wastage_percent',
        'status',
        'designed_by',
        'release_date',
        'is_limited_edition',
        'edition_prefix',
        'edition_limit',
        'edition_current',
        'huid',
        'certificate_url',
        'certificate_number',
        'certificates',
    ];

    protected $casts = [
        'base_weight_grams' => 'float',
        'making_charge' => 'float',
        'making_charge_percent' => 'float',
        'brand_markup_percent' => 'float',
        'available_purities' => 'array',
        'available_finishes' => 'array',
        'other_charges' => 'float',
        'wastage_percent' => 'float',
        'release_date' => 'date:Y-m-d',
        'is_limited_edition' => 'boolean',
        'edition_limit' => 'integer',
        'edition_current' => 'integer',
        'certificates' => 'array',
        'custom_sections' => 'array',
    ];

    protected $appends = [
        'edition_text',
        'is_sold_out',
    ];

    public function getEditionTextAttribute(): string
    {
        $prefix = !empty($this->edition_prefix) ? trim($this->edition_prefix) : 'LIMITED EDITION';
        $curr = $this->edition_current !== null ? (int)$this->edition_current : 1;
        $lim = $this->edition_limit !== null ? (int)$this->edition_limit : 50;
        $currStr = str_pad((string)$curr, 2, '0', STR_PAD_LEFT);
        $limStr = str_pad((string)$lim, 2, '0', STR_PAD_LEFT);
        return "{$prefix} {$currStr}/{$limStr}";
    }

    public function getIsSoldOutAttribute(): bool
    {
        if ($this->is_limited_edition === false) {
            return false;
        }
        $curr = $this->edition_current !== null ? (int)$this->edition_current : 1;
        $lim = $this->edition_limit !== null ? (int)$this->edition_limit : 50;
        return $curr >= $lim;
    }

    public function collectionMaster()
    {
        return $this->belongsTo(CollectionMaster::class, 'collection_master_id');
    }

    public function collection()
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

    public function finishImages(?string $finishKey = null)
    {
        $query = $this->hasMany(ProductImage::class)->orderBy('sort_order', 'asc');
        if ($finishKey) {
            $query->where('finish_key', $finishKey);
        }
        return $query;
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
