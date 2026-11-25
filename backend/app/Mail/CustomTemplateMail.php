<?php

namespace App\Mail;

use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomTemplateMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $resolvedSubject;
    public string $resolvedBodyHtml;

    public function __construct(EmailTemplate $template, array $vars = [])
    {
        $this->resolvedSubject = EmailTemplate::replaceVariables((string) $template->subject, $vars);
        $this->resolvedBodyHtml = EmailTemplate::replaceVariables((string) $template->body_html, $vars);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->resolvedSubject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.custom_raw',
            with: [
                'emailSubject' => $this->resolvedSubject,
                'customBodyHtml' => $this->resolvedBodyHtml,
            ],
        );
    }
}
