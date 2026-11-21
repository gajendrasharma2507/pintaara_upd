@extends('layouts.admin')

@section('title', 'Orders & Invoices')

@section('content')
<div style="display: flex; flex-direction: column; gap: 24px; max-width: 1400px; margin: 0 auto;">

  <!-- Header -->
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
    <div>
      <h1 style="font-size: 24px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 4px 0;">
        Orders & Invoices
      </h1>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 0;">
        Track customer orders, fulfillment progress, and tax invoices.
      </p>
    </div>
  </div>

  <!-- Filters -->
  <div class="admin-card" style="padding: 16px 20px; border-radius: 14px; background: var(--admin-surface); border: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
    <form method="GET" action="{{ route('admin.orders') }}" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; flex: 1;">
      <div style="position: relative; min-width: 260px;">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by order #, customer, email..." class="admin-input" style="padding-left: 36px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted);">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <select name="status" onchange="this.form.submit()" class="admin-input" style="width: auto; cursor: pointer;">
        <option value="all" {{ (!request('status') || request('status') === 'all') ? 'selected' : '' }}>All Active Statuses</option>
        <option value="confirmed" {{ request('status') === 'confirmed' ? 'selected' : '' }}>Confirmed</option>
        <option value="in_production" {{ request('status') === 'in_production' ? 'selected' : '' }}>In Production</option>
        <option value="inspection" {{ request('status') === 'inspection' ? 'selected' : '' }}>Inspection</option>
        <option value="shipped" {{ request('status') === 'shipped' ? 'selected' : '' }}>Shipped</option>
        <option value="delivered" {{ request('status') === 'delivered' ? 'selected' : '' }}>Delivered</option>
        <option value="cancelled" {{ request('status') === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
        <option value="trash" {{ in_array(request('status'), ['trash', 'deleted']) ? 'selected' : '' }}>🗑️ Trash / Deleted Orders ({{ $trashedCount ?? 0 }})</option>
      </select>

      <button type="submit" class="admin-btn-outline" style="padding: 8px 14px;">Filter</button>
      @if(request()->hasAny(['search', 'status']))
        <a href="{{ route('admin.orders') }}" class="admin-btn-ghost" style="padding: 8px 12px;">Reset</a>
      @endif

      @if(isset($trashedCount) && $trashedCount > 0 && !in_array(request('status'), ['trash', 'deleted']))
        <a href="{{ route('admin.orders', ['status' => 'trash']) }}" class="admin-badge admin-badge-danger" style="text-decoration: none; padding: 6px 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
          <span>🗑️ Trash</span>
          <span style="background: rgba(255,255,255,0.25); border-radius: 10px; padding: 1px 6px;">{{ $trashedCount }}</span>
        </a>
      @endif
    </form>

    <div style="font-size: 13px; font-weight: 600; color: var(--admin-text-muted);">
      {{ in_array(request('status'), ['trash', 'deleted']) ? $orders->total() . ' Deleted Orders' : $orders->total() . ' Commissions' }}
    </div>
  </div>

  <!-- Orders Table -->
  <div class="admin-card" style="border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border); overflow: hidden;">
    <div style="overflow-x: auto;">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Date</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          @forelse($orders as $ord)
            @php
              $firstItem = $ord->items->first();
              $badgeClass = 'neutral';
              if(in_array($ord->status, ['delivered', 'paid'])) $badgeClass = 'success';
              elseif(in_array($ord->status, ['shipped', 'inspection'])) $badgeClass = 'info';
              elseif(in_array($ord->status, ['confirmed', 'in_production'])) $badgeClass = 'warning';
              elseif($ord->status === 'cancelled') $badgeClass = 'danger';
            @endphp
            <tr>
              <td>
                <a href="{{ route('admin.orders.show', $ord->id) }}" style="font-weight: 700; color: #3C50E0; text-decoration: none;">
                  {{ $ord->order_number ?: ('#PIN-' . $ord->id) }}
                </a>
              </td>
              <td>
                <div style="font-weight: 600; color: var(--admin-text-primary);">
                  {{ $ord->customer_name ?: 'PINTAARA Patron' }}
                </div>
                <div style="font-size: 11px; color: var(--admin-text-muted);">
                  {{ $ord->customer_email }}
                </div>
              </td>
              <td>
                @if($firstItem)
                  <span style="font-weight: 600;">{{ $firstItem->product_name }}</span>
                  @if($ord->items->count() > 1)
                    <span style="font-size: 11px; color: var(--admin-text-muted);">(+{{ $ord->items->count() - 1 }} more)</span>
                  @endif
                @else
                  <span style="color: var(--admin-text-muted);">Custom Piece</span>
                @endif
              </td>
              <td style="font-weight: 700; color: var(--admin-text-primary);">
                ₹{{ number_format($ord->total_amount, 2) }}
              </td>
              <td>
                <span class="admin-badge admin-badge-{{ $ord->payment_status === 'paid' ? 'success' : 'warning' }}">
                  {{ $ord->payment_status ?: 'paid' }}
                </span>
              </td>
              <td>
                <span class="admin-badge admin-badge-{{ $badgeClass }}">
                  {{ ucfirst(str_replace('_', ' ', $ord->status)) }}
                </span>
                @if($ord->trashed())
                  <span class="admin-badge admin-badge-danger" style="margin-left: 4px;">Deleted</span>
                @endif
              </td>
              <td style="font-size: 12px; color: var(--admin-text-muted);">
                {{ $ord->created_at ? $ord->created_at->format('d M Y, h:i A') : '—' }}
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 6px;">
                  <a href="{{ route('admin.orders.show', $ord->id) }}" class="admin-btn admin-btn-edit" title="View details & generate invoice">
                    View
                  </a>
                  @if($ord->trashed())
                    <form method="POST" action="{{ route('admin.orders.restore', $ord->id) }}" style="display: inline;" onsubmit="return confirm('Restore this order?')">
                      @csrf
                      <button type="submit" class="admin-btn" style="background: #10B981; color: #fff; padding: 6px 10px; font-size: 12px; border: none; border-radius: 6px; cursor: pointer;">
                        Restore
                      </button>
                    </form>
                    <form method="POST" action="{{ route('admin.orders.force-delete', $ord->id) }}" style="display: inline;" onsubmit="return confirm('Permanently delete this order from database? This cannot be undone.')">
                      @csrf
                      @method('DELETE')
                      <button type="submit" class="admin-btn" style="background: #EF4444; color: #fff; padding: 6px 10px; font-size: 12px; border: none; border-radius: 6px; cursor: pointer;">
                        Purge
                      </button>
                    </form>
                  @else
                    <form method="POST" action="{{ route('admin.orders.delete', $ord->id) }}" style="display: inline;" onsubmit="return confirm('Move order {{ $ord->order_number ?: ('#' . $ord->id) }} to Trash?')">
                      @csrf
                      @method('DELETE')
                      <button type="submit" class="admin-btn" style="background: transparent; border: 1px solid #FCA5A5; color: #EF4444; padding: 5px 8px; font-size: 12px; border-radius: 6px; cursor: pointer;" title="Move order to Trash">
                        Delete
                      </button>
                    </form>
                  @endif
                </div>
              </td>
            </tr>
          @empty
            <tr>
              <td colspan="8" style="text-align: center; color: var(--admin-text-muted); padding: 40px;">
                No orders found.
              </td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>

    @if($orders->hasPages())
      <div style="padding: 16px 24px; border-top: 1px solid var(--admin-border);">
        {{ $orders->links('vendor.pagination.admin') }}
      </div>
    @endif
  </div>

</div>
@endsection

