<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderDeliveredMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public ?string $viewOrderUrl;

    public function __construct(Order $order, ?string $viewOrderUrl = null)
    {
        $this->order = $order->loadMissing('items');
        $this->viewOrderUrl = $viewOrderUrl ?: (config('app.frontend_url', 'http://localhost:3000') . '/account');
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'order_delivered',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'action_url' => $this->viewOrderUrl,
            ],
            "PINTAARA | Your Piece Has Arrived",
            'emails.orders.delivered'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'order_delivered',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'action_url' => $this->viewOrderUrl,
            ],
            "PINTAARA | Your Piece Has Arrived",
            'emails.orders.delivered',
            ['order' => $this->order, 'viewOrderUrl' => $this->viewOrderUrl]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
