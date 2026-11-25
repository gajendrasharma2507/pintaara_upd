@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">Your cancellation is confirmed.</h2>
  <div style="font-size: 14px; color: #B8860B; font-weight: 700; margin-bottom: 18px;">
    Order {{ $order->order_number }}
  </div>

  <p>As requested, your order has been cancelled. Manufacturing will not proceed.</p>
  <p>If payment has already been collected, a refund will be processed to your original payment method in accordance with our cancellation policy. You will receive a separate confirmation when the refund has been initiated.</p>
  <p>For any questions, you may reply directly to this email.</p>
@endsection
