<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'finish_key',
        'finish_id',
        'url',
        'sort_order',
        'is_primary',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_primary' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getUrlAttribute($value)
    {
        if (empty($value)) return $value;
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, 'data:')) {
            return $value;
        }
        if (str_starts_with($value, '/images/uploads/') || str_starts_with($value, '/storage/')) {
            $base = config('app.url', 'https://admin.pintaara.com');
            return rtrim($base, '/') . '/' . ltrim($value, '/');
        }
        return $value;
    }
}
