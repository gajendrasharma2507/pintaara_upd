<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollectionMaster extends Model
{
    use HasFactory;

    protected $table = 'collections_master';

    protected $fillable = [
        'name',
        'slug',
        'image',
        'description',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'collection_master_id');
    }

    public function getImageAttribute($value)
    {
        if (!$value) {
            return null;
        }
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, 'data:') || str_starts_with($value, 'blob:')) {
            return $value;
        }
        if (str_starts_with($value, '/storage/')) {
            return url($value);
        }
        if (str_starts_with($value, 'storage/')) {
            return url('/' . $value);
        }
        return $value;
    }
}
