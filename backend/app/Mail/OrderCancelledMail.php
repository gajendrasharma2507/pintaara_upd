<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'order_cancelled',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'cancel_reason' => $this->order->cancellation_reason ?? '',
                'action_url' => config('app.frontend_url', 'https://pintaara.com') . '/account',
            ],
            "PINTAARA | Order {$this->order->order_number} Cancelled",
            'emails.orders.cancelled'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'order_cancelled',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'cancel_reason' => $this->order->cancellation_reason ?? '',
                'action_url' => config('app.frontend_url', 'https://pintaara.com') . '/account',
            ],
            "PINTAARA | Order {$this->order->order_number} Cancelled",
            'emails.orders.cancelled',
            ['order' => $this->order]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
