@extends('layouts.admin')

@section('content')
<div style="padding: 28px 32px; max-width: 1400px; margin: 0 auto;">

  <!-- Header Banner -->
  <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
    <div>
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
        <h1 style="font-size: 22px; font-weight: 700; color: var(--admin-text-primary); margin: 0; letter-spacing: -0.01em;">
          Product Options &amp; Variants
        </h1>
        <span style="background: #EFF2FE; color: #3C50E0; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">
          Dynamic System
        </span>
      </div>
      <p style="font-size: 13.5px; color: var(--admin-text-secondary); margin: 0; max-width: 720px; line-height: 1.5;">
        Create unlimited option groups (e.g. Metal Purity, Gemstones, Ring Size, Diamond Clarity, Chain Type), choose frontend display types, and manage values with swatches, price adjustments, and stock.
      </p>
    </div>

    <div style="display: flex; gap: 10px;">
      <button type="button" class="admin-btn admin-btn-primary" onclick="openNewGroupModal()" style="padding: 9px 16px; font-size: 13px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Option Group
      </button>
    </div>
  </div>

  @if(session('success'))
    <div style="background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 12px 18px; border-radius: 8px; margin-bottom: 22px; font-size: 13.5px; display: flex; align-items: center; gap: 10px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>{{ session('success') }}</span>
    </div>
  @endif

  <!-- Metrics Cards -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px;">
    <div class="admin-card" style="padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="font-size: 12px; font-weight: 600; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Option Groups</div>
        <div style="font-size: 24px; font-weight: 700; color: var(--admin-text-primary);">{{ $totalGroups }}</div>
      </div>
      <div style="width: 42px; height: 42px; border-radius: 8px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      </div>
    </div>

    <div class="admin-card" style="padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="font-size: 12px; font-weight: 600; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Total Configured Values</div>
        <div style="font-size: 24px; font-weight: 700; color: var(--admin-text-primary);">{{ $totalValues }}</div>
      </div>
      <div style="width: 42px; height: 42px; border-radius: 8px; background: #ECFDF5; color: #10B981; display: flex; align-items: center; justify-content: center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </div>
    </div>

    <div class="admin-card" style="padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="font-size: 12px; font-weight: 600; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Active Groups</div>
        <div style="font-size: 24px; font-weight: 700; color: #10B981;">{{ $activeGroups }}</div>
      </div>
      <div style="width: 42px; height: 42px; border-radius: 8px; background: #F0FDF4; color: #16A34A; display: flex; align-items: center; justify-content: center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
    </div>
  </div>

  <!-- Option Groups Container -->
  <div style="display: flex; flex-direction: column; gap: 20px;">
    @forelse($groups as $group)
      <div class="admin-card" style="overflow: hidden; border: 1px solid var(--admin-border);">
        <!-- Group Header Card -->
        <div style="padding: 16px 22px; background: var(--admin-surface); border-bottom: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="cursor: grab; color: var(--admin-text-muted);" title="Display Order: {{ $group->sort_order }}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
              </svg>
            </span>

            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h3 style="font-size: 16px; font-weight: 700; color: var(--admin-text-primary); margin: 0;">
                  {{ $group->name }}
                </h3>
                <span style="background: #F1F5F9; color: #475569; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; font-family: monospace;">
                  {{ $group->code }}
                </span>

                <!-- Display Type Badge -->
                @if($group->display_type === 'image_swatch')
                  <span style="background: #FEF3C7; color: #D97706; font-size: 11.5px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Image Swatch
                  </span>
                @elseif($group->display_type === 'text_button')
                  <span style="background: #EEF2FF; color: #4F46E5; font-size: 11.5px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    Text Button
                  </span>
                @else
                  <span style="background: #F3F4F6; color: #374151; font-size: 11.5px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    Dropdown
                  </span>
                @endif

                @if($group->is_required)
                  <span style="background: #FEE2E2; color: #DC2626; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">
                    Required
                  </span>
                @endif

                @if(!$group->is_active)
                  <span style="background: #F3F4F6; color: #9CA3AF; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">
                    Inactive
                  </span>
                @endif
              </div>

              @if($group->description)
                <div style="font-size: 12.5px; color: var(--admin-text-muted); margin-top: 3px;">
                  {{ $group->description }}
                </div>
              @endif
            </div>
          </div>

          <!-- Group Actions -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="admin-btn admin-btn-secondary" onclick="openAddValueModal({{ $group->id }}, '{{ addslashes($group->name) }}', '{{ $group->display_type }}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Value
            </button>

            <button type="button" class="admin-btn admin-btn-edit" onclick="openEditGroupModal({{ json_encode($group) }})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Edit
            </button>

            <form action="{{ route('admin.product-options.delete', $group->id) }}" method="POST" onsubmit="return confirm('Delete option group {{ $group->name }} and all its values?');" style="margin: 0;">
              @csrf
              @method('DELETE')
              <button type="submit" class="admin-btn admin-btn-danger" style="padding: 5px 8px;" title="Delete Group">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </form>
          </div>
        </div>

        <!-- Group Values Table -->
        <div style="overflow-x: auto;">
          <table class="admin-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #FAFAFA; border-bottom: 1px solid var(--admin-border); font-size: 11.5px; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.05em; text-align: left;">
                <th style="padding: 10px 18px; width: 40px;">#</th>
                <th style="padding: 10px 18px;">Value Name</th>
                <th style="padding: 10px 18px;">Visual Swatch / Color</th>
                <th style="padding: 10px 18px;">Status</th>
                <th style="padding: 10px 18px; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @forelse($group->values as $vIdx => $val)
                <tr style="border-bottom: 1px solid #F1F5F9; font-size: 13px;">
                  <td style="padding: 10px 18px; color: var(--admin-text-muted); font-size: 11px;">
                    {{ $vIdx + 1 }}
                  </td>
                  <td style="padding: 10px 18px; font-weight: 600; color: var(--admin-text-primary);">
                    {{ $val->value }}
                  </td>
                  <td style="padding: 10px 18px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      @if($val->image)
                        <img src="{{ $val->image }}" alt="{{ $val->value }}" style="width: 28px; height: 28px; border-radius: 6px; object-fit: cover; border: 1px solid #E2E8F0;">
                      @endif
                      @if($val->color_code)
                        <span style="display: inline-flex; align-items: center; gap: 4px;">
                          <span style="width: 16px; height: 16px; border-radius: 50%; background: {{ $val->color_code }}; border: 1px solid #CBD5E1; display: inline-block;"></span>
                          <span style="font-family: monospace; font-size: 11px; color: var(--admin-text-muted);">{{ $val->color_code }}</span>
                        </span>
                      @endif
                      @if(!$val->image && !$val->color_code)
                        <span style="font-size: 12px; color: var(--admin-text-muted); font-style: italic;">Text only</span>
                      @endif
                    </div>
                  </td>
                  <td style="padding: 10px 18px;">
                    @if($val->is_active)
                      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10B981; margin-right: 4px;" title="Active"></span>
                      <span style="font-size: 12px; color: #065F46;">Active</span>
                    @else
                      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #9CA3AF; margin-right: 4px;" title="Inactive"></span>
                      <span style="font-size: 12px; color: #6B7280;">Inactive</span>
                    @endif
                  </td>
                  <td style="padding: 10px 18px; text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                      <button type="button" class="admin-btn admin-btn-edit" style="padding: 4px 8px; font-size: 11px;" onclick="openEditValueModal({{ json_encode($val) }})">
                        Edit
                      </button>
                      <form action="{{ route('admin.product-options.values.delete', $val->id) }}" method="POST" onsubmit="return confirm('Delete value {{ $val->value }}?');" style="margin: 0; display: inline;">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="admin-btn admin-btn-danger" style="padding: 4px 8px; font-size: 11px;">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              @empty
                <tr>
                  <td colspan="5" style="padding: 24px; text-align: center; color: var(--admin-text-muted); font-size: 13px;">
                    No values added yet for this option group.
                    <a href="javascript:void(0)" onclick="openAddValueModal({{ $group->id }}, '{{ addslashes($group->name) }}', '{{ $group->display_type }}')" style="color: #3C50E0; font-weight: 600; margin-left: 6px;">
                      + Add the first value
                    </a>
                  </td>
                </tr>
              @endforelse
            </tbody>
          </table>
        </div>
      </div>
    @empty
      <div class="admin-card" style="padding: 48px 24px; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;">✦</div>
        <h3 style="font-size: 17px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 8px;">No Option Groups Yet</h3>
        <p style="font-size: 13.5px; color: var(--admin-text-secondary); max-width: 480px; margin: 0 auto 20px auto;">
          Create your first dynamic option group (e.g. Metal Purity, Finish, Ring Size, Gemstone, Diamond Clarity) to begin configuring variants.
        </p>
        <button type="button" class="admin-btn admin-btn-primary" onclick="openNewGroupModal()" style="padding: 10px 20px;">
          + Create Option Group
        </button>
      </div>
    @endforelse
  </div>

</div>

<!-- ==================== MODAL: CREATE OPTION GROUP ==================== -->
<div id="newGroupModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
  <div class="admin-card" style="width: 100%; max-width: 520px; background: #FFFFFF; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
    <div style="padding: 18px 24px; border-bottom: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between;">
      <h3 style="font-size: 16px; font-weight: 700; color: var(--admin-text-primary); margin: 0;">Create New Option Group</h3>
      <button type="button" onclick="closeNewGroupModal()" style="background: transparent; border: none; font-size: 20px; cursor: pointer; color: var(--admin-text-muted);">&times;</button>
    </div>
    <form action="{{ route('admin.product-options.store') }}" method="POST" style="padding: 22px 24px;">
      @csrf
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 6px;">Option Name *</label>
        <input type="text" name="name" required placeholder="e.g. Diamond Clarity, Ring Size, Chain Length" class="admin-input" style="width: 100%;">
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 6px;">Internal Key / Code (Optional)</label>
        <input type="text" name="code" placeholder="e.g. CLARITY, SIZE, CHAIN_LEN (auto-generated if empty)" class="admin-input" style="width: 100%; text-transform: uppercase;">
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 6px;">Display Type *</label>
        <select name="display_type" class="admin-input" style="width: 100%;">
          <option value="dropdown">Dropdown (Recommended for long lists like Ring Size, Chain Type)</option>
          <option value="text_button">Text Button (Pills for short options like 18KT, 22KT, S, M, L)</option>
          <option value="image_swatch">Image Swatch (Visual round/square swatches with images & colors)</option>
        </select>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 6px;">Description (Optional)</label>
        <textarea name="description" rows="2" placeholder="Helpful guidance for internal team or frontend tooltip" class="admin-input" style="width: 100%; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; gap: 24px; margin-bottom: 22px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
          <input type="checkbox" name="is_required" value="1" style="accent-color: #3C50E0;">
          <span>Required Selection</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
          <input type="checkbox" name="is_active" value="1" checked style="accent-color: #3C50E0;">
          <span>Active</span>
        </label>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="admin-btn admin-btn-secondary" onclick="closeNewGroupModal()">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Create Group</button>
      </div>
    </form>
  </div>
</div>

<!-- ==================== MODAL: EDIT OPTION GROUP ==================== -->
<div id="editGroupModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
  <div class="admin-card" style="width: 100%; max-width: 520px; background: #FFFFFF; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
    <div style="padding: 18px 24px; border-bottom: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between;">
      <h3 style="font-size: 16px; font-weight: 700; color: var(--admin-text-primary); margin: 0;">Edit Option Group</h3>
      <button type="button" onclick="closeEditGroupModal()" style="background: transparent; border: none; font-size: 20px; cursor: pointer; color: var(--admin-text-muted);">&times;</button>
    </div>
    <form id="editGroupForm" method="POST" style="padding: 22px 24px;">
      @csrf
      @method('PUT')
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 6px;">Option Name *</label>
        <input type="text" id="edit_group_name" name="name" required class="admin-input" style="width: 100%;">
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 6px;">Internal Key / Code *</label>
        <input type="text" id="edit_group_code" name="code" required class="admin-input" style="width: 100%; text-transform: uppercase;">
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 6px;">Display Type *</label>
        <select id="edit_group_display_type" name="display_type" class="admin-input" style="width: 100%;">
          <option value="dropdown">Dropdown</option>
          <option value="text_button">Text Button</option>
          <option value="image_swatch">Image Swatch</option>
        </select>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 6px;">Description (Optional)</label>
        <textarea id="edit_group_description" name="description" rows="2" class="admin-input" style="width: 100%; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; gap: 24px; margin-bottom: 22px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
          <input type="checkbox" id="edit_group_is_required" name="is_required" value="1" style="accent-color: #3C50E0;">
          <span>Required Selection</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
          <input type="checkbox" id="edit_group_is_active" name="is_active" value="1" style="accent-color: #3C50E0;">
          <span>Active</span>
        </label>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="admin-btn admin-btn-secondary" onclick="closeEditGroupModal()">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Update Group</button>
      </div>
    </form>
  </div>
</div>

<!-- ==================== MODAL: ADD OPTION VALUE ==================== -->
<div id="addValueModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
  <div class="admin-card" style="width: 100%; max-width: 560px; background: #FFFFFF; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
    <div style="padding: 18px 24px; border-bottom: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between;">
      <h3 style="font-size: 16px; font-weight: 700; color: var(--admin-text-primary); margin: 0;">
        Add Value to <span id="addValueGroupName" style="color: #3C50E0;"></span>
      </h3>
      <button type="button" onclick="closeAddValueModal()" style="background: transparent; border: none; font-size: 20px; cursor: pointer; color: var(--admin-text-muted);">&times;</button>
    </div>
    <form id="addValueForm" method="POST" enctype="multipart/form-data" style="padding: 22px 24px;">
      @csrf
      <div style="margin-bottom: 14px;">
        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 5px;">Value Name *</label>
        <input type="text" name="value" required placeholder="e.g. 18KT, Emerald, VS1, Size 14, Rose Gold" class="admin-input" style="width: 100%;">
      </div>

      <div style="margin-bottom: 14px;">
        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 5px;">Hex Color Code (Optional)</label>
        <div style="display: flex; gap: 6px; align-items: center;">
          <input type="color" id="add_color_picker" value="#E5C158" style="height: 36px; width: 44px; padding: 2px; border: 1px solid var(--admin-border); border-radius: 6px; cursor: pointer;" onchange="document.getElementById('add_color_text').value = this.value">
          <input type="text" id="add_color_text" name="color_code" placeholder="#E5C158" class="admin-input" style="flex: 1;" onchange="document.getElementById('add_color_picker').value = this.value">
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 5px;">Swatch Image (for Image Swatch)</label>
        <input type="file" name="image" accept="image/*" class="admin-input" style="width: 100%; padding: 6px;">
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
          <input type="checkbox" name="is_active" value="1" checked style="accent-color: #3C50E0;">
          <span>Active in store</span>
        </label>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="admin-btn admin-btn-secondary" onclick="closeAddValueModal()">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Save Value</button>
      </div>
    </form>
  </div>
</div>

<!-- ==================== MODAL: EDIT OPTION VALUE ==================== -->
<div id="editValueModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
  <div class="admin-card" style="width: 100%; max-width: 560px; background: #FFFFFF; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
    <div style="padding: 18px 24px; border-bottom: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between;">
      <h3 style="font-size: 16px; font-weight: 700; color: var(--admin-text-primary); margin: 0;">Edit Option Value</h3>
      <button type="button" onclick="closeEditValueModal()" style="background: transparent; border: none; font-size: 20px; cursor: pointer; color: var(--admin-text-muted);">&times;</button>
    </div>
    <form id="editValueForm" method="POST" enctype="multipart/form-data" style="padding: 22px 24px;">
      @csrf
      @method('PUT')
      <div style="margin-bottom: 14px;">
        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 5px;">Value Name *</label>
        <input type="text" id="edit_val_value" name="value" required class="admin-input" style="width: 100%;">
      </div>

      <div style="margin-bottom: 14px;">
        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 5px;">Hex Color Code (Optional)</label>
        <div style="display: flex; gap: 6px; align-items: center;">
          <input type="color" id="edit_color_picker" style="height: 36px; width: 44px; padding: 2px; border: 1px solid var(--admin-border); border-radius: 6px; cursor: pointer;" onchange="document.getElementById('edit_val_color_code').value = this.value">
          <input type="text" id="edit_val_color_code" name="color_code" class="admin-input" style="flex: 1;" onchange="document.getElementById('edit_color_picker').value = this.value">
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--admin-text-primary); margin-bottom: 5px;">Replace Swatch Image</label>
        <input type="file" name="image" accept="image/*" class="admin-input" style="width: 100%; padding: 6px;">
        <div id="edit_val_img_preview" style="margin-top: 8px;"></div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
          <input type="checkbox" id="edit_val_is_active" name="is_active" value="1" style="accent-color: #3C50E0;">
          <span>Active in store</span>
        </label>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="admin-btn admin-btn-secondary" onclick="closeEditValueModal()">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Update Value</button>
      </div>
    </form>
  </div>
</div>

<script>
  function openNewGroupModal() {
    document.getElementById('newGroupModal').style.display = 'flex';
  }
  function closeNewGroupModal() {
    document.getElementById('newGroupModal').style.display = 'none';
  }

  function openEditGroupModal(group) {
    document.getElementById('editGroupForm').action = '/admin/product-options/' + group.id;
    document.getElementById('edit_group_name').value = group.name || '';
    document.getElementById('edit_group_code').value = group.code || '';
    document.getElementById('edit_group_display_type').value = group.display_type || 'dropdown';
    document.getElementById('edit_group_description').value = group.description || '';
    document.getElementById('edit_group_is_required').checked = !!group.is_required;
    document.getElementById('edit_group_is_active').checked = !!group.is_active;
    document.getElementById('editGroupModal').style.display = 'flex';
  }
  function closeEditGroupModal() {
    document.getElementById('editGroupModal').style.display = 'none';
  }

  function openAddValueModal(groupId, groupName, displayType) {
    document.getElementById('addValueForm').action = '/admin/product-options/' + groupId + '/values';
    document.getElementById('addValueGroupName').innerText = groupName;
    document.getElementById('addValueModal').style.display = 'flex';
  }
  function closeAddValueModal() {
    document.getElementById('addValueModal').style.display = 'none';
  }

  function openEditValueModal(val) {
    document.getElementById('editValueForm').action = '/admin/product-options/values/' + val.id;
    document.getElementById('edit_val_value').value = val.value || '';
    document.getElementById('edit_val_color_code').value = val.color_code || '';
    if (val.color_code && val.color_code.startsWith('#')) {
      document.getElementById('edit_color_picker').value = val.color_code;
    }
    document.getElementById('edit_val_is_active').checked = !!val.is_active;

    const previewDiv = document.getElementById('edit_val_img_preview');
    if (val.image) {
      previewDiv.innerHTML = '<span style="font-size:11px; color:#64748B;">Current Image:</span><br><img src="' + val.image + '" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid #CBD5E1;margin-top:4px;">';
    } else {
      previewDiv.innerHTML = '';
    }

    document.getElementById('editValueModal').style.display = 'flex';
  }
  function closeEditValueModal() {
    document.getElementById('editValueModal').style.display = 'none';
  }

  // Close modals on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeNewGroupModal();
      closeEditGroupModal();
      closeAddValueModal();
      closeEditValueModal();
    }
  });
</script>
@endsection
