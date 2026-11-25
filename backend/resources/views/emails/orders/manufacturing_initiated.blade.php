@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">Your piece is now in production.</h2>
  <div style="font-size: 14px; color: #B8860B; font-weight: 700; margin-bottom: 18px;">
    Order {{ $order->order_number }}
  </div>

  <p>We're bringing your selected design and specifications into their final form.</p>
  <p>Production is expected to take 7–14 days.</p>
  <p>We'll notify you when your order is dispatched.</p>

  <div class="note-box" style="margin-top: 28px;">
    Every PINTAARA piece undergoes precision crafting, microscopic hallmarking, and rigorous quality inspection before dispatch.
  </div>
@endsection
