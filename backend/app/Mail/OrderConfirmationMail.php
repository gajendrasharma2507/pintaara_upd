<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public string $currency;
    public array $addressLines;

    public function __construct(Order $order, string $currency = '₹', array $addressLines = [])
    {
        $this->order = $order->loadMissing('items.product');
        $this->currency = $currency;
        $this->addressLines = $addressLines ?: explode("\n", str_replace(["\r\n", "\r"], "\n", (string) $order->shipping_address));
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'order_confirmation',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'total_amount' => $this->currency . ' ' . number_format((float) $this->order->total_amount, 2),
                'action_url' => config('app.frontend_url', 'https://pintaara.com') . '/account/orders',
            ],
            "PINTAARA | Order {$this->order->order_number} confirmed",
            'emails.orders.confirmation'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'order_confirmation',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'total_amount' => $this->currency . ' ' . number_format((float) $this->order->total_amount, 2),
                'action_url' => config('app.frontend_url', 'https://pintaara.com') . '/account/orders',
            ],
            "PINTAARA | Order {$this->order->order_number} confirmed",
            'emails.orders.confirmation',
            [
                'order' => $this->order,
                'currency' => $this->currency,
                'addressLines' => $this->addressLines,
            ]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
