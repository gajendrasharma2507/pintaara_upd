<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderDispatchedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public ?string $courierName;
    public ?string $trackingNumber;
    public ?string $estimatedDelivery;

    public function __construct(
        Order $order,
        ?string $courierName = null,
        ?string $trackingNumber = null,
        ?string $estimatedDelivery = null
    ) {
        $this->order = $order->loadMissing('items');
        $this->courierName = $courierName ?: ($order->courier_partner ?: 'Sequel 247 Armored Logistics');
        $this->trackingNumber = $trackingNumber ?: ($order->docket_number ?: 'PIN-TRK-' . strtoupper(substr(md5($order->id), 0, 8)));
        $this->estimatedDelivery = $estimatedDelivery ?: ($order->estimated_delivery_date ?: 'Within 2–4 business days');
    }

    public function envelope(): Envelope
    {
        $liveTrackingUrl = $this->order->tracking_link ?: (config('app.frontend_url', 'https://pintaara.com') . '/account/orders');
        $resolved = \App\Services\EmailTemplateService::resolve(
            'order_dispatched',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'courier_name' => $this->courierName,
                'tracking_number' => $this->trackingNumber,
                'estimated_delivery' => $this->estimatedDelivery,
                'tracking_url' => $liveTrackingUrl,
                'action_url' => $liveTrackingUrl,
            ],
            "PINTAARA | Your Piece Is on Its Way",
            'emails.orders.dispatched'
        );
        return new Envelope(subject: $resolved['subject']);
    }

    public function content(): Content
    {
        $liveTrackingUrl = $this->order->tracking_link ?: (config('app.frontend_url', 'https://pintaara.com') . '/account/orders');
        $resolved = \App\Services\EmailTemplateService::resolve(
            'order_dispatched',
            [
                'customer_name' => $this->order->customer_name ?? 'Valued Client',
                'order_number' => $this->order->order_number,
                'courier_name' => $this->courierName,
                'tracking_number' => $this->trackingNumber,
                'estimated_delivery' => $this->estimatedDelivery,
                'tracking_url' => $liveTrackingUrl,
                'action_url' => $liveTrackingUrl,
            ],
            "PINTAARA | Your Piece Is on Its Way",
            'emails.orders.dispatched',
            [
                'order' => $this->order,
                'courierName' => $this->courierName,
                'trackingNumber' => $this->trackingNumber,
                'estimatedDelivery' => $this->estimatedDelivery,
                'liveTrackingUrl' => $liveTrackingUrl,
            ]
        );
        return new Content(view: $resolved['view'], with: $resolved['with']);
    }
}
