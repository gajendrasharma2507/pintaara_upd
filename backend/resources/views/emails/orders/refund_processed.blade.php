@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">Your refund has been issued.</h2>
  <div style="font-size: 14px; color: #B8860B; font-weight: 700; margin-bottom: 18px;">
    Order {{ $order->order_number }}
  </div>

  <p>Your refund has been processed to your original payment method.</p>

  <div class="section-label">REFUND DETAILS</div>
  <div class="detail-card">
    <div class="detail-row">
      <span class="detail-label">Refund Amount:</span>
      <span class="detail-value" style="color: #B8860B; font-size: 15px;">{{ $currency ?? '₹' }}{{ $refundAmount ?? number_format($order->total_amount, 2) }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Refund Reference:</span>
      <span class="detail-value" style="font-family: monospace;">{{ $refundReference ?? ('RFND-' . strtoupper(Str::random(10))) }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Refund Issued:</span>
      <span class="detail-value">{{ $refundDate ?? now()->format('d M Y') }}</span>
    </div>
  </div>

  <p style="font-size: 13.5px; color: #555555; margin-top: 20px;">
    The amount may take additional time to appear in your account, depending on your payment provider. If the amount has not appeared within the timeframe provided by your payment provider, don't hesitate to get in touch with us.
  </p>
@endsection
