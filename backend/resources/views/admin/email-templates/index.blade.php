@extends('layouts.admin')

@section('title', 'Email Templates')

@section('content')
<div style="display: flex; flex-direction: column; gap: 22px; max-width: 1300px; margin: 0 auto; padding-bottom: 60px;">

  <!-- Header -->
  <div style="background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 16px; padding: 22px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
    <div>
      <h1 style="font-size: 22px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 4px 0;">
        Email Templates
      </h1>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 0;">
        Edit system notification emails or add new custom templates for your clients.
      </p>
    </div>

    <a href="{{ route('admin.email-templates.create') }}" class="admin-btn-primary" style="text-decoration: none; padding: 10px 20px; font-size: 13px; font-weight: 700;">
      + Add New Template
    </a>
  </div>

  @if(session('success'))
    <div style="background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;">
      {{ session('success') }}
    </div>
  @endif

  @if(session('error'))
    <div style="background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;">
      {{ session('error') }}
    </div>
  @endif

  <!-- Category Filter Tabs -->
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    @foreach(['all' => 'All Templates', 'orders' => 'Order & Shipping', 'auth' => 'Account & Auth', 'custom' => 'Custom Templates'] as $key => $label)
      <a href="{{ route('admin.email-templates', ['category' => $key]) }}"
         style="padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; border: 1px solid {{ $category === $key ? '#0F172A' : 'var(--admin-border)' }}; background: {{ $category === $key ? '#0F172A' : 'var(--admin-surface)' }}; color: {{ $category === $key ? '#FFFFFF' : 'var(--admin-text-secondary)' }};">
        {{ $label }}
      </a>
    @endforeach
  </div>

  <!-- Templates Table -->
  <div class="admin-card" style="padding: 0; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border); overflow: hidden;">
    <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
      <thead>
        <tr style="background: var(--admin-surface-elevated); border-bottom: 1px solid var(--admin-border);">
          <th style="padding: 13px 18px; font-weight: 700; color: var(--admin-text-secondary);">Template Name</th>
          <th style="padding: 13px 18px; font-weight: 700; color: var(--admin-text-secondary);">Category</th>
          <th style="padding: 13px 18px; font-weight: 700; color: var(--admin-text-secondary);">Subject Line</th>
          <th style="padding: 13px 18px; font-weight: 700; color: var(--admin-text-secondary);">Status</th>
          <th style="padding: 13px 18px; font-weight: 700; color: var(--admin-text-secondary); text-align: right;">Actions</th>
        </tr>
      </thead>
      <tbody>
        @forelse($templates as $tpl)
          <tr style="border-bottom: 1px solid var(--admin-border);">
            <td style="padding: 14px 18px;">
              <div style="font-weight: 700; color: var(--admin-text-primary);">{{ $tpl->name }}</div>
              <div style="font-size: 11px; font-family: monospace; color: var(--admin-text-muted); margin-top: 2px;">{{ $tpl->slug }}</div>
            </td>
            <td style="padding: 14px 18px;">
              <span class="admin-badge admin-badge-neutral" style="text-transform: uppercase; font-size: 10.5px;">
                {{ $tpl->category }}
              </span>
            </td>
            <td style="padding: 14px 18px; color: var(--admin-text-secondary);">
              {{ $tpl->subject }}
            </td>
            <td style="padding: 14px 18px;">
              @if($tpl->is_active)
                <span class="admin-badge admin-badge-success" style="font-size: 11px;">Active</span>
              @else
                <span class="admin-badge admin-badge-neutral" style="font-size: 11px;">Inactive</span>
              @endif
            </td>
            <td style="padding: 14px 18px; text-align: right; white-space: nowrap;">
              <div style="display: inline-flex; align-items: center; gap: 8px;">
                <a href="{{ route('admin.email-templates.edit', $tpl->id) }}" class="admin-btn-secondary" style="padding: 6px 14px; font-size: 12px; text-decoration: none; border: 1px solid var(--admin-border); border-radius: 6px; color: var(--admin-text-primary); font-weight: 600;">
                  Edit
                </a>
                @if(!$tpl->is_system)
                  <form action="{{ route('admin.email-templates.delete', $tpl->id) }}" method="POST" onsubmit="return confirm('Delete this custom email template?');" style="margin: 0;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" style="padding: 6px 12px; font-size: 12px; border: 1px solid #FECACA; background: #FEF2F2; color: #DC2626; border-radius: 6px; cursor: pointer; font-weight: 600;">
                      Delete
                    </button>
                  </form>
                @endif
              </div>
            </td>
          </tr>
        @empty
          <tr>
            <td colspan="5" style="padding: 36px; text-align: center; color: var(--admin-text-secondary);">
              No email templates found. Click "+ Add New Template" to create one.
            </td>
          </tr>
        @endforelse
      </tbody>
    </table>
  </div>

</div>
@endsection
