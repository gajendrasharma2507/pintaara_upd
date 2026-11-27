@extends('layouts.admin')

@section('title', 'Customers')

@section('content')
<div style="display: flex; flex-direction: column; gap: 24px; max-width: 1400px; margin: 0 auto;">

  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
    <div>
      <h1 style="font-size: 24px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 4px 0;">
        Patrons & Clients
      </h1>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 0;">
        Registered clients, order histories, and profile management.
      </p>
    </div>
    <form method="GET" action="{{ route('admin.customers') }}" style="display: flex; align-items: center; gap: 10px;">
      <div style="position: relative; min-width: 260px;">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by name, email, phone..." class="admin-input" style="padding-left: 36px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted);">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <button type="submit" class="admin-btn-outline" style="padding: 8px 14px;">Search</button>
      @if(request('search'))
        <a href="{{ route('admin.customers') }}" class="admin-btn-ghost" style="padding: 8px 12px;">Reset</a>
      @endif
    </form>
  </div>

  <div class="admin-card" style="border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border); overflow: hidden;">
    <div style="overflow-x: auto;">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Patron</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Commissions</th>
            <th>Joined</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          @forelse($customers as $client)
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--admin-primary-light); color: var(--admin-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px;">
                    {{ strtoupper(substr($client->name, 0, 2)) }}
                  </div>
                  <div>
                    <div style="font-weight: 700; color: var(--admin-text-primary);">{{ $client->name }}</div>
                    @if($client->address)
                      <div style="font-size: 11px; color: var(--admin-text-muted); max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        {{ $client->address }}
                      </div>
                    @endif
                  </div>
                </div>
              </td>
              <td>{{ $client->email }}</td>
              <td>{{ $client->phone ?: '—' }}</td>
              <td>
                <span class="admin-badge admin-badge-{{ $client->role === 'admin' ? 'gold' : 'neutral' }}">
                  {{ $client->role ?: 'customer' }}
                </span>
              </td>
              <td>
                <span class="admin-badge admin-badge-{{ ($client->is_disabled || $client->status === 'disabled') ? 'danger' : 'success' }}">
                  {{ ($client->is_disabled || $client->status === 'disabled') ? 'Disabled' : 'Active' }}
                </span>
              </td>
              <td>
                <span class="admin-badge admin-badge-info">
                  {{ $client->orders_count }} orders
                </span>
              </td>
              <td style="font-size: 12px; color: var(--admin-text-muted);">
                {{ $client->created_at ? $client->created_at->format('d M Y') : '—' }}
              </td>
              <td style="text-align: right; white-space: nowrap;">
                <button
                  type="button"
                  class="admin-btn admin-btn-edit"
                  onclick="openEditUserModal({{ json_encode([
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'phone' => $client->phone ?? '',
                    'address' => $client->address ?? '',
                    'role' => $client->role ?? 'customer',
                    'status' => ($client->is_disabled || $client->status === 'disabled') ? 'disabled' : 'active',
                  ]) }})"
                  style="cursor: pointer;"
                >
                  Edit Profile
                </button>
                @if(auth()->id() !== $client->id)
                  <button
                    type="button"
                    onclick="deleteCustomer({{ $client->id }}, {{ json_encode($client->name ?: $client->email) }})"
                    style="cursor: pointer; margin-left: 6px; background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 600;"
                  >
                    Delete
                  </button>
                @endif
              </td>
            </tr>
          @empty
            <tr>
              <td colspan="8" style="text-align: center; color: var(--admin-text-muted); padding: 40px;">
                No clients found.
              </td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>

    @if($customers->hasPages())
      <div style="padding: 16px 24px; border-top: 1px solid var(--admin-border);">
        {{ $customers->links('vendor.pagination.admin') }}
      </div>
    @endif
  </div>

  <!-- Edit Customer Profile Modal -->
  <div id="editCustomerModal" style="display: none; position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); align-items: center; justify-content: center; padding: 20px;">
    <div style="background: var(--admin-surface, #fff); border: 1px solid var(--admin-border, #e5e7eb); border-radius: 16px; width: 100%; max-width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
      <div style="padding: 20px 24px; border-bottom: 1px solid var(--admin-border, #e5e7eb); display: flex; align-items: center; justify-content: space-between;">
        <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: var(--admin-text-primary, #111);">Edit Patron Profile</h3>
        <button type="button" onclick="closeEditUserModal()" style="background: none; border: none; font-size: 22px; cursor: pointer; color: var(--admin-text-muted, #9ca3af); line-height: 1;">&times;</button>
      </div>

      <form id="editCustomerForm" method="POST" action="" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
        @csrf

        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--admin-text-muted, #6b7280); margin-bottom: 6px;">Full Name *</label>
          <input type="text" id="modal_name" name="name" required class="admin-input" style="width: 100%; box-sizing: border-box;">
        </div>

        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--admin-text-muted, #6b7280); margin-bottom: 6px;">Email Address *</label>
          <input type="email" id="modal_email" name="email" required class="admin-input" style="width: 100%; box-sizing: border-box;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--admin-text-muted, #6b7280); margin-bottom: 6px;">Phone Number</label>
            <input type="text" id="modal_phone" name="phone" class="admin-input" style="width: 100%; box-sizing: border-box;" placeholder="+91 98765 43210">
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--admin-text-muted, #6b7280); margin-bottom: 6px;">Role</label>
            <select id="modal_role" name="role" class="admin-input" style="width: 100%; box-sizing: border-box;">
              <option value="customer">Customer / Patron</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--admin-text-muted, #6b7280); margin-bottom: 6px;">Address</label>
          <textarea id="modal_address" name="address" rows="2" class="admin-input" style="width: 100%; box-sizing: border-box; resize: vertical;" placeholder="Street address, city, state, pincode"></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--admin-text-muted, #6b7280); margin-bottom: 6px;">Account Status</label>
            <select id="modal_status" name="status" class="admin-input" style="width: 100%; box-sizing: border-box;">
              <option value="active">Active (Login Enabled)</option>
              <option value="disabled">Disabled (Login Blocked)</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--admin-text-muted, #6b7280); margin-bottom: 6px;">Reset Password</label>
            <input type="password" id="modal_password" name="password" class="admin-input" style="width: 100%; box-sizing: border-box;" placeholder="Leave blank to keep">
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 10px; padding-top: 16px; border-top: 1px solid var(--admin-border, #e5e7eb);">
          <button type="button" onclick="closeEditUserModal()" class="admin-btn-ghost" style="padding: 9px 16px;">Cancel</button>
          <button type="submit" class="admin-btn-primary" style="padding: 9px 20px;">Save Profile Changes</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function openEditUserModal(user) {
      document.getElementById('modal_name').value = user.name || '';
      document.getElementById('modal_email').value = user.email || '';
      document.getElementById('modal_phone').value = user.phone || '';
      document.getElementById('modal_address').value = user.address || '';
      document.getElementById('modal_role').value = user.role || 'customer';
      document.getElementById('modal_status').value = user.status || 'active';
      document.getElementById('modal_password').value = '';
      document.getElementById('editCustomerForm').action = '/admin/customers/' + user.id;
      const modal = document.getElementById('editCustomerModal');
      modal.style.display = 'flex';
    }

    function closeEditUserModal() {
      const modal = document.getElementById('editCustomerModal');
      modal.style.display = 'none';
    }

    window.addEventListener('click', function(e) {
      const modal = document.getElementById('editCustomerModal');
      if (e.target === modal) {
        closeEditUserModal();
      }
    });

    function deleteCustomer(id, label) {
      if (!confirm('Are you sure you want to permanently delete user "' + label + '"?')) return;
      const form = document.getElementById('deleteCustomerForm');
      form.action = '/admin/customers/' + id;
      form.submit();
    }
  </script>

  <form id="deleteCustomerForm" method="POST" style="display: none;">
    @csrf
    @method('DELETE')
  </form>
        </tbody>
      </table>
    </div>

    @if($customers->hasPages())
      <div style="padding: 16px 24px; border-top: 1px solid var(--admin-border);">
        {{ $customers->links('vendor.pagination.admin') }}
      </div>
    @endif
  </div>

</div>
@endsection

