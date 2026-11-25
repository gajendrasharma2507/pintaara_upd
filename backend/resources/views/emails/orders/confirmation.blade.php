@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">Your order is confirmed.</h2>
  <p style="margin-top: 0; color: #555555;">Thank you for choosing PINTAARA.</p>
  <p>Your order has been received, and your piece is confirmed for production.</p>

  <div class="section-label">ORDER DETAILS</div>
  <div class="detail-card">
    <div class="detail-row">
      <span class="detail-label">Order Number:</span>
      <span class="detail-value" style="font-family: monospace;">{{ $order->order_number }}</span>
    </div>
    @php
      $firstItem = $order->items->first();
      $productName = $firstItem?->product_name ?? 'Bespoke Atelier Piece';
      $productCode = $firstItem?->design_code ?? ($firstItem?->product?->design_code ?? 'PD-ATELIER');
      $purity = $firstItem?->metal_purity ?? '22KT';
      $finish = $firstItem?->finish ?? 'Yellow Gold';
      $sizeOrLength = $firstItem?->size ?: ($firstItem?->chain ?: 'Standard');
      $stoneDetails = $firstItem?->gem ?: 'Natural Diamond';
      $currency = $currency ?? '₹';
      $totalPaid = number_format($order->total_amount, 2);
    @endphp
    <div class="detail-row">
      <span class="detail-label">Product:</span>
      <span class="detail-value">{{ $productName }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Product Code:</span>
      <span class="detail-value" style="font-family: monospace;">{{ $productCode }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Purity:</span>
      <span class="detail-value">{{ $purity }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Finish:</span>
      <span class="detail-value">{{ $finish }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Size / Length:</span>
      <span class="detail-value">{{ $sizeOrLength }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Stone:</span>
      <span class="detail-value">{{ $stoneDetails }}</span>
    </div>
    <div class="detail-row" style="border-top: 1px solid #EAE6DF; margin-top: 4px; padding-top: 8px;">
      <span class="detail-label" style="font-weight: 700; color: #1A1A1A;">Total Paid:</span>
      <span class="detail-value" style="color: #B8860B; font-size: 15px;">{{ $currency }}{{ $totalPaid }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Payment Status:</span>
      <span class="detail-value" style="color: #2E7D32;">Paid in full</span>
    </div>
  </div>

  <div class="section-label">SHIPPING ADDRESS</div>
  <p style="font-size: 13px; color: #666666; margin: 4px 0 10px 0;">
    Please review your shipping details. If anything needs correcting, contact us within 24 hours of placing your order.
  </p>
  <div class="detail-card" style="line-height: 1.7; font-size: 13.5px; color: #2D2D2D;">
    <strong>{{ $order->customer_name }}</strong><br>
    @if(!empty($addressLines) && is_array($addressLines))
      @foreach($addressLines as $line)
        {{ $line }}<br>
      @endforeach
    @else
      {{ $order->shipping_address }}<br>
    @endif
    Phone: {{ $order->customer_phone ?: '—' }}
  </div>

  <div class="note-box">
    Manufacturing begins after the 24-hour cancellation window.<br>
    Production is expected to take 4–10 days from its start.<br>
    If you need assistance, simply reply to this email.
  </div>
@endsection
