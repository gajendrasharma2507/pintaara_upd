@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">Verify your email.</h2>

  <p>Use the button below to verify your email address and complete your PINTAARA account setup.</p>

  <div class="btn-container">
    <a href="{{ $verificationUrl }}" class="btn-primary">
      VERIFY EMAIL
    </a>
  </div>

  <p style="font-size: 13px; color: #777777; margin-top: 24px;">
    This link expires in {{ $expiryMinutes ?? 60 }} minutes.<br>
    If you didn't request this, you can safely ignore this email.
  </p>
@endsection
