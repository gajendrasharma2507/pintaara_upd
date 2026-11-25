<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class RefundProcessedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public ?string $refundAmount;
    public ?string $refundReference;
    public ?string $refundDate;
    public string $currency;

    public function __construct(
        Order $order,
        ?string $refundAmount = null,
        ?string $refundReference = null,
        ?string $refundDate = null,
        string $currency = '₹'
    ) {
        $this->order = $order;
        $this->refundAmount = $refundAmount ?: number_format($order->total_amount, 2);
        $this->refundReference = $refundReference ?: ('RFND-' . strtoupper(Str::random(10)));
        $this->refundDate = $refundDate ?: now()->format('d M Y');
        $this->currency = $currency;
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'refund_processed',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'refund_amount' => $this->currency . ' ' . $this->refundAmount,
                'action_url' => config('app.frontend_url', 'https://pintaara.com') . '/account/orders',
            ],
            "PINTAARA | Refund Issued for Order {$this->order->order_number}",
            'emails.orders.refund_processed'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'refund_processed',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'refund_amount' => $this->currency . ' ' . $this->refundAmount,
                'action_url' => config('app.frontend_url', 'https://pintaara.com') . '/account/orders',
            ],
            "PINTAARA | Refund Issued for Order {$this->order->order_number}",
            'emails.orders.refund_processed',
            [
                'order' => $this->order,
                'refundAmount' => $this->refundAmount,
                'refundReference' => $this->refundReference,
                'refundDate' => $this->refundDate,
                'currency' => $this->currency,
            ]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
