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

  @php
    $allOptionGroupsData = [];
    if (isset($optionGroups)) {
        foreach ($optionGroups as $og) {
            $vals = [];
            foreach ($og->values as $v) {
                $vals[] = [
                    'id' => $v->id,
                    'value' => $v->value,
                    'code' => $v->code,
                    'color_code' => $v->color_code,
                    'image' => $v->image,
                    'price_delta' => $v->price_delta,
                    'sku' => $v->sku,
                    'stock_qty' => $v->stock_qty,
                    'is_active' => (bool)$v->is_active,
                ];
            }
            $allOptionGroupsData[] = [
                'id' => $og->id,
                'name' => $og->name,
                'code' => $og->code,
                'display_type' => $og->display_type,
                'is_required' => (bool)$og->is_required,
                'values' => $vals,
            ];
        }
    }
  @endphp

  <form action="{{ route('admin.products.store') }}" method="POST" enctype="multipart/form-data" onsubmit="syncFormInputs()" class="admin-card" style="padding: 32px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border); display: flex; flex-direction: column; gap: 20px;">
    @csrf

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <label class="admin-label">Product Name <span style="font-size: 11px; font-weight: 400; color: var(--admin-muted);">(Optional)</span></label>
        <input type="text" name="name" value="{{ old('name') }}" placeholder="e.g. Origin Signet Ring (Optional)" class="admin-input">
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
        <input type="number" step="0.001" name="base_weight_grams" value="{{ old('base_weight_grams') }}" required class="admin-input" placeholder="8.500">
      </div>
      <div>
        <label class="admin-label">Making Charge (%)</label>
        <input type="number" step="0.01" name="making_charge_percent" value="{{ old('making_charge_percent') }}" class="admin-input" placeholder="12.00">
      </div>
      <div>
        <label class="admin-label">Brand Markup (%)</label>
        <input type="number" step="0.01" name="brand_markup_percent" value="{{ old('brand_markup_percent') }}" class="admin-input" placeholder="10.00">
      </div>
      <div>
        <label class="admin-label">Other Charge (₹)</label>
        <input type="number" step="0.01" name="other_charges" value="{{ old('other_charges') }}" class="admin-input" placeholder="0.00">
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px;">
      <div>
        <label class="admin-label">Silver Net Weight (g)</label>
        <input type="number" step="0.001" name="silver_weight_grams" value="{{ old('silver_weight_grams') }}" class="admin-input" placeholder="8.500">
      </div>
      <div>
        <label class="admin-label">Silver Making Charge (%)</label>
        <input type="number" step="0.01" name="silver_making_charge_percent" value="{{ old('silver_making_charge_percent') }}" class="admin-input" placeholder="12.00">
      </div>
      <div>
        <label class="admin-label">Silver Brand Markup (%)</label>
        <input type="number" step="0.01" name="silver_brand_markup_percent" value="{{ old('silver_brand_markup_percent') }}" class="admin-input" placeholder="10.00">
      </div>
      <div>
        <label class="admin-label">Silver Other Charge (₹)</label>
        <input type="number" step="0.01" name="silver_other_charges" value="{{ old('silver_other_charges') }}" class="admin-input" placeholder="0.00">
      </div>
    </div>

    <div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <label class="admin-label" style="margin: 0; font-size: 13.5px; font-weight: 700; color: var(--admin-text-primary);">
          Limited Edition
        </label>
        <label style="display: inline-flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; margin: 0;">
          <span style="position: relative; display: inline-block; width: 44px; height: 24px;">
            <input type="hidden" name="is_limited_edition" value="0">
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
          <input type="text" name="edition_prefix" id="edition_prefix_input" value="{{ old('edition_prefix') }}" class="admin-input" placeholder="e.g. LIMITED EDITION">
        </div>
        <div>
          <label class="admin-label">Current Piece No. *</label>
          <input type="number" name="edition_current" id="edition_current_input" min="0" value="{{ old('edition_current') }}" class="admin-input" placeholder="1">
        </div>
        <div>
          <label class="admin-label">Total Edition Limit *</label>
          <input type="number" name="edition_limit" id="edition_limit_input" min="1" value="{{ old('edition_limit') }}" class="admin-input" placeholder="50">
        </div>
      </div>
    </div>

    <!-- METAL PURITY (KT) SELECTION & LIVE PRICING -->
    <div style="background: var(--admin-surface-elevated); padding: 22px; border-radius: 14px; border: 1px solid var(--admin-border); display: flex; flex-direction: column; gap: 16px;">
      <div>
        <label class="admin-label" style="font-size: 13.5px; font-weight: 800; color: var(--admin-text-primary); margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
          METAL PURITY (KT)
        </label>
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
            'sub' => '58.5% Everyday',
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
            'label' => 'Yellow',
            'badge' => '#D4AF37',
            'gradient' => 'linear-gradient(180deg, #8B6508 0%, #C99700 15%, #E5B824 35%, #FBE580 50%, #C99700 80%, #7D5A02 100%)',
          ],
          'WG' => [
            'label' => 'White',
            'badge' => '#94A3B8',
            'gradient' => 'linear-gradient(180deg, #55585B 0%, #8A8E93 15%, #C2C6CC 35%, #F0F2F5 50%, #8A8E93 80%, #484A4D 100%)',
          ],
          'RG' => [
            'label' => 'Rose',
            'badge' => '#B76E79',
            'gradient' => 'linear-gradient(180deg, #874112 0%, #BA6222 15%, #DB7F3E 35%, #F5B37B 50%, #BA6222 80%, #75360B 100%)',
          ],
          'BLK' => [
            'label' => 'Black',
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
            <span>Images Gallery</span>
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
          Drag & drop images
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
      <input type="hidden" id="custom_sections_json" name="custom_sections_json" value="" />
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
          No images uploaded
        </div>
      </div>
    </div>

    <!-- Dynamic Product Sections / Text Boxes (Replaces fixed Description & Delivery/Return boxes) -->
    <div style="border: 1px solid var(--admin-border); border-radius: 8px; padding: 18px 20px; background: var(--admin-surface); margin-top: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; gap: 12px; flex-wrap: wrap;">
        <div>
          <label class="admin-label" style="margin: 0; font-size: 13.5px; font-weight: 600;">Product Sections / Text Boxes</label>
        </div>
        <button type="button" id="btn_add_section" class="admin-btn-secondary" style="padding: 7px 15px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Text Box
        </button>
      </div>

      <div id="custom_sections_container" style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Dynamically rendered custom section cards -->
      </div>

      <div id="custom_sections_empty" style="display: none; text-align: center; padding: 22px 12px; color: var(--admin-text-muted); font-size: 12px; border: 1px dashed var(--admin-border); border-radius: 6px; background: #ffffff;">
        No text boxes added yet. Click <strong>"+ Add Text Box"</strong> to create one.
      </div>
    </div>

    <!-- Dynamic Product Options & Variants System -->
    <div style="border: 1px solid var(--admin-border); border-radius: 8px; padding: 20px 22px; background: var(--admin-surface); margin-top: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 12px; flex-wrap: wrap;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label class="admin-label" style="margin: 0; font-size: 14px; font-weight: 700; color: var(--admin-text-primary);">
              Product Options
            </label>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <a href="{{ route('admin.product-options') }}" target="_blank" class="admin-btn admin-btn-secondary" style="font-size: 11.5px; text-decoration: none;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Manage Global Option Groups
          </a>
        </div>
      </div>

      <!-- Hidden inputs for form submission -->
      <input type="hidden" name="option_assignments_json" id="option_assignments_json" value="">
      <input type="hidden" name="variants_matrix_json" id="variants_matrix_json" value="">

      <!-- Option Groups List -->
      <div id="option_groups_builder_container" style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
        <!-- Populated by JavaScript -->
      </div>


    </div>

    <!-- COMPATIBILITY MASTER (CLEAN NORMAL TABLE DISPLAY - NOT A FORM) -->
    <div style="background: var(--admin-surface-elevated); padding: 22px; border-radius: 14px; border: 1px solid var(--admin-border); display: flex; flex-direction: column; gap: 16px; margin-top: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label class="admin-label" style="font-size: 13.5px; font-weight: 800; color: var(--admin-text-primary); margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
          COMPATIBILITY MASTER
        </label>
      </div>

      <input type="hidden" name="compatibility_matrix_json" id="compatibility_matrix_json" value="">

      <!-- Clean normal display table container (dynamically updated when admin selects purities, finishes, or options) -->
      <div id="compatibility_master_table_container" style="overflow-x: auto; border: 1px solid var(--admin-border); border-radius: 10px; background: var(--admin-surface);">
        <!-- Populated dynamically by JS as a normal clean table -->
      </div>
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
  { key: 'YG', name: 'Yellow', code: 'YG', color: '#D4AF37' },
  { key: 'WG', name: 'White', code: 'WG', color: '#94A3B8' },
  { key: 'RG', name: 'Rose', code: 'RG', color: '#B76E79' },
  { key: 'BLK', name: 'Black', code: 'BLK', color: '#1E293B' },
  { key: 'NAT_SILVER', name: 'Natural Silver', code: 'NAT_SILVER', color: '#94A3B8' },
  { key: 'RHOD_SILVER', name: 'Rhodium-Plated Silver', code: 'RHOD_SILVER', color: '#CBD5E1' },
  { key: 'GOLD_SILVER', name: 'Gold-Plated Silver', code: 'GOLD_SILVER', color: '#EAB308' },
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
  renderCompatibilityMasterTable();
}

function handlePurityToggle(checkbox) {
  const key = checkbox.getAttribute('data-purity-key');
  const color = checkbox.getAttribute('data-color') || '#B8860B';
  const card = document.getElementById('card_purity_' + key);
  if (card) {
    card.style.borderColor = checkbox.checked ? color : 'var(--admin-border)';
  }
  renderCompatibilityMasterTable();
}

const COMPATIBILITY_RULES_MASTER = {
  finishes: [
    { key: 'YG', name: 'Yellow', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
    { key: 'WG', name: 'White', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
    { key: 'RG', name: 'Rose', purities: { '22KT': false, '18KT': true, '14KT': true, '925 SILVER': false } },
    { key: 'BLK', name: 'Black', purities: { '22KT': false, '18KT': true, '14KT': true, '925 SILVER': false } },
    { key: 'NAT_SILVER', name: 'Natural Silver', purities: { '22KT': false, '18KT': false, '14KT': false, '925 SILVER': true } },
    { key: 'RHOD_SILVER', name: 'Rhodium-Plated Silver', purities: { '22KT': false, '18KT': false, '14KT': false, '925 SILVER': true } },
    { key: 'GOLD_SILVER', name: 'Gold-Plated Silver', purities: { '22KT': false, '18KT': false, '14KT': false, '925 SILVER': true } },
  ],
  stones: [
    { code: 'LGD', name: 'Lab-grown diamond', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
    { code: 'DIA', name: 'Natural diamond', purities: { '22KT': false, '18KT': true, '14KT': true, '925 SILVER': false } },
    { code: 'CZ', name: 'American diamond (CZ)', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': true } },
    { code: 'MOI', name: 'Moissanite', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': true } },
    { code: 'SAP', name: 'Sapphire', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
    { code: 'EMR', name: 'Emerald', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': true } },
    { code: 'RUB', name: 'Ruby', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
    { code: 'NONE', name: 'No stone / Plain metal', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': true } },
  ]
};

function getCheckedPurities() {
  const cbs = document.querySelectorAll('.purity-checkbox:checked');
  const list = Array.from(cbs).map(cb => cb.value.toUpperCase().trim());
  return list.length > 0 ? list : ['22KT', '18KT', '14KT'];
}

function normalizePurityKey(raw) {
  const u = (raw || '').toUpperCase();
  if (u.includes('22')) return '22KT';
  if (u.includes('18')) return '18KT';
  if (u.includes('14')) return '14KT';
  if (u.includes('925') || u.includes('SILVER')) return '925 SILVER';
  return u;
}

let currentMatrixData = {};

function handleMatrixCellChange() {
  const matrix = {};
  const normalizedPurities = Array.from(new Set(getCheckedPurities().map(normalizePurityKey)));

  normalizedPurities.forEach(p => {
    matrix[p] = { finishes: [], options: {}, options_by_name: {}, stones: [] };
  });

  document.querySelectorAll('.matrix-cell-chk').forEach(cb => {
    const p = cb.getAttribute('data-purity');
    const type = cb.getAttribute('data-type');
    const key = cb.getAttribute('data-key');
    const groupId = cb.getAttribute('data-group-id');
    const groupName = cb.getAttribute('data-group-name');
    const valName = cb.getAttribute('data-val-name');

    if (!matrix[p]) matrix[p] = { finishes: [], options: {}, options_by_name: {}, stones: [] };

    if (cb.checked) {
      if (type === 'finish') {
        if (!matrix[p].finishes.includes(key)) matrix[p].finishes.push(key);
      } else if (type === 'option') {
        if (!matrix[p].options[groupId]) matrix[p].options[groupId] = [];
        if (!matrix[p].options[groupId].includes(key)) matrix[p].options[groupId].push(key);

        if (!matrix[p].options_by_name[groupName]) matrix[p].options_by_name[groupName] = [];
        if (!matrix[p].options_by_name[groupName].includes(valName)) matrix[p].options_by_name[groupName].push(valName);

        const gLower = (groupName || '').toLowerCase();
        if (gLower.includes('gem') || gLower.includes('stone') || gLower.includes('diamond')) {
          if (!matrix[p].stones) matrix[p].stones = [];
          if (!matrix[p].stones.includes(key) && !matrix[p].stones.includes(valName)) {
            matrix[p].stones.push(valName);
          }
        }
      } else if (type === 'stone') {
        if (!matrix[p].stones) matrix[p].stones = [];
        if (!matrix[p].stones.includes(key)) matrix[p].stones.push(key);
      }
    }
  });

  currentMatrixData = matrix;
  const input = document.getElementById('compatibility_matrix_json');
  if (input) {
    input.value = JSON.stringify(matrix);
  }
}

function renderCompatibilityMasterTable() {
  const container = document.getElementById('compatibility_master_table_container');
  if (!container) return;

  const rawPurities = getCheckedPurities();
  const normalizedPurities = Array.from(new Set(rawPurities.map(normalizePurityKey)));
  const selectedFinishKeys = getSelectedFinishKeys();

  // Active finishes from selectedFinishKeys
  const activeFinishes = COMPATIBILITY_RULES_MASTER.finishes.filter(f => selectedFinishKeys.includes(f.key));
  const finishesToDisplay = activeFinishes.length > 0 ? activeFinishes : COMPATIBILITY_RULES_MASTER.finishes.slice(0, 4);

  // Active option groups selected by admin in Product Options
  const activeGroups = [];
  if (typeof optionGroupsData !== 'undefined' && Array.isArray(optionGroupsData)) {
    optionGroupsData.forEach(group => {
      const chkEnable = document.getElementById(`chk_group_enable_${group.id}`);
      if (chkEnable && chkEnable.checked) {
        const checkedValCbs = document.querySelectorAll(`.group-val-chk-${group.id}:checked`);
        if (checkedValCbs.length > 0) {
          const values = Array.from(checkedValCbs).map(cb => ({
            id: cb.value,
            name: cb.getAttribute('data-val-name') || cb.value,
          }));
          activeGroups.push({
            id: group.id,
            name: group.name,
            code: group.code,
            values: values
          });
        }
      }
    });
  }

  // Build clean normal table with interactive checkboxes
  const purityBadges = {
    '22KT': '#D4AF37',
    '18KT': '#B8860B',
    '14KT': '#9A7C38',
    '925 SILVER': '#64748B'
  };

  let html = `
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; background: #FFFFFF;">
      <thead>
        <tr style="border-bottom: 2px solid #E2E8F0; background: #F8FAFC;">
          <th style="padding: 12px 18px; font-weight: 800; color: #1E293B; letter-spacing: 0.04em; text-transform: uppercase; font-size: 12px; width: 45%;">
            Finish / appearance
          </th>
  `;

  normalizedPurities.forEach(p => {
    const badgeColor = purityBadges[p] || '#1E293B';
    html += `
      <th style="padding: 12px 14px; font-weight: 800; color: ${badgeColor}; text-align: center; font-size: 13px; letter-spacing: 0.05em;">
        ${p}
      </th>
    `;
  });

  html += `
        </tr>
      </thead>
      <tbody>
  `;

  // 1. Finish rows with interactive checkboxes
  finishesToDisplay.forEach((f, idx) => {
    const bg = idx % 2 === 0 ? '#FFFFFF' : '#FDFDFD';
    html += `
      <tr style="border-bottom: 1px solid #F1F5F9; background: ${bg};">
        <td style="padding: 11px 18px; color: #334155; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${purityBadges[f.key] || '#CBD5E1'}; border: 1px solid rgba(0,0,0,0.1);"></span>
          <span>${escapeHtml(f.name)}</span>
        </td>
    `;
    normalizedPurities.forEach(p => {
      let isCompat = false;
      if (currentMatrixData[p] && Array.isArray(currentMatrixData[p].finishes)) {
        isCompat = currentMatrixData[p].finishes.includes(f.key);
      } else {
        isCompat = Boolean(f.purities && f.purities[p]);
      }

      html += `
        <td style="padding: 9px 14px; text-align: center;">
          <label style="cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 0; padding: 2px;">
            <input
              type="checkbox"
              class="matrix-cell-chk"
              data-type="finish"
              data-key="${f.key}"
              data-purity="${p}"
              ${isCompat ? 'checked' : ''}
              onchange="handleMatrixCellChange()"
              style="width: 17px; height: 17px; accent-color: #10B981; cursor: pointer;"
            />
          </label>
        </td>
      `;
    });
    html += `</tr>`;
  });

  // 2. Loop through each active option group (e.g. SIZE, GEM / STONE OPTIONS, etc.)
  activeGroups.forEach(grp => {
    html += `
      <tr style="background: #F8FAFC; border-top: 2px solid #E2E8F0; border-bottom: 1px solid #E2E8F0;">
        <td colspan="${normalizedPurities.length + 1}" style="padding: 10px 18px; font-weight: 800; color: #1E293B; letter-spacing: 0.04em; text-transform: uppercase; font-size: 12px;">
          ${escapeHtml(grp.name)}
        </td>
      </tr>
    `;

    const isGemGroup = (grp.name.toLowerCase().includes('gem') || grp.name.toLowerCase().includes('stone')) && !grp.name.toLowerCase().includes('clarity');

    grp.values.forEach((val, vIdx) => {
      const bg = vIdx % 2 === 0 ? '#FFFFFF' : '#FDFDFD';
      html += `
        <tr style="border-bottom: 1px solid #F1F5F9; background: ${bg};">
          <td style="padding: 11px 18px; color: #334155; font-weight: 500;">
            ${escapeHtml(val.name)}
          </td>
      `;

      normalizedPurities.forEach(p => {
        let isCompat = false;
        const savedOptions = currentMatrixData[p]?.options;
        const savedOptionsByName = currentMatrixData[p]?.options_by_name;
        const savedStones = currentMatrixData[p]?.stones;

        if (savedOptions && savedOptions[grp.id]) {
          isCompat = savedOptions[grp.id].includes(String(val.id)) || savedOptions[grp.id].includes(Number(val.id));
        } else if (savedOptionsByName && savedOptionsByName[grp.name]) {
          isCompat = savedOptionsByName[grp.name].includes(val.name);
        } else if (isGemGroup && savedStones) {
          isCompat = savedStones.includes(val.name) || savedStones.includes(String(val.id));
        } else if (isGemGroup) {
          // Fallback to Master Rules for stones
          const vLower = val.name.toLowerCase();
          const matched = COMPATIBILITY_RULES_MASTER.stones.find(s => {
            const sName = s.name.toLowerCase();
            return sName.includes(vLower) || vLower.includes(sName.split(' ')[0]);
          });
          if (matched) {
            isCompat = Boolean(matched.purities && matched.purities[p]);
          } else {
            isCompat = true;
          }
        } else {
          // Default for sizes or other groups: true
          isCompat = true;
        }

        html += `
          <td style="padding: 9px 14px; text-align: center;">
            <label style="cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 0; padding: 2px;">
              <input
                type="checkbox"
                class="matrix-cell-chk"
                data-type="option"
                data-group-id="${grp.id}"
                data-group-name="${escapeHtml(grp.name)}"
                data-key="${val.id}"
                data-val-name="${escapeHtml(val.name)}"
                data-purity="${p}"
                ${isCompat ? 'checked' : ''}
                onchange="handleMatrixCellChange()"
                style="width: 17px; height: 17px; accent-color: #10B981; cursor: pointer;"
              />
            </label>
          </td>
        `;
      });
      html += `</tr>`;
    });
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
  handleMatrixCellChange();
}

function getCompatibilityMatrixPayload() {
  handleMatrixCellChange();
  return currentMatrixData;
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
      btn.style.background = '#FFFFFF';
      btn.style.color = 'var(--admin-text-primary)';
      btn.style.border = `2px solid ${f.color}`;
      btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
    } else {
      btn.style.background = 'var(--admin-surface)';
      btn.style.color = 'var(--admin-text-primary)';
      btn.style.border = '1px solid var(--admin-border)';
      btn.style.boxShadow = 'none';
    }

    btn.innerHTML = `
      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${f.color}; border: 1px solid rgba(0,0,0,0.15);"></span>
      <span>${escapeHtml(f.name)}</span>
      <span style="font-size: 10.5px; padding: 1px 6px; border-radius: 999px; font-weight: 700; ${
        isActive
          ? `background: ${f.color}22; color: var(--admin-text-primary); border: 1px solid ${f.color}66;`
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

  if (dropzonePrompt) dropzonePrompt.textContent = 'Drag & drop images';
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
      emptyNotice.textContent = 'No images uploaded';
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
            ${escapeHtml(activeConf.name)}
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
  const customSectionsJson = document.getElementById('custom_sections_json');

  if (jsonInput) {
    jsonInput.value = JSON.stringify(galleryImages);
  }

  if (customSectionsJson && typeof customSectionsData !== 'undefined') {
    const validSections = customSectionsData.filter(s => (s.title && s.title.trim()) || (s.content && s.content.trim()));
    customSectionsJson.value = JSON.stringify(validSections);
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

  // Sync Compatibility Matrix
  const compatJson = document.getElementById('compatibility_matrix_json');
  if (compatJson && typeof getCompatibilityMatrixPayload === 'function') {
    compatJson.value = JSON.stringify(getCompatibilityMatrixPayload());
  }

  // Sync Options Assignments
  const optAssignJson = document.getElementById('option_assignments_json');
  if (optAssignJson && typeof getOptionAssignmentsPayload === 'function') {
    optAssignJson.value = JSON.stringify(getOptionAssignmentsPayload());
  }

  // Sync Variants Matrix
  const varMatrixJson = document.getElementById('variants_matrix_json');
  if (varMatrixJson && typeof getVariantsMatrixPayload === 'function') {
    varMatrixJson.value = JSON.stringify(getVariantsMatrixPayload());
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
  renderCompatibilityMasterTable();
  renderFinishTabs();
  renderActiveGallery();
  initCustomSections();
});

function handleEditionSwitch(enabled) {
  const slider = document.getElementById('edition_switch_slider');
  const knob = document.getElementById('edition_switch_knob');
  const label = document.getElementById('edition_switch_label');
  const row = document.getElementById('limited_edition_inputs_row');
  if (slider) slider.style.backgroundColor = enabled ? '#10B981' : '#64748B';
  if (knob) knob.style.left = enabled ? '23px' : '3px';
  if (label) label.textContent = enabled ? 'Enabled' : 'Disabled';
  if (row) {
    row.style.opacity = enabled ? '1' : '0.45';
    row.style.pointerEvents = enabled ? 'auto' : 'none';
  }
}

let customSectionsData = {!! json_encode(old('custom_sections', [])) !!};
if (typeof customSectionsData === 'string') {
  try { customSectionsData = JSON.parse(customSectionsData); } catch (e) { customSectionsData = []; }
}
if (!Array.isArray(customSectionsData)) {
  customSectionsData = [];
}
if (customSectionsData.length === 0) {
  customSectionsData = [
    { title: 'DESCRIPTION', content: '' },
    { title: 'DELIVERY & RETURN', content: "- 24-Hour Cancellation Window - Full Refund\n- 10% Deduction of total Value upon return." }
  ];
}

function initCustomSections() {
  const customSectionsContainer = document.getElementById('custom_sections_container');
  const customSectionsEmpty = document.getElementById('custom_sections_empty');
  const btnAddSection = document.getElementById('btn_add_section');

  function renderCustomSections() {
    if (!customSectionsContainer) return;
    customSectionsContainer.innerHTML = '';
    if (!customSectionsData || customSectionsData.length === 0) {
      if (customSectionsEmpty) customSectionsEmpty.style.display = 'block';
      return;
    }
    if (customSectionsEmpty) customSectionsEmpty.style.display = 'none';

    customSectionsData.forEach((sec, idx) => {
      const card = document.createElement('div');
      card.className = 'custom-section-card';
      card.style.cssText = 'border: 1px solid var(--admin-border); border-radius: 8px; padding: 14px 16px; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.03);';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-secondary); letter-spacing: 0.6px;">
            Text Box #${idx + 1}
          </span>
          <button type="button" class="btn-remove-section" data-idx="${idx}" style="background: none; border: none; color: #DC2626; cursor: pointer; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Remove
          </button>
        </div>
        <div style="margin-bottom: 10px;">
          <label style="display: block; font-size: 11px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 4px; text-transform: uppercase;">
            Section Heading / Title
          </label>
          <input type="text" name="custom_sections[${idx}][title]" value="${escapeHtml(sec.title || '')}" class="admin-input sec-title-input" placeholder="e.g. MATERIALS & CARE" style="padding: 8px 12px; font-size: 13px;" />
        </div>
        <div>
          <label style="display: block; font-size: 11px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 4px; text-transform: uppercase;">
            Section Content / Description
          </label>
          <textarea name="custom_sections[${idx}][content]" rows="3" class="admin-input sec-content-input" placeholder="Enter description or - bullet points (one per line)..." style="padding: 8px 12px; font-size: 13px;">${escapeHtml(sec.content || '')}</textarea>
        </div>
      `;

      const titleInput = card.querySelector('.sec-title-input');
      const contentInput = card.querySelector('.sec-content-input');
      titleInput.addEventListener('input', (e) => {
        customSectionsData[idx].title = e.target.value;
      });
      contentInput.addEventListener('input', (e) => {
        customSectionsData[idx].content = e.target.value;
      });

      const btnRemove = card.querySelector('.btn-remove-section');
      btnRemove.addEventListener('click', () => {
        customSectionsData.splice(idx, 1);
        renderCustomSections();
      });

      customSectionsContainer.appendChild(card);
    });
  }

  if (btnAddSection) {
    btnAddSection.addEventListener('click', () => {
      customSectionsData.push({ title: '', content: '' });
      renderCustomSections();
      const allTitles = customSectionsContainer.querySelectorAll('.sec-title-input');
      if (allTitles.length > 0) {
        allTitles[allTitles.length - 1].focus();
      }
    });
  }

  renderCustomSections();
}

// ==========================================
// DYNAMIC PRODUCT OPTIONS & VARIANTS BUILDER
// ==========================================
const optionGroupsData = {!! json_encode($allOptionGroupsData ?? []) !!};
const existingAssignments = [];
let currentVariants = [];

function getProductCode() {
  const codeInput = document.querySelector('input[name="design_code"]');
  return (codeInput && codeInput.value.trim()) ? codeInput.value.trim().toUpperCase() : 'NEW-PIECE';
}

function initOptionsAndVariantsBuilder() {
  const container = document.getElementById('option_groups_builder_container');
  if (!container) return;

  container.innerHTML = '';

  if (!optionGroupsData || optionGroupsData.length === 0) {
    container.innerHTML = `
      <div style="padding: 16px; border: 1px dashed var(--admin-border); border-radius: 8px; text-align: center; color: var(--admin-text-muted); font-size: 13px;">
        No option groups configured in the system yet.
        <a href="{{ route('admin.product-options') }}" target="_blank" style="color: #3C50E0; font-weight: 600; margin-left: 6px;">+ Create Option Groups</a>
      </div>
    `;
    return;
  }

  optionGroupsData.forEach((group, gIdx) => {
    // Default checked for common initial groups like PURITY and FINISH
    const isDefaultChecked = (group.code === 'PURITY' || group.code === 'FINISH');
    const displayType = group.display_type || 'dropdown';
    const isRequired = !!group.is_required;

    const card = document.createElement('div');
    card.id = `opt_group_card_${group.id}`;
    card.style.cssText = `border: 1px solid ${isDefaultChecked ? '#C7D2FE' : 'var(--admin-border)'}; border-radius: 8px; padding: 14px 18px; background: ${isDefaultChecked ? '#F8FAFF' : 'var(--admin-surface)'}; transition: all 0.2s ease;`;

    let groupHtml = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: ${isDefaultChecked ? '14px' : '0'};">
        <div style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" id="chk_group_enable_${group.id}" class="opt-group-enable-chk" data-group-id="${group.id}" ${isDefaultChecked ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: #3C50E0; cursor: pointer;">
          <label for="chk_group_enable_${group.id}" style="font-size: 13.5px; font-weight: 700; color: var(--admin-text-primary); cursor: pointer; margin: 0;">
            ${escapeHtml(group.name)}
          </label>
        </div>

        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <label style="font-size: 11.5px; color: var(--admin-text-secondary); font-weight: 500;">Display Type:</label>
            <select id="sel_group_display_${group.id}" class="admin-input" style="padding: 4px 8px; font-size: 12px; height: 30px; width: auto;" ${!isDefaultChecked ? 'disabled' : ''}>
              <option value="dropdown" ${displayType === 'dropdown' ? 'selected' : ''}>Dropdown</option>
              <option value="text_button" ${displayType === 'text_button' ? 'selected' : ''}>Text Button</option>
              <option value="image_swatch" ${displayType === 'image_swatch' ? 'selected' : ''}>Image Swatch</option>
            </select>
          </div>

          <label style="display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--admin-text-secondary); cursor: pointer; margin: 0;">
            <input type="checkbox" id="chk_group_req_${group.id}" ${isRequired ? 'checked' : ''} ${!isDefaultChecked ? 'disabled' : ''} style="accent-color: #3C50E0;">
            <span>Required</span>
          </label>
        </div>
      </div>

      <!-- Values Selection Area -->
      <div id="opt_group_vals_area_${group.id}" style="display: ${isDefaultChecked ? 'block' : 'none'}; border-top: 1px dashed #CBD5E1; padding-top: 12px; margin-top: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.05em;">
            Available Values for this piece:
          </span>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn-select-all-vals" data-group-id="${group.id}" style="background: none; border: none; color: #3C50E0; font-size: 11.5px; font-weight: 600; cursor: pointer; padding: 0;">Select All</button>
            <span style="color: #CBD5E1;">|</span>
            <button type="button" class="btn-deselect-all-vals" data-group-id="${group.id}" style="background: none; border: none; color: #64748B; font-size: 11.5px; cursor: pointer; padding: 0;">None</button>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
    `;

    group.values.forEach(val => {
      let visualBadge = '';
      if (val.image) {
        visualBadge = `<img src="${escapeHtml(val.image)}" style="width: 18px; height: 18px; border-radius: 4px; object-fit: cover; border: 1px solid #CBD5E1;">`;
      } else if (val.color_code) {
        visualBadge = `<span style="width: 14px; height: 14px; border-radius: 50%; background: ${escapeHtml(val.color_code)}; border: 1px solid #94A3B8; display: inline-block;"></span>`;
      }

      groupHtml += `
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border: 1px solid #E2E8F0; border-radius: 6px; background: #ffffff; font-size: 12px;">
          <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; margin: 0;">
            <input type="checkbox" class="opt-val-chk group-val-chk-${group.id}" value="${val.id}" data-val-name="${escapeHtml(val.value)}" data-group-id="${group.id}" checked style="accent-color: #3C50E0;">
            ${visualBadge}
            <span style="font-weight: 600; color: var(--admin-text-primary);">${escapeHtml(val.value)}</span>
          </label>
          <div style="display: inline-flex; align-items: center; gap: 2px; margin-left: 4px; padding-left: 6px; border-left: 1px solid #E2E8F0;" title="Additional price for this piece (e.g. 2000 for Product A, 3000 for Product B)">
            <span style="font-size: 10.5px; color: #64748B; font-weight: 600;">+₹</span>
            <input type="number" step="0.01" min="0" class="admin-input opt-val-price-${group.id}" data-val-id="${val.id}" value="" placeholder="0" style="width: 65px; height: 23px; padding: 2px 4px; font-size: 11px; border-radius: 4px; border: 1px solid #CBD5E1;">
          </div>
        </div>
      `;
    });

    groupHtml += `
        </div>
      </div>
    `;

    card.innerHTML = groupHtml;
    container.appendChild(card);

    const chkEnable = card.querySelector(`#chk_group_enable_${group.id}`);
    const selDisplay = card.querySelector(`#sel_group_display_${group.id}`);
    const chkReq = card.querySelector(`#chk_group_req_${group.id}`);
    const valsArea = card.querySelector(`#opt_group_vals_area_${group.id}`);

    chkEnable.addEventListener('change', () => {
      const checked = chkEnable.checked;
      valsArea.style.display = checked ? 'block' : 'none';
      selDisplay.disabled = !checked;
      chkReq.disabled = !checked;
      card.style.background = checked ? '#F8FAFF' : 'var(--admin-surface)';
      card.style.borderColor = checked ? '#C7D2FE' : 'var(--admin-border)';
      renderCompatibilityMasterTable();
    });

    card.querySelectorAll(`.group-val-chk-${group.id}`).forEach(c => {
      c.addEventListener('change', () => {
        renderCompatibilityMasterTable();
      });
    });

    const btnSelectAll = card.querySelector(`.btn-select-all-vals[data-group-id="${group.id}"]`);
    if (btnSelectAll) {
      btnSelectAll.addEventListener('click', () => {
        card.querySelectorAll(`.group-val-chk-${group.id}`).forEach(c => c.checked = true);
        renderCompatibilityMasterTable();
      });
    }

    const btnDeselectAll = card.querySelector(`.btn-deselect-all-vals[data-group-id="${group.id}"]`);
    if (btnDeselectAll) {
      btnDeselectAll.addEventListener('click', () => {
        card.querySelectorAll(`.group-val-chk-${group.id}`).forEach(c => c.checked = false);
        renderCompatibilityMasterTable();
      });
    }
  });

  renderVariantsMatrix();
}

function getOptionAssignmentsPayload() {
  const payload = [];
  optionGroupsData.forEach((group, idx) => {
    const chkEnable = document.getElementById(`chk_group_enable_${group.id}`);
    if (chkEnable && chkEnable.checked) {
      const selDisplay = document.getElementById(`sel_group_display_${group.id}`);
      const chkReq = document.getElementById(`chk_group_req_${group.id}`);
      const valCheckboxes = document.querySelectorAll(`.group-val-chk-${group.id}:checked`);
      const valIds = Array.from(valCheckboxes).map(c => Number(c.value));

      const valPrices = {};
      valCheckboxes.forEach(c => {
        const pInput = document.querySelector(`.opt-val-price-${group.id}[data-val-id="${c.value}"]`);
        if (pInput && pInput.value !== '' && !isNaN(parseFloat(pInput.value)) && parseFloat(pInput.value) > 0) {
          valPrices[c.value] = parseFloat(pInput.value);
        }
      });

      payload.push({
        group_id: group.id,
        display_type: selDisplay ? selDisplay.value : group.display_type,
        is_required: chkReq ? chkReq.checked : false,
        selected_values: valIds,
        value_prices: valPrices,
        sort_order: idx + 1,
      });
    }
  });
  return payload;
}

function getVariantsMatrixPayload() {
  const tbody = document.getElementById('variants_matrix_tbody');
  if (!tbody) return [];

  const rows = tbody.querySelectorAll('tr.variant-row');
  const payload = [];

  rows.forEach((tr, idx) => {
    const sku = tr.querySelector('.var-sku-input')?.value || '';
    const priceOverride = tr.querySelector('.var-price-input')?.value;
    const variantImage = tr.querySelector('.var-image-input')?.value || '';
    const enabled = tr.querySelector('.var-enabled-chk')?.checked ?? true;
    const combination = tr.getAttribute('data-combination') || '';
    const valIdsAttr = tr.getAttribute('data-val-ids') || '';
    const valIds = valIdsAttr ? valIdsAttr.split(',').map(Number).filter(Boolean) : [];

    payload.push({
      sku: sku.trim(),
      combination: combination.trim(),
      price_override: priceOverride !== '' ? parseFloat(priceOverride) : null,
      stock_qty: 999,
      variant_image: variantImage.trim(),
      enabled: enabled,
      option_value_ids: valIds,
      sort_order: idx + 1,
    });
  });

  currentVariants = payload;
  return payload;
}

function renderVariantsMatrix() {
  const tbody = document.getElementById('variants_matrix_tbody');
  const emptyNotice = document.getElementById('variants_empty_notice');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!currentVariants || currentVariants.length === 0) {
    if (emptyNotice) emptyNotice.style.display = 'block';
    return;
  }
  if (emptyNotice) emptyNotice.style.display = 'none';

  currentVariants.forEach((v, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'variant-row';
    tr.style.cssText = 'border-bottom: 1px solid #F1F5F9; font-size: 12.5px;';
    tr.setAttribute('data-combination', v.combination || '');
    tr.setAttribute('data-val-ids', (v.option_value_ids || []).join(','));

    tr.innerHTML = `
      <td style="padding: 10px 14px; font-weight: 700; color: var(--admin-text-primary);">
        ${escapeHtml(v.combination || 'Custom Variant')}
      </td>
      <td style="padding: 8px 14px;">
        <input type="text" class="admin-input var-sku-input" value="${escapeHtml(v.sku || '')}" placeholder="SKU" style="padding: 5px 8px; font-size: 12px; font-family: monospace;">
      </td>
      <td style="padding: 8px 14px;">
        <input type="number" step="0.01" class="admin-input var-price-input" value="${v.price_override !== null && v.price_override !== undefined ? v.price_override : ''}" placeholder="Base Price" style="padding: 5px 8px; font-size: 12px;">
      </td>
      <td style="padding: 8px 14px;">
        <input type="text" class="admin-input var-image-input" value="${escapeHtml(v.variant_image || '')}" placeholder="/images/..." style="padding: 5px 8px; font-size: 11.5px;">
      </td>
      <td style="padding: 8px 14px; text-align: center;">
        <input type="checkbox" class="var-enabled-chk" ${v.enabled ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #10B981; cursor: pointer;" title="Toggle Variant Status">
      </td>
      <td style="padding: 8px 14px; text-align: right;">
        <button type="button" class="btn-remove-variant" data-idx="${idx}" style="background: none; border: none; color: #DC2626; cursor: pointer; padding: 4px;" title="Remove row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </td>
    `;

    const btnRemove = tr.querySelector('.btn-remove-variant');
    btnRemove.addEventListener('click', () => {
      tr.remove();
      getVariantsMatrixPayload();
      if (tbody.children.length === 0 && emptyNotice) {
        emptyNotice.style.display = 'block';
      }
    });

    tbody.appendChild(tr);
  });
}

function generateVariantMatrix() {
  const activeGroups = [];
  optionGroupsData.forEach(g => {
    const chk = document.getElementById(`chk_group_enable_${g.id}`);
    if (chk && chk.checked) {
      const checkedVals = [];
      document.querySelectorAll(`.group-val-chk-${g.id}:checked`).forEach(c => {
        const pInput = document.querySelector(`.opt-val-price-${g.id}[data-val-id="${c.value}"]`);
        const addPrice = (pInput && pInput.value !== '' && !isNaN(parseFloat(pInput.value))) ? parseFloat(pInput.value) : 0;
        checkedVals.push({
          id: Number(c.value),
          name: c.getAttribute('data-val-name'),
          group_code: g.code,
          add_price: addPrice,
        });
      });
      if (checkedVals.length > 0) {
        activeGroups.push({ group: g, values: checkedVals });
      }
    }
  });

  if (activeGroups.length === 0) {
    alert('Please enable at least one Option Group and select at least one value.');
    return;
  }

  function cartesian(arr) {
    return arr.reduce((acc, curr) => {
      const res = [];
      acc.forEach(a => {
        curr.values.forEach(b => {
          res.push(a.concat([b]));
        });
      });
      return res;
    }, [[]]);
  }

  const combinations = cartesian(activeGroups);
  const oldVariants = getVariantsMatrixPayload();
  const prodCode = getProductCode();

  const newVariants = [];
  combinations.forEach(combList => {
    const combText = combList.map(v => v.name).join(' / ');
    const valIds = combList.map(v => v.id).sort((a,b) => a - b);

    const matched = oldVariants.find(ov => {
      if (ov.option_value_ids && ov.option_value_ids.length === valIds.length) {
        const sortedOld = [...ov.option_value_ids].sort((a,b) => a - b);
        return JSON.stringify(sortedOld) === JSON.stringify(valIds);
      }
      return ov.combination === combText;
    });

    const skuSuffix = combList.map(v => v.name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4)).join('-');
    const defaultSku = `${prodCode}-${skuSuffix}`;

    const totalAddPrice = combList.reduce((sum, v) => sum + (v.add_price || 0), 0);
    const computedPrice = totalAddPrice > 0 ? totalAddPrice : null;

    newVariants.push({
      sku: matched?.sku || defaultSku,
      combination: combText,
      price_override: (matched?.price_override !== null && matched?.price_override !== undefined && matched?.price_override !== '')
        ? matched.price_override
        : computedPrice,
      stock_qty: 999,
      variant_image: matched?.variant_image || '',
      enabled: matched?.enabled !== undefined ? matched.enabled : true,
      option_value_ids: valIds,
    });
  });

  currentVariants = newVariants;
  renderVariantsMatrix();
}

function addSingleCustomVariant() {
  const prodCode = getProductCode();
  const sku = `${prodCode}-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`;
  currentVariants.push({
    sku: sku,
    combination: 'Custom Variant Option',
    price_override: null,
    stock_qty: 10,
    variant_image: '',
    enabled: true,
    option_value_ids: [],
  });
  renderVariantsMatrix();
}

const btnGenVariants = document.getElementById('btn_generate_variants');
if (btnGenVariants) {
  btnGenVariants.addEventListener('click', generateVariantMatrix);
}

const btnAddVariant = document.getElementById('btn_add_single_variant');
if (btnAddVariant) {
  btnAddVariant.addEventListener('click', addSingleCustomVariant);
}

initOptionsAndVariantsBuilder();

</script>
@endsection

