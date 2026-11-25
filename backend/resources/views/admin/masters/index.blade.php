@extends('layouts.admin')

@section('title', 'Pricing Masters')

@section('content')
<div style="display: flex; flex-direction: column; gap: 24px; max-width: 1400px; margin: 0 auto;">

  <div>
    <h1 style="font-size: 24px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 4px 0;">
      Pricing Masters
    </h1>
    <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 0;">
      Configure metal purities, finishing textures, and gemstone options.
    </p>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">
    
    <!-- Metal Purities -->
    <div class="admin-card" style="padding: 24px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <h3 style="font-size: 16px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 16px 0;">
        Metal Purities
      </h3>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Purity</th>
            <th>Type</th>
            <th>Fraction</th>
          </tr>
        </thead>
        <tbody>
          @foreach($purities as $p)
            <tr>
              <td style="font-weight: 700;">{{ $p->name }}</td>
              <td><span class="admin-badge admin-badge-gold">{{ $p->type }}</span></td>
              <td style="font-family: monospace;">{{ $p->purity_fraction }}</td>
            </tr>
          @endforeach
        </tbody>
      </table>
    </div>

    <!-- Finish Options -->
    <div class="admin-card" style="padding: 24px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <h3 style="font-size: 16px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 16px 0;">
        Finishes & Hues
      </h3>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Color</th>
            <th>Finish Name</th>
          </tr>
        </thead>
        <tbody>
          @foreach($finishes as $f)
            <tr>
              <td>
                <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: {{ $f->hex_color ?: '#D4AF37' }}; border: 1px solid var(--admin-border);"></span>
              </td>
              <td style="font-weight: 700;">{{ $f->name }}</td>
            </tr>
          @endforeach
        </tbody>
      </table>
    </div>

    <!-- Gem Options -->
    <div class="admin-card" style="padding: 24px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <h3 style="font-size: 16px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 16px 0;">
        Gemstone Options
      </h3>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Stone</th>
            <th>Carat</th>
            <th>Charge</th>
          </tr>
        </thead>
        <tbody>
          @foreach($gems as $g)
            <tr>
              <td style="font-weight: 700;">{{ $g->stone_type }}</td>
              <td>{{ $g->carat ? $g->carat . 'ct' : '—' }}</td>
              <td>₹{{ number_format($g->default_stone_charge, 2) }}</td>
            </tr>
          @endforeach
        </tbody>
      </table>
    </div>

  </div>

</div>
@endsection

