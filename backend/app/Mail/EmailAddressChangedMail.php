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
        return new Envelope(
            subject: "PINTAARA | Email Address Updated",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.auth.email_address_changed',
            with: [
                'newEmailAddress' => $this->newEmailAddress,
                'user' => $this->user,
                'contactSupportUrl' => $this->contactSupportUrl,
                'emailSubject' => "PINTAARA | Email Address Updated",
            ],
        );
    }
}
