@extends('layouts.admin')

@section('title', 'PINTAARA Design Logs & Specifications')

@section('content')
<div style="display: flex; flex-direction: column; gap: 24px; max-width: 1400px; margin: 0 auto;">

  <!-- Header -->
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
    <div>
      <h1 style="font-size: 24px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 4px 0;">
        PINTAARA Design Logs & Specifications
      </h1>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 0;">
        Technical CAD blueprints and bespoke material specifications for all Pintaara pieces.
      </p>
    </div>

    <div style="display: flex; align-items: center; gap: 10px;">
      <a href="{{ route('admin.design-logs.create') }}" class="admin-btn admin-btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Add Design Specification</span>
      </a>
    </div>
  </div>

  <!-- Search & Filter Bar -->
  <div class="admin-card" style="padding: 16px 20px; border-radius: 12px; background: var(--admin-surface); border: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
    <form method="GET" action="{{ route('admin.design-logs') }}" style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 280px; flex-wrap: wrap;">
      <div style="position: relative; flex: 1; min-width: 240px;">
        <input
          type="text"
          name="search"
          value="{{ request('search') }}"
          placeholder="Search design code (e.g. RG-SG-OR-002), product name, or inspiration..."
          class="admin-input"
          style="padding-left: 36px;"
        />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted);">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>

      <button type="submit" class="admin-btn admin-btn-primary" style="padding: 8px 16px;">
        Search
      </button>

      @if(request('search'))
        <a href="{{ route('admin.design-logs') }}" class="admin-btn admin-btn-secondary" style="padding: 8px 14px;">
          Reset
        </a>
      @endif
    </form>

    <div style="font-size: 13px; font-weight: 600; color: var(--admin-text-muted);">
      {{ $logs->total() }} Specifications
    </div>
  </div>

  <!-- Design Logs Table View -->
  <div class="admin-card" style="border-radius: 14px; background: var(--admin-surface); border: 1px solid var(--admin-border); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
    <div style="overflow-x: auto;">
      <table class="admin-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em; width: 75px;">CAD Sheet</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em;">Design Code</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em;">Collection</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em;">Type</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em; text-align: center; width: 140px;">Status</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em; text-align: right; width: 140px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          @forelse($logs as $log)
            @php
              $specs = is_array($log->specs) ? $log->specs : (json_decode($log->specs, true) ?: []);
              $code = $log->design_code ?: ($log->product ? $log->product->design_code : 'RG-SG-OR-002');
              $prodName = $log->product ? $log->product->name : ($specs['collection'] ?? 'Atelier Piece');
              $collectionName = $specs['collection'] ?? ($log->product && $log->product->collection ? $log->product->collection->name : 'SIGNATURE');
              $type = $specs['type'] ?? ($log->design_type ?: 'BESPOKE DESIGN');
              $status = strtoupper($specs['status'] ?? ($log->status ?: 'UNDER DEVELOPMENT'));
              $release = $specs['release'] ?? 'OCTOBER 2026';
              $blueprintImg = $log->blueprint_image ?: '/images/design-log/' . $code . '.JPG';
            @endphp
            <tr style="border-bottom: 1px solid var(--admin-border-light); transition: background 0.15s;">
              
              <!-- CAD Thumbnail -->
              <td style="padding: 14px 20px; vertical-align: middle;">
                <a href="{{ route('admin.design-logs.edit', $log->id) }}" style="display: block; text-decoration: none;">
                  <div style="width: 52px; height: 52px; border-radius: 8px; overflow: hidden; background: #FFFFFF; border: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
                    <img
                      src="{{ $blueprintImg }}"
                      alt="{{ $code }}"
                      style="width: 100%; height: 100%; object-fit: contain;"
                      onerror="this.onerror=null; this.src='/images/design-log/RG-SG-OR-002.JPG';"
                    />
                  </div>
                </a>
              </td>

              <!-- Design Code -->
              <td style="padding: 14px 20px; vertical-align: middle;">
                <a href="{{ route('admin.design-logs.edit', $log->id) }}" style="font-family: monospace; font-size: 13.5px; font-weight: 700; color: var(--admin-text-primary); text-decoration: none;">
                  {{ $code }}
                </a>
              </td>

              <!-- Collection -->
              <td style="padding: 14px 20px; vertical-align: middle;">
                <span class="admin-badge admin-badge-neutral" style="font-size: 11px; text-transform: uppercase;">
                  {{ $collectionName }}
                </span>
              </td>

              <!-- Type -->
              <td style="padding: 14px 20px; vertical-align: middle;">
                <span style="font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary);">
                  {{ $type }}
                </span>
              </td>

              <!-- Status -->
              <td style="padding: 14px 20px; text-align: center; vertical-align: middle;">
                <span style="font-size: 12px; font-weight: 600; color: var(--admin-text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">
                  {{ $status }}
                </span>
              </td>

              <!-- Actions -->
              <td style="padding: 14px 20px; text-align: right; vertical-align: middle;">
                <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 8px;">
                  
                  <!-- Edit -->
                  <a href="{{ route('admin.design-logs.edit', $log->id) }}" class="admin-btn admin-btn-edit">
                    Edit
                  </a>

                  <!-- Delete -->
                  <form action="{{ route('admin.design-logs.delete', $log->id) }}" method="POST" onsubmit="return confirm('Delete this blueprint specification?');" style="margin: 0;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="admin-btn admin-btn-danger">
                      Delete
                    </button>
                  </form>

                </div>
              </td>

            </tr>
          @empty
            <tr>
              <td colspan="6" style="padding: 40px; text-align: center; color: var(--admin-text-muted);">
                No design specifications found.
              </td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>
  </div>

  @if($logs->hasPages())
    <div>{{ $logs->links('vendor.pagination.admin') }}</div>
  @endif

</div>
@endsection
