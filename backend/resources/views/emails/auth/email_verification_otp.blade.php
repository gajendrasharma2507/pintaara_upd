@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">Your verification code.</h2>

  <p>Enter the code below to continue.</p>

  <div class="otp-display">
    <div class="otp-code">{{ $verificationCode }}</div>
  </div>

  <p style="font-size: 13px; color: #777777; margin-top: 24px;">
    This code expires in {{ $expiryMinutes ?? 10 }} minutes.<br>
    Do not share this code with anyone. If you didn't request it, ignore this email.
  </p>
@endsection
