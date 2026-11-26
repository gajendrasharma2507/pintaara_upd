<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    public const DEFAULT_MEETING_URL = 'https://meet.google.com/mvy-qjxc-ojh';

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
        'reminder_1h_sent_at',
        'reminder_15m_sent_at',
    ];

    protected $casts = [
        'reminder_1h_sent_at' => 'datetime',
        'reminder_15m_sent_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getMeetingUrl(): string
    {
        $url = trim((string) ($this->booking_url ?? ''));
        return $url !== '' ? $url : self::DEFAULT_MEETING_URL;
    }

    /**
     * Parse appointment date + time in Asia/Kolkata timezone.
     */
    public function parseScheduledAt(): ?Carbon
    {
        $rawDate = trim((string) ($this->date ?? ''));
        $rawTime = trim((string) ($this->time ?? ''));
        if ($rawDate === '' || $rawTime === '') {
            return null;
        }

        // Normalize yyyy/mm/dd -> yyyy-mm-dd
        $normDate = str_replace('/', '-', $rawDate);

        // If time is a range like "10:30 AM - 11:30 AM", take start time
        if (str_contains($rawTime, '-')) {
            $parts = explode('-', $rawTime);
            $rawTime = trim($parts[0]);
        }

        try {
            return Carbon::parse($normDate . ' ' . $rawTime, 'Asia/Kolkata');
        } catch (\Throwable $e) {
            return null;
        }
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
