<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PINTAARA Sign In</title>
  <link rel="icon" type="image/png" href="/images/logo-butterfly.png">
  <link rel="stylesheet" href="/css/admin.css">
</head>
<body style="background: #F4F7FE; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px;">
  <div class="admin-card" style="width: 100%; max-width: 420px; padding: 36px 32px; border-radius: 18px; box-shadow: var(--admin-shadow-lg); background: #FFF; border: 1px solid var(--admin-border);">
    <div style="text-align: center; margin-bottom: 28px;">
      <a href="{{ route('admin.login') }}" style="display: inline-block; text-decoration: none;">
        <img src="/images/mobile/logo-wordmark.png" alt="PINTAARA" style="height: 30px; width: auto; max-width: 220px; object-fit: contain; display: block; margin: 0 auto;">
      </a>
      <div style="font-size: 13px; color: var(--admin-text-secondary); margin-top: 10px;">
        PINTAARA Operations & Administration Portal
      </div>
    </div>

    @if($errors->any())
      <div style="background: #FEE2E2; border: 1px solid #FECACA; color: #991B1B; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 20px;">
        {{ $errors->first() }}
      </div>
    @endif

    <form action="{{ route('admin.login.submit') }}" method="POST" style="display: flex; flex-direction: column; gap: 18px;">
      @csrf
      <div>
        <label class="admin-label">Email Address</label>
        <input type="email" name="email" value="{{ old('email', 'admin@pintaara.com') }}" required autofocus class="admin-input" placeholder="admin@pintaara.com">
      </div>

      <div>
        <label class="admin-label">Password</label>
        <input type="password" name="password" value="password" required class="admin-input" placeholder="••••••••">
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12.5px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--admin-text-secondary);">
          <input type="checkbox" name="remember" checked style="border-radius: 4px;">
          <span>Remember me</span>
        </label>
      </div>

      <button type="submit" class="admin-btn-primary" style="justify-content: center; padding: 12px; font-size: 14px; margin-top: 6px;">
        Sign In to PINTAARA
      </button>
    </form>
  </div>
</body>
</html>

