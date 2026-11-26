@extends('layouts.admin')

@section('title', 'Currency & FX Rates')

@section('content')
<div class="admin-header-row" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
    <div>
        <h1 class="admin-page-title" style="margin: 0 0 6px 0;">Currency &amp; Exchange Rates</h1>
        <p style="margin: 0; font-size: 13px; color: var(--admin-text-muted);">
            Frankfurter API v2 (<code>base=INR</code>, no API key required) · Auto-syncs every 6 hours · Never overwrites original INR product prices.
        </p>
    </div>

    <form method="POST" action="{{ route('admin.currencies.sync') }}">
        @csrf
        <button type="submit" class="admin-btn-gold" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; cursor: pointer;">
            <span>↻ Sync Exchange Rates</span>
        </button>
    </form>
</div>

@if(session('success'))
    <div style="background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 12px 16px; border-radius: 8px; margin-bottom: 18px; font-size: 13px;">
        {{ session('success') }}
    </div>
@endif

@if(session('warning'))
    <div style="background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; padding: 12px 16px; border-radius: 8px; margin-bottom: 18px; font-size: 13px;">
        {{ session('warning') }}
    </div>
@endif

<!-- API Connection Status & Last Sync Cards -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
    <div class="admin-card" style="padding: 18px 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--admin-text-muted); margin-bottom: 6px;">API Connection Status</div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600;">
            @if($apiStatus === 'connected')
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
                <span style="color: #065F46;">Connected (Frankfurter v2)</span>
            @elseif($apiStatus === 'error')
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #EF4444; display: inline-block;"></span>
                <span style="color: #991B1B;">API Error · Using Cached Rates</span>
            @else
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #F59E0B; display: inline-block;"></span>
                <span style="color: #92400E;">Pending Initial Sync</span>
            @endif
        </div>
        @if(!empty($lastError))
            <div style="margin-top: 6px; font-size: 11.5px; color: #B91C1C;">{{ $lastError }}</div>
        @endif
    </div>

    <div class="admin-card" style="padding: 18px 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--admin-text-muted); margin-bottom: 6px;">Last Successful Sync</div>
        <div style="font-size: 15px; font-weight: 600; color: var(--admin-text-primary);">
            @if(!empty($lastSuccessAt))
                {{ \Carbon\Carbon::parse($lastSuccessAt)->timezone('Asia/Kolkata')->format('d M Y, h:i A') }} IST
            @else
                Not synced yet
            @endif
        </div>
    </div>

    <div class="admin-card" style="padding: 18px 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--admin-text-muted); margin-bottom: 6px;">Pricing Formula</div>
        <div style="font-size: 13px; font-weight: 500; color: var(--admin-text-primary);">
            (INR Price &times; FX Rate) + Country Markup
        </div>
    </div>
</div>

<!-- Currency Rates & Country Markup Form -->
<form method="POST" action="{{ route('admin.currencies.update') }}">
    @csrf
    <div class="admin-card" style="padding: 0; overflow: hidden; margin-bottom: 24px;">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 14px;">Storefront Currencies &amp; Country-Wise Markups</strong>
            <button type="submit" class="admin-btn-gold" style="padding: 8px 16px; cursor: pointer;">Save Currency Settings</button>
        </div>

        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: rgba(0,0,0,0.02); border-bottom: 1px solid var(--admin-border); text-align: left;">
                        <th style="padding: 12px 16px;">Enabled</th>
                        <th style="padding: 12px 16px;">Currency</th>
                        <th style="padding: 12px 16px;">Symbol</th>
                        <th style="padding: 12px 16px;">Country</th>
                        <th style="padding: 12px 16px;">Rate (1 INR =)</th>
                        <th style="padding: 12px 16px;">Country Markup</th>
                        <th style="padding: 12px 16px;">Sample (₹1,00,000)</th>
                        <th style="padding: 12px 16px;">Rate Date / Synced</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($currencies as $c)
                    <tr style="border-bottom: 1px solid var(--admin-border);">
                        <td style="padding: 12px 16px;">
                            <input type="checkbox"
                                name="currencies[{{ $c->id }}][is_enabled]"
                                value="1"
                                {{ $c->is_enabled ? 'checked' : '' }}
                                {{ $c->currency_code === 'INR' ? 'disabled' : '' }}>
                            @if($c->currency_code === 'INR')
                                <input type="hidden" name="currencies[{{ $c->id }}][is_enabled]" value="1">
                            @endif
                        </td>
                        <td style="padding: 12px 16px;">
                            <strong>{{ $c->currency_code }}</strong>
                            <div style="font-size: 11px; color: var(--admin-text-muted);">{{ $c->currency_name }}</div>
                        </td>
                        <td style="padding: 12px 16px;">
                            <input type="text" name="currencies[{{ $c->id }}][currency_symbol]" value="{{ $c->currency_symbol }}" class="admin-input" style="width: 64px; padding: 6px 8px;">
                        </td>
                        <td style="padding: 12px 16px;">
                            <input type="text" name="currencies[{{ $c->id }}][country_name]" value="{{ $c->country_name }}" class="admin-input" style="width: 140px; padding: 6px 8px;">
                        </td>
                        <td style="padding: 12px 16px; font-family: monospace;">
                            {{ number_format((float)$c->exchange_rate, 6) }}
                        </td>
                        <td style="padding: 12px 16px;">
                            <input type="number" step="0.01" min="0" name="currencies[{{ $c->id }}][country_markup]" value="{{ number_format((float)$c->country_markup, 2, '.', '') }}" class="admin-input" style="width: 110px; padding: 6px 8px;">
                        </td>
                        <td style="padding: 12px 16px; font-weight: 600;">
                            {{ $c->currency_symbol }} {{ number_format($c->convertFromInr(100000), 2) }}
                        </td>
                        <td style="padding: 12px 16px; font-size: 11.5px; color: var(--admin-text-muted);">
                            <div>Date: {{ $c->rate_date ? $c->rate_date->format('Y-m-d') : '—' }}</div>
                            <div>Synced: {{ $c->last_synced_at ? $c->last_synced_at->timezone('Asia/Kolkata')->format('d M, H:i') : 'Never' }}</div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add New Storefront Currency -->
    <div class="admin-card" style="padding: 18px 20px;">
        <div style="font-size: 13.5px; font-weight: 600; margin-bottom: 12px;">Add Another Storefront Currency (Optional)</div>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;">
            <div>
                <label style="display: block; font-size: 11px; margin-bottom: 4px;">Code (e.g. JPY)</label>
                <input type="text" name="new_currency_code" maxlength="5" placeholder="NZD" class="admin-input" style="width: 90px; padding: 7px 10px; text-transform: uppercase;">
            </div>
            <div>
                <label style="display: block; font-size: 11px; margin-bottom: 4px;">Name</label>
                <input type="text" name="new_currency_name" placeholder="New Zealand Dollar" class="admin-input" style="width: 170px; padding: 7px 10px;">
            </div>
            <div>
                <label style="display: block; font-size: 11px; margin-bottom: 4px;">Symbol</label>
                <input type="text" name="new_currency_symbol" placeholder="NZ$" class="admin-input" style="width: 80px; padding: 7px 10px;">
            </div>
            <div>
                <label style="display: block; font-size: 11px; margin-bottom: 4px;">Country</label>
                <input type="text" name="new_country_name" placeholder="New Zealand" class="admin-input" style="width: 150px; padding: 7px 10px;">
            </div>
            <div>
                <label style="display: block; font-size: 11px; margin-bottom: 4px;">Country Markup</label>
                <input type="number" step="0.01" min="0" name="new_country_markup" value="0.00" class="admin-input" style="width: 110px; padding: 7px 10px;">
            </div>
            <button type="submit" class="admin-btn-gold" style="padding: 8px 16px; cursor: pointer;">Add &amp; Save</button>
        </div>
    </div>
</form>
@endsection
