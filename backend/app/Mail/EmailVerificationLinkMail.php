<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $verificationUrl;
    public int $expiryMinutes;

    public function __construct(string $verificationUrl, int $expiryMinutes = 60)
    {
        $this->verificationUrl = $verificationUrl;
        $this->expiryMinutes = $expiryMinutes;
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'email_verification_link',
            ['action_url' => $this->verificationUrl, 'expires_minutes' => $this->expiryMinutes, 'customer_name' => 'Valued Client'],
            "PINTAARA | Email Verification",
            'emails.auth.email_verification_link'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'email_verification_link',
            ['action_url' => $this->verificationUrl, 'expires_minutes' => $this->expiryMinutes, 'customer_name' => 'Valued Client'],
            "PINTAARA | Email Verification",
            'emails.auth.email_verification_link',
            ['verificationUrl' => $this->verificationUrl, 'expiryMinutes' => $this->expiryMinutes]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
