<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ManufacturingInitiatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public function __construct(Order $order)
    {
        $this->order = $order->loadMissing('items');
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'manufacturing_initiated',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'action_url' => config('app.frontend_url', 'https://pintaara.com') . '/account/orders',
            ],
            "PINTAARA | Your piece has entered production",
            'emails.orders.manufacturing_initiated'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'manufacturing_initiated',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'action_url' => config('app.frontend_url', 'https://pintaara.com') . '/account/orders',
            ],
            "PINTAARA | Your piece has entered production",
            'emails.orders.manufacturing_initiated',
            ['order' => $this->order]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
