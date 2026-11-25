@extends('layouts.admin')

@section('title', $template->exists ? 'Edit Email Template' : 'Add Email Template')

@section('content')
<div style="display: flex; flex-direction: column; gap: 22px; max-width: 1300px; margin: 0 auto; padding-bottom: 60px;">

  <!-- Header -->
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
    <div>
      <a href="{{ route('admin.email-templates') }}" style="font-size: 12.5px; color: var(--admin-text-secondary); text-decoration: none; font-weight: 600;">
        ← Back to Email Templates
      </a>
      <h1 style="font-size: 22px; font-weight: 800; color: var(--admin-text-primary); margin: 6px 0 0 0;">
        {{ $template->exists ? 'Edit Template: ' . $template->name : 'Add New Email Template' }}
      </h1>
    </div>
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

  @if($errors->any())
    <div style="background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; padding: 12px 18px; border-radius: 10px; font-size: 13px;">
      <ul style="margin: 0; padding-left: 18px;">
        @foreach($errors->all() as $err)
          <li>{{ $err }}</li>
        @endforeach
      </ul>
    </div>
  @endif

  <div style="display: grid; grid-template-columns: minmax(420px, 1.1fr) minmax(380px, 1fr); gap: 24px; align-items: start;">

    <!-- Left: Editor Form -->
    <div class="admin-card" style="padding: 24px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <form action="{{ $template->exists ? route('admin.email-templates.update', $template->id) : route('admin.email-templates.store') }}" method="POST" style="display: flex; flex-direction: column; gap: 18px;">
        @csrf
        @if($template->exists)
          @method('PUT')
        @endif

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Template Name *</label>
            <input type="text" name="name" value="{{ old('name', $template->name) }}" required class="admin-input" placeholder="e.g. Festive Offer Announcement" style="width: 100%;">
          </div>

          <div>
            <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Category</label>
            <select name="category" class="admin-input" style="width: 100%;" {{ $template->is_system ? 'disabled' : '' }}>
              <option value="custom" {{ old('category', $template->category) === 'custom' ? 'selected' : '' }}>Custom</option>
              <option value="orders" {{ old('category', $template->category) === 'orders' ? 'selected' : '' }}>Orders &amp; Shipping</option>
              <option value="auth" {{ old('category', $template->category) === 'auth' ? 'selected' : '' }}>Auth &amp; Account</option>
            </select>
            @if($template->is_system)
              <input type="hidden" name="category" value="{{ $template->category }}">
            @endif
          </div>
        </div>

        @if(!$template->exists)
          <div>
            <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Template Slug (optional)</label>
            <input type="text" name="slug" value="{{ old('slug') }}" class="admin-input" placeholder="Auto-generated from name if left blank" style="width: 100%; font-family: monospace;">
          </div>
        @else
          <div>
            <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Slug</label>
            <input type="text" value="{{ $template->slug }}" disabled class="admin-input" style="width: 100%; font-family: monospace; background: #F8FAFC; color: #64748B;">
          </div>
        @endif

        <div>
          <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Email Subject Line *</label>
          <input type="text" name="subject" id="tpl_subject" value="{{ old('subject', $template->subject) }}" required oninput="updateLivePreview()" class="admin-input" placeholder="e.g. PINTAARA | Order {{order_number}} confirmed" style="width: 100%;">
        </div>

        <!-- Variables Helper Chips -->
        @php
          $varsList = array_filter(array_map('trim', explode(',', (string) ($template->variables_hint ?? 'customer_name, customer_email, order_number, total_amount, action_url'))));
        @endphp
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
          <div style="font-size: 11.5px; font-weight: 700; color: #475569; margin-bottom: 8px;">
            Available Variables (click to insert into body):
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            @foreach($varsList as $v)
              <button type="button" onclick="insertPlaceholder('{{'{{' . $v . '}}'}}')" style="font-size: 11.5px; font-family: monospace; padding: 4px 10px; border-radius: 6px; border: 1px solid #CBD5E1; background: #FFFFFF; color: #0F172A; cursor: pointer; font-weight: 600;">
                {{'{{' . $v . '}}'}}
              </button>
            @endforeach
          </div>
        </div>

        <div>
          <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Email Body (HTML) *</label>
          <textarea name="body_html" id="tpl_body_html" rows="13" required oninput="updateLivePreview()" class="admin-input" style="width: 100%; font-family: monospace; font-size: 12.5px; line-height: 1.55;">{{ old('body_html', $template->body_html) }}</textarea>
        </div>

        @if(!$template->is_system)
          <div>
            <label class="admin-label" style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Variables Hint (comma separated)</label>
            <input type="text" name="variables_hint" value="{{ old('variables_hint', $template->variables_hint) }}" class="admin-input" style="width: 100%; font-family: monospace; font-size: 12px;">
          </div>
        @endif

        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding-top: 8px; border-top: 1px solid var(--admin-border);">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
            <input type="checkbox" name="is_active" value="1" {{ old('is_active', $template->is_active) ? 'checked' : '' }}>
            <span>Template Active</span>
          </label>

          <button type="submit" class="admin-btn-primary" style="padding: 10px 24px; font-size: 13px; font-weight: 700;">
            {{ $template->exists ? 'Save Template Changes' : 'Create Template' }}
          </button>
        </div>
      </form>

      @if($template->exists)
        <div style="margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--admin-border);">
          <form action="{{ route('admin.email-templates.test', $template->id) }}" method="POST" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            @csrf
            <input type="email" name="test_email" required placeholder="Enter email to send test..." class="admin-input" style="flex: 1; min-width: 200px;">
            <button type="submit" style="padding: 10px 18px; font-size: 12.5px; font-weight: 700; border-radius: 8px; border: 1px solid #0F172A; background: #FFFFFF; color: #0F172A; cursor: pointer;">
              Send Test Email
            </button>
          </form>
        </div>
      @endif
    </div>

    <!-- Right: Live Email Preview -->
    <div class="admin-card" style="padding: 20px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h3 style="font-size: 15px; font-weight: 800; color: var(--admin-text-primary); margin: 0;">Live Email Preview</h3>
        <button type="button" onclick="updateLivePreview()" style="font-size: 11.5px; padding: 5px 12px; border-radius: 6px; border: 1px solid var(--admin-border); background: #FFFFFF; cursor: pointer; font-weight: 600;">
          Refresh Preview
        </button>
      </div>
      <iframe id="email_preview_frame" style="width: 100%; height: 640px; border: 1px solid var(--admin-border); border-radius: 10px; background: #FAF9F5;"></iframe>
    </div>

  </div>
</div>

<script>
  let previewTimer = null;

  function insertPlaceholder(tag) {
    const textarea = document.getElementById('tpl_body_html');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    textarea.value = val.substring(0, start) + tag + val.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + tag.length, start + tag.length);
    updateLivePreview();
  }

  function updateLivePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(async () => {
      const subject = document.getElementById('tpl_subject')?.value || '';
      const bodyHtml = document.getElementById('tpl_body_html')?.value || '';
      const frame = document.getElementById('email_preview_frame');
      if (!frame) return;

      try {
        const res = await fetch('{{ route("admin.email-templates.preview") }}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}',
            'Accept': 'text/html'
          },
          body: JSON.stringify({ subject: subject, body_html: bodyHtml })
        });
        if (!res.ok) return;
        const html = await res.text();
        frame.srcdoc = html;
      } catch (e) {
        console.error('Preview error:', e);
      }
    }, 250);
  }

  document.addEventListener('DOMContentLoaded', updateLivePreview);
</script>
@endsection
