<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class EmailOtp extends Model
{
    protected $table = 'email_otps';

    protected $fillable = [
        'email',
        'otp_hash',
        'purpose',
        'metadata',
        'attempts',
        'resend_available_at',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'expires_at' => 'datetime',
        'resend_available_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    /**
     * Generate a cryptographically secure 6-digit OTP and store hashed.
     */
    public static function generateFor(string $email, string $purpose = 'registration', array $metadata = []): string
    {
        // Invalidate any active unused OTPs for this email and purpose
        static::where('email', $email)
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->delete();

        // 6-digit cryptographically secure random number
        $plainOtp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $otpHash = Hash::make($plainOtp);

        static::create([
            'email' => strtolower(trim($email)),
            'otp_hash' => $otpHash,
            'purpose' => $purpose,
            'metadata' => $metadata,
            'attempts' => 0,
            'resend_available_at' => now()->addSeconds(60),
            'expires_at' => now()->addMinutes(10),
        ]);

        return $plainOtp;
    }

    /**
     * Verify provided OTP.
     */
    public static function verify(string $email, string $otp, string $purpose = 'registration'): array
    {
        $record = static::where('email', strtolower(trim($email)))
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->orderBy('id', 'desc')
            ->first();

        if (!$record) {
            return ['valid' => false, 'message' => 'No active OTP verification found. Please request a new code.'];
        }

        if (now()->isAfter($record->expires_at)) {
            $record->delete();
            return ['valid' => false, 'message' => 'Verification code has expired. Please request a new code.'];
        }

        if ($record->attempts >= 5) {
            $record->delete();
            return ['valid' => false, 'message' => 'Maximum verification attempts exceeded. Please request a new code.'];
        }

        if (!Hash::check($otp, $record->otp_hash)) {
            $record->increment('attempts');
            $remaining = 5 - $record->attempts;
            return [
                'valid' => false,
                'message' => "Invalid verification code. {$remaining} attempts remaining.",
            ];
        }

        // Mark as used
        $record->update(['used_at' => now()]);

        return [
            'valid' => true,
            'metadata' => $record->metadata,
            'record' => $record,
        ];
    }
}
