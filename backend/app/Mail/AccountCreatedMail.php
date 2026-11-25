<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public ?User $user;
    public ?string $viewAccountUrl;

    public function __construct(?User $user = null, ?string $viewAccountUrl = null)
    {
        $this->user = $user;
        $this->viewAccountUrl = $viewAccountUrl ?: (config('app.frontend_url', 'http://localhost:3000') . '/account');
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'account_created',
            [
                'customer_name' => $this->user?->name ?? 'Valued Client',
                'customer_email' => $this->user?->email ?? '',
                'action_url' => $this->viewAccountUrl,
            ],
            "Welcome to PINTAARA",
            'emails.auth.account_created'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'account_created',
            [
                'customer_name' => $this->user?->name ?? 'Valued Client',
                'customer_email' => $this->user?->email ?? '',
                'action_url' => $this->viewAccountUrl,
            ],
            "Welcome to PINTAARA",
            'emails.auth.account_created',
            [
                'user' => $this->user,
                'viewAccountUrl' => $this->viewAccountUrl,
            ]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
