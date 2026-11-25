@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">Reset your password.</h2>

  <p>We received a request to reset your PINTAARA account password.</p>

  <div class="btn-container">
    <a href="{{ $resetUrl }}" class="btn-primary">
      RESET PASSWORD
    </a>
  </div>

  @if(!empty($resetCode))
    <p style="text-align: center; font-size: 13.5px; color: #555;">Or use this one-time reset code:</p>
    <div class="otp-display">
      <div class="otp-code">{{ $resetCode }}</div>
    </div>
  @endif

  <p style="font-size: 13px; color: #777777; margin-top: 24px;">
    This link expires in {{ $expiryMinutes ?? 60 }} minutes.<br>
    If you didn't request this, no action is required.
  </p>
@endsection
