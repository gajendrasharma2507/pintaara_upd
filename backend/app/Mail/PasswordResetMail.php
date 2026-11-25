<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $resetUrl;
    public ?string $resetCode;
    public int $expiryMinutes;

    public function __construct(string $resetUrl, ?string $resetCode = null, int $expiryMinutes = 60)
    {
        $this->resetUrl = $resetUrl;
        $this->resetCode = $resetCode;
        $this->expiryMinutes = $expiryMinutes;
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'password_reset',
            ['action_url' => $this->resetUrl, 'otp' => $this->resetCode ?? '', 'customer_name' => 'Valued Client'],
            "PINTAARA | Reset Your Password",
            'emails.auth.password_reset'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'password_reset',
            ['action_url' => $this->resetUrl, 'otp' => $this->resetCode ?? '', 'customer_name' => 'Valued Client'],
            "PINTAARA | Reset Your Password",
            'emails.auth.password_reset',
            ['resetUrl' => $this->resetUrl, 'resetCode' => $this->resetCode, 'expiryMinutes' => $this->expiryMinutes]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
