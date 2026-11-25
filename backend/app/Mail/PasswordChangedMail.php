<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public ?User $user;
    public ?string $secureAccountUrl;

    public function __construct(?User $user = null, ?string $secureAccountUrl = null)
    {
        $this->user = $user;
        $this->secureAccountUrl = $secureAccountUrl ?: (config('app.frontend_url', 'http://localhost:3000') . '/account');
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'password_changed',
            ['customer_name' => $this->user?->name ?? 'Valued Client', 'customer_email' => $this->user?->email ?? '', 'action_url' => $this->secureAccountUrl],
            "PINTAARA | Password Updated",
            'emails.auth.password_changed'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'password_changed',
            ['customer_name' => $this->user?->name ?? 'Valued Client', 'customer_email' => $this->user?->email ?? '', 'action_url' => $this->secureAccountUrl],
            "PINTAARA | Password Updated",
            'emails.auth.password_changed',
            ['user' => $this->user, 'secureAccountUrl' => $this->secureAccountUrl]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
