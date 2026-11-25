@extends('layouts.admin')

@section('title', 'Live Gold & Silver Spot Rates')

@section('content')
@php
  $goldCap = $rates['gold_cap'] ?? 145000.0;
  $silverCap = $rates['silver_cap'] ?? 210000.0;
  $liveGoldRate = $rates['live_gold_rate'] ?? ($liveData['gold_24kt_per_10g'] ?? 142678.0);
  $liveSilverRate = $rates['live_silver_rate'] ?? ($liveData['silver_per_kg'] ?? 208000.0);
  $manualGoldRate = $settings['manual_gold_rate'] ?? ($rates['manual_gold_rate'] ?? $liveGoldRate);
  $manualSilverRate = $settings['manual_silver_rate'] ?? ($rates['manual_silver_rate'] ?? $liveSilverRate);
  $goldRateMode = $settings['gold_rate_mode'] ?? 'live';
  $silverRateMode = $settings['silver_rate_mode'] ?? 'live';
  $goldStepGap = $settings['gold_step_gap'] ?? 5000;
  $silverStepGap = $settings['silver_step_gap'] ?? 10000;

  $base22kGram = $rates['gold_22kt_rate_per_gram'] ?? round(($goldCap * 0.916) / 10.0, 2);
  $gold18kGram = $rates['gold_18kt_rate_per_gram'] ?? round(($goldCap * 0.750) / 10.0, 2);
  $gold14kGram = $rates['gold_14kt_rate_per_gram'] ?? round(($goldCap * 0.585) / 10.0, 2);
  $silver925Gram = $rates['silver_925_per_gram'] ?? round(($silverCap * 0.925) / 1000.0, 2);

  $streamItems = $liveData['stream_items'] ?? [];
  $goldRow = $liveData['gold_row'] ?? null;
  $silverRow = $liveData['silver_row'] ?? null;
@endphp

<div style="display: flex; flex-direction: column; gap: 24px; max-width: 1400px; margin: 0 auto; padding-bottom: 60px;">

  <!-- ==================== HEADER BAR WITH LIVE STATUS ==================== -->
  <div style="background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 16px; padding: 22px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
    <div>
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
        <span class="live-pulse-badge">
          <span class="live-pulse-dot"></span>
          LIVE FEED
        </span>
        <h1 style="font-size: 22px; font-weight: 800; color: var(--admin-text-primary); margin: 0; letter-spacing: -0.01em;">
          Live Gold &amp; Silver Spot Rates
        </h1>
      </div>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
        <span>Real-time streaming prices synchronized directly with</span>
        <a href="https://aaravbullion.in" target="_blank" rel="noopener noreferrer" style="color: #B8860B; font-weight: 700; text-decoration: none; border-bottom: 1px dotted #B8860B;">aaravbullion.in</a>
        <span>&amp;</span>
        <a href="https://www.aaravbullionspot.com" target="_blank" rel="noopener noreferrer" style="color: #B8860B; font-weight: 700; text-decoration: none; border-bottom: 1px dotted #B8860B;">aaravbullionspot.com</a>
        <span style="color: var(--admin-text-muted);">• Dynamic catalog pricing driver</span>
      </p>
    </div>

    <!-- Right Telemetry Status -->
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <div style="background: var(--admin-surface-elevated); border: 1px solid var(--admin-border); padding: 8px 14px; border-radius: 10px; text-align: right;">
        <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--admin-text-secondary);">
          Indian Standard Time (IST)
        </div>
        <div id="ist_clock_display" style="font-size: 14px; font-weight: 800; color: var(--admin-text-primary); font-family: monospace;">
          {{ now()->timezone('Asia/Kolkata')->format('h:i:s A') }} IST
        </div>
      </div>

      <div style="background: var(--admin-surface-elevated); border: 1px solid var(--admin-border); padding: 8px 14px; border-radius: 10px; display: flex; align-items: center; gap: 8px;">
        <span id="connection_pill" style="display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; color: #10B981;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;"></span>
          <span id="connection_status_text">STREAM CONNECTED</span>
        </span>
        <span style="color: var(--admin-border);">|</span>
        <span id="last_tick_time" style="font-size: 11.5px; color: var(--admin-text-secondary); font-family: monospace;">
          Tick: Just now
        </span>
      </div>

      <button id="manual_sync_btn" type="button" onclick="triggerManualSync()" class="admin-btn-secondary" style="height: 38px; padding: 0 14px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
        <svg id="sync_icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        <span>Sync Tick</span>
      </button>
    </div>
  </div>

  <!-- ==================== AARAV BULLION LIVE STREAM FEED TABLE ==================== -->
  <div class="admin-card" style="padding: 24px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 18px;">
      <div>
        <h3 style="font-size: 17px; font-weight: 800; color: var(--admin-text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
          <span>Aarav Bullion Live Broadcast Stream</span>
          <span class="admin-badge admin-badge-success" style="font-size: 10px;">AUTO-REFRESHING 3s</span>
        </h3>
      </div>

      <!-- Quick Filter Pills -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" onclick="filterStreamTable('all')" class="stream-filter-btn active" data-filter="all">All Items</button>
        <button type="button" onclick="filterStreamTable('gold')" class="stream-filter-btn" data-filter="gold">Gold 999</button>
        <button type="button" onclick="filterStreamTable('silver')" class="stream-filter-btn" data-filter="silver">Silver</button>
      </div>
    </div>

    <!-- Table Container -->
    <div style="overflow-x: auto; border: 1px solid var(--admin-border); border-radius: 12px;">
      <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
        <thead>
          <tr style="background: var(--admin-surface-elevated); border-bottom: 1px solid var(--admin-border);">
            <th style="padding: 12px 16px; font-weight: 700; color: var(--admin-text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Commodity Name</th>
            <th style="padding: 12px 16px; font-weight: 700; color: var(--admin-text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Row ID</th>
            <th style="padding: 12px 16px; font-weight: 700; color: var(--admin-text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Unit</th>
            <th style="padding: 12px 16px; font-weight: 700; color: var(--admin-text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Bid Rate</th>
            <th style="padding: 12px 16px; font-weight: 700; color: var(--admin-text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Ask Rate</th>
            <th style="padding: 12px 16px; font-weight: 700; color: var(--admin-text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Day High</th>
            <th style="padding: 12px 16px; font-weight: 700; color: var(--admin-text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Day Low</th>
            <th style="padding: 12px 16px; font-weight: 700; color: var(--admin-text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; text-align: center;">Feed Status</th>
          </tr>
        </thead>
        <tbody id="stream_table_body">
          @forelse($streamItems as $item)
            @if(in_array($item['id'], ['2124', '2126', '2125']) || in_array($item['category'] ?? '', ['international', 'forex']) || stripos($item['name'], 'GOLD COST') !== false)
              @continue
            @endif
            @php
              $isBenchmarkGold = in_array($item['id'], ['2148', '2252', '2129']);
              $isBenchmarkSilver = in_array($item['id'], ['2259', '2174']);
              $sym = '₹';
            @endphp
            <tr id="stream_row_{{ $item['id'] }}" data-category="{{ $item['category'] ?? 'gold' }}" style="border-bottom: 1px solid var(--admin-border); transition: background 0.3s;">
              <td style="padding: 12px 16px; font-weight: 700; color: var(--admin-text-primary);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>{{ $item['name'] }}</span>
                  @if($isBenchmarkGold)
                    <span class="admin-badge" style="background: rgba(212,175,55,0.15); color: #B8860B; font-size: 9.5px; padding: 2px 6px;">GOLD 24K BENCHMARK</span>
                  @elseif($isBenchmarkSilver)
                    <span class="admin-badge" style="background: rgba(100,116,139,0.15); color: #64748B; font-size: 9.5px; padding: 2px 6px;">SILVER BENCHMARK</span>
                  @endif
                </div>
              </td>
              <td style="padding: 12px 16px; font-family: monospace; color: var(--admin-text-secondary); font-size: 12px;">
                #{{ $item['id'] }}
              </td>
              <td style="padding: 12px 16px; color: var(--admin-text-secondary);">
                {{ $item['unit'] ?? '10 Grams' }}
              </td>
              <td id="stream_bid_{{ $item['id'] }}" class="stream-price-cell" style="padding: 12px 16px; font-weight: 800; color: var(--admin-text-primary); font-family: monospace; font-size: 14px;">
                {{ $sym }}{{ number_format($item['bid'], 2) }}
              </td>
              <td id="stream_ask_{{ $item['id'] }}" style="padding: 12px 16px; font-weight: 600; color: var(--admin-text-secondary); font-family: monospace; font-size: 14px;">
                {{ $sym }}{{ number_format($item['ask'], 2) }}
              </td>
              <td id="stream_high_{{ $item['id'] }}" style="padding: 12px 16px; color: #10B981; font-weight: 600; font-family: monospace;">
                {{ $sym }}{{ number_format($item['high'], 2) }}
              </td>
              <td id="stream_low_{{ $item['id'] }}" style="padding: 12px 16px; color: #EF4444; font-weight: 600; font-family: monospace;">
                {{ $sym }}{{ number_format($item['low'], 2) }}
              </td>
              <td style="padding: 12px 16px; text-align: center;">
                <span class="admin-badge admin-badge-success" style="font-size: 10px; display: inline-flex; align-items: center; gap: 4px;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background: #10B981;"></span>
                  LIVE
                </span>
              </td>
            </tr>
          @empty
            <tr>
              <td colspan="8" style="padding: 32px; text-align: center; color: var(--admin-text-secondary);">
                Connecting to Aarav Bullion live stream feed...
              </td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>
  </div>

  <!-- ==================== SPREADSHEET PRICE SYSTEM ENGINE ==================== -->
  <div class="admin-card" style="padding: 24px 28px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border); box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; border-bottom: 1px solid var(--admin-border); padding-bottom: 16px;">
      <div>
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #B8860B; margin-bottom: 4px;">
          PINTAARA FORMULA PRICING SYSTEM
        </div>
        <h2 style="font-size: 20px; font-weight: 800; color: var(--admin-text-primary); margin: 0;">
          Gold &amp; Silver Rate Driver (Ceiling CAP Engine)
        </h2>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span class="admin-badge admin-badge-success" style="font-size: 11px; padding: 6px 12px;">
          ✓ LIVE STORE DRIVER ACTIVE
        </span>
      </div>
    </div>

    <form id="rate_engine_form" onsubmit="handleSaveRateEngine(event)">
      @csrf

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(460px, 1fr)); gap: 24px;">

        <!-- LEFT: GOLD RATE -->
        <div style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #FFFFFF;">
          <div style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between;">
            <div style="font-size: 13.5px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #D4AF37;"></span>
              GOLD RATE (24KT / 10G)
            </div>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 600;">
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: {{ $goldRateMode === 'live' ? '#B8860B' : '#64748B' }};">
                <input type="radio" name="gold_rate_mode" value="live" {{ $goldRateMode === 'live' ? 'checked' : '' }} onchange="recalculateEngine()">
                Live Stream
              </label>
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: {{ $goldRateMode === 'manual' ? '#B8860B' : '#64748B' }};">
                <input type="radio" name="gold_rate_mode" value="manual" {{ $goldRateMode === 'manual' ? 'checked' : '' }} onchange="recalculateEngine()">
                Manual Entry
              </label>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tbody>
              <!-- Live Gold Rate -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 12px 18px; font-weight: 600; color: #475569; width: 45%;">Live Gold Rate</td>
                <td style="padding: 12px 18px; font-weight: 800; font-family: monospace; font-size: 15px; color: #0F172A;">
                  <span id="live_gold_rate_display">{{ number_format($liveGoldRate, 0, '', '') }}</span>
                  <input type="hidden" id="live_gold_rate_val" value="{{ $liveGoldRate }}">
                </td>
              </tr>

              <!-- Manual Entry -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 12px 18px; font-weight: 600; color: #475569;">Manual Entry</td>
                <td style="padding: 8px 18px;">
                  <input type="number" step="1" name="manual_gold_rate" id="manual_gold_rate_input" value="{{ $manualGoldRate }}" oninput="recalculateEngine()" class="admin-input" style="font-weight: 800; font-family: monospace; font-size: 14px; padding: 6px 12px; width: 100%;">
                </td>
              </tr>

              <!-- Ceiling Formula Header (Pink/Coral background) -->
              <tr style="background: #FCA5A5; border-bottom: 1px solid #F87171;">
                <td colspan="2" style="padding: 8px 18px; font-size: 12px; font-weight: 700; color: #7F1D1D; text-align: center; font-family: monospace;">
                  CEILING(Active Gold Rate, <input type="number" step="500" name="gold_step_gap" id="gold_step_gap_input" value="{{ $goldStepGap }}" oninput="recalculateEngine()" style="width: 70px; display: inline-block; padding: 2px 6px; font-weight: 800; font-size: 12px; border: 1px solid #DC2626; border-radius: 4px; text-align: center; background: #FEF2F2;">)
                </td>
              </tr>

              <!-- Gold Rate CAP -->
              <tr style="background: #FFF1F2; border-bottom: 2px solid #FECDD3;">
                <td style="padding: 14px 18px; font-weight: 800; font-size: 14px; color: #9F1239;">Gold Rate CAP</td>
                <td style="padding: 14px 18px; font-weight: 900; font-family: monospace; font-size: 18px; color: #9F1239;">
                  <span id="gold_cap_display">{{ number_format($goldCap, 0, '', '') }}</span>
                </td>
              </tr>

              <!-- Formula (B6 x 91.6%) / 10 Header (Pink/Coral background) -->
              <tr style="background: #FCA5A5; border-bottom: 1px solid #F87171;">
                <td colspan="2" style="padding: 8px 18px; font-size: 12px; font-weight: 700; color: #7F1D1D; text-align: center; font-family: monospace;">
                  (Gold Rate CAP × Purity%) ÷ 10
                </td>
              </tr>

              <!-- 22KT (91.6%) / G (Cyan background) -->
              <tr style="background: #A5F3FC; border-bottom: 1px solid #67E8F9;">
                <td style="padding: 12px 18px; font-weight: 700; color: #0E7490;">22KT (91.6%) / G</td>
                <td style="padding: 12px 18px; font-weight: 900; font-family: monospace; font-size: 16px; color: #083344;">
                  ₹<span id="gold_22kt_g_display">{{ number_format($base22kGram, 2) }}</span>
                </td>
              </tr>

              <!-- 18KT (75%) / G (Cyan background) -->
              <tr style="background: #A5F3FC; border-bottom: 1px solid #67E8F9;">
                <td style="padding: 12px 18px; font-weight: 700; color: #0E7490;">18KT (75%) / G</td>
                <td style="padding: 12px 18px; font-weight: 900; font-family: monospace; font-size: 16px; color: #083344;">
                  ₹<span id="gold_18kt_g_display">{{ number_format($gold18kGram, 2) }}</span>
                </td>
              </tr>

              <!-- 14KT (58.5%) / G (Cyan background) -->
              <tr style="background: #A5F3FC;">
                <td style="padding: 12px 18px; font-weight: 700; color: #0E7490;">14KT (58.5%) / G</td>
                <td style="padding: 12px 18px; font-weight: 900; font-family: monospace; font-size: 16px; color: #083344;">
                  ₹<span id="gold_14kt_g_display">{{ number_format($gold14kGram, 2) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- RIGHT: SILVER RATE -->
        <div style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #FFFFFF;">
          <div style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between;">
            <div style="font-size: 13.5px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #94A3B8;"></span>
              SILVER RATE (999 / 1 KG)
            </div>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 600;">
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: {{ $silverRateMode === 'live' ? '#2563EB' : '#64748B' }};">
                <input type="radio" name="silver_rate_mode" value="live" {{ $silverRateMode === 'live' ? 'checked' : '' }} onchange="recalculateEngine()">
                Live Stream
              </label>
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: {{ $silverRateMode === 'manual' ? '#2563EB' : '#64748B' }};">
                <input type="radio" name="silver_rate_mode" value="manual" {{ $silverRateMode === 'manual' ? 'checked' : '' }} onchange="recalculateEngine()">
                Manual Entry
              </label>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tbody>
              <!-- Live Silver Rate -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 12px 18px; font-weight: 600; color: #475569; width: 45%;">Live Silver Rate</td>
                <td style="padding: 12px 18px; font-weight: 800; font-family: monospace; font-size: 15px; color: #0F172A;">
                  <span id="live_silver_rate_display">{{ number_format($liveSilverRate, 0, '', '') }}</span>
                  <input type="hidden" id="live_silver_rate_val" value="{{ $liveSilverRate }}">
                </td>
              </tr>

              <!-- Manual Entry -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 12px 18px; font-weight: 600; color: #475569;">Manual Entry</td>
                <td style="padding: 8px 18px;">
                  <input type="number" step="1" name="manual_silver_rate" id="manual_silver_rate_input" value="{{ $manualSilverRate }}" oninput="recalculateEngine()" class="admin-input" style="font-weight: 800; font-family: monospace; font-size: 14px; padding: 6px 12px; width: 100%;">
                </td>
              </tr>

              <!-- Ceiling Formula Header (Pink/Coral background) -->
              <tr style="background: #FCA5A5; border-bottom: 1px solid #F87171;">
                <td colspan="2" style="padding: 8px 18px; font-size: 12px; font-weight: 700; color: #7F1D1D; text-align: center; font-family: monospace;">
                  CEILING(Active Silver Rate, <input type="number" step="1000" name="silver_step_gap" id="silver_step_gap_input" value="{{ $silverStepGap }}" oninput="recalculateEngine()" style="width: 75px; display: inline-block; padding: 2px 6px; font-weight: 800; font-size: 12px; border: 1px solid #DC2626; border-radius: 4px; text-align: center; background: #FEF2F2;">)
                </td>
              </tr>

              <!-- Silver Rate CAP -->
              <tr style="background: #FFF1F2; border-bottom: 2px solid #FECDD3;">
                <td style="padding: 14px 18px; font-weight: 800; font-size: 14px; color: #9F1239;">Silver Rate CAP</td>
                <td style="padding: 14px 18px; font-weight: 900; font-family: monospace; font-size: 18px; color: #9F1239;">
                  <span id="silver_cap_display">{{ number_format($silverCap, 0, '', '') }}</span>
                </td>
              </tr>

              <!-- Formula (E6 x 92.5%) / 1000 Header (Pink/Coral background) -->
              <tr style="background: #FCA5A5; border-bottom: 1px solid #F87171;">
                <td colspan="2" style="padding: 8px 18px; font-size: 12px; font-weight: 700; color: #7F1D1D; text-align: center; font-family: monospace;">
                  (Silver Rate CAP × 92.5%) ÷ 1000
                </td>
              </tr>

              <!-- 92.5% / G (Yellow background) -->
              <tr style="background: #FEF08A; border-bottom: 1px solid #FDE047;">
                <td style="padding: 12px 18px; font-weight: 700; color: #854D0E;">92.5% / G</td>
                <td style="padding: 12px 18px; font-weight: 900; font-family: monospace; font-size: 16px; color: #713F12;">
                  ₹<span id="silver_925_g_display">{{ number_format($silver925Gram, 2) }}</span>
                </td>
              </tr>

              <!-- Pure Silver 999 / G (Soft Gray) -->
              <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 12px 18px; font-weight: 600; color: #64748B;">Pure 999 / G</td>
                <td style="padding: 12px 18px; font-weight: 700; font-family: monospace; font-size: 14px; color: #334155;">
                  ₹<span id="silver_999_g_display">{{ number_format($silverCap / 1000.0, 2) }}</span>
                </td>
              </tr>

              <!-- Filler Row to match height -->
              <tr style="background: #FFFFFF;">
                <td colspan="2" style="padding: 15px 18px; color: transparent;">-</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- Action Bar -->
      <div style="margin-top: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 20px;">
        <div id="rate_engine_status" style="font-size: 13px; font-weight: 700; color: #0F172A; display: flex; align-items: center; gap: 8px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981;"></span>
          <span id="engine_status_text">Storefront Active: 22K @ ₹<span id="summary_22k">{{ number_format($base22kGram, 2) }}</span>/g • 18K @ ₹<span id="summary_18k">{{ number_format($gold18kGram, 2) }}</span>/g • 14K @ ₹<span id="summary_14k">{{ number_format($gold14kGram, 2) }}</span>/g • 925 Silver @ ₹<span id="summary_925">{{ number_format($silver925Gram, 2) }}</span>/g</span>
        </div>

        <button type="submit" id="btn_save_rate_engine" class="admin-btn-primary" style="padding: 11px 26px; font-size: 13px; font-weight: 800; background: #0F172A; border-color: #0F172A;">
          Save &amp; Apply Rates to Store
        </button>
      </div>

    </form>
  </div>

  <!-- ==================== TWO COLUMNS: PURITY MATRIX & MANUAL OVERRIDE ==================== -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 24px;">

    <!-- Active Metal Purity Matrix -->
    <div class="admin-card" style="padding: 24px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <h3 style="font-size: 16px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 16px 0;">
        Active Catalog Purity Matrix
      </h3>

      <div style="border: 1px solid var(--admin-border); border-radius: 10px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
          <thead>
            <tr style="background: var(--admin-surface-elevated); border-bottom: 1px solid var(--admin-border); text-align: left;">
              <th style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-secondary);">Purity Tier</th>
              <th style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-secondary);">Assay Fraction</th>
              <th style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-secondary);">Live Spot (10g)</th>
              <th style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-secondary);">Rate with BRACKET GAP (10g)</th>
              <th style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-secondary);">Per Gram Rate with BRACKET GAP</th>
            </tr>
          </thead>
          <tbody id="purity_matrix_body">
            @if(!empty($rates['purities']))
              @foreach($rates['purities'] as $p)
                @php
                  $raw10g = $p['raw_market_10g'] ?? (
                    $p['type'] === 'gold' 
                      ? round(($liveData['gold_24kt_per_10g'] ?? 146713) * $p['purity_fraction'], 2)
                      : round(($liveData['silver_per_10g'] ?? 1923.53) * $p['purity_fraction'], 2)
                  );
                  $stepped10g = $p['rate_with_gap_10g'] ?? $p['rate_per_10g'];
                @endphp
                <tr id="purity_row_{{ $p['id'] }}" style="border-bottom: 1px solid var(--admin-border);">
                  <td style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">
                    {{ $p['name'] }} ({{ ucfirst($p['type']) }})
                  </td>
                  <td style="padding: 10px 14px; color: var(--admin-text-secondary);">
                    {{ number_format($p['purity_fraction'], 3) }}
                  </td>
                  <td id="purity_raw_{{ $p['id'] }}" style="padding: 10px 14px; color: var(--admin-text-secondary);">
                    <div>₹{{ number_format($raw10g, 2) }}</div>
                    <div style="font-size: 11px; color: var(--admin-text-muted);">₹{{ number_format($raw10g / 10, 2) }} / g</div>
                  </td>
                  <td id="purity_gap_{{ $p['id'] }}" style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">
                    ₹{{ number_format($stepped10g, 2) }}
                  </td>
                  <td id="purity_gram_{{ $p['id'] }}" style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">
                    ₹{{ number_format($p['rate_per_gram'], 2) }}
                  </td>
                </tr>
              @endforeach
            @else
              @php
                $stepped24k10 = $pure24k10g;
                $stepped22k10 = $base22k10g;
                $raw24k10 = $liveData['gold_24kt_per_10g'] ?? $pure24k10g;
                $raw22k10 = round($raw24k10 * 0.916, 2);
              @endphp
              <tr style="border-bottom: 1px solid var(--admin-border);">
                <td style="padding: 10px 14px; font-weight: 700;">22KT Gold</td>
                <td style="padding: 10px 14px; color: var(--admin-text-secondary);">0.916</td>
                <td style="padding: 10px 14px; color: var(--admin-text-secondary);">₹{{ number_format($raw22k10, 2) }}</td>
                <td style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">₹{{ number_format($stepped22k10, 2) }}</td>
                <td style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">₹{{ number_format($base22kGram, 2) }}</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--admin-border);">
                <td style="padding: 10px 14px; font-weight: 700;">18KT Gold</td>
                <td style="padding: 10px 14px; color: var(--admin-text-secondary);">0.750</td>
                <td style="padding: 10px 14px; color: var(--admin-text-secondary);">₹{{ number_format($raw24k10 * 0.750, 2) }}</td>
                <td style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">₹{{ number_format($stepped24k10 * 0.750, 2) }}</td>
                <td style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">₹{{ number_format($gold18kGram, 2) }}</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--admin-border);">
                <td style="padding: 10px 14px; font-weight: 700;">14KT Gold</td>
                <td style="padding: 10px 14px; color: var(--admin-text-secondary);">0.585</td>
                <td style="padding: 10px 14px; color: var(--admin-text-secondary);">₹{{ number_format($raw24k10 * 0.585, 2) }}</td>
                <td style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">₹{{ number_format($stepped24k10 * 0.585, 2) }}</td>
                <td style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">₹{{ number_format($gold14kGram, 2) }}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-weight: 700;">925 Silver</td>
                <td style="padding: 10px 14px; color: var(--admin-text-secondary);">0.925</td>
                <td style="padding: 10px 14px; color: var(--admin-text-secondary);">₹{{ number_format(($liveData['silver_per_10g'] ?? 1923.53) * 0.925, 2) }}</td>
                <td style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">₹{{ number_format($silver10g, 2) }}</td>
                <td style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">₹{{ number_format($silver925Gram, 2) }}</td>
              </tr>
            @endif
          </tbody>
        </table>
      </div>
    </div>

    <!-- Live Calculator & Manual Rate Override -->
    <div class="admin-card" style="padding: 24px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <h3 style="font-size: 16px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 14px 0;">
        Manual Benchmark Rate Fallback
      </h3>
      <p style="font-size: 12.5px; color: var(--admin-text-secondary); margin: 0 0 16px 0;">
        Used as emergency fallback if the Aarav Bullion live stream feed is temporarily unavailable.
      </p>

      <form action="{{ route('admin.gold-rates.update') }}" method="POST" style="display: flex; flex-direction: column; gap: 16px;">
        @csrf
        <div>
          <label class="admin-label">Gold 22KT Rate (₹ per 10 grams)</label>
          <input type="number" step="0.01" name="gold_22k_per_10g" value="{{ $base22k10g }}" required class="admin-input">
        </div>
        <div>
          <label class="admin-label">Silver Rate (₹ per 10 grams)</label>
          <input type="number" step="0.01" name="silver_per_10g" value="{{ $silver10g }}" class="admin-input">
        </div>
        <button type="submit" class="admin-btn-primary" style="justify-content: center; padding: 11px;">
          Save Manual Benchmark
        </button>
      </form>
    </div>

  </div>

  <!-- ==================== PRICE MOVEMENT (UP / DOWN) LOG TABLE ==================== -->
  <div class="admin-card" style="padding: 24px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
      <div>
        <h3 style="font-size: 16px; font-weight: 800; color: var(--admin-text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
          <span>Price Audit Log</span>
          <span class="admin-badge admin-badge-success" style="font-size: 10px;">AUTO-RECORDING</span>
        </h3>
        <p style="font-size: 12.5px; color: var(--admin-text-secondary); margin: 4px 0 0 0;">
          Audit trail tracking every time the store pricing system steps UP (▲) or DOWN (▼) as live spot crosses bracket boundaries.
        </p>
      </div>
      <div style="font-size: 11.5px; color: var(--admin-text-muted);">
        Showing latest movements
      </div>
    </div>

    <div style="overflow-x: auto; border: 1px solid var(--admin-border); border-radius: 12px;">
      <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12.5px;">
        <thead>
          <tr style="background: var(--admin-surface-elevated); border-bottom: 1px solid var(--admin-border);">
            <th style="padding: 11px 14px; font-weight: 700; color: var(--admin-text-secondary);">Date / Time</th>
            <th style="padding: 11px 14px; font-weight: 700; color: var(--admin-text-secondary);">Movement</th>
            <th style="padding: 11px 14px; font-weight: 700; color: var(--admin-text-secondary);">Metal &amp; Purity</th>
            <th style="padding: 11px 14px; font-weight: 700; color: var(--admin-text-secondary);">Previous Rate (10g)</th>
            <th style="padding: 11px 14px; font-weight: 700; color: var(--admin-text-secondary);">New Rate (10g)</th>
            <th style="padding: 11px 14px; font-weight: 700; color: var(--admin-text-secondary);">Live Spot at Tick</th>
            <th style="padding: 11px 14px; font-weight: 700; color: var(--admin-text-secondary);">Trigger Reason</th>
          </tr>
        </thead>
        <tbody id="movement_log_tbody">
          @forelse($movementLogs ?? [] as $log)
            <tr style="border-bottom: 1px solid var(--admin-border);">
              <td style="padding: 11px 14px; color: var(--admin-text-secondary); white-space: nowrap;">
                {{ $log->created_at->setTimezone('Asia/Kolkata')->format('d M, Y h:i:s A') }}
              </td>
              <td style="padding: 11px 14px; white-space: nowrap;">
                @if($log->direction === 'up')
                  <span class="admin-badge admin-badge-success" style="font-size: 11px; font-weight: 800; padding: 3px 8px; display: inline-flex; align-items: center; gap: 4px;">
                    ▲ STEPPED UP (+₹{{ number_format(abs($log->difference_10g)) }})
                  </span>
                @elseif($log->direction === 'down')
                  <span class="admin-badge admin-badge-danger" style="font-size: 11px; font-weight: 800; padding: 3px 8px; display: inline-flex; align-items: center; gap: 4px;">
                    ▼ STEPPED DOWN (-₹{{ number_format(abs($log->difference_10g)) }})
                  </span>
                @else
                  <span class="admin-badge" style="font-size: 11px; font-weight: 700; padding: 3px 8px;">
                    ● BASELINE
                  </span>
                @endif
              </td>
              <td style="padding: 11px 14px; font-weight: 700; color: var(--admin-text-primary);">
                {{ $log->purity }}
              </td>
              <td style="padding: 11px 14px; color: var(--admin-text-secondary);">
                <div>₹{{ number_format($log->old_rate_per_10g, 2) }}</div>
                @if($log->old_rate_per_gram > 0)
                  <div style="font-size: 10.5px; color: var(--admin-text-muted);">₹{{ number_format($log->old_rate_per_gram, 2) }}/g</div>
                @endif
              </td>
              <td style="padding: 11px 14px; font-weight: 700; color: var(--admin-text-primary);">
                <div>₹{{ number_format($log->new_rate_per_10g, 2) }}</div>
                @if($log->new_rate_per_gram > 0)
                  <div style="font-size: 10.5px; color: var(--admin-text-muted);">₹{{ number_format($log->new_rate_per_gram, 2) }}/g</div>
                @endif
              </td>
              <td style="padding: 11px 14px; color: var(--admin-text-secondary);">
                {{ $log->market_spot_10g ? '₹' . number_format($log->market_spot_10g, 2) : '—' }}
              </td>
              <td style="padding: 11px 14px; color: var(--admin-text-secondary); font-size: 11.5px; line-height: 1.4;">
                {{ $log->reason }}
              </td>
            </tr>
          @empty
            <tr>
              <td colspan="7" style="padding: 28px; text-align: center; color: var(--admin-text-secondary);">
                No price step transitions recorded yet. Live movements will log here automatically.
              </td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>
  </div>

</div>

<!-- STYLES FOR STEP BRACKET GAP BUTTONS, TICKS & PULSE -->
<style>
  .live-pulse-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(16, 185, 129, 0.12);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.3);
    padding: 3px 8px;
    border-radius: 9999px;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.05em;
  }
  .live-pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10B981;
    box-shadow: 0 0 0 rgba(16, 185, 129, 0.7);
    animation: livePulseAnim 2s infinite;
  }
  @keyframes livePulseAnim {
    0% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    }
    70% {
      box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
  }

  .stream-filter-btn {
    background: var(--admin-surface-elevated);
    border: 1px solid var(--admin-border);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--admin-text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }
  .stream-filter-btn.active {
    background: var(--admin-surface);
    color: var(--admin-text-primary);
    border-color: #B8860B;
    box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  }

  /* Tick Flashing Animation for Live Cells */
  .tick-up {
    background-color: rgba(16, 185, 129, 0.25) !important;
    color: #047857 !important;
    transition: background-color 0.15s ease-in, color 0.15s ease-in;
  }
  .tick-down {
    background-color: rgba(239, 68, 68, 0.25) !important;
    color: #B91C1C !important;
    transition: background-color 0.15s ease-in, color 0.15s ease-in;
  }
  .spin-anim {
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
</style>

<!-- CLIENT-SIDE LIVE POLLING & PRICING RULES JAVASCRIPT -->
<script>
  let previousPrices = {};
  let pollInterval = null;

  // 1. Digital IST Clock
  function updateClock() {
    const clockEl = document.getElementById('ist_clock_display');
    if (!clockEl) return;
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' IST';
  }
  setInterval(updateClock, 1000);
  updateClock();

  // 2. Format Currency (INR)
  function formatINR(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val)) return '0.00';
    return Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // 3. Highlight Element on Tick
  function flashTick(el, type) {
    if (!el) return;
    el.classList.remove('tick-up', 'tick-down');
    void el.offsetWidth; // force DOM reflow
    el.classList.add(type === 'up' ? 'tick-up' : 'tick-down');
    setTimeout(() => {
      el.classList.remove('tick-up', 'tick-down');
    }, 1200);
  }

  // 4. Real-Time Spreadsheet Rate Engine Recalculation
  function recalculateEngine() {
    const goldMode = document.querySelector('input[name="gold_rate_mode"]:checked')?.value || 'live';
    const silverMode = document.querySelector('input[name="silver_rate_mode"]:checked')?.value || 'live';

    const liveGold = Number(document.getElementById('live_gold_rate_val')?.value || 142678);
    const manualGold = Number(document.getElementById('manual_gold_rate_input')?.value || 142678);
    const goldGap = Number(document.getElementById('gold_step_gap_input')?.value || 5000);

    const activeGold = (goldMode === 'manual' && manualGold > 0) ? manualGold : liveGold;
    const goldCap = (goldGap > 0) ? (Math.ceil(activeGold / goldGap) * goldGap) : activeGold;

    // Formulas: (Gold Rate CAP * purity%) / 10
    const rate22k = Math.round(((goldCap * 0.916) / 10) * 100) / 100;
    const rate18k = Math.round(((goldCap * 0.750) / 10) * 100) / 100;
    const rate14k = Math.round(((goldCap * 0.585) / 10) * 100) / 100;

    const liveSilver = Number(document.getElementById('live_silver_rate_val')?.value || 208000);
    const manualSilver = Number(document.getElementById('manual_silver_rate_input')?.value || 208000);
    const silverGap = Number(document.getElementById('silver_step_gap_input')?.value || 10000);

    const activeSilver = (silverMode === 'manual' && manualSilver > 0) ? manualSilver : liveSilver;
    const silverCap = (silverGap > 0) ? (Math.ceil(activeSilver / silverGap) * silverGap) : activeSilver;

    // Formula: (Silver Rate CAP * 92.5%) / 1000
    const rate925 = Math.round(((silverCap * 0.925) / 1000) * 100) / 100;
    const rate999 = Math.round((silverCap / 1000) * 100) / 100;

    // Update DOM displays
    const gCapEl = document.getElementById('gold_cap_display');
    const r22El = document.getElementById('gold_22kt_g_display');
    const r18El = document.getElementById('gold_18kt_g_display');
    const r14El = document.getElementById('gold_14kt_g_display');

    if (gCapEl) gCapEl.textContent = formatINR(goldCap, 0);
    if (r22El) r22El.textContent = formatINR(rate22k, 2);
    if (r18El) r18El.textContent = formatINR(rate18k, 2);
    if (r14El) r14El.textContent = formatINR(rate14k, 2);

    const sCapEl = document.getElementById('silver_cap_display');
    const r925El = document.getElementById('silver_925_g_display');
    const s999El = document.getElementById('silver_999_g_display');

    if (sCapEl) sCapEl.textContent = formatINR(silverCap, 0);
    if (r925El) r925El.textContent = formatINR(rate925, 2);
    if (s999El) s999El.textContent = formatINR(rate999, 2);

    const s22 = document.getElementById('summary_22k');
    const s18 = document.getElementById('summary_18k');
    const s14 = document.getElementById('summary_14k');
    const s925 = document.getElementById('summary_925');

    if (s22) s22.textContent = formatINR(rate22k, 2);
    if (s18) s18.textContent = formatINR(rate18k, 2);
    if (s14) s14.textContent = formatINR(rate14k, 2);
    if (s925) s925.textContent = formatINR(rate925, 2);
  }

  // 5. Save Rate Engine Configuration via AJAX
  async function handleSaveRateEngine(e) {
    if (e && e.preventDefault) e.preventDefault();
    const btn = document.getElementById('btn_save_rate_engine');
    const origText = btn ? btn.textContent : '';

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Saving & Applying...';
      }

      const form = document.getElementById('rate_engine_form');
      const formData = new FormData(form);

      const res = await fetch('{{ route("admin.gold-rates.update") }}', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);

      if (btn) {
        btn.textContent = '✓ Rates Applied Live to Store!';
        btn.style.background = '#10B981';
        btn.style.borderColor = '#10B981';
      }

      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Save & Apply Rates to Store';
          btn.style.background = '#0F172A';
          btn.style.borderColor = '#0F172A';
        }
      }, 2000);

      fetchLiveRates();

    } catch (err) {
      console.error('Save rate engine error:', err);
      alert('Error saving rates. Please try again.');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Save & Apply Rates to Store';
      }
    }
  }

  // 6. Fetch Live Rates Feed from backend
  async function fetchLiveRates() {
    const syncBtn = document.getElementById('manual_sync_btn');
    const syncIcon = document.getElementById('sync_icon');
    const connPill = document.getElementById('connection_pill');
    const connText = document.getElementById('connection_status_text');
    const lastTickEl = document.getElementById('last_tick_time');

    try {
      if (syncIcon) syncIcon.classList.add('spin-anim');

      const response = await fetch('{{ route("admin.gold-rates.feed") }}?realtime=1&_t=' + Date.now(), {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();

      if (data.status === 'success' && data.liveData) {
        const live = data.liveData;
        const rates = data.rates || {};

        if (connPill) connPill.style.color = '#10B981';
        if (connText) connText.textContent = 'STREAM CONNECTED';
        if (lastTickEl) {
          const tickDate = new Date();
          lastTickEl.textContent = 'Tick: ' + tickDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }

        // Live Rate Engine Ticker Update
        if (rates && rates.live_gold_rate) {
          const lGoldEl = document.getElementById('live_gold_rate_display');
          const lGoldVal = document.getElementById('live_gold_rate_val');
          if (lGoldEl) lGoldEl.textContent = formatINR(rates.live_gold_rate, 0);
          if (lGoldVal) lGoldVal.value = rates.live_gold_rate;
        }
        if (rates && rates.live_silver_rate) {
          const lSilvEl = document.getElementById('live_silver_rate_display');
          const lSilvVal = document.getElementById('live_silver_rate_val');
          if (lSilvEl) lSilvEl.textContent = formatINR(rates.live_silver_rate, 0);
          if (lSilvVal) lSilvVal.value = rates.live_silver_rate;
        }
        recalculateEngine();

        // Live Rate Engine Update
        if (rates && rates.live_gold_rate) {
          const lgDisp = document.getElementById('live_gold_rate_display');
          const lgVal = document.getElementById('live_gold_rate_val');
          if (lgDisp) lgDisp.textContent = Math.round(rates.live_gold_rate);
          if (lgVal) lgVal.value = rates.live_gold_rate;
        }
        if (rates && rates.live_silver_rate) {
          const lsDisp = document.getElementById('live_silver_rate_display');
          const lsVal = document.getElementById('live_silver_rate_val');
          if (lsDisp) lsDisp.textContent = Math.round(rates.live_silver_rate);
          if (lsVal) lsVal.value = rates.live_silver_rate;
        }
        recalculateEngine();

        // Stream Items Table Update
        if (Array.isArray(live.stream_items)) {
          live.stream_items.forEach(it => {
            if (it.id == '2124' || it.id == '2126' || it.id == '2125') return;

            const bidCell = document.getElementById('stream_bid_' + it.id);
            const askCell = document.getElementById('stream_ask_' + it.id);
            const highCell = document.getElementById('stream_high_' + it.id);
            const lowCell = document.getElementById('stream_low_' + it.id);

            const sym = '₹';
            const prevBid = previousPrices['stream_' + it.id];
            if (bidCell) {
              if (prevBid !== undefined && prevBid !== it.bid) {
                flashTick(bidCell, it.bid > prevBid ? 'up' : 'down');
              }
              bidCell.textContent = sym + formatINR(it.bid);
            }
            if (askCell) askCell.textContent = sym + formatINR(it.ask);
            if (highCell) highCell.textContent = sym + formatINR(it.high);
            if (lowCell) lowCell.textContent = sym + formatINR(it.low);

            previousPrices['stream_' + it.id] = it.bid;
          });
        }

        // Active Catalog Purity Matrix Real-Time Live Update
        if (rates && Array.isArray(rates.purities)) {
          rates.purities.forEach(p => {
            const rawEl = document.getElementById('purity_raw_' + p.id);
            const gapEl = document.getElementById('purity_gap_' + p.id);
            const gramEl = document.getElementById('purity_gram_' + p.id);

            if (rawEl && p.raw_market_10g !== undefined) {
              const raw10 = parseFloat(p.raw_market_10g);
              rawEl.innerHTML = '<div>₹' + formatINR(raw10) + '</div><div style="font-size: 11px; color: var(--admin-text-muted);">₹' + formatINR(raw10 / 10) + ' / g</div>';
            }
            if (gapEl && (p.rate_with_gap_10g !== undefined || p.rate_per_10g !== undefined)) {
              gapEl.textContent = '₹' + formatINR(p.rate_with_gap_10g || p.rate_per_10g);
            }
            if (gramEl && p.rate_per_gram !== undefined) {
              gramEl.textContent = '₹' + formatINR(p.rate_per_gram);
            }
          });
        }

        // Price Movement Logs Live Sync
        if (Array.isArray(data.movementLogs)) {
          const logTbody = document.getElementById('movement_log_tbody');
          if (logTbody) {
            if (data.movementLogs.length === 0) {
              logTbody.innerHTML = `
                <tr>
                  <td colspan="7" style="padding: 28px; text-align: center; color: var(--admin-text-secondary);">
                    No price step transitions recorded yet. Live movements will log here automatically.
                  </td>
                </tr>
              `;
            } else {
              logTbody.innerHTML = data.movementLogs.map(log => {
                const dateStr = new Date(log.created_at).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                });
                let badgeHtml = '';
                const diffAbs = formatINR(Math.abs(log.difference_10g || 0), 0);
                if (log.direction === 'up') {
                  badgeHtml = `<span class="admin-badge admin-badge-success" style="font-size: 11px; font-weight: 800; padding: 3px 8px; display: inline-flex; align-items: center; gap: 4px;">▲ STEPPED UP (+₹${diffAbs})</span>`;
                } else if (log.direction === 'down') {
                  badgeHtml = `<span class="admin-badge admin-badge-danger" style="font-size: 11px; font-weight: 800; padding: 3px 8px; display: inline-flex; align-items: center; gap: 4px;">▼ STEPPED DOWN (-₹${diffAbs})</span>`;
                } else {
                  badgeHtml = `<span class="admin-badge" style="font-size: 11px; font-weight: 700; padding: 3px 8px;">● BASELINE</span>`;
                }

                return `
                  <tr style="border-bottom: 1px solid var(--admin-border);">
                    <td style="padding: 11px 14px; color: var(--admin-text-secondary); white-space: nowrap;">${dateStr}</td>
                    <td style="padding: 11px 14px; white-space: nowrap;">${badgeHtml}</td>
                    <td style="padding: 11px 14px; font-weight: 700; color: var(--admin-text-primary);">${log.purity || '24KT Gold'}</td>
                    <td style="padding: 11px 14px; color: var(--admin-text-secondary);">
                      <div>₹${formatINR(log.old_rate_per_10g)}</div>
                      ${log.old_rate_per_gram > 0 ? `<div style="font-size: 10.5px; color: var(--admin-text-muted);">₹${formatINR(log.old_rate_per_gram)}/g</div>` : ''}
                    </td>
                    <td style="padding: 11px 14px; font-weight: 700; color: var(--admin-text-primary);">
                      <div>₹${formatINR(log.new_rate_per_10g)}</div>
                      ${log.new_rate_per_gram > 0 ? `<div style="font-size: 10.5px; color: var(--admin-text-muted);">₹${formatINR(log.new_rate_per_gram)}/g</div>` : ''}
                    </td>
                    <td style="padding: 11px 14px; color: var(--admin-text-secondary);">${log.market_spot_10g ? '₹' + formatINR(log.market_spot_10g) : '—'}</td>
                    <td style="padding: 11px 14px; color: var(--admin-text-secondary); font-size: 11.5px; line-height: 1.4;">${log.reason || ''}</td>
                  </tr>
                `;
              }).join('');
            }
          }
        }
      }
    } catch (err) {
      console.warn('[AaravBullion] Live tick poll issue:', err);
      if (connPill) connPill.style.color = '#F59E0B';
      if (connText) connText.textContent = 'SYNC DELAYED';
    } finally {
      if (syncIcon) syncIcon.classList.remove('spin-anim');
    }
  }

  function roundNum(num, dec) {
    return +(Math.round(num + "e+" + dec) + "e-" + dec);
  }

  function triggerManualSync() {
    fetchLiveRates();
  }

  function filterStreamTable(filter) {
    document.querySelectorAll('.stream-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });

    const rows = document.querySelectorAll('#stream_table_body tr');
    rows.forEach(tr => {
      const cat = tr.getAttribute('data-category') || '';
      if (filter === 'all') {
        tr.style.display = '';
      } else if (filter === 'gold') {
        tr.style.display = (cat === 'gold' || cat === 'international') ? '' : 'none';
      } else if (filter === 'silver') {
        tr.style.display = (cat === 'silver') ? '' : 'none';
      }
    });
  }

  // Start Real-Time Live Polling Loop (every 3 seconds)
  pollInterval = setInterval(fetchLiveRates, 3000);
</script>
@endsection
