@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">It's yours now.</h2>
  <div style="font-size: 14px; color: #B8860B; font-weight: 700; margin-bottom: 18px;">
    Order {{ $order->order_number }}
  </div>

  <p>Your PINTAARA piece has arrived.</p>
  <p>Thank you for choosing our design.</p>

  <div class="btn-container">
    <a href="{{ $viewOrderUrl ?? (config('app.frontend_url', 'http://localhost:3000') . '/account') }}" class="btn-primary">
      VIEW YOUR ORDER
    </a>
  </div>

  <div class="note-box" style="margin-top: 30px;">
    Your official authenticity certificate and digital ownership record are now permanently unlocked in your Client Profile.
  </div>
@endsection
