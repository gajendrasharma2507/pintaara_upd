@extends('emails.layouts.master')

@section('content')
  <h2 class="h1-title">Email address updated.</h2>

  <p>The email address associated with your PINTAARA account has been changed.</p>

  <div class="detail-card">
    <div class="detail-row">
      <span class="detail-label">New Email Address:</span>
      <span class="detail-value" style="font-family: monospace;">{{ $newEmailAddress }}</span>
    </div>
  </div>

  <p>If you made this change, no action is required.</p>
  <p>If you didn't authorize it, contact us immediately.</p>

  <div class="btn-container">
    <a href="{{ $contactSupportUrl ?? ('mailto:' . config('mail.from.address', 'info@pintaara.com')) }}" class="btn-primary">
      CONTACT SUPPORT
    </a>
  </div>
@endsection
