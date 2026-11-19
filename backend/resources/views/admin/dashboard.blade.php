@extends('layouts.admin')

@section('title', 'PINTAARA Overview')

@section('content')
<div style="display: flex; flex-direction: column; gap: 28px; max-width: 1400px; margin: 0 auto;">

  <!-- Page Title & Subtitle matching the screenshot -->
  <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
    <div>
      <h1 style="font-size: 26px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 6px 0; letter-spacing: -0.02em;">
        PINTAARA Overview
      </h1>
      <p style="font-size: 13.5px; color: var(--admin-text-secondary); margin: 0;">
        PINTAARA luxury metrics, live gold rates, client orders, and catalog status.
      </p>
    </div>

    <!-- Live indicator badge -->
    <div style="display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--admin-text-muted);">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
      <span>Real-time Store Sync</span>
    </div>
  </div>

  <!-- ==================== TOP 4 METRIC CARDS ==================== -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
    
    <!-- 1. Total Views -->
    <div class="admin-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 150px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <div style="width: 44px; height: 44px; border-radius: 50%; background: #EFF2FE; color: #3C50E0; display: flex; align-items: center; justify-content: center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <div style="margin-top: 18px;">
        <div style="font-size: 26px; font-weight: 800; color: var(--admin-text-primary); letter-spacing: -0.02em;">
          {{ $stats['total_views']['value'] }}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
          <span style="font-size: 13px; color: var(--admin-text-secondary); font-weight: 500;">{{ $stats['total_views']['title'] ?? 'Catalog Pieces' }}</span>
          <span style="font-size: 12px; font-weight: 700; color: #10B981;">
            {{ $stats['total_views']['change'] }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2. Total Revenue / Profit -->
    <div class="admin-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 150px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <div style="width: 44px; height: 44px; border-radius: 50%; background: #E6FBF2; color: #10B981; display: flex; align-items: center; justify-content: center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      </div>
      <div style="margin-top: 18px;">
        <div style="font-size: 26px; font-weight: 800; color: var(--admin-text-primary); letter-spacing: -0.02em;">
          {{ $stats['total_profit']['value'] }}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
          <span style="font-size: 13px; color: var(--admin-text-secondary); font-weight: 500;">{{ $stats['total_profit']['title'] ?? 'Total Revenue' }}</span>
          <span style="font-size: 12px; font-weight: 700; color: {{ ($stats['total_profit']['is_positive'] ?? true) ? '#10B981' : '#EF4444' }};">
            {{ $stats['total_profit']['change'] }}
          </span>
        </div>
      </div>
    </div>

    <!-- 3. Total Order -->
    <div class="admin-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 150px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <div style="width: 44px; height: 44px; border-radius: 50%; background: #FFF7ED; color: #F97316; display: flex; align-items: center; justify-content: center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m7.5 4.27 9 5.15" />
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      </div>
      <div style="margin-top: 18px;">
        <div style="font-size: 26px; font-weight: 800; color: var(--admin-text-primary); letter-spacing: -0.02em;">
          {{ $stats['total_order']['value'] }}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
          <span style="font-size: 13px; color: var(--admin-text-secondary); font-weight: 500;">{{ $stats['total_order']['title'] ?? 'Total Orders' }}</span>
          <span style="font-size: 12px; font-weight: 700; color: #10B981;">
            {{ $stats['total_order']['change'] }}
          </span>
        </div>
      </div>
    </div>

    <!-- 4. Total User -->
    <div class="admin-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 150px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <div style="width: 44px; height: 44px; border-radius: 50%; background: #F5F3FF; color: #7C3AED; display: flex; align-items: center; justify-content: center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div style="margin-top: 18px;">
        <div style="font-size: 26px; font-weight: 800; color: var(--admin-text-primary); letter-spacing: -0.02em;">
          {{ $stats['total_user']['value'] }}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
          <span style="font-size: 13px; color: var(--admin-text-secondary); font-weight: 500;">{{ $stats['total_user']['title'] ?? 'Total Patrons' }}</span>
          <span style="font-size: 12px; font-weight: 700; color: #10B981;">
            {{ $stats['total_user']['change'] }}
          </span>
        </div>
      </div>
    </div>

  </div>

  <!-- ==================== SALES & REVENUE AREA CHART ==================== -->
  <div class="admin-card" style="padding: 26px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
    
    <!-- Legend & Period Selector Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 28px; flex-wrap: wrap;">
        
        <!-- Sales Indicator -->
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: #3C50E0;"></span>
            <span style="font-size: 13px; font-weight: 600; color: var(--admin-text-secondary);">Sales Amount</span>
          </div>
          <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 4px;">
            <span style="font-size: 22px; font-weight: 800; color: var(--admin-text-primary);">{{ $salesAmount }}</span>
            <span style="font-size: 12px; font-weight: 700; color: #10B981;">{{ $stats['total_profit']['change'] }}</span>
          </div>
        </div>

        <!-- Revenue Indicator -->
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: #8B5CF6;"></span>
            <span style="font-size: 13px; font-weight: 600; color: var(--admin-text-secondary);">Revenue Amount</span>
          </div>
          <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 4px;">
            <span style="font-size: 22px; font-weight: 800; color: var(--admin-text-primary);">{{ $revenueAmount }}</span>
            <span style="font-size: 12px; font-weight: 700; color: #10B981;">{{ $stats['total_profit']['change'] }}</span>
          </div>
        </div>

      </div>

      <!-- Time Filter Dropdown -->
      <div style="position: relative;">
        <select style="appearance: none; background: var(--admin-surface-elevated); border: 1px solid var(--admin-border); border-radius: 8px; padding: 7px 32px 7px 14px; font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary); cursor: pointer; outline: none;">
          <option value="Monthly">Monthly</option>
          <option value="Weekly">Weekly</option>
          <option value="Yearly">Yearly</option>
        </select>
        <svg style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--admin-text-muted);" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>

    <!-- Interactive SVG Curve Chart -->
    <div style="width: 100%; overflow-x: auto; position: relative;">
      <svg viewBox="0 0 920 240" style="width: 100%; height: auto; min-width: 600px; display: block;">
        <defs>
          <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Horizontal Grid Lines -->
        <line x1="45" y1="30" x2="900" y2="30" stroke="var(--admin-border)" stroke-dasharray="4 4" stroke-width="1" />
        <text x="35" y="34" text-anchor="end" fill="var(--admin-text-muted)" font-size="11" font-weight="600">1000</text>

        <line x1="45" y1="75" x2="900" y2="75" stroke="var(--admin-border)" stroke-dasharray="4 4" stroke-width="1" />
        <text x="35" y="79" text-anchor="end" fill="var(--admin-text-muted)" font-size="11" font-weight="600">750</text>

        <line x1="45" y1="120" x2="900" y2="120" stroke="var(--admin-border)" stroke-dasharray="4 4" stroke-width="1" />
        <text x="35" y="124" text-anchor="end" fill="var(--admin-text-muted)" font-size="11" font-weight="600">500</text>

        <line x1="45" y1="165" x2="900" y2="165" stroke="var(--admin-border)" stroke-dasharray="4 4" stroke-width="1" />
        <text x="35" y="169" text-anchor="end" fill="var(--admin-text-muted)" font-size="11" font-weight="600">250</text>

        <line x1="45" y1="210" x2="900" y2="210" stroke="var(--admin-border)" stroke-width="1" />
        <text x="35" y="214" text-anchor="end" fill="var(--admin-text-muted)" font-size="11" font-weight="600">0</text>

        <!-- Area Curve matching the screenshot bell curve in Nov -->
        <path d="M 50 210 Q 300 210 650 210 C 700 210, 720 50, 760 50 C 800 50, 820 210, 880 210 L 880 210 L 50 210 Z" fill="url(#revenueGrad)" />
        <path d="M 50 210 Q 300 210 650 210 C 700 210, 720 50, 760 50 C 800 50, 820 210, 880 210" fill="none" stroke="#8B5CF6" stroke-width="3" />

        <!-- Peak dot in November -->
        <circle cx="760" cy="50" r="5" fill="#FFFFFF" stroke="#8B5CF6" stroke-width="3" />

        <!-- Month Labels -->
        <text x="65" y="230" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600">Jan</text>
        <text x="140" y="230" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600">Feb</text>
        <text x="215" y="230" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600">Mar</text>
        <text x="290" y="230" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600">Apr</text>
        <text x="365" y="230" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600">May</text>
        <text x="440" y="230" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600">Jun</text>
        <text x="515" y="230" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600">Jul</text>
        <text x="590" y="230" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600">Aug</text>
        <text x="665" y="230" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600">Sep</text>
        <text x="740" y="230" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600">Oct</text>
        <text x="815" y="230" text-anchor="middle" fill="#8B5CF6" font-size="12" font-weight="800">Nov</text>
        <text x="890" y="230" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600">Dec</text>
      </svg>
    </div>

  </div>

  <!-- ==================== 2-COLUMN BOTTOM SECTION ==================== -->
  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: start;">
    
    <!-- LEFT: Recent Orders Table -->
    <div class="admin-card" style="padding: 24px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
        <div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 4px 0;">
            Recent Orders
          </h3>
          <p style="font-size: 12.5px; color: var(--admin-text-secondary); margin: 0;">
            Client orders placed from the storefront website
          </p>
        </div>
        <a href="{{ route('admin.orders') }}" class="admin-btn-ghost" style="font-size: 12px;">
          <span>View All</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>

      <div style="overflow-x: auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @forelse($recentOrders as $order)
              <tr>
                <td>
                  <a href="{{ route('admin.orders.show', $order['order_db_id']) }}" style="font-weight: 700; color: #3C50E0; text-decoration: none;">
                    {{ $order['id'] }}
                  </a>
                  <div style="font-size: 11px; color: var(--admin-text-muted);">{{ $order['date'] }}</div>
                </td>
                <td>
                  <div style="font-weight: 600; color: var(--admin-text-primary);">{{ $order['client'] }}</div>
                  <div style="font-size: 11px; color: var(--admin-text-muted);">{{ $order['email'] }}</div>
                </td>
                <td style="color: var(--admin-text-secondary); font-size: 12px;">
                  {{ $order['product'] }}
                </td>
                <td style="font-weight: 700; color: var(--admin-text-primary);">
                  {{ $order['amount'] }}
                </td>
                <td>
                  <span class="admin-badge admin-badge-{{ $order['statusVariant'] }}">
                    {{ $order['status'] }}
                  </span>
                </td>
              </tr>
            @empty
              <tr>
                <td colspan="5" style="text-align: center; color: var(--admin-text-muted); padding: 32px;">
                  No recent orders available
                </td>
              </tr>
            @endforelse
          </tbody>
        </table>
      </div>
    </div>

    <!-- RIGHT: Quick Actions & Live Metal Benchmark -->
    <div style="display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Quick Actions -->
      <div class="admin-card" style="padding: 22px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 14px 0; color: var(--admin-text-primary);">
          Quick Actions
        </h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="{{ route('admin.products.create') }}" class="admin-btn-primary" style="justify-content: center; width: 100%;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add New Product</span>
          </a>
          <a href="{{ route('admin.product-options') }}" class="admin-btn-outline" style="justify-content: center; width: 100%;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Product Options &amp; Variants</span>
          </a>
        </div>
      </div>

      <!-- Live Metal Benchmark -->
      <div class="admin-card" style="padding: 22px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <h3 style="font-size: 15px; font-weight: 700; margin: 0; color: var(--admin-text-primary);">
            Live Metal Benchmark
          </h3>
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--admin-surface-elevated); border-radius: 8px; border: 1px solid var(--admin-border);">
            <div>
              <div style="font-size: 11px; font-weight: 600; color: var(--admin-text-secondary);">
                24K GOLD (99.9%)
              </div>
              <div style="font-size: 16px; font-weight: 700; color: var(--admin-text-primary);">
                ₹{{ number_format($gold24k, 2) }} / g
              </div>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: #10B981;">+0.4% ↑</span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--admin-surface-elevated); border-radius: 8px; border: 1px solid var(--admin-border);">
            <div>
              <div style="font-size: 11px; font-weight: 600; color: var(--admin-text-secondary);">
                22K GOLD (91.6%)
              </div>
              <div style="font-size: 16px; font-weight: 700; color: var(--admin-text-primary);">
                ₹{{ number_format($gold22k, 2) }} / g
              </div>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: #10B981;">+0.3% ↑</span>
          </div>
        </div>
      </div>

    </div>

  </div>

</div>
@endsection

