@extends('layouts.admin')

@section('title', 'Jewellery Catalog')

@section('content')
<div style="display: flex; flex-direction: column; gap: 24px; max-width: 1400px; margin: 0 auto;">

  <!-- Header -->
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
    <div>
      <h1 style="font-size: 24px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 4px 0;">
        Jewellery Catalog
      </h1>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 0;">
        Manage fine jewelry designs, pricing formulas, and collection items.
      </p>
    </div>
    <a href="{{ route('admin.products.create') }}" class="admin-btn-primary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span>Add New Piece</span>
    </a>
  </div>

  <!-- Filters -->
  <div class="admin-card" style="padding: 16px 20px; border-radius: 14px; background: var(--admin-surface); border: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
    <form method="GET" action="{{ route('admin.products') }}" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; flex: 1;">
      <div style="position: relative; min-width: 260px;">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by name, code..." class="admin-input" style="padding-left: 36px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted);">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <select name="collection" onchange="this.form.submit()" class="admin-input" style="width: auto; cursor: pointer;">
        <option value="all">All Collections</option>
        @foreach($collections as $col)
          <option value="{{ $col->id }}" {{ request('collection') == $col->id ? 'selected' : '' }}>
            {{ $col->name }}
          </option>
        @endforeach
      </select>

      <button type="submit" class="admin-btn-outline" style="padding: 8px 14px;">Filter</button>
      @if(request()->hasAny(['search', 'collection']))
        <a href="{{ route('admin.products') }}" class="admin-btn-ghost" style="padding: 8px 12px;">Reset</a>
      @endif
    </form>

    <div style="font-size: 13px; font-weight: 600; color: var(--admin-text-muted);">
      {{ $products->total() }} Products
    </div>
  </div>

  <!-- Products Table -->
  <div class="admin-card" style="border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border); overflow: hidden;">
    <div style="overflow-x: auto;">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Piece</th>
            <th>Design Code</th>
            <th>Collection</th>
            <th>Net Weight</th>
            <th>Making (%)</th>
            <th>Brand Markup (%)</th>
            <th>Other (₹)</th>
            <th>Purities &amp; Final Prices</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          @forelse($products as $prod)
            @php
              $primaryImg = $prod->images->where('is_primary', true)->first() ?: $prod->images->first();
              $imgUrl = $primaryImg ? $primaryImg->url : '/images/products/ring.png';

              $netWt = (float) $prod->base_weight_grams;
              $rate18k = (float) ($rates['gold_18kt_per_gram'] ?? 11250);
              $metalVal = $netWt * $rate18k;

              $makingPct = (float) ($prod->making_charge_percent ?? 0);
              $makingFlat = (float) ($prod->making_charge ?? 0);
              $makingVal = $makingPct > 0 ? ($metalVal * ($makingPct / 100)) : $makingFlat;

              $markupPct = (float) ($prod->brand_markup_percent ?? 0);
              $markupVal = $metalVal * ($markupPct / 100);

              $otherVal = (float) ($prod->other_charges ?? 0);
              $subtotal = $metalVal + $makingVal + $markupVal + $otherVal;
              $gstVal = $subtotal * 0.03;
              $finalAmt = $subtotal + $gstVal;
            @endphp
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img src="{{ $imgUrl }}" onerror="this.onerror=null; this.src='/images/products/ring.png';" alt="{{ $prod->name }}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover; background: #F8FAFC; border: 1px solid var(--admin-border);">
                  <div style="font-weight: 700; color: var(--admin-text-primary);">
                    {{ $prod->name }}
                  </div>
                </div>
              </td>
              <td style="font-family: monospace; font-size: 13px; font-weight: 600; color: var(--admin-text-primary);">
                {{ $prod->design_code }}
              </td>
              <td>
                <span class="admin-badge admin-badge-neutral">
                  {{ $prod->collection ? $prod->collection->name : 'Unassigned' }}
                </span>
              </td>
              <td style="font-weight: 600;">
                {{ number_format($netWt, 3) }} g
              </td>
              <td>
                @if($makingPct > 0)
                  <span style="font-weight: 600;">{{ $makingPct }}%</span>
                @elseif($makingFlat > 0)
                  ₹{{ number_format($makingFlat, 2) }}
                @else
                  —
                @endif
              </td>
              <td>
                @if($markupPct > 0)
                  <span style="font-weight: 600;">{{ $markupPct }}%</span>
                @else
                  —
                @endif
              </td>
              <td>
                @if($otherVal > 0)
                  ₹{{ number_format($otherVal, 2) }}
                @else
                  —
                @endif
              </td>
              <td>
                @php
                  $availPurities = $prod->available_purities ?: ['22KT', '18KT', '14KT'];
                  $gold24kRate = (float) ($rates['gold_24kt_pure_per_gram'] ?? 15000);
                  $silverRate = (float) ($rates['silver_per_gram'] ?? 192.35);
                @endphp
                <div style="display: flex; flex-direction: column; gap: 4px; min-width: 140px;">
                  @foreach($availPurities as $ap)
                    @php
                      $fraction = match($ap) {
                        '22KT' => 0.916,
                        '18KT' => 0.750,
                        '14KT' => 0.585,
                        '925 Silver', '925 SILVER' => 0.925,
                        default => 0.750
                      };
                      $isSilver = str_contains(strtolower($ap), 'silver');
                      $purityGramRate = $isSilver ? ($silverRate * $fraction) : ($gold24kRate * $fraction);
                      $pNetWt = $isSilver ? (float) ($prod->silver_weight_grams ?: $netWt) : $netWt;
                      $pMakingPct = $isSilver ? (float) ($prod->silver_making_charge_percent ?? $makingPct) : $makingPct;
                      $pMarkupPct = $isSilver ? (float) ($prod->silver_brand_markup_percent ?? $markupPct) : $markupPct;
                      $pOtherVal = $isSilver ? (float) ($prod->silver_other_charges ?? $otherVal) : $otherVal;

                      $pMetalVal = $pNetWt * $purityGramRate;
                      $pMakingVal = $pMakingPct > 0 ? ($pMetalVal * ($pMakingPct / 100)) : $makingFlat;
                      $pMarkupVal = $pMetalVal * ($pMarkupPct / 100);
                      $pSubtotal = $pMetalVal + $pMakingVal + $pMarkupVal + $pOtherVal;
                      $pFinal = $pSubtotal * 1.03;
                    @endphp
                    @php
                      $chargesTax = $pFinal - $pMetalVal;
                    @endphp
                    <div style="font-size: 11px; padding: 4px 0; border-bottom: 1px dashed var(--admin-border);">
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <span style="font-weight: 700; color: {{ $isSilver ? '#64748B' : '#B8860B' }};">{{ $ap }}:</span>
                        <strong style="color: var(--admin-text-primary); font-size: 11.5px;">₹{{ number_format($pFinal, 2) }}</strong>
                      </div>
                      <div style="font-size: 10px; color: var(--admin-text-muted); display: flex; justify-content: space-between; gap: 6px; margin-top: 1px;">
                        <span>Metal: ₹{{ number_format($pMetalVal, 2) }}</span>
                        <span style="color: #64748B;">+₹{{ number_format($chargesTax, 2) }}</span>
                      </div>
                    </div>
                  @endforeach
                </div>
              </td>
              <td>
                <span class="admin-badge admin-badge-{{ $prod->status === 'active' ? 'success' : 'neutral' }}">
                  {{ $prod->status }}
                </span>
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 8px;">
                  <a href="{{ route('admin.products.edit', $prod->id) }}" class="admin-btn admin-btn-edit">
                    Edit
                  </a>
                  <form action="{{ route('admin.products.delete', $prod->id) }}" method="POST" onsubmit="return confirm('Delete this piece?')" style="margin: 0;">
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
              <td colspan="10" style="text-align: center; color: var(--admin-text-muted); padding: 40px;">
                No products found.
              </td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>

    @if($products->hasPages())
      <div style="padding: 16px 24px; border-top: 1px solid var(--admin-border);">
        {{ $products->links('vendor.pagination.admin') }}
      </div>
    @endif
  </div>

</div>
@endsection

