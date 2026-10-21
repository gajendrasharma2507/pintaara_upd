<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'full_name',
        'contact',
        'date',
        'time',
        'purpose',
        'notes',
        'status',
    ];
}
