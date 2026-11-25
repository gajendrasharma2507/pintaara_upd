@extends('layouts.admin')

@section('title', 'Edit Blueprint Spec — ' . ($log->product ? $log->product->design_code : 'Design Log'))

@section('content')
@php
  $specs = is_array($log->specs) ? $log->specs : (json_decode($log->specs, true) ?: []);
  $code = $log->product ? $log->product->design_code : 'RG-SG-OR-002';
  $prodName = $log->product ? $log->product->name : 'Atelier Piece';
  $currentBpImg = $log->blueprint_image ?: '/images/design-log/' . $code . '.JPG';
@endphp

<div style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">

  <!-- Header -->
  <div style="display: flex; align-items: center; justify-content: space-between;">
    <div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <a href="{{ route('admin.design-logs') }}" class="admin-btn admin-btn-secondary" style="font-size: 12px; padding: 6px 12px;">
          &larr; Back to Design Logs
        </a>
        <h1 style="font-size: 22px; font-weight: 800; color: var(--admin-text-primary); margin: 0;">
          Edit Blueprint Specification
        </h1>
      </div>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 4px 0 0 0;">
        Editing technical CAD specifications for <strong>{{ $code }} · {{ $prodName }}</strong>
      </p>
    </div>

    <a href="{{ route('admin.design-logs') }}" class="admin-btn admin-btn-secondary">
      Cancel
    </a>
  </div>

  @if($errors->any())
    <div style="background: #FEE2E2; color: #DC2626; padding: 14px 18px; border-radius: 8px; border: 1px solid #FECACA; font-size: 13.5px;">
      <ul style="margin: 0; padding-left: 20px;">
        @foreach($errors->all() as $err)
          <li>{{ $err }}</li>
        @endforeach
      </ul>
    </div>
  @endif

  <form action="{{ route('admin.design-logs.update', $log->id) }}" method="POST" enctype="multipart/form-data" style="display: flex; flex-direction: column; gap: 24px;">
    @csrf
    @method('PUT')

    <!-- Card 1: Design Image -->
    <div class="admin-card" style="padding: 28px; border-radius: 14px; background: var(--admin-surface); border: 1px solid var(--admin-border); display: flex; flex-direction: column; gap: 20px;">
      <div style="border-bottom: 1px solid var(--admin-border-light); padding-bottom: 12px;">
        <h3 style="font-size: 16px; font-weight: 800; color: var(--admin-text-primary); margin: 0;">
          Design Image
        </h3>
      </div>

      <!-- DESIGN IMAGE UPLOADER -->
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <label style="font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); text-transform: uppercase;">
            DESIGN IMAGE <span style="color: #DC2626;">*</span>
          </label>
          <span id="bp_status_badge" style="font-size: 11.5px; font-weight: 700; color: #10B981; display: none;">
            ✓ Uploaded to PINTAARA
          </span>
        </div>

        <!-- Live Preview & Uploader Box (Styled with form colors) -->
        <div style="background: var(--admin-surface-elevated); padding: 20px; border-radius: 12px; border: 1px solid var(--admin-border); display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
          
          <!-- Image Thumbnail Preview -->
          <div style="width: 140px; height: 140px; background: #FFFFFF; border-radius: 10px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid var(--admin-border);">
            <img
              id="bp_preview_img"
              src="{{ old('blueprint_image', $currentBpImg) }}"
              alt="Design Preview"
              style="width: 100%; height: 100%; object-fit: contain; display: block;"
              onerror="this.src='/images/design-log/RG-SG-OR-002.JPG'"
            />
          </div>

          <!-- Drag & Drop Uploader Area -->
          <div style="flex: 1; min-width: 260px;">
            <div
              id="bp_dropzone"
              onclick="document.getElementById('blueprint_file_input').click()"
              style="border: 2px dashed var(--admin-border); border-radius: 10px; padding: 26px 20px; text-align: center; cursor: pointer; background: var(--admin-surface); transition: all 0.2s;"
              ondragover="event.preventDefault(); this.style.borderColor='var(--admin-primary)'; this.style.background='var(--admin-primary-light)';"
              ondragleave="this.style.borderColor='var(--admin-border)'; this.style.background='var(--admin-surface)';"
              ondrop="handleFileDrop(event, 'blueprint')"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 8px auto; display: block; color: var(--admin-primary);">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <div style="font-size: 13.5px; color: var(--admin-text-primary); font-weight: 700;">
                Click to browse or drag & drop design image
              </div>
              <div style="font-size: 11.5px; color: var(--admin-text-secondary); margin-top: 4px;">
                Supports PNG, JPG, JPEG, WEBP, SVG (up to 20MB)
              </div>
              <div id="bp_spinner" style="display: none; margin-top: 8px; color: var(--admin-primary); font-size: 12px; font-weight: 600;">
                Uploading image to server...
              </div>
            </div>

            <!-- Hidden Inputs -->
            <input
              type="hidden"
              id="bp_image_input"
              name="blueprint_image"
              value="{{ old('blueprint_image', $currentBpImg) }}"
            />
            <input
              type="file"
              id="blueprint_file_input"
              name="blueprint_file"
              accept="image/*"
              style="display: none;"
              onchange="uploadFileDirectly(this, 'blueprint')"
            />
          </div>

        </div>
      </div>
    </div>

    <!-- Card 2: Design Specification -->
    <div class="admin-card" style="padding: 28px; border-radius: 14px; background: var(--admin-surface); border: 1px solid var(--admin-border); display: flex; flex-direction: column; gap: 20px;">
      <div style="border-bottom: 1px solid var(--admin-border-light); padding-bottom: 12px;">
        <h3 style="font-size: 16px; font-weight: 800; color: var(--admin-text-primary); margin: 0;">
          Design Specification
        </h3>
      </div>

      <!-- DESIGN CODE & LINK COLLECTION (OPTIONAL) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
            DESIGN CODE <span style="color: #DC2626;">*</span>
          </label>
          <input
            type="text"
            id="design_code_field"
            name="design_code"
            value="{{ old('design_code', $log->design_code ?: ($log->product ? $log->product->design_code : '')) }}"
            placeholder="e.g. RG-SG-OR-002, ER-SG-FS-003"
            class="admin-input"
            style="width: 100%; font-weight: 700;"
            required
          />
        </div>

        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
            LINK COLLECTION <span style="font-size: 11px; font-weight: 500; color: var(--admin-text-muted);">(OPTIONAL)</span>
          </label>
          <select name="product_id" id="product_id_select" class="admin-input" style="width: 100%;" onchange="autoFillDesignCode(this)">
            <option value="">-- None / Standalone Design --</option>
            @foreach($products as $p)
              <option value="{{ $p->id }}" data-code="{{ $p->design_code }}" {{ (old('product_id', $log->product_id) == $p->id) ? 'selected' : '' }}>
                {{ $p->design_code }}
              </option>
            @endforeach
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- TYPE -->
        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
            TYPE
          </label>
          <input
            type="text"
            name="design_type"
            value="{{ old('design_type', $specs['type'] ?? $log->design_type ?? 'BESPOKE DESIGN') }}"
            placeholder="e.g. BESPOKE DESIGN, SOLITAIRE SIGNET, PENDANT"
            class="admin-input"
            style="width: 100%;"
            required
          />
        </div>

        <!-- MATERIAL OPTIONS -->
        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
            MATERIAL OPTIONS
          </label>
          <input
            type="text"
            name="material_options"
            value="{{ old('material_options', $specs['material_options'] ?? '24KT Solid Gold, 22KT Solid Gold, 18KT Solid Gold') }}"
            placeholder="e.g. 24KT Solid Gold, 22KT Solid Gold, 18KT Solid Gold"
            class="admin-input"
            style="width: 100%;"
          />
        </div>
      </div>

      <!-- FINISH OPTIONS & SIZE OPTIONS -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
            FINISH OPTIONS
          </label>
          <input
            type="text"
            name="finish_options"
            value="{{ old('finish_options', $specs['finish_options'] ?? 'Yellow Gold, Rose Gold, White Gold') }}"
            placeholder="e.g. Yellow Gold, Rose Gold, White Gold"
            class="admin-input"
            style="width: 100%;"
          />
        </div>

        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
            SIZE OPTIONS
          </label>
          <input
            type="text"
            name="size_options"
            value="{{ old('size_options', $specs['size_options'] ?? '10, 12, 14, 16') }}"
            placeholder="e.g. 10, 12, 14, 16"
            class="admin-input"
            style="width: 100%;"
          />
        </div>
      </div>

      <!-- GEM / STONE OPTIONS -->
      <div>
        <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
          GEM / STONE OPTIONS
        </label>
        <textarea
          name="gem_options"
          rows="2"
          class="admin-input"
          style="width: 100%; resize: vertical;"
          placeholder="e.g. Natural Diamond (VVS-VS), Zambian Emerald, Ceylon Blue Sapphire, Burmese Ruby, No Stone / Solid Gold"
        >{{ old('gem_options', $specs['gem_options'] ?? 'Natural Diamond (VVS-VS), Zambian Emerald, Ceylon Blue Sapphire, Burmese Ruby, No Stone / Solid Gold') }}</textarea>
      </div>

      <!-- INSPIRATION: CUSTOM LABEL & CONTENT -->
      <div style="background: var(--admin-surface-elevated); padding: 18px 20px; border-radius: 10px; border: 1px solid var(--admin-border);">
        <div style="margin-bottom: 12px;">
          <span style="font-size: 12px; font-weight: 700; color: var(--admin-text-primary); text-transform: uppercase; letter-spacing: 0.05em;">
            INSPIRATION SECTION (LABEL & CONTENT)
          </span>
        </div>
        <div style="display: grid; grid-template-columns: 240px 1fr; gap: 16px;">
          <div>
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: var(--admin-text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">
              FIELD LABEL
            </label>
            <input
              type="text"
              name="inspired_by_label"
              value="{{ old('inspired_by_label', $specs['inspired_by_label'] ?? 'INSPIRED BY') }}"
              placeholder="e.g. INSPIRED BY"
              class="admin-input"
              style="width: 100%; font-weight: 700; text-transform: uppercase;"
            />
          </div>
          <div>
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: var(--admin-text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">
              INSPIRATION / STORY CONTENT
            </label>
            <input
              type="text"
              name="inspired_by"
              value="{{ old('inspired_by', $specs['inspired_by'] ?? $log->inspired_by ?? 'Dewdrop physics and morning horizon light') }}"
              placeholder="e.g. Dewdrop physics and morning horizon light"
              class="admin-input"
              style="width: 100%;"
            />
          </div>
        </div>
      </div>

      <!-- DESIGNED BY & BRAND ORIGIN -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
            DESIGNED BY
          </label>
          <input
            type="text"
            name="designed_by"
            value="{{ old('designed_by', $specs['designed_by'] ?? 'DARSHIT SONI') }}"
            placeholder="e.g. DARSHIT SONI"
            class="admin-input"
            style="width: 100%;"
          />
        </div>

        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
            BRAND ORIGIN
          </label>
          <input
            type="text"
            name="brand_origin"
            value="{{ old('brand_origin', $specs['brand_origin'] ?? 'A PINTAARA™ ORIGINAL') }}"
            placeholder="e.g. A PINTAARA™ ORIGINAL"
            class="admin-input"
            style="width: 100%;"
          />
        </div>
      </div>

      <!-- BOTTOM ROW: STATUS / COLLECTION / RELEASE -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
            STATUS
          </label>
          <input
            type="text"
            name="status"
            value="{{ old('status', $specs['status'] ?? $log->status ?? 'UNDER DEVELOPMENT') }}"
            placeholder="e.g. UNDER DEVELOPMENT, PRODUCTION"
            class="admin-input"
            style="width: 100%;"
          />
        </div>

        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
            COLLECTION
          </label>
          <input
            type="text"
            name="collection"
            value="{{ old('collection', $specs['collection'] ?? ($log->product && $log->product->collection ? $log->product->collection->name : 'SIGNATURE')) }}"
            placeholder="e.g. SIGNATURE, ORIGIN"
            class="admin-input"
            style="width: 100%;"
          />
        </div>

        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 6px;">
            RELEASE
          </label>
          <input
            type="text"
            name="release"
            value="{{ old('release', $specs['release'] ?? 'OCTOBER 2026') }}"
            placeholder="e.g. OCTOBER 2026"
            class="admin-input"
            style="width: 100%;"
          />
        </div>
      </div>

    </div>

    <!-- Actions -->
    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px;">
      <a href="{{ route('admin.design-logs') }}" class="admin-btn admin-btn-secondary">
        Cancel
      </a>
      <button type="submit" class="admin-btn admin-btn-primary" style="padding: 12px 28px; font-size: 14px;">
        Save Specification Changes
      </button>
    </div>

  </form>

</div>

<script>
function autoFillDesignCode(selectEl) {
  const selectedOpt = selectEl.options[selectEl.selectedIndex];
  const code = selectedOpt.getAttribute('data-code');
  const codeInput = document.getElementById('design_code_field');
  if (code && codeInput && !codeInput.value) {
    codeInput.value = code;
  }
}

function handleFileDrop(e, type) {
  e.preventDefault();
  const dropzone = document.getElementById('bp_dropzone');
  dropzone.style.borderColor = 'var(--admin-border)';
  dropzone.style.background = 'var(--admin-surface)';
  
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    uploadFile(file, type);
  }
}

function uploadFileDirectly(input, type) {
  if (input.files && input.files.length > 0) {
    uploadFile(input.files[0], type);
  }
}

function uploadFile(file, type) {
  // Show local preview immediately
  const previewImg = document.getElementById('bp_preview_img');
  previewImg.src = URL.createObjectURL(file);

  const spinner = document.getElementById('bp_spinner');
  const badge = document.getElementById('bp_status_badge');
  spinner.style.display = 'block';
  badge.style.display = 'none';

  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', type);

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '{{ csrf_token() }}';

  fetch('{{ route("admin.upload-image") }}', {
    method: 'POST',
    headers: {
      'X-CSRF-TOKEN': csrfToken,
    },
    body: formData,
  })
  .then(res => res.json())
  .then(data => {
    spinner.style.display = 'none';
    if (data.status === 'success' && data.url) {
      document.getElementById('bp_image_input').value = data.url;
      previewImg.src = data.url;
      badge.textContent = '✓ Uploaded Successfully';
      badge.style.display = 'inline-block';
    } else {
      alert('Upload failed: ' + (data.message || 'Unknown error'));
    }
  })
  .catch(err => {
    spinner.style.display = 'none';
    console.error('Upload error:', err);
    badge.textContent = '✓ File attached (will save on submit)';
    badge.style.display = 'inline-block';
  });
}
</script>
@endsection
