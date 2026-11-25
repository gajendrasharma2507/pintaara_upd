<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'user_id',
        'full_name',
        'contact',
        'email',
        'date',
        'time',
        'booking_url',
        'purpose',
        'notes',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Resolve the best available email address for this booking.
     */
    public function resolveCustomerEmail(): ?string
    {
        if (!empty($this->email) && filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            return $this->email;
        }
        if ($this->user && !empty($this->user->email)) {
            return $this->user->email;
        }
        if (!empty($this->contact) && filter_var($this->contact, FILTER_VALIDATE_EMAIL)) {
            return $this->contact;
        }
        if (!empty($this->contact)) {
            $user = User::where('phone', $this->contact)->first();
            if ($user && !empty($user->email)) {
                return $user->email;
            }
        }
        return null;
    }
}
