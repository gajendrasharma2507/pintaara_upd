@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">Welcome to PINTAARA.</h2>

  <p>You can now manage your details, view your orders and access your purchase records in one place.</p>

  <div class="btn-container">
    <a href="{{ $viewAccountUrl ?? (config('app.frontend_url', 'http://localhost:3000') . '/account') }}" class="btn-primary">
      VIEW YOUR ACCOUNT
    </a>
  </div>

  <div class="note-box">
    Your PINTAARA client profile provides lifetime access to your jewelry certificates, HUID verification reports, and private atelier commissions.
  </div>
@endsection
