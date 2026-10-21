<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinishPurity extends Model
{
    use HasFactory;

    protected $table = 'finish_purities';

    protected $fillable = [
        'finish_id',
        'purity_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function finish()
    {
        return $this->belongsTo(Finish::class);
    }

    public function purity()
    {
        return $this->belongsTo(Purity::class);
    }
}
