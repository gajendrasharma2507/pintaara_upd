<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductFinishPurity extends Model
{
    use HasFactory;

    protected $table = 'product_finish_purities';

    protected $fillable = [
        'product_id',
        'finish_id',
        'purity_id',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function finish()
    {
        return $this->belongsTo(Finish::class);
    }

    public function purity()
    {
        return $this->belongsTo(Purity::class);
    }
}
