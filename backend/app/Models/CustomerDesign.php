<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerDesign extends Model
{
    protected $table = 'customer_designs';

    protected $fillable = [
        'user_id',
        'title',
        'notes',
        'metal_preference',
        'gem_preference',
        'media_path',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
