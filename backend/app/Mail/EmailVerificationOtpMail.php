<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $verificationCode;
    public int $expiryMinutes;

    public function __construct(string $verificationCode, int $expiryMinutes = 10)
    {
        $this->verificationCode = $verificationCode;
        $this->expiryMinutes = $expiryMinutes;
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'email_verification_otp',
            ['otp' => $this->verificationCode, 'expires_minutes' => $this->expiryMinutes, 'customer_name' => 'Valued Client'],
            "PINTAARA | Your Verification Code",
            'emails.auth.email_verification_otp'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'email_verification_otp',
            ['otp' => $this->verificationCode, 'expires_minutes' => $this->expiryMinutes, 'customer_name' => 'Valued Client'],
            "PINTAARA | Your Verification Code",
            'emails.auth.email_verification_otp',
            ['verificationCode' => $this->verificationCode, 'expiryMinutes' => $this->expiryMinutes]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
