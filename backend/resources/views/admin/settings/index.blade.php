@extends('layouts.admin')

@section('title', 'Global Settings')

@section('content')
<div style="display: flex; flex-direction: column; gap: 24px; max-width: 1400px; margin: 0 auto;">

  <!-- Header -->
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
    <div>
      <h1 style="font-size: 24px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 4px 0;">
        Global Settings
      </h1>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 0;">
        Store tax rates, brand parameters, and payment/mail gateway configurations.
      </p>
    </div>
  </div>

  @php
    $generalParams = [
      'gst_percent' => [
        'name' => 'GST Percentage',
        'raw_val' => $settings['gst_percent'] ?? '3.0',
        'display_val' => ($settings['gst_percent'] ?? '3.0') . '%',
        'type' => 'number',
        'action_type' => 'single',
      ],
      'brand_name' => [
        'name' => 'Brand Name',
        'raw_val' => $settings['brand_name'] ?? 'PINTAARA',
        'display_val' => $settings['brand_name'] ?? 'PINTAARA',
        'type' => 'text',
        'action_type' => 'single',
      ],
      'contact_email' => [
        'name' => 'Contact Email',
        'raw_val' => $settings['contact_email'] ?? 'info@pintaara.com',
        'display_val' => $settings['contact_email'] ?? 'info@pintaara.com',
        'type' => 'email',
        'action_type' => 'single',
      ],
      'contact_phone' => [
        'name' => 'Contact US',
        'raw_val' => $settings['contact_phone'] ?? '+91 98765 43210',
        'display_val' => $settings['contact_phone'] ?? '+91 98765 43210',
        'type' => 'text',
        'action_type' => 'single',
      ],
      'invoice_prefix' => [
        'name' => 'Invoice Prefix',
        'raw_val' => $settings['invoice_prefix'] ?? 'INV-PT-',
        'display_val' => $settings['invoice_prefix'] ?? 'INV-PT-',
        'type' => 'text',
        'action_type' => 'single',
      ],
      'storefront_passcode' => [
        'name' => 'Website Password',
        'raw_val' => $settings['storefront_passcode'] ?? 'Pintaara@2026',
        'is_enabled' => ($settings['storefront_password_enabled'] ?? '1') !== '0',
        'display_val' => $settings['storefront_passcode'] ?? 'Pintaara@2026',
        'type' => 'modal',
        'action_type' => 'website_password',
      ],
      'razorpay' => [
        'name' => 'Razorpay Setup',
        'raw_val' => $settings['razorpay_key_id'] ?? config('services.razorpay.key_id', env('RAZORPAY_KEY_ID', '')),
        'display_val' => !empty($settings['razorpay_key_id'] ?? config('services.razorpay.key_id', env('RAZORPAY_KEY_ID', ''))) ? ($settings['razorpay_key_id'] ?? config('services.razorpay.key_id', env('RAZORPAY_KEY_ID', ''))) : 'Not Configured',
        'type' => 'modal',
        'action_type' => 'razorpay',
      ],
      'smtp' => [
        'name' => 'SMTP Setup',
        'raw_val' => $settings['mail_host'] ?? config('mail.mailers.smtp.host', env('MAIL_HOST', '')),
        'display_val' => !empty($settings['mail_host'] ?? config('mail.mailers.smtp.host', env('MAIL_HOST', '')))
          ? (($settings['mail_host'] ?? config('mail.mailers.smtp.host', env('MAIL_HOST', ''))) . ':' . ($settings['mail_port'] ?? config('mail.mailers.smtp.port', env('MAIL_PORT', '465'))) . ' (' . ($settings['mail_username'] ?? config('mail.mailers.smtp.username', env('MAIL_USERNAME', ''))) . ')')
          : 'Not Configured',
        'type' => 'modal',
        'action_type' => 'smtp',
      ],
      'sequel' => [
        'name' => 'Sequel 247 Delivery (Armored Logistics)',
        'raw_val' => $settings['sequel_client_code'] ?? '31492',
        'display_val' => !empty($settings['sequel_prod_token'] ?? $settings['sequel_test_token'] ?? config('services.sequel247.test_token'))
          ? ((($settings['sequel_env'] ?? config('services.sequel247.env', 'test')) === 'production' ? 'Production (Live)' : 'Sandbox (Test)') . ' · Client: ' . ($settings['sequel_client_code'] ?? config('services.sequel247.client_code', '31492')) . ' · Store: ' . ($settings['sequel_store_code'] ?? config('services.sequel247.store_code', 'PINTARA')) . ' · Origin: ' . ($settings['sequel_origin_pincode'] ?? config('services.sequel247.origin_pincode', '390001')))
          : 'Pending Credentials (Click Edit to configure)',
        'type' => 'modal',
        'action_type' => 'sequel',
      ],
    ];
  @endphp

  <!-- Settings Table Card -->
  <div class="admin-card" style="border-radius: 14px; background: var(--admin-surface); border: 1px solid var(--admin-border); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
    <div style="overflow-x: auto;">
      <table class="admin-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--admin-border);">
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em; text-align: left; width: 35%;">Name</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em; text-align: left;">Configured Value</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em; text-align: right; width: 100px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          @foreach($generalParams as $key => $item)
            <tr style="border-bottom: 1px solid var(--admin-border-light); transition: background 0.15s;">
              
              <!-- Name -->
              <td style="padding: 18px 20px; vertical-align: middle;">
                <div style="font-size: 14px; font-weight: 700; color: var(--admin-text-primary);">
                  {{ $item['name'] }}
                </div>
              </td>

              <!-- Configured Value -->
              <td style="padding: 18px 20px; vertical-align: middle;">
                @if($item['action_type'] === 'website_password')
                  <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    @if($item['is_enabled'])
                      <span style="background: #ECFDF5; color: #059669; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 5px;">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #059669;"></span>
                        Enabled
                      </span>
                      <span style="font-size: 13.5px; font-family: monospace; font-weight: 600; color: var(--admin-text-primary);">
                        {{ $item['raw_val'] }}
                      </span>
                    @else
                      <span style="background: #FEF2F2; color: #DC2626; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 5px;">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #DC2626;"></span>
                        Disabled
                      </span>
                      <span style="font-size: 12.5px; color: var(--admin-text-muted);">
                        (Public access — no password required)
                      </span>
                    @endif
                  </div>
                @else
                  <span style="font-size: 14px; font-weight: 600; color: var(--admin-text-primary); {{ in_array($item['action_type'], ['razorpay', 'smtp']) ? 'font-family: monospace;' : '' }}">
                    {{ $item['display_val'] }}
                  </span>
                @endif
              </td>

              <!-- Actions -->
              <td style="padding: 18px 20px; text-align: right; vertical-align: middle;">
                @if($item['action_type'] === 'website_password')
                  <button type="button" onclick="openWebsitePasswordModal()" class="admin-btn admin-btn-edit">
                    Edit
                  </button>
                @elseif($item['action_type'] === 'razorpay')
                  <button type="button" onclick="openRazorpayModal()" class="admin-btn admin-btn-edit">
                    Edit
                  </button>
                @elseif($item['action_type'] === 'smtp')
                  <button type="button" onclick="openSmtpModal()" class="admin-btn admin-btn-edit">
                    Edit
                  </button>
                @elseif($item['action_type'] === 'sequel')
                  <button type="button" onclick="openSequelModal()" class="admin-btn admin-btn-edit">
                    Edit
                  </button>
                @else
                  <button
                    type="button"
                    onclick="openSettingModal('{{ $key }}', '{{ addslashes($item['name']) }}', '{{ addslashes($item['raw_val']) }}', '{{ $item['type'] }}')"
                    class="admin-btn admin-btn-edit"
                  >
                    Edit
                  </button>
                @endif
              </td>

            </tr>
          @endforeach
        </tbody>
      </table>
    </div>
  </div>

</div>

<!-- ============================================================ -->
<!-- 0. WEBSITE PASSWORD SETUP POPUP MODAL -->
<!-- ============================================================ -->
<div id="websitePasswordModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
  <div style="background: var(--admin-surface); width: 100%; max-width: 500px; border-radius: 14px; border: 1px solid var(--admin-border); box-shadow: 0 20px 40px rgba(0,0,0,0.25); overflow: hidden;">
    <div style="padding: 20px 24px; border-bottom: 1px solid var(--admin-border-light); display: flex; align-items: center; justify-content: space-between;">
      <div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--admin-text-primary);">
          Edit Website Password
        </h3>
        <span style="font-size: 11.5px; color: var(--admin-text-muted);">Manage storefront access lock and passcode</span>
      </div>
      <button type="button" onclick="closeWebsitePasswordModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--admin-text-muted);">&times;</button>
    </div>

    <form action="{{ route('admin.settings.update') }}" method="POST" style="padding: 24px; display: flex; flex-direction: column; gap: 18px;">
      @csrf

      <div>
        <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 8px;">
          Website Password Protection
        </label>
        <div style="display: flex; gap: 20px; align-items: center;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13.5px; font-weight: 600; color: var(--admin-text-primary); margin: 0;">
            <input 
              type="radio" 
              name="storefront_password_enabled" 
              value="1" 
              {{ ($settings['storefront_password_enabled'] ?? '1') !== '0' ? 'checked' : '' }} 
              style="width: 17px; height: 17px; accent-color: #3C50E0; cursor: pointer;"
              onchange="togglePasscodeStatus(true)"
            >
            <span style="color: #059669; font-weight: 700;">Enabled</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13.5px; font-weight: 600; color: var(--admin-text-primary); margin: 0;">
            <input 
              type="radio" 
              name="storefront_password_enabled" 
              value="0" 
              {{ ($settings['storefront_password_enabled'] ?? '1') === '0' ? 'checked' : '' }} 
              style="width: 17px; height: 17px; accent-color: #3C50E0; cursor: pointer;"
              onchange="togglePasscodeStatus(false)"
            >
            <span style="color: #DC2626; font-weight: 700;">Disabled</span>
          </label>
        </div>
        <div id="passcode_status_hint" style="font-size: 11.5px; color: var(--admin-text-muted); margin-top: 6px;">
          {{ ($settings['storefront_password_enabled'] ?? '1') !== '0' ? 'Visitors must enter the password below before browsing the storefront.' : 'Website is open to the public without asking for a password.' }}
        </div>
      </div>

      <div id="passcode_input_wrap" style="{{ ($settings['storefront_password_enabled'] ?? '1') === '0' ? 'opacity: 0.5;' : '' }}">
        <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
          Website Password *
        </label>
        <input 
          type="text" 
          name="storefront_passcode" 
          id="modal_storefront_passcode"
          value="{{ $settings['storefront_passcode'] ?? 'Pintaara@2026' }}" 
          required 
          placeholder="Enter website password" 
          class="admin-input" 
          style="font-family: monospace; font-size: 14px;"
        >
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; padding-top: 14px; border-top: 1px solid var(--admin-border-light);">
        <button type="button" onclick="closeWebsitePasswordModal()" class="admin-btn admin-btn-secondary">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Save Changes</button>
      </div>
    </form>
  </div>
</div>

<!-- ============================================================ -->
<!-- 1. GENERAL SETTING EDIT POPUP MODAL -->
<!-- ============================================================ -->
<div id="singleModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
  <div style="background: var(--admin-surface); width: 100%; max-width: 480px; border-radius: 14px; border: 1px solid var(--admin-border); box-shadow: 0 20px 40px rgba(0,0,0,0.25); overflow: hidden;">
    <div style="padding: 20px 24px; border-bottom: 1px solid var(--admin-border-light); display: flex; align-items: center; justify-content: space-between;">
      <h3 id="singleModalTitle" style="margin: 0; font-size: 18px; font-weight: 800; color: var(--admin-text-primary);">
        Edit Setting
      </h3>
      <button type="button" onclick="closeSettingModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--admin-text-muted);">&times;</button>
    </div>

    <form action="{{ route('admin.settings.update') }}" method="POST" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
      @csrf
      <div>
        <label id="singleModalLabel" class="admin-label" style="display: block; margin-bottom: 6px;">Setting Value</label>
        <div id="singleModalInputContainer"></div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px;">
        <button type="button" onclick="closeSettingModal()" class="admin-btn admin-btn-secondary">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Save Changes</button>
      </div>
    </form>
  </div>
</div>

<!-- ============================================================ -->
<!-- 2. RAZORPAY SETUP POPUP MODAL -->
<!-- ============================================================ -->
<div id="razorpayModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
  <div style="background: var(--admin-surface); width: 100%; max-width: 540px; border-radius: 14px; border: 1px solid var(--admin-border); box-shadow: 0 20px 40px rgba(0,0,0,0.25); overflow: hidden;">
    <div style="padding: 20px 24px; border-bottom: 1px solid var(--admin-border-light); display: flex; align-items: center; justify-content: space-between;">
      <div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--admin-text-primary);">
          Razorpay Gateway Setup
        </h3>
        <span style="font-size: 11.5px; color: var(--admin-text-muted);">Configure live Razorpay credentials</span>
      </div>
      <button type="button" onclick="closeRazorpayModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--admin-text-muted);">&times;</button>
    </div>

    <form action="{{ route('admin.settings.update') }}" method="POST" style="padding: 24px; display: flex; flex-direction: column; gap: 18px;">
      @csrf
      <input type="hidden" name="razorpay_env" value="live">

      <div>
        <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
          Razorpay Key ID (Live) *
        </label>
        <input 
          type="text" 
          name="razorpay_key_id" 
          value="{{ $settings['razorpay_key_id'] ?? '' }}" 
          required 
          placeholder="rzp_live_xxxxxxxxxxxxxxxx" 
          class="admin-input" 
          style="font-family: monospace;"
        >
      </div>

      <div>
        <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
          Razorpay Key Secret (Live) *
        </label>
        <input 
          type="password" 
          name="razorpay_key_secret" 
          placeholder="{{ !empty($settings['razorpay_key_secret']) ? '•••••••••••••••• (Leave blank to keep current)' : 'Enter live secret' }}" 
          class="admin-input" 
          style="font-family: monospace;"
        >
        <div style="font-size: 11.5px; color: var(--admin-text-muted); margin-top: 4px;">
          @if(!empty($settings['razorpay_key_secret']))
            <span style="color: #059669; font-weight: 600;">&#10003; Secret configured.</span> Leave blank unless updating.
          @else
            Live Key Secret from Razorpay Dashboard.
          @endif
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; padding-top: 14px; border-top: 1px solid var(--admin-border-light);">
        <button type="button" onclick="closeRazorpayModal()" class="admin-btn admin-btn-secondary">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Save Razorpay Credentials</button>
      </div>
    </form>
  </div>
</div>

<!-- ============================================================ -->
<!-- 3. SMTP SETUP POPUP MODAL -->
<!-- ============================================================ -->
<div id="smtpModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
  <div style="background: var(--admin-surface); width: 100%; max-width: 620px; border-radius: 14px; border: 1px solid var(--admin-border); box-shadow: 0 20px 40px rgba(0,0,0,0.25); overflow: hidden;">
    <div style="padding: 20px 24px; border-bottom: 1px solid var(--admin-border-light); display: flex; align-items: center; justify-content: space-between;">
      <div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--admin-text-primary);">
          SMTP Email Setup
        </h3>
        <span style="font-size: 11.5px; color: var(--admin-text-muted);">Outgoing transactional email server configuration</span>
      </div>
      <button type="button" onclick="closeSmtpModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--admin-text-muted);">&times;</button>
    </div>

    <form action="{{ route('admin.settings.update') }}" method="POST" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
      @csrf

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px;">
        <div>
          <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">SMTP Host *</label>
          <input 
            type="text" 
            name="mail_host" 
            value="{{ $settings['mail_host'] ?? config('mail.mailers.smtp.host', env('MAIL_HOST', 'smtp.hostinger.com')) }}" 
            required 
            placeholder="smtp.hostinger.com" 
            class="admin-input" 
            style="font-family: monospace;"
          >
        </div>
        <div>
          <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">SMTP Port *</label>
          <input 
            type="number" 
            name="mail_port" 
            value="{{ $settings['mail_port'] ?? config('mail.mailers.smtp.port', env('MAIL_PORT', 465)) }}" 
            required 
            placeholder="465" 
            class="admin-input" 
            style="font-family: monospace;"
          >
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div>
          <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">SMTP Username</label>
          <input 
            type="text" 
            name="mail_username" 
            value="{{ $settings['mail_username'] ?? config('mail.mailers.smtp.username', env('MAIL_USERNAME', 'noreply@pintaara.com')) }}" 
            placeholder="noreply@pintaara.com" 
            class="admin-input"
          >
        </div>
        <div>
          <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">SMTP Password</label>
          <input 
            type="password" 
            name="mail_password" 
            placeholder="{{ !empty($settings['mail_password'] ?? config('mail.mailers.smtp.password', env('MAIL_PASSWORD'))) ? '•••••••••••••••• (Leave blank to keep current)' : 'Enter password' }}" 
            class="admin-input"
          >
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;">
        <div>
          <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">Encryption</label>
          @php $currEnc = strtolower($settings['mail_encryption'] ?? config('mail.mailers.smtp.encryption', env('MAIL_ENCRYPTION', 'ssl'))); @endphp
          <select name="mail_encryption" class="admin-input" style="cursor: pointer;">
            <option value="ssl" {{ $currEnc === 'ssl' ? 'selected' : '' }}>SSL (Port 465)</option>
            <option value="tls" {{ $currEnc === 'tls' ? 'selected' : '' }}>TLS (Port 587)</option>
            <option value="null" {{ $currEnc === 'null' ? 'selected' : '' }}>None</option>
          </select>
        </div>
        <div>
          <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">From Email *</label>
          <input 
            type="email" 
            name="mail_from_address" 
            value="{{ $settings['mail_from_address'] ?? config('mail.from.address', env('MAIL_FROM_ADDRESS', 'noreply@pintaara.com')) }}" 
            required 
            placeholder="noreply@pintaara.com" 
            class="admin-input"
          >
        </div>
        <div>
          <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">From Name *</label>
          <input 
            type="text" 
            name="mail_from_name" 
            value="{{ $settings['mail_from_name'] ?? config('mail.from.name', env('MAIL_FROM_NAME', 'PINTAARA')) }}" 
            required 
            placeholder="PINTAARA" 
            class="admin-input"
          >
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; padding-top: 14px; border-top: 1px solid var(--admin-border-light);">
        <button type="button" onclick="closeSmtpModal()" class="admin-btn admin-btn-secondary">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Save SMTP Settings</button>
      </div>
    </form>
  </div>
</div>

<!-- ============================================================ -->
<!-- 4. SEQUEL 247 ARMORED LOGISTICS SETUP MODAL -->
<!-- ============================================================ -->
<div id="sequelModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
  <div style="background: var(--admin-surface); width: 100%; max-width: 620px; border-radius: 14px; border: 1px solid var(--admin-border); box-shadow: 0 20px 40px rgba(0,0,0,0.25); overflow: hidden;">
    <div style="padding: 20px 24px; border-bottom: 1px solid var(--admin-border-light); display: flex; align-items: center; justify-content: space-between;">
      <div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--admin-text-primary);">
          Sequel 247 Logistics Setup
        </h3>
        <span style="font-size: 11.5px; color: var(--admin-text-muted);">Armored door-to-door transit for high-value fine jewelry (<a href="https://sequel247.com" target="_blank" style="color: #3C50E0; text-decoration: underline;">sequel247.com</a>)</span>
      </div>
      <button type="button" onclick="closeSequelModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--admin-text-muted);">&times;</button>
    </div>

    <form action="{{ route('admin.settings.update') }}" method="POST" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
      @csrf

      <div>
        <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Environment Mode</label>
        <div style="display: flex; gap: 20px; align-items: center;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13.5px; font-weight: 600; color: var(--admin-text-primary); margin: 0;">
            <input 
              type="radio" 
              name="sequel_env" 
              value="production" 
              {{ ($settings['sequel_env'] ?? 'test') === 'production' ? 'checked' : '' }} 
              style="width: 17px; height: 17px; accent-color: #3C50E0; cursor: pointer;"
            >
            <span style="color: #059669; font-weight: 700;">Production (Live - sequel247.com)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13.5px; font-weight: 600; color: var(--admin-text-primary); margin: 0;">
            <input 
              type="radio" 
              name="sequel_env" 
              value="test" 
              {{ ($settings['sequel_env'] ?? 'test') !== 'production' ? 'checked' : '' }} 
              style="width: 17px; height: 17px; accent-color: #3C50E0; cursor: pointer;"
            >
            <span style="color: #D97706; font-weight: 700;">Sandbox / Test (test.sequel247.com)</span>
          </label>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div>
          <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">Client Code *</label>
          <input 
            type="text" 
            name="sequel_client_code" 
            value="{{ $settings['sequel_client_code'] ?? config('services.sequel247.client_code', '31492') }}" 
            required 
            placeholder="31492" 
            class="admin-input" 
            style="font-family: monospace;"
          >
          <div style="font-size: 11px; color: var(--admin-text-muted); margin-top: 3px;">Assigned by Sequel 247 account manager</div>
        </div>

        <div>
          <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">Store Code *</label>
          <input 
            type="text" 
            name="sequel_store_code" 
            value="{{ $settings['sequel_store_code'] ?? config('services.sequel247.store_code', 'PINTARA') }}" 
            required 
            placeholder="PINTARA" 
            class="admin-input" 
            style="font-family: monospace;"
          >
          <div style="font-size: 11px; color: var(--admin-text-muted); margin-top: 3px;">Store / Vault branch identifier</div>
        </div>
      </div>

      <div>
        <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">Origin Vault Pincode *</label>
        <input 
          type="text" 
          name="sequel_origin_pincode" 
          value="{{ $settings['sequel_origin_pincode'] ?? config('services.sequel247.origin_pincode', '390001') }}" 
          required 
          placeholder="390001" 
          class="admin-input" 
          style="font-family: monospace;"
        >
        <div style="font-size: 11px; color: var(--admin-text-muted); margin-top: 3px;">Vadodara studio pickup pincode for armored vehicle dispatch</div>
      </div>

      <div>
        <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">Production API Token</label>
        <input 
          type="password" 
          name="sequel_prod_token" 
          placeholder="{{ !empty($settings['sequel_prod_token']) ? '•••••••••••••••••••••••• (Configured - leave blank to keep)' : 'Enter production token from Sequel247 portal' }}" 
          class="admin-input" 
          style="font-family: monospace;"
        >
        <div style="font-size: 11px; color: var(--admin-text-muted); margin-top: 3px;">API Bearer Token provided by Sequel for live shipments</div>
      </div>

      <div>
        <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">Test / Sandbox API Token</label>
        <input 
          type="password" 
          name="sequel_test_token" 
          placeholder="{{ !empty($settings['sequel_test_token']) ? '•••••••••••••••••••••••• (Configured - leave blank to keep)' : 'Enter staging test token' }}" 
          class="admin-input" 
          style="font-family: monospace;"
        >
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; padding-top: 14px; border-top: 1px solid var(--admin-border-light);">
        <button type="button" onclick="closeSequelModal()" class="admin-btn admin-btn-secondary">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Save Sequel 247 Credentials</button>
      </div>
    </form>
  </div>
</div>

<script>
  // 0. Website Password Modal
  function openWebsitePasswordModal() {
    document.getElementById('websitePasswordModal').style.display = 'flex';
  }

  function closeWebsitePasswordModal() {
    document.getElementById('websitePasswordModal').style.display = 'none';
  }

  function togglePasscodeStatus(enabled) {
    const wrap = document.getElementById('passcode_input_wrap');
    const hint = document.getElementById('passcode_status_hint');
    if (wrap) {
      wrap.style.opacity = enabled ? '1' : '0.5';
    }
    if (hint) {
      hint.textContent = enabled 
        ? 'Visitors must enter the password below before browsing the storefront.'
        : 'Website is open to the public without asking for a password.';
    }
  }

  // 1. Single General Setting Modal
  function openSettingModal(key, name, value, type) {
    document.getElementById('singleModalTitle').textContent = 'Edit ' + name;
    document.getElementById('singleModalLabel').textContent = name;
    const container = document.getElementById('singleModalInputContainer');
    container.innerHTML = '';

    const input = document.createElement('input');
    input.name = key;
    input.type = type || 'text';
    input.className = 'admin-input';
    input.style.width = '100%';
    input.value = value;
    input.required = true;

    if (type === 'number') {
      input.step = key === 'gst_percent' ? '0.1' : '1';
      input.min = '0';
    }

    container.appendChild(input);
    input.focus();
    document.getElementById('singleModal').style.display = 'flex';
  }

  function closeSettingModal() {
    document.getElementById('singleModal').style.display = 'none';
  }

  // 2. Razorpay Modal
  function openRazorpayModal() {
    document.getElementById('razorpayModal').style.display = 'flex';
  }

  function closeRazorpayModal() {
    document.getElementById('razorpayModal').style.display = 'none';
  }

  // 3. SMTP Modal
  function openSmtpModal() {
    document.getElementById('smtpModal').style.display = 'flex';
  }

  function closeSmtpModal() {
    document.getElementById('smtpModal').style.display = 'none';
  }

  // 4. Sequel 247 Modal
  function openSequelModal() {
    document.getElementById('sequelModal').style.display = 'flex';
  }

  function closeSequelModal() {
    document.getElementById('sequelModal').style.display = 'none';
  }

  // Close modals when clicking backdrop
  window.addEventListener('click', function(e) {
    const singleModal = document.getElementById('singleModal');
    const razorpayModal = document.getElementById('razorpayModal');
    const smtpModal = document.getElementById('smtpModal');
    const passModal = document.getElementById('websitePasswordModal');
    const sequelModal = document.getElementById('sequelModal');
    if (e.target === singleModal) closeSettingModal();
    if (e.target === razorpayModal) closeRazorpayModal();
    if (e.target === smtpModal) closeSmtpModal();
    if (e.target === passModal) closeWebsitePasswordModal();
    if (e.target === sequelModal) closeSequelModal();
  });

  // Close modals on Escape key
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeSettingModal();
      closeRazorpayModal();
      closeSmtpModal();
      closeWebsitePasswordModal();
      closeSequelModal();
    }
  });
</script>
@endsection
