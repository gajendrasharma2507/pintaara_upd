<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountDeletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $email;
    public string $name;

    public function __construct(string $email, string $name = 'Client')
    {
        $this->email = $email;
        $this->name = $name;
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'account_deleted',
            ['customer_name' => $this->name, 'customer_email' => $this->email],
            "PINTAARA | Account Deletion Confirmed",
            'emails.auth.account_deleted'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'account_deleted',
            ['customer_name' => $this->name, 'customer_email' => $this->email],
            "PINTAARA | Account Deletion Confirmed",
            'emails.auth.account_deleted',
            ['email' => $this->email, 'name' => $this->name]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
