<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DesignLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'blueprint_image',
        'design_type',
        'status',
        'measurements',
        'gem_details',
        'specs',
        'idea_image',
        'idea_note',
        'cad_image',
        'cad_note',
        'craft_image',
        'craft_note',
        'creation_image',
        'creation_note',
        'inspired_by',
        'release_date',
    ];

    protected $casts = [
        'release_date' => 'date:Y-m-d',
        'measurements' => 'array',
        'gem_details' => 'array',
        'specs' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
