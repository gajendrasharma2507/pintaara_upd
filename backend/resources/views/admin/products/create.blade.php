@extends('layouts.admin')

@section('title', 'Add New Piece')

@section('content')
<div style="max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">

  <div style="display: flex; align-items: center; justify-content: space-between;">
    <div>
      <h1 style="font-size: 24px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 4px 0;">
        Add New Jewellery Piece
      </h1>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 0;">
        Enter design specification, metal weights, and PINTAARA crafting rules.
      </p>
    </div>
    <a href="{{ route('admin.products') }}" class="admin-btn-outline">
      &larr; Back to Catalog
    </a>
  </div>

  <form action="{{ route('admin.products.store') }}" method="POST" enctype="multipart/form-data" onsubmit="syncFormInputs()" class="admin-card" style="padding: 32px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border); display: flex; flex-direction: column; gap: 20px;">
    @csrf

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <label class="admin-label">Product Name *</label>
        <input type="text" name="name" value="{{ old('name') }}" required placeholder="e.g. Origin Signet Ring" class="admin-input">
      </div>
      <div>
        <label class="admin-label">Design Code (SKU) *</label>
        <input type="text" name="design_code" value="{{ old('design_code') }}" required placeholder="e.g. RG-SG-OR-005" class="admin-input">
      </div>
    </div>

    <div>
      <label class="admin-label">Collection *</label>
      <select name="collection_master_id" required class="admin-input">
        <option value="">Select Collection</option>
        @foreach($collections as $col)
          <option value="{{ $col->id }}" {{ old('collection_master_id') == $col->id ? 'selected' : '' }}>{{ $col->name }}</option>
        @endforeach
      </select>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px;">
      <div>
        <label class="admin-label">Net Weight (g) *</label>
        <input type="number" step="0.001" name="base_weight_grams" value="{{ old('base_weight_grams', '8.500') }}" required class="admin-input" placeholder="8.500">
      </div>
      <div>
        <label class="admin-label">Making Charge (%)</label>
        <input type="number" step="0.01" name="making_charge_percent" value="{{ old('making_charge_percent', '12.00') }}" class="admin-input" placeholder="12.00">
      </div>
      <div>
        <label class="admin-label">Brand Markup (%)</label>
        <input type="number" step="0.01" name="brand_markup_percent" value="{{ old('brand_markup_percent', '10.00') }}" class="admin-input" placeholder="10.00">
      </div>
      <div>
        <label class="admin-label">Other Charge (₹)</label>
        <input type="number" step="0.01" name="other_charges" value="{{ old('other_charges', '0.00') }}" class="admin-input" placeholder="0.00">
      </div>
    </div>

    <div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <label class="admin-label" style="margin: 0; font-size: 13.5px; font-weight: 700; color: var(--admin-text-primary);">
          Limited Edition
        </label>
        <label style="display: inline-flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; margin: 0;">
          <span style="position: relative; display: inline-block; width: 44px; height: 24px;">
            <input type="checkbox" name="is_limited_edition" id="is_limited_edition_toggle" value="1" {{ old('is_limited_edition', '1') ? 'checked' : '' }} style="opacity: 0; width: 0; height: 0; position: absolute;" onchange="handleEditionSwitch(this.checked)">
            <span id="edition_switch_slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: {{ old('is_limited_edition', '1') ? '#10B981' : '#64748B' }}; transition: 0.25s; border-radius: 24px;">
              <span id="edition_switch_knob" style="position: absolute; content: ''; height: 18px; width: 18px; left: {{ old('is_limited_edition', '1') ? '23px' : '3px' }}; bottom: 3px; background-color: white; transition: 0.25s; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></span>
            </span>
          </span>
          <span id="edition_switch_label" style="font-size: 12.5px; font-weight: 700; color: var(--admin-text-primary); min-width: 55px;">
            {{ old('is_limited_edition', '1') ? 'Enabled' : 'Disabled' }}
          </span>
        </label>
      </div>

      <div id="limited_edition_inputs_row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; transition: opacity 0.2s; {{ old('is_limited_edition', '1') ? '' : 'opacity: 0.45; pointer-events: none;' }}">
        <div>
          <label class="admin-label">Edition Title / Text Prefix *</label>
          <input type="text" name="edition_prefix" id="edition_prefix_input" value="{{ old('edition_prefix', 'LIMITED EDITION') }}" class="admin-input" placeholder="e.g. LIMITED EDITION">
        </div>
        <div>
          <label class="admin-label">Current Piece No. *</label>
          <input type="number" name="edition_current" id="edition_current_input" min="0" value="{{ old('edition_current', 1) }}" class="admin-input" placeholder="1">
        </div>
        <div>
          <label class="admin-label">Total Edition Limit *</label>
          <input type="number" name="edition_limit" id="edition_limit_input" min="1" value="{{ old('edition_limit', 50) }}" class="admin-input" placeholder="50">
        </div>
      </div>
    </div>

    <!-- METAL PURITY (KT) SELECTION & LIVE PRICING -->
    <div style="background: var(--admin-surface-elevated); padding: 22px; border-radius: 14px; border: 1px solid var(--admin-border); display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div>
          <label class="admin-label" style="font-size: 13.5px; font-weight: 800; color: var(--admin-text-primary); margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
            METAL PURITY (KT)
          </label>
          <p style="font-size: 12px; color: var(--admin-text-secondary); margin: 2px 0 0 0;">
            Select which metal purities this piece is available in.
          </p>
        </div>
        <div style="font-size: 11px; color: var(--admin-text-muted);">
          Select Multiple Available Purities
        </div>
      </div>

      @php
        $selectedPurities = old('available_purities', ['22KT', '18KT', '14KT']);
        $allPuritiesConfig = [
          '22KT' => [
            'label' => '22KT Gold',
            'sub' => '91.6% Hallmark Gold',
            'rate' => (float) ($rates['purities'][0]['rate_per_gram'] ?? ($rates['gold_22kt_per_gram'] ?? 13740.00)),
            'badge' => '#D4AF37'
          ],
          '18KT' => [
            'label' => '18KT Gold',
            'sub' => '75.0% Fine Diamond Setting',
            'rate' => (float) ($rates['purities'][1]['rate_per_gram'] ?? ($rates['gold_18kt_per_gram'] ?? 11250.00)),
            'badge' => '#B8860B'
          ],
          '14KT' => [
            'label' => '14KT Gold',
            'sub' => '58.5% Everyday Atelier',
            'rate' => (float) ($rates['purities'][2]['rate_per_gram'] ?? ($rates['gold_14kt_per_gram'] ?? 8775.00)),
            'badge' => '#9A7C38'
          ],
          '925 SILVER' => [
            'label' => '925 SILVER',
            'sub' => '92.5% Sterling Hallmark',
            'rate' => (float) ($rates['purities'][3]['rate_per_gram'] ?? ($rates['silver_per_gram'] ?? 177.91)),
            'badge' => '#64748B'
          ],
        ];
      @endphp

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        @foreach($allPuritiesConfig as $key => $conf)
          @php
            $isChecked = in_array($key, $selectedPurities ?? []);
            $slug = Str::slug($key);
          @endphp
          <div id="card_purity_{{ $slug }}" style="background: var(--admin-surface); border: 2px solid {{ $isChecked ? $conf['badge'] : 'var(--admin-border)' }}; border-radius: 12px; padding: 14px 16px; transition: all 0.2s;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 700; font-size: 14px; color: var(--admin-text-primary); margin: 0;">
                <input
                  type="checkbox"
                  name="available_purities[]"
                  value="{{ $key }}"
                  class="purity-checkbox"
                  data-purity-key="{{ $slug }}"
                  data-color="{{ $conf['badge'] }}"
                  {{ $isChecked ? 'checked' : '' }}
                  style="width: 16px; height: 16px; accent-color: {{ $conf['badge'] }}; cursor: pointer;"
                  onchange="handlePurityToggle(this)"
                />
                <span>{{ $key }}</span>
              </label>
              <span style="font-size: 10px; font-weight: 700; color: {{ $conf['badge'] }}; background: var(--admin-surface-elevated); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--admin-border);">
                ₹{{ number_format($conf['rate'], 2) }}/g
              </span>
            </div>

            <div style="font-size: 11px; color: var(--admin-text-muted); margin-top: 6px; margin-left: 24px;">
              {{ $conf['sub'] }}
            </div>
          </div>
        @endforeach
      </div>
    </div>

    <!-- FINISH OPTIONS SELECTION -->
    <div style="background: var(--admin-surface-elevated); padding: 22px; border-radius: 14px; border: 1px solid var(--admin-border); display: flex; flex-direction: column; gap: 16px;">
      <div>
        <label class="admin-label" style="font-size: 13.5px; font-weight: 800; color: var(--admin-text-primary); margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
          FINISH OPTIONS
        </label>
      </div>

      @php
        $selectedFinishes = old('available_finishes', ['YG', 'WG', 'RG', 'BLK']);
        if (!is_array($selectedFinishes) || empty($selectedFinishes)) {
          $selectedFinishes = ['YG', 'WG', 'RG', 'BLK'];
        }
        $allFinishesConfig = [
          'YG' => [
            'label' => 'Yellow Gold (YG)',
            'badge' => '#D4AF37',
            'gradient' => 'linear-gradient(180deg, #8B6508 0%, #C99700 15%, #E5B824 35%, #FBE580 50%, #C99700 80%, #7D5A02 100%)',
          ],
          'WG' => [
            'label' => 'White Gold (WG)',
            'badge' => '#94A3B8',
            'gradient' => 'linear-gradient(180deg, #55585B 0%, #8A8E93 15%, #C2C6CC 35%, #F0F2F5 50%, #8A8E93 80%, #484A4D 100%)',
          ],
          'RG' => [
            'label' => 'Rose Gold (RG)',
            'badge' => '#B76E79',
            'gradient' => 'linear-gradient(180deg, #874112 0%, #BA6222 15%, #DB7F3E 35%, #F5B37B 50%, #BA6222 80%, #75360B 100%)',
          ],
          'BLK' => [
            'label' => 'Black Ruthenium (BLK)',
            'badge' => '#1E293B',
            'gradient' => 'linear-gradient(180deg, #111315 0%, #2A2E33 15%, #4C525A 35%, #828A94 50%, #2A2E33 80%, #111315 100%)',
          ],
        ];
      @endphp

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        @foreach($allFinishesConfig as $key => $conf)
          @php
            $isChecked = in_array($key, $selectedFinishes ?? []);
            $slug = strtolower($key);
          @endphp
          <div id="card_finish_{{ $slug }}" style="background: var(--admin-surface); border: 2px solid {{ $isChecked ? $conf['badge'] : 'var(--admin-border)' }}; border-radius: 12px; padding: 14px 16px; transition: all 0.2s;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 700; font-size: 14px; color: var(--admin-text-primary); margin: 0;">
                <input
                  type="checkbox"
                  name="available_finishes[]"
                  value="{{ $key }}"
                  class="finish-checkbox"
                  data-finish-key="{{ $key }}"
                  data-slug="{{ $slug }}"
                  data-color="{{ $conf['badge'] }}"
                  {{ $isChecked ? 'checked' : '' }}
                  style="width: 16px; height: 16px; accent-color: {{ $conf['badge'] }}; cursor: pointer;"
                  onchange="handleFinishToggle(this)"
                />
                <span>{{ $conf['label'] }}</span>
              </label>
              <div style="width: 32px; height: 16px; border-radius: 4px; background: {{ $conf['gradient'] }}; border: 1px solid rgba(0,0,0,0.25); box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
            </div>
          </div>
        @endforeach
      </div>
    </div>

    <!-- Multiple Piece Images Gallery Grouped by Finish Option -->
    <div style="background: var(--admin-surface-elevated); padding: 22px; border-radius: 12px; border: 1px solid var(--admin-border);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-size: 15px; font-weight: 700; color: var(--admin-text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>📸 Finish Piece Images Gallery</span>
          </h3>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="gallery_status_badge" style="display: none; font-size: 11.5px; font-weight: 600; color: #16a34a; background: #f0fdf4; padding: 4px 10px; border-radius: 999px; border: 1px solid #bbf7d0;"></span>
        </div>
      </div>

      <!-- Finish Option Tabs -->
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--admin-border);" id="finish_tabs_container">
        <!-- Generated by JS -->
      </div>

      <!-- Drag & Drop Uploader Area -->
      <div
        id="gallery_dropzone"
        onclick="document.getElementById('gallery_file_input').click()"
        style="border: 2px dashed var(--admin-border); border-radius: 10px; padding: 22px 20px; text-align: center; cursor: pointer; background: var(--admin-surface); transition: all 0.2s;"
        ondragover="event.preventDefault(); this.style.borderColor='var(--admin-primary)'; this.style.background='var(--admin-primary-light)';"
        ondragleave="this.style.borderColor='var(--admin-border)'; this.style.background='var(--admin-surface)';"
        ondrop="handleGalleryDrop(event)"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 6px auto; display: block; color: var(--admin-primary);">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <div style="font-size: 13.5px; color: var(--admin-text-primary); font-weight: 700;" id="dropzone_prompt_text">
          Click to browse or drag & drop images for Yellow Gold (YG)
        </div>
        <div style="font-size: 11.5px; color: var(--admin-text-secondary); margin-top: 3px;">
          Select multiple images at once (PNG, JPG, JPEG, WEBP, SVG up to 20MB each)
        </div>
        <div id="gallery_spinner" style="display: none; margin-top: 10px; color: var(--admin-primary); font-size: 12px; font-weight: 600;">
          Uploading images to server...
        </div>
      </div>

      <!-- Hidden file input for multiple selection -->
      <input
        type="file"
        id="gallery_file_input"
        multiple
        accept="image/*"
        style="display: none;"
        onchange="uploadMultipleFiles(this.files)"
      />

      <!-- Hidden fields for submission -->
      <input type="hidden" id="finish_images_json" name="finish_images_json" value="" />
      <input type="hidden" id="primary_image_input" name="primary_image" value="" />
      <div id="legacy_hidden_images_container"></div>

      <!-- Thumbnails Grid for Active Finish -->
      <div style="margin-top: 18px;">
        <div style="margin-bottom: 10px;">
          <span style="font-size: 12px; font-weight: 700; color: var(--admin-text-secondary); text-transform: uppercase; letter-spacing: 0.05em;" id="active_grid_header">
            Images in this finish
          </span>
        </div>

        <div id="gallery_grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 14px;">
          <!-- Dynamically populated cards for active finish -->
        </div>

        <div id="gallery_empty_notice" style="display: none; padding: 28px 16px; text-align: center; color: var(--admin-text-muted); font-size: 12.5px; border: 1px dashed var(--admin-border); border-radius: 8px; background: var(--admin-surface);">
          No images uploaded for this finish yet. Click the upload box above to add images for this finish.
        </div>
      </div>
    </div>

    <div>
      <label class="admin-label">Product Description</label>
      <textarea name="description" rows="4" class="admin-input" placeholder="Crafted with pure architectural precision and comfort fit shank...">{{ old('description') }}</textarea>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
      <a href="{{ route('admin.products') }}" class="admin-btn-ghost">Cancel</a>
      <button type="submit" class="admin-btn-primary" style="padding: 10px 24px;">Save Piece</button>
    </div>
  </form>

</div>

<script>
let galleryImages = [];

const FINISH_CONFIG = [
  { key: 'YG', name: 'Yellow Gold (YG)', code: 'YG', color: '#D4AF37', desc: 'Gallery images displayed when patron chooses Yellow Gold' },
  { key: 'WG', name: 'White Gold (WG)', code: 'WG', color: '#94A3B8', desc: 'Gallery images displayed when patron chooses White Gold' },
  { key: 'RG', name: 'Rose Gold (RG)', code: 'RG', color: '#B76E79', desc: 'Gallery images displayed when patron chooses Rose Gold' },
  { key: 'BLK', name: 'Black Ruthenium / Black Gold (BLK)', code: 'BLK', color: '#1E293B', desc: 'Gallery images displayed when patron chooses Black Ruthenium / Black Gold' }
];

let activeFinishKey = 'YG';

function switchFinishTab(key) {
  activeFinishKey = key;
  renderFinishTabs();
  renderActiveGallery();
}

function getSelectedFinishKeys() {
  const checkboxes = document.querySelectorAll('.finish-checkbox:checked');
  const selected = Array.from(checkboxes).map(cb => cb.getAttribute('data-finish-key'));
  return selected.length > 0 ? selected : ['YG'];
}

function handleFinishToggle(checkbox) {
  const slug = checkbox.getAttribute('data-slug');
  const color = checkbox.getAttribute('data-color') || '#D4AF37';
  const card = document.getElementById('card_finish_' + slug);
  if (card) {
    card.style.borderColor = checkbox.checked ? color : 'var(--admin-border)';
  }

  const selectedKeys = getSelectedFinishKeys();
  if (!selectedKeys.includes(activeFinishKey)) {
    activeFinishKey = selectedKeys[0] || 'YG';
  }

  renderFinishTabs();
  renderActiveGallery();
}

function renderFinishTabs() {
  const container = document.getElementById('finish_tabs_container');
  if (!container) return;

  container.innerHTML = '';

  const selectedKeys = getSelectedFinishKeys();
  const visibleFinishes = FINISH_CONFIG.filter(f => selectedKeys.includes(f.key));

  if (!selectedKeys.includes(activeFinishKey)) {
    activeFinishKey = visibleFinishes[0]?.key || 'YG';
  }

  visibleFinishes.forEach(f => {
    const count = galleryImages.filter(img => (img.finish_key || 'YG') === f.key).length;
    const isActive = f.key === activeFinishKey;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.onclick = () => switchFinishTab(f.key);
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.gap = '8px';
    btn.style.padding = '8px 14px';
    btn.style.borderRadius = '8px';
    btn.style.fontSize = '12.5px';
    btn.style.fontWeight = isActive ? '700' : '500';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'all 0.15s ease';
    btn.style.whiteSpace = 'nowrap';

    if (isActive) {
      btn.style.background = '#0F172A';
      btn.style.color = '#FFFFFF';
      btn.style.border = `2px solid ${f.color}`;
      btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
    } else {
      btn.style.background = 'var(--admin-surface)';
      btn.style.color = 'var(--admin-text-primary)';
      btn.style.border = '1px solid var(--admin-border)';
    }

    btn.innerHTML = `
      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${f.color}; border: 1px solid rgba(255,255,255,0.4);"></span>
      <span>${escapeHtml(f.name)}</span>
      <span style="font-size: 10.5px; padding: 1px 6px; border-radius: 999px; font-weight: 700; ${
        isActive
          ? 'background: rgba(255,255,255,0.2); color: #FFFFFF;'
          : 'background: var(--admin-surface-elevated); color: var(--admin-text-secondary); border: 1px solid var(--admin-border);'
      }">
        ${count}
      </span>
    `;

    container.appendChild(btn);
  });

  const activeConf = FINISH_CONFIG.find(c => c.key === activeFinishKey) || FINISH_CONFIG[0];
  const activeCount = galleryImages.filter(img => (img.finish_key || 'YG') === activeFinishKey).length;

  const dropzonePrompt = document.getElementById('dropzone_prompt_text');
  const gridHeader = document.getElementById('active_grid_header');

  if (dropzonePrompt) dropzonePrompt.textContent = `Click to browse or drag & drop images for ${activeConf.name}`;
  if (gridHeader) gridHeader.textContent = `${activeConf.name} Images (${activeCount})`;
}

function renderActiveGallery() {
  const grid = document.getElementById('gallery_grid');
  const emptyNotice = document.getElementById('gallery_empty_notice');
  const totalCountSpan = document.getElementById('total_images_count');

  if (!grid) return;
  grid.innerHTML = '';

  const activeConf = FINISH_CONFIG.find(c => c.key === activeFinishKey) || FINISH_CONFIG[0];
  const currentImages = galleryImages.filter(img => (img.finish_key || 'default') === activeFinishKey);

  if (totalCountSpan) totalCountSpan.textContent = galleryImages.length;

  if (currentImages.length === 0) {
    if (emptyNotice) {
      emptyNotice.style.display = 'block';
      emptyNotice.textContent = `No images uploaded for ${activeConf.name} yet. Click the box above to upload images for this finish.`;
    }
  } else {
    if (emptyNotice) emptyNotice.style.display = 'none';

    currentImages.forEach((img) => {
      // Find index in main galleryImages array
      const globalIndex = galleryImages.indexOf(img);

      const card = document.createElement('div');
      card.style.borderRadius = '10px';
      card.style.overflow = 'hidden';
      card.style.position = 'relative';
      card.style.background = '#FFFFFF';
      card.style.border = img.is_primary ? '2px solid #10B981' : '1px solid var(--admin-border)';
      card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';

      card.innerHTML = `
        <!-- Top left finish badge -->
        <div style="position: absolute; top: 6px; left: 6px; z-index: 2;">
          <span style="font-size: 9.5px; font-weight: 700; color: #FFFFFF; background: ${activeConf.color}; padding: 2px 6px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.3);">
            ${escapeHtml(activeConf.code || activeConf.key)}
          </span>
        </div>

        <!-- Top right remove button -->
        <div style="position: absolute; top: 6px; right: 6px; z-index: 2;">
          <button
            type="button"
            onclick="removeGalleryImage(${globalIndex})"
            title="Remove image"
            style="background: rgba(220, 38, 38, 0.9); border: none; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px; line-height: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"
          >&times;</button>
        </div>

        <!-- Thumbnail Preview -->
        <div style="width: 100%; aspect-ratio: 1/1; background: #FAFAFA; display: flex; align-items: center; justify-content: center; overflow: hidden;">
          <img
            src="${escapeHtml(img.url)}"
            alt="Piece Image"
            style="width: 100%; height: 100%; object-fit: contain; padding: 6px;"
            onerror="this.src='/images/products/piece-dummy.png'"
          />
        </div>

        <!-- Bottom primary action bar -->
        <div style="padding: 6px 8px; background: #F8FAFC; border-top: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between;">
          <button
            type="button"
            onclick="setPrimaryImage(${globalIndex})"
            style="border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 700; padding: 0; display: flex; align-items: center; gap: 4px; color: ${img.is_primary ? '#059669' : '#64748B'};"
          >
            ${img.is_primary ? '★ Primary' : '☆ Set Primary'}
          </button>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  syncFormInputs();
}

function removeGalleryImage(index) {
  if (index >= 0 && index < galleryImages.length) {
    galleryImages.splice(index, 1);
    renderFinishTabs();
    renderActiveGallery();
  }
}

function setPrimaryImage(index) {
  if (index >= 0 && index < galleryImages.length) {
    galleryImages.forEach((img, i) => {
      img.is_primary = (i === index);
    });
    renderActiveGallery();
  }
}

function handleGalleryDrop(e) {
  e.preventDefault();
  const dropzone = document.getElementById('gallery_dropzone');
  dropzone.style.borderColor = 'var(--admin-border)';
  dropzone.style.background = 'var(--admin-surface)';

  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    uploadMultipleFiles(e.dataTransfer.files);
  }
}

async function uploadMultipleFiles(files) {
  if (!files || files.length === 0) return;

  const spinner = document.getElementById('gallery_spinner');
  const badge = document.getElementById('gallery_status_badge');
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '{{ csrf_token() }}';
  const activeConf = FINISH_CONFIG.find(c => c.key === activeFinishKey) || FINISH_CONFIG[0];

  spinner.style.display = 'block';
  badge.style.display = 'none';

  let uploadedCount = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    spinner.textContent = `Uploading ${i + 1} of ${files.length} to ${activeConf.name}: ${file.name}...`;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'products');

    try {
      const res = await fetch('{{ route("admin.upload-image") }}', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success' && data.url) {
        galleryImages.push({
          id: null,
          url: data.url,
          finish_key: activeFinishKey,
          is_primary: galleryImages.length === 0,
          sort_order: galleryImages.length + 1,
        });
        uploadedCount++;
        renderFinishTabs();
        renderActiveGallery();
      } else {
        alert('Upload failed for ' + file.name + ': ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading ' + file.name);
    }
  }

  spinner.style.display = 'none';
  if (uploadedCount > 0) {
    badge.textContent = `✓ ${uploadedCount} image(s) uploaded to ${activeConf.name}`;
    badge.style.display = 'inline-block';
    setTimeout(() => { badge.style.display = 'none'; }, 4000);
  }
}

function syncFormInputs() {
  const jsonInput = document.getElementById('finish_images_json');
  const primaryInput = document.getElementById('primary_image_input');
  const legacyContainer = document.getElementById('legacy_hidden_images_container');

  if (jsonInput) {
    jsonInput.value = JSON.stringify(galleryImages);
  }

  const primaryImg = galleryImages.find(img => img.is_primary) || galleryImages[0];
  if (primaryInput) {
    primaryInput.value = primaryImg ? primaryImg.url : '';
  }

  if (legacyContainer) {
    legacyContainer.innerHTML = '';
    galleryImages.forEach(img => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'images[]';
      input.value = img.url;
      legacyContainer.appendChild(input);
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  renderFinishTabs();
  renderActiveGallery();
});
</script>
@endsection

