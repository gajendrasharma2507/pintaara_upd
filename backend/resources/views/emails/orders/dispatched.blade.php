@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">Your piece is on its way.</h2>
  <div style="font-size: 14px; color: #B8860B; font-weight: 700; margin-bottom: 18px;">
    Order {{ $order->order_number }}
  </div>

  <p>Your order has completed production and quality checks and has been dispatched.</p>

  <div class="section-label">SHIPPING DETAILS</div>
  <div class="detail-card">
    <div class="detail-row">
      <span class="detail-label">Courier:</span>
      <span class="detail-value">{{ $courierName ?? ($order->courier_partner ?: 'Sequel 247 Armored Logistics') }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Tracking Number:</span>
      <span class="detail-value" style="font-family: monospace;">{{ $trackingNumber ?? ($order->docket_number ?: 'PIN-TRK-' . strtoupper(substr(md5($order->id), 0, 8))) }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Estimated Delivery:</span>
      <span class="detail-value">{{ $estimatedDelivery ?? ($order->estimated_delivery_date ?: 'Within 2–4 business days') }}</span>
    </div>
  </div>

  <div class="btn-container">
    <a href="{{ $liveTrackingUrl ?? $order->tracking_link ?? (config('app.frontend_url', 'https://pintaara.com') . '/account/orders') }}" class="btn-primary">
      TRACK ORDER (LIVE TRACKING)
    </a>
  </div>

  <div class="section-label">SHIPPED TO</div>
  <div class="detail-card" style="line-height: 1.7; font-size: 13.5px;">
    <strong>{{ $order->customer_name }}</strong><br>
    {{ $order->shipping_address }}<br>
    Phone: {{ $order->customer_phone ?: '—' }}
  </div>

  <div class="section-label" style="margin-top: 28px; border-bottom: none; color: #B8860B;">A NOTE ON DELIVERY</div>
  <div class="note-box" style="margin-top: 6px;">
    For your protection, we recommend recording a continuous unboxing video, starting with the sealed package and showing the jewellery upon opening. This helps document its condition on arrival and provides supporting evidence in case of damage, missing items or discrepancies.
  </div>
@endsection
