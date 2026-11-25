<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderDelayMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public ?string $delayReason;
    public ?string $revisedCompletionDate;

    public function __construct(
        Order $order,
        ?string $delayReason = null,
        ?string $revisedCompletionDate = null
    ) {
        $this->order = $order;
        $this->delayReason = $delayReason;
        $this->revisedCompletionDate = $revisedCompletionDate ?: 'Within 5–7 business days';
    }

    public function envelope(): Envelope
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'order_delay',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'delay_reason' => $this->delayReason ?? '',
                'new_estimate' => $this->revisedCompletionDate,
                'action_url' => config('app.frontend_url', 'https://pintaara.com') . '/account/orders',
            ],
            "PINTAARA | An Update on Order {$this->order->order_number}",
            'emails.orders.delay_update'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $resolved = \App\Services\EmailTemplateService::resolve(
            'order_delay',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'delay_reason' => $this->delayReason ?? '',
                'new_estimate' => $this->revisedCompletionDate,
                'action_url' => config('app.frontend_url', 'https://pintaara.com') . '/account/orders',
            ],
            "PINTAARA | An Update on Order {$this->order->order_number}",
            'emails.orders.delay_update',
            ['order' => $this->order, 'delayReason' => $this->delayReason, 'revisedCompletionDate' => $this->revisedCompletionDate]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
