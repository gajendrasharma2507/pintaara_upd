@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">An update on your order.</h2>
  <div style="font-size: 14px; color: #B8860B; font-weight: 700; margin-bottom: 18px;">
    Order {{ $order->order_number }}
  </div>

  <p>Your piece is taking a little longer than originally expected.</p>
  
  @if(!empty($delayReason))
    <p style="font-style: italic; color: #555555; background: #FDFCF9; border-left: 2px solid #D5CEBE; padding: 10px 14px;">
      {{ $delayReason }}
    </p>
  @endif

  <p>We want to ensure that the finished piece meets the specifications and standards established for its design.</p>

  <div class="section-label">REVISED TIMELINE</div>
  <div class="detail-card">
    <div class="detail-row">
      <span class="detail-label">Expected Completion:</span>
      <span class="detail-value" style="color: #B8860B;">{{ $revisedCompletionDate ?? 'Within 5–7 business days' }}</span>
    </div>
  </div>

  <p style="font-size: 13.5px; color: #555555; margin-top: 20px;">
    We'll continue to keep you informed if anything changes.<br>
    We appreciate your patience.
  </p>
@endsection
