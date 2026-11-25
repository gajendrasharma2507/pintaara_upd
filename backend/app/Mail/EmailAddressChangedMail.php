<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailAddressChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $newEmailAddress;
    public ?User $user;
    public ?string $contactSupportUrl;

    public function __construct(string $newEmailAddress, ?User $user = null, ?string $contactSupportUrl = null)
    {
        $this->newEmailAddress = $newEmailAddress;
        $this->user = $user;
        $this->contactSupportUrl = $contactSupportUrl ?: ('mailto:' . config('mail.from.address', 'info@pintaara.com'));
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'email_address_changed',
            ['customer_name' => $this->user?->name ?? 'Valued Client', 'customer_email' => $this->newEmailAddress],
            "PINTAARA | Email Address Updated",
            'emails.auth.email_address_changed'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'email_address_changed',
            ['customer_name' => $this->user?->name ?? 'Valued Client', 'customer_email' => $this->newEmailAddress],
            "PINTAARA | Email Address Updated",
            'emails.auth.email_address_changed',
            ['newEmailAddress' => $this->newEmailAddress, 'user' => $this->user, 'contactSupportUrl' => $this->contactSupportUrl]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
