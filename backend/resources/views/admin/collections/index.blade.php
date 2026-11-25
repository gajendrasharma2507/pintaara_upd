@extends('layouts.admin')

@section('title', 'Collections')

@section('content')
<div style="display: flex; flex-direction: column; gap: 24px; max-width: 1400px; margin: 0 auto;">

  <!-- Header -->
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
    <div>
      <h1 style="font-size: 24px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 4px 0;">
        Collections Master
      </h1>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 0;">
        Manage storefront jewelry categories, URLs, and piece curation sequences.
      </p>
    </div>

    <button onclick="openAddCollectionModal()" class="admin-btn admin-btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span>Add Collection</span>
    </button>
  </div>

  <!-- Collections Table Card -->
  <div class="admin-card" style="border-radius: 14px; background: var(--admin-surface); border: 1px solid var(--admin-border); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
    <div style="overflow-x: auto;">
      <table class="admin-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em; width: 80px;">Image</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em;">Category</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em;">Storefront Route</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em; text-align: center; width: 90px;">Pieces</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em; text-align: center; width: 120px;">Status</th>
            <th style="padding: 16px 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.06em; text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          @forelse($collections as $col)
            @php
              $imgUrl = $col->image ?: '/images/products/ring.png';
              $isActive = ($col->status ?? 'active') === 'active';
              $routeSlug = strtolower(rtrim($col->slug, 's'));
            @endphp
            <tr style="border-bottom: 1px solid var(--admin-border-light); transition: background 0.15s;">
              
              <!-- Thumbnail Image -->
              <td style="padding: 14px 20px; vertical-align: middle;">
                <div style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; background: #FAF5F0; border: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img
                    src="{{ $imgUrl }}"
                    alt="{{ $col->name }}"
                    style="width: 100%; height: 100%; object-fit: cover;"
                    onerror="this.onerror=null; this.src='/images/products/ring.png';"
                  />
                </div>
              </td>

              <!-- Name -->
              <td style="padding: 14px 20px; vertical-align: middle;">
                <div style="font-size: 15px; font-weight: 700; color: var(--admin-text-primary); text-transform: lowercase;">
                  {{ strtolower($col->name) }}
                </div>
              </td>

              <!-- Storefront Route Badge -->
              <td style="padding: 14px 20px; vertical-align: middle;">
                <a href="https://pintaara.com/collection/{{ $col->slug }}" target="_blank" style="text-decoration: none;">
                  <span style="font-family: monospace; font-size: 12px; font-weight: 500; background: #EFF6FF; color: #2563EB; padding: 5px 12px; border-radius: 6px; border: 1px solid #DBEAFE; display: inline-block;">
                    /collection/{{ $col->slug }}
                  </span>
                </a>
              </td>

              <!-- Pieces Count -->
              <td style="padding: 14px 20px; text-align: center; vertical-align: middle;">
                <span style="font-size: 15px; font-weight: 800; color: var(--admin-text-primary);">
                  {{ $col->products_count }}
                </span>
              </td>

              <!-- Status Pill -->
              <td style="padding: 14px 20px; text-align: center; vertical-align: middle;">
                @if($isActive)
                  <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0;">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981;"></span>
                    Active
                  </span>
                @else
                  <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #F1F5F9; color: #64748B; border: 1px solid #CBD5E1;">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #94A3B8;"></span>
                    Draft
                  </span>
                @endif
              </td>

              <!-- Action Buttons (Edit / Delete) -->
              <td style="padding: 14px 20px; text-align: right; vertical-align: middle;">
                <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 8px;">
                  
                  <!-- Edit Button -->
                  <button
                    type="button"
                    onclick="openEditCollectionModal({{ json_encode($col) }})"
                    class="admin-btn admin-btn-edit"
                  >
                    Edit
                  </button>

                  <!-- Delete Button -->
                  <form action="{{ route('admin.collections.delete', $col->id) }}" method="POST" onsubmit="return confirm('Delete collection {{ $col->name }}?');" style="margin: 0;">
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
                No collections found.
              </td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>
  </div>

</div>

<!-- ============================================================ -->
<!-- ADD COLLECTION MODAL -->
<!-- ============================================================ -->
<div id="addCollectionModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
  <div style="background: var(--admin-surface); width: 100%; max-width: 520px; border-radius: 14px; border: 1px solid var(--admin-border); box-shadow: 0 20px 40px rgba(0,0,0,0.25); overflow: hidden;">
    <div style="padding: 20px 24px; border-bottom: 1px solid var(--admin-border-light); display: flex; align-items: center; justify-content: space-between;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--admin-text-primary);">Add New Collection</h3>
      <button type="button" onclick="closeAddCollectionModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--admin-text-muted);">&times;</button>
    </div>

    <form action="{{ route('admin.collections.store') }}" method="POST" enctype="multipart/form-data" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
      @csrf
      <div>
        <label style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Category Name *</label>
        <input type="text" name="name" required placeholder="e.g. Necklaces" class="admin-input" id="new_col_name" oninput="autoSlug(this.value, 'new_col_slug')">
      </div>

      <div>
        <label style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Slug (URL Path) *</label>
        <input type="text" name="slug" required placeholder="e.g. necklaces" class="admin-input" id="new_col_slug">
      </div>

      <!-- Collection Image Uploader -->
      <div>
        <label style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Collection Image</label>
        <div style="background: var(--admin-surface-elevated); padding: 14px; border-radius: 10px; border: 1px solid var(--admin-border); display: flex; align-items: center; gap: 14px;">
          <!-- Preview Thumbnail -->
          <div style="width: 72px; height: 72px; border-radius: 8px; overflow: hidden; background: #FAF5F0; border: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img
              id="add_col_preview"
              src="/images/products/ring.png"
              alt="Preview"
              style="width: 100%; height: 100%; object-fit: cover;"
              onerror="this.onerror=null; this.src='/images/products/ring.png';"
            />
          </div>

          <!-- Dropzone / Browse -->
          <div
            onclick="document.getElementById('add_col_file_input').click()"
            ondragover="event.preventDefault(); this.style.borderColor='var(--admin-primary)'; this.style.background='var(--admin-primary-light)';"
            ondragleave="this.style.borderColor='var(--admin-border)'; this.style.background='var(--admin-surface)';"
            ondrop="handleCollectionDrop(event, 'add')"
            style="flex: 1; border: 2px dashed var(--admin-border); border-radius: 8px; padding: 12px 14px; text-align: center; cursor: pointer; background: var(--admin-surface); transition: all 0.2s;"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 4px auto; display: block; color: var(--admin-primary);">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <div style="font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary);">
              Click to browse or drag & drop image
            </div>
            <div id="add_col_status" style="font-size: 11px; color: var(--admin-text-secondary); margin-top: 2px;">
              PNG, JPG, WEBP, SVG
            </div>
          </div>
        </div>

        <input type="hidden" name="image" id="add_col_image" value="/images/products/ring.png">
        <input type="file" id="add_col_file_input" name="image_file" accept="image/*" style="display: none;" onchange="handleCollectionFileSelect(this, 'add')">
      </div>

      <div>
        <label style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Status</label>
        <select name="status" class="admin-input">
          <option value="active" selected>Active</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" onclick="closeAddCollectionModal()" class="admin-btn admin-btn-secondary">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Create Collection</button>
      </div>
    </form>
  </div>
</div>

<!-- ============================================================ -->
<!-- EDIT COLLECTION MODAL -->
<!-- ============================================================ -->
<div id="editCollectionModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
  <div style="background: var(--admin-surface); width: 100%; max-width: 520px; border-radius: 14px; border: 1px solid var(--admin-border); box-shadow: 0 20px 40px rgba(0,0,0,0.25); overflow: hidden;">
    <div style="padding: 20px 24px; border-bottom: 1px solid var(--admin-border-light); display: flex; align-items: center; justify-content: space-between;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--admin-text-primary);">Edit Collection</h3>
      <button type="button" onclick="closeEditCollectionModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--admin-text-muted);">&times;</button>
    </div>

    <form id="editCollectionForm" method="POST" enctype="multipart/form-data" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
      @csrf
      @method('PUT')
      <div>
        <label style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Category Name *</label>
        <input type="text" name="name" id="edit_col_name" required class="admin-input">
      </div>

      <!-- Collection Image Uploader -->
      <div>
        <label style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Collection Image</label>
        <div style="background: var(--admin-surface-elevated); padding: 14px; border-radius: 10px; border: 1px solid var(--admin-border); display: flex; align-items: center; gap: 14px;">
          <!-- Preview Thumbnail -->
          <div style="width: 72px; height: 72px; border-radius: 8px; overflow: hidden; background: #FAF5F0; border: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img
              id="edit_col_preview"
              src="/images/products/ring.png"
              alt="Preview"
              style="width: 100%; height: 100%; object-fit: cover;"
              onerror="this.onerror=null; this.src='/images/products/ring.png';"
            />
          </div>

          <!-- Dropzone / Browse -->
          <div
            onclick="document.getElementById('edit_col_file_input').click()"
            ondragover="event.preventDefault(); this.style.borderColor='var(--admin-primary)'; this.style.background='var(--admin-primary-light)';"
            ondragleave="this.style.borderColor='var(--admin-border)'; this.style.background='var(--admin-surface)';"
            ondrop="handleCollectionDrop(event, 'edit')"
            style="flex: 1; border: 2px dashed var(--admin-border); border-radius: 8px; padding: 12px 14px; text-align: center; cursor: pointer; background: var(--admin-surface); transition: all 0.2s;"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 4px auto; display: block; color: var(--admin-primary);">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <div style="font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary);">
              Click to browse or drag & drop image
            </div>
            <div id="edit_col_status" style="font-size: 11px; color: var(--admin-text-secondary); margin-top: 2px;">
              PNG, JPG, WEBP, SVG
            </div>
          </div>
        </div>

        <input type="hidden" name="image" id="edit_col_image" value="">
        <input type="file" id="edit_col_file_input" name="image_file" accept="image/*" style="display: none;" onchange="handleCollectionFileSelect(this, 'edit')">
      </div>

      <div>
        <label style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">Status</label>
        <select name="status" id="edit_col_status_select" class="admin-input">
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" onclick="closeEditCollectionModal()" class="admin-btn admin-btn-secondary">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Save Changes</button>
      </div>
    </form>
  </div>
</div>

<script>
function autoSlug(val, targetId) {
  const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  document.getElementById(targetId).value = slug;
}

function openAddCollectionModal() {
  document.getElementById('add_col_name').value = '';
  document.getElementById('new_col_slug').value = '';
  document.getElementById('add_col_image').value = '/images/products/ring.png';
  document.getElementById('add_col_preview').src = '/images/products/ring.png';
  document.getElementById('add_col_status').textContent = 'PNG, JPG, WEBP, SVG';
  document.getElementById('add_col_status').style.color = 'var(--admin-text-secondary)';
  document.getElementById('addCollectionModal').style.display = 'flex';
}
function closeAddCollectionModal() {
  document.getElementById('addCollectionModal').style.display = 'none';
}

function openEditCollectionModal(col) {
  document.getElementById('editCollectionForm').action = '/admin/collections/' + col.id;
  document.getElementById('edit_col_name').value = col.name;
  const colImg = col.image || '/images/products/ring.png';
  document.getElementById('edit_col_image').value = col.image || '';
  document.getElementById('edit_col_preview').src = colImg;
  document.getElementById('edit_col_status_select').value = col.status || 'active';
  document.getElementById('edit_col_status').textContent = 'PNG, JPG, WEBP, SVG';
  document.getElementById('edit_col_status').style.color = 'var(--admin-text-secondary)';
  document.getElementById('editCollectionModal').style.display = 'flex';
}
function closeEditCollectionModal() {
  document.getElementById('editCollectionModal').style.display = 'none';
}

function handleCollectionFileSelect(input, mode) {
  if (!input.files || !input.files[0]) return;
  uploadCollectionFile(input.files[0], mode);
}

function handleCollectionDrop(event, mode) {
  event.preventDefault();
  const dropzone = event.currentTarget;
  dropzone.style.borderColor = 'var(--admin-border)';
  dropzone.style.background = 'var(--admin-surface)';

  if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
    uploadCollectionFile(event.dataTransfer.files[0], mode);
  }
}

function uploadCollectionFile(file, mode) {
  const previewImg = document.getElementById(mode + '_col_preview');
  const statusEl = document.getElementById(mode + '_col_status');
  const hiddenInput = document.getElementById(mode + '_col_image');

  // Instant local preview
  const reader = new FileReader();
  reader.onload = function(e) {
    if (previewImg) previewImg.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // Upload via AJAX
  if (statusEl) {
    statusEl.textContent = 'Uploading...';
    statusEl.style.color = 'var(--admin-primary)';
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', 'collections');

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

  fetch('{{ route("admin.upload-image") }}', {
    method: 'POST',
    headers: {
      'X-CSRF-TOKEN': csrfToken,
      'Accept': 'application/json'
    },
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success' && data.url) {
      if (hiddenInput) hiddenInput.value = data.url;
      if (previewImg) previewImg.src = data.url;
      if (statusEl) {
        statusEl.textContent = '✓ Uploaded successfully';
        statusEl.style.color = '#059669';
      }
    } else {
      if (statusEl) {
        statusEl.textContent = 'Selected (will save on submit)';
        statusEl.style.color = 'var(--admin-text-secondary)';
      }
    }
  })
  .catch(err => {
    console.warn('AJAX upload error, will upload via form submit', err);
    if (statusEl) {
      statusEl.textContent = 'Selected (will save on submit)';
      statusEl.style.color = 'var(--admin-text-secondary)';
    }
  });
}
</script>
@endsection
