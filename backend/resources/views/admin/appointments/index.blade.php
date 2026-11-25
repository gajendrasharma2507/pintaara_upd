@extends('layouts.admin')

@section('title', 'Studio Bookings & Appointments')

@section('content')
<div style="display: flex; flex-direction: column; gap: 22px; max-width: 1350px; margin: 0 auto; padding-bottom: 60px;">

  <!-- Header -->
  <div style="background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 16px; padding: 22px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
    <div>
      <h1 style="font-size: 22px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 4px 0;">
        Studio Bookings &amp; Appointments
      </h1>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 0;">
        View client appointments, update booking date/time, and notify clients automatically via email.
      </p>
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

  <!-- Status Filter Tabs -->
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    @foreach(['all' => 'All Bookings', 'confirmed' => 'Confirmed', 'rescheduled' => 'Rescheduled', 'completed' => 'Completed', 'cancelled' => 'Cancelled'] as $key => $label)
      <a href="{{ route('admin.appointments', ['status' => $key]) }}"
         style="padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; border: 1px solid {{ $status === $key ? '#0F172A' : 'var(--admin-border)' }}; background: {{ $status === $key ? '#0F172A' : 'var(--admin-surface)' }}; color: {{ $status === $key ? '#FFFFFF' : 'var(--admin-text-secondary)' }};">
        {{ $label }}
      </a>
    @endforeach
  </div>

  <!-- Bookings Table -->
  <div class="admin-card" style="padding: 0; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border); overflow: hidden;">
    <div style="overflow-x: auto;">
      <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
        <thead>
          <tr style="background: var(--admin-surface-elevated); border-bottom: 1px solid var(--admin-border);">
            <th style="padding: 13px 16px; font-weight: 700; color: var(--admin-text-secondary);">Client</th>
            <th style="padding: 13px 16px; font-weight: 700; color: var(--admin-text-secondary);">Contact &amp; Email</th>
            <th style="padding: 13px 16px; font-weight: 700; color: var(--admin-text-secondary);">Date &amp; Time</th>
            <th style="padding: 13px 16px; font-weight: 700; color: var(--admin-text-secondary);">Purpose &amp; Notes</th>
            <th style="padding: 13px 16px; font-weight: 700; color: var(--admin-text-secondary);">Status</th>
            <th style="padding: 13px 16px; font-weight: 700; color: var(--admin-text-secondary); text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          @forelse($appointments as $apt)
            @php
              $resolvedEmail = $apt->resolveCustomerEmail();
              $badgeClass = match($apt->status) {
                'confirmed', 'completed' => 'admin-badge-success',
                'cancelled' => 'admin-badge-danger',
                default => 'admin-badge-neutral',
              };
            @endphp
            <tr style="border-bottom: 1px solid var(--admin-border);">
              <td style="padding: 14px 16px;">
                <div style="font-weight: 700; color: var(--admin-text-primary);">{{ $apt->full_name }}</div>
                <div style="font-size: 11px; color: var(--admin-text-muted);">Booked {{ $apt->created_at->setTimezone('Asia/Kolkata')->format('d M Y, h:i A') }}</div>
              </td>
              <td style="padding: 14px 16px;">
                <div style="font-weight: 600; color: var(--admin-text-primary);">{{ $apt->contact }}</div>
                <div style="font-size: 12px; color: {{ $resolvedEmail ? '#0E7490' : 'var(--admin-text-muted)' }};">
                  {{ $resolvedEmail ?: 'No email on file' }}
                </div>
              </td>
              <td style="padding: 14px 16px; white-space: nowrap;">
                <div style="font-weight: 700; color: var(--admin-text-primary);">{{ $apt->date ?: '—' }}</div>
                <div style="font-size: 12px; color: var(--admin-text-secondary);">{{ $apt->time ?: '—' }}</div>
              </td>
              <td style="padding: 14px 16px; max-width: 280px;">
                <div style="font-weight: 600; color: var(--admin-text-primary);">{{ $apt->purpose }}</div>
                @if($apt->notes)
                  <div style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 2px;">{{ $apt->notes }}</div>
                @endif
              </td>
              <td style="padding: 14px 16px;">
                <span class="admin-badge {{ $badgeClass }}" style="text-transform: capitalize; font-size: 11px;">
                  {{ $apt->status }}
                </span>
              </td>
              <td style="padding: 14px 16px; text-align: right; white-space: nowrap;">
                <button type="button"
                        onclick='openEditAppointmentModal(@json($apt), @json($resolvedEmail))'
                        style="padding: 7px 14px; font-size: 12px; font-weight: 600; border-radius: 6px; border: 1px solid #CBD5E1; background: #FFFFFF; color: #0F172A; cursor: pointer;">
                  Change Time / Edit
                </button>
              </td>
            </tr>
          @empty
            <tr>
              <td colspan="6" style="padding: 36px; text-align: center; color: var(--admin-text-secondary);">
                No bookings found.
              </td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>
  </div>

  @if($appointments->hasPages())
    <div>{{ $appointments->appends(['status' => $status])->links() }}</div>
  @endif

</div>

<!-- Edit / Change Booking Time Modal -->
<div id="editAppointmentModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
  <div style="background: #FFFFFF; border-radius: 16px; width: 100%; max-width: 500px; padding: 24px 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
      <div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #0F172A;">Update Booking Time &amp; Status</h3>
        <div id="modal_client_info" style="font-size: 12px; color: #64748B; margin-top: 3px;"></div>
      </div>
      <button type="button" onclick="closeEditAppointmentModal()" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #64748B;">&times;</button>
    </div>

    <form id="editAppointmentForm" method="POST" style="display: flex; flex-direction: column; gap: 14px;">
      @csrf
      @method('PUT')

      <div>
        <label class="admin-label" style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 5px;">Date (yyyy/mm/dd)</label>
        <input type="text" name="date" id="modal_apt_date" class="admin-input" placeholder="yyyy/mm/dd" style="width: 100%;">
      </div>

      <div>
        <label class="admin-label" style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 5px;">Time Slot *</label>
        <input type="text" name="time" id="modal_apt_time" list="studio_time_slots" required class="admin-input" placeholder="e.g. 02:30 PM - 04:00 PM" style="width: 100%;">
        <datalist id="studio_time_slots">
          <option value="10:30 AM - 12:00 PM">
          <option value="12:00 PM - 01:30 PM">
          <option value="02:30 PM - 04:00 PM">
          <option value="04:00 PM - 05:30 PM">
          <option value="05:30 PM - 07:00 PM">
        </datalist>
      </div>

      <div>
        <label class="admin-label" style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 5px;">Status *</label>
        <select name="status" id="modal_apt_status" class="admin-input" style="width: 100%;">
          <option value="confirmed">Confirmed</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div>
        <label class="admin-label" style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 5px;">Message to Client (included in email)</label>
        <textarea name="admin_note" id="modal_apt_admin_note" rows="2" class="admin-input" placeholder="Optional note explaining time change..." style="width: 100%;"></textarea>
      </div>

      <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #0F172A; cursor: pointer;">
        <input type="checkbox" name="notify_user" value="1" checked>
        <span>Send updated booking email to client (<span id="modal_email_preview">—</span>)</span>
      </label>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px;">
        <button type="button" onclick="closeEditAppointmentModal()" style="padding: 9px 18px; border-radius: 8px; border: 1px solid #CBD5E1; background: #FFFFFF; font-weight: 600; cursor: pointer;">Cancel</button>
        <button type="submit" class="admin-btn-primary" style="padding: 9px 20px; font-weight: 700;">Save &amp; Send Email</button>
      </div>
    </form>
  </div>
</div>

<script>
  function openEditAppointmentModal(apt, email) {
    const form = document.getElementById('editAppointmentForm');
    form.action = '/admin/appointments/' + apt.id;
    document.getElementById('modal_client_info').textContent = apt.full_name + ' • ' + apt.contact;
    document.getElementById('modal_apt_date').value = apt.date || '';
    document.getElementById('modal_apt_time').value = apt.time || '';
    document.getElementById('modal_apt_status').value = apt.status === 'confirmed' ? 'rescheduled' : (apt.status || 'rescheduled');
    document.getElementById('modal_apt_admin_note').value = '';
    document.getElementById('modal_email_preview').textContent = email || 'No email on file';
    document.getElementById('editAppointmentModal').style.display = 'flex';
  }

  function closeEditAppointmentModal() {
    document.getElementById('editAppointmentModal').style.display = 'none';
  }
</script>
@endsection
