@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">Password updated.</h2>

  <p>Your PINTAARA account password has been successfully changed.</p>
  <p>If you made this change, no further action is required.</p>
  <p>If you didn't, secure your account immediately.</p>

  <div class="btn-container">
    <a href="{{ $secureAccountUrl ?? (config('app.frontend_url', 'http://localhost:3000') . '/account') }}" class="btn-primary">
      SECURE YOUR ACCOUNT
    </a>
  </div>

  <div class="note-box">
    If you suspect unauthorized activity, contact our security team at info@pintaara.com.
  </div>
@endsection
