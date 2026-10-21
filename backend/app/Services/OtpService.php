<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    /**
     * Send an OTP for a given purpose.
     */
    public static function sendOtp(string $email, string $purpose = 'registration', array $metadata = []): array
    {
        $cleanEmail = strtolower(trim($email));

        // Check if recent active OTP exists within cooldown period (60 seconds)
        $recent = EmailOtp::where('email', $cleanEmail)
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->where('resend_available_at', '>', now())
            ->first();

        if ($recent) {
            $secondsRemaining = now()->diffInSeconds($recent->resend_available_at, false);
            if ($secondsRemaining > 0) {
                return [
                    'success' => false,
                    'message' => "Please wait {$secondsRemaining} seconds before requesting a new code.",
                    'cooldown_seconds' => $secondsRemaining,
                ];
            }
        }

        $plainOtp = EmailOtp::generateFor($cleanEmail, $purpose, $metadata);

        // Attempt sending via Laravel Mailer
        try {
            Mail::raw(
                "PINTAARA Fine Jewelry Atelier\n\nYour 6-digit verification code is: {$plainOtp}\n\nThis code will expire in 10 minutes.\nFor your security, never share this code with anyone.",
                function ($message) use ($cleanEmail, $purpose) {
                    $message->to($cleanEmail)
                        ->subject("PINTAARA — Your Verification Code [" . strtoupper(str_replace('_', ' ', $purpose)) . "]");
                }
            );
        } catch (\Throwable $e) {
            Log::warning("Could not dispatch email via SMTP (logged instead): " . $e->getMessage());
        }

        Log::info("PINTAARA OTP dispatched for {$cleanEmail} [Purpose: {$purpose}]: {$plainOtp}");

        AuditLog::log('otp_generated', 'EmailOtp', null, null, [
            'email' => $cleanEmail,
            'purpose' => $purpose,
        ]);

        return [
            'success' => true,
            'message' => 'A 6-digit verification code has been dispatched to your email.',
            'email' => $cleanEmail,
            'expires_in_minutes' => 10,
            'cooldown_seconds' => 60,
            // Provide for seamless developer testing if in local environment
            'dev_otp' => config('app.debug') ? $plainOtp : null,
        ];
    }

    /**
     * Verify an OTP.
     */
    public static function verifyOtp(string $email, string $otp, string $purpose = 'registration'): array
    {
        $result = EmailOtp::verify($email, $otp, $purpose);

        if ($result['valid']) {
            AuditLog::log('otp_verified_successfully', 'EmailOtp', null, null, [
                'email' => strtolower(trim($email)),
                'purpose' => $purpose,
            ]);
        } else {
            AuditLog::log('otp_verification_failed', 'EmailOtp', null, null, [
                'email' => strtolower(trim($email)),
                'purpose' => $purpose,
                'reason' => $result['message'],
            ]);
        }

        return $result;
    }
}
