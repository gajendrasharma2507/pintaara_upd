@extends('layouts.admin')

@section('title', 'Order ' . ($order->order_number ?: '#' . $order->id))

@section('content')
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

<div class="order-detail-view" style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">

  <!-- Header -->
  <div class="no-print" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
    <div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <h1 style="font-size: 24px; font-weight: 800; color: var(--admin-text-primary); margin: 0;">
          Order {{ $order->order_number ?: ('#PIN-' . $order->id) }}
        </h1>
        <span class="admin-badge admin-badge-{{ in_array($order->status, ['delivered', 'paid']) ? 'success' : 'warning' }}">
          {{ ucfirst(str_replace('_', ' ', $order->status)) }}
        </span>
      </div>
      <p style="font-size: 13px; color: var(--admin-text-secondary); margin: 4px 0 0 0;">
        Placed on {{ $order->created_at ? $order->created_at->format('d M Y, h:i A') : '—' }}
      </p>
    </div>

    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
      <!-- Open PDF Invoice Modal Button -->
      <button type="button" onclick="openInvoiceModal()" class="admin-btn admin-btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span>Print Tax Invoice (PDF)</span>
      </button>

      @if($order->trashed())
        <form method="POST" action="{{ route('admin.orders.restore', $order->id) }}" style="display: inline;" onsubmit="return confirm('Restore this order?')">
          @csrf
          <button type="submit" class="admin-btn" style="background: #10B981; color: #fff; padding: 8px 14px; font-size: 13px; border: none; border-radius: 8px; cursor: pointer;">
            Restore Order
          </button>
        </form>
      @else
        <form method="POST" action="{{ route('admin.orders.delete', $order->id) }}" style="display: inline;" onsubmit="return confirm('Move this order to Trash?')">
          @csrf
          @method('DELETE')
          <button type="submit" class="admin-btn" style="background: transparent; border: 1px solid #FCA5A5; color: #EF4444; padding: 8px 14px; font-size: 13px; border-radius: 8px; cursor: pointer;">
            Move to Trash
          </button>
        </form>
      @endif

      <a href="{{ route('admin.orders') }}" class="admin-btn admin-btn-ghost">&larr; Back to Orders</a>
    </div>
  </div>

  @if($order->trashed())
    <div class="admin-card no-print" style="padding: 16px 20px; border-radius: 12px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 10px; color: #B91C1C;">
        <span style="font-size: 18px;">⚠️</span>
        <span style="font-size: 13px; font-weight: 600;">This order is currently in the Trash (Deleted on {{ $order->deleted_at ? $order->deleted_at->format('d M Y, h:i A') : '' }}). It is hidden from normal client queries.</span>
      </div>
      <form method="POST" action="{{ route('admin.orders.restore', $order->id) }}" onsubmit="return confirm('Restore this order?')">
        @csrf
        <button type="submit" class="admin-btn" style="background: #10B981; color: #fff; padding: 6px 14px; font-size: 13px; border: none; border-radius: 6px; cursor: pointer;">
          Restore Order
        </button>
      </form>
    </div>
  @endif

  <!-- Status Transition Form -->
  <div class="admin-card no-print" style="padding: 20px 24px; border-radius: 14px; background: var(--admin-surface); border: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
    <div>
      <div style="font-size: 13px; font-weight: 700; color: var(--admin-text-primary);">Fulfillment Status</div>
      <div style="font-size: 12px; color: var(--admin-text-muted);">Update workshop milestone for this client piece</div>
    </div>
    <form action="{{ route('admin.orders.status', $order->id) }}" method="POST" style="display: flex; align-items: center; gap: 10px; margin: 0;">
      @csrf
      <select name="status" class="admin-input" style="width: auto; cursor: pointer;">
        @foreach(['confirmed', 'in_production', 'inspection', 'shipped', 'delivered', 'cancelled'] as $st)
          <option value="{{ $st }}" {{ $order->status === $st ? 'selected' : '' }}>
            {{ ucfirst(str_replace('_', ' ', $st)) }}
          </option>
        @endforeach
      </select>
      <button type="submit" class="admin-btn-primary" style="padding: 8px 16px;">Update Status</button>
    </form>
  </div>

  <!-- Customer Email & Notification Dispatcher Card -->
  <div class="admin-card no-print" style="padding: 22px 24px; border-radius: 14px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
      <div>
        <div style="font-size: 14px; font-weight: 800; color: var(--admin-text-primary); display: flex; align-items: center; gap: 8px;">
          <span>Customer Email &amp; Notification System</span>
          <span style="font-size: 11px; font-weight: 700; color: #B8860B; background: #FAF9F5; padding: 2px 8px; border-radius: 4px; border: 1px solid #EAE6DF;">
            A-1 to A-7 Dispatcher
          </span>
        </div>
        <div style="font-size: 12px; color: var(--admin-text-muted); margin-top: 2px;">
          Dispatch luxury certified emails to <strong>{{ $order->customer_email ?: 'Client' }}</strong> or preview live HTML templates
        </div>
      </div>

      <!-- Quick Preview Dropdown -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <label style="font-size: 12px; font-weight: 600; color: var(--admin-text-secondary);">Preview:</label>
        <select id="email_preview_select" class="admin-input" style="width: auto; padding: 6px 12px; font-size: 12px;" onchange="if(this.value) window.open(this.value, '_blank')">
          <option value="">Select Template...</option>
          <option value="{{ route('admin.orders.preview-email', [$order->id, 'confirmation']) }}">A-1. Order Confirmation</option>
          <option value="{{ route('admin.orders.preview-email', [$order->id, 'manufacturing_initiated']) }}">A-2. Manufacturing Initiated</option>
          <option value="{{ route('admin.orders.preview-email', [$order->id, 'dispatched']) }}">A-3. Order Dispatched</option>
          <option value="{{ route('admin.orders.preview-email', [$order->id, 'delivered']) }}">A-4. Order Delivered</option>
          <option value="{{ route('admin.orders.preview-email', [$order->id, 'cancelled']) }}">A-5. Order Cancellation</option>
          <option value="{{ route('admin.orders.preview-email', [$order->id, 'refund_processed']) }}">A-6. Refund Processed</option>
          <option value="{{ route('admin.orders.preview-email', [$order->id, 'delay_update']) }}">A-7. Delay Update</option>
        </select>
      </div>
    </div>

    <!-- Dispatch Action Form -->
    <form action="{{ route('admin.orders.send-email', $order->id) }}" method="POST" style="margin: 0; display: flex; flex-direction: column; gap: 12px;">
      @csrf
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; align-items: end;">
        <div>
          <label class="admin-label" style="font-size: 11.5px;">Notification Type</label>
          <select name="email_type" id="dispatch_email_type" class="admin-input" required onchange="handleEmailTypeChange(this.value)">
            <option value="confirmation">A-1. Order Confirmation</option>
            <option value="manufacturing_initiated">A-2. Manufacturing Initiated (Production)</option>
            <option value="dispatched">A-3. Order Dispatched</option>
            <option value="delivered">A-4. Order Delivered</option>
            <option value="cancelled">A-5. Order Cancellation Confirmed</option>
            <option value="refund_processed">A-6. Refund Processed</option>
            <option value="delay_update">A-7. Manufacturing / Delivery Delay</option>
          </select>
        </div>

        <!-- Dynamic Field for Dispatch: Courier & Tracking -->
        <div id="field_dispatched_box" style="display: none;">
          <label class="admin-label" style="font-size: 11.5px;">Tracking / Courier</label>
          <input type="text" name="tracking_number" placeholder="Tracking Number (optional)" value="{{ $order->docket_number }}" class="admin-input">
        </div>

        <!-- Dynamic Field for Refund: Amount -->
        <div id="field_refund_box" style="display: none;">
          <label class="admin-label" style="font-size: 11.5px;">Refund Amount (₹)</label>
          <input type="number" step="0.01" name="refund_amount" placeholder="₹{{ number_format($order->total_amount, 2) }}" value="{{ $order->total_amount }}" class="admin-input">
        </div>

        <!-- Dynamic Field for Delay: Reason -->
        <div id="field_delay_box" style="display: none;">
          <label class="admin-label" style="font-size: 11.5px;">Delay Reason</label>
          <input type="text" name="delay_reason" placeholder="e.g. Master setter hand-crafting prongs" class="admin-input">
        </div>

        <div>
          <button type="submit" class="admin-btn admin-btn-primary" style="width: 100%; justify-content: center; padding: 10px 16px; background: #1A1A1A;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px;">
              <path d="M22 2L11 13"></path>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Dispatch Email Now
          </button>
        </div>
      </div>
    </form>
  </div>

  <script>
    function handleEmailTypeChange(val) {
      document.getElementById('field_dispatched_box').style.display = val === 'dispatched' ? 'block' : 'none';
      document.getElementById('field_refund_box').style.display = val === 'refund_processed' ? 'block' : 'none';
      document.getElementById('field_delay_box').style.display = val === 'delay_update' ? 'block' : 'none';
    }
  </script>

  <!-- 2-Column: Customer Info & Items -->
  <div class="no-print" style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
    
    <!-- Items Table -->
    <div class="admin-card" style="padding: 24px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
      <h3 style="font-size: 16px; font-weight: 800; color: var(--admin-text-primary); margin: 0 0 16px 0;">
        Commissioned Pieces
      </h3>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        @foreach($order->items as $item)
          <div style="padding-bottom: 20px; border-bottom: 1px solid var(--admin-border-light);">
            <div style="display: flex; align-items: flex-start; justify-content: space-between;">
              <div style="display: flex; gap: 14px; align-items: flex-start;">
                @if($item->image)
                  <a href="{{ $item->image }}" target="_blank" title="View Commissioned Piece Photo">
                    <img src="{{ $item->image }}" alt="{{ $item->product_name }}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; border: 1px solid var(--admin-border);">
                  </a>
                @endif
                <div>
                  <div style="font-size: 15px; font-weight: 700; color: var(--admin-text-primary);">
                    {{ $item->product_name }}
                  </div>
                  <div style="font-size: 12px; color: var(--admin-text-muted); margin-top: 4px;">
                    Code: <span style="font-family: monospace;">{{ $item->design_code }}</span> &middot;
                    Purity: <strong>{{ $item->metal_purity ?: '22KT' }}</strong> &middot;
                    Weight: {{ number_format($item->weight_used, 3) }}g
                  </div>
                  @if($item->finish || $item->size || $item->gem)
                    <div style="font-size: 11.5px; color: var(--admin-text-secondary); margin-top: 2px;">
                      {{ $item->finish ? 'Finish: ' . $item->finish : '' }}
                      {{ $item->size ? ' · Size: ' . $item->size : '' }}
                      {{ $item->gem && $item->gem !== 'None' ? ' · Gem: ' . $item->gem : '' }}
                    </div>
                  @endif
                  @if($item->huid)
                    <div style="margin-top: 5px;">
                      <span style="font-size: 11px; font-weight: 600; color: #15803D; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.25); padding: 2px 7px; border-radius: 4px;">
                        HUID: {{ $item->huid }}
                      </span>
                    </div>
                  @endif
                </div>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 16px; font-weight: 800; color: var(--admin-text-primary);">
                  ₹{{ number_format($item->total ?: $item->price, 2) }}
                </div>
                <div style="font-size: 11px; color: var(--admin-text-muted);">
                  Qty: {{ $item->quantity ?: 1 }}
                </div>
              </div>
            </div>

            <!-- Existing Attached Documents / Certificates on User Side -->
            @php
              $itemCerts = is_array($item->certificates) ? $item->certificates : [];
              if (empty($itemCerts) && $item->certificate_url && !str_contains($item->certificate_url, 'sample-certificate.pdf')) {
                  $itemCerts[] = [
                      'name' => 'Certificate of Authenticity',
                      'certificate_number' => $item->certificate_number ?: 'BIS-CERT',
                      'certificate_url' => $item->certificate_url,
                  ];
              }
            @endphp

            @if(count($itemCerts) > 0)
              <div style="margin-top: 14px; padding: 10px 14px; background: rgba(201, 169, 97, 0.08); border: 1px solid rgba(201, 169, 97, 0.25); border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 700; color: #92722A; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px;">
                  Active Client Documents (Visible in Patron Collection)
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  @foreach($itemCerts as $cIdx => $cert)
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                      <a href="{{ $cert['certificate_url'] ?? '#' }}" target="_blank" style="color: #1A1A1A; font-weight: 600; text-decoration: underline; display: inline-flex; align-items: center; gap: 6px;">
                        <span>📄 {{ $cert['name'] ?? 'Certificate' }}</span>
                        @if(!empty($cert['certificate_number']))
                          <span style="font-size: 10.5px; color: #666; font-family: monospace;">({{ $cert['certificate_number'] }})</span>
                        @endif
                      </a>
                      <form action="{{ route('admin.orders.items.delete-cert', [$order->id, $item->id, $cIdx]) }}" method="POST" style="margin: 0;" onsubmit="return confirm('Remove this certificate from client portal?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" style="background: none; border: none; color: #EF4444; font-size: 11px; cursor: pointer; padding: 2px 6px;">
                          Remove
                        </button>
                      </form>
                    </div>
                  @endforeach
                </div>
              </div>
            @endif

            <!-- Upload Documents Form -->
            <div style="margin-top: 14px; padding: 16px; background: var(--admin-surface-elevated, #FAF9F5); border: 1px solid var(--admin-border); border-radius: 12px;">
              <details open>
                <summary style="font-size: 13px; font-weight: 700; color: var(--admin-text-primary); cursor: pointer; outline: none; user-select: none;">
                  Documents
                </summary>
                
                <form action="{{ route('admin.orders.items.upload-document', [$order->id, $item->id]) }}" method="POST" enctype="multipart/form-data" style="margin-top: 14px; display: flex; flex-direction: column; gap: 14px;">
                  @csrf

                  <!-- Dynamic Document Rows Container -->
                  <div id="doc_rows_{{ $item->id }}" style="display: flex; flex-direction: column; gap: 10px;">
                    <!-- Row 1 -->
                    <div class="doc-row" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end; background: #fff; padding: 10px 12px; border-radius: 8px; border: 1px solid #E5E1DA;">
                      <div>
                        <label style="display: block; font-size: 10.5px; font-weight: 600; color: var(--admin-text-muted); margin-bottom: 4px;">Document File (PDF / Image)</label>
                        <input type="file" name="document_files[]" multiple accept=".pdf,.png,.jpg,.jpeg,.webp" class="admin-input" style="padding: 5px; font-size: 11.5px;">
                      </div>
                      <div>
                        <label style="display: block; font-size: 10.5px; font-weight: 600; color: var(--admin-text-muted); margin-bottom: 4px;">Document Name</label>
                        <input type="text" name="certificate_names[]" placeholder="e.g. Certificate of Authenticity" list="cert_names_list" class="admin-input" style="font-size: 12px;">
                      </div>
                      <div>
                        <button type="button" onclick="this.closest('.doc-row').remove()" style="background: none; border: none; color: #999; font-size: 16px; cursor: pointer; padding: 8px;" title="Remove this row">&times;</button>
                      </div>
                    </div>
                  </div>

                  <!-- Add Another Document Row Button -->
                  <div>
                    <button type="button" onclick="addDocRow('{{ $item->id }}')" style="background: transparent; border: 1px dashed #C9A961; color: #92722A; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                      <span>+ Add Another Document</span>
                    </button>
                  </div>

                  <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                    <button type="submit" class="admin-btn admin-btn-primary" style="padding: 8px 24px; font-size: 12.5px; font-weight: 700; background: #C9A961; color: #000; border: none; border-radius: 6px; cursor: pointer;">
                      Upload Documents
                    </button>
                  </div>
                </form>
              </details>
            </div>
          </div>
        @endforeach

        <datalist id="cert_names_list">
          <option value="Certificate of Authenticity">
          <option value="BIS Hallmark Certificate">
          <option value="Diamond Quality Report (VVS-VS)">
          <option value="IGI Lab Certificate">
          <option value="GIA Grading Report">
          <option value="Gemological Appraisal &amp; Valuation">
          <option value="Bespoke Design Blueprint">
        </datalist>

        <script>
          function addDocRow(itemId) {
            const container = document.getElementById('doc_rows_' + itemId);
            const row = document.createElement('div');
            row.className = 'doc-row';
            row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end; background: #fff; padding: 10px 12px; border-radius: 8px; border: 1px solid #E5E1DA;';
            row.innerHTML = `
              <div>
                <label style="display: block; font-size: 10.5px; font-weight: 600; color: var(--admin-text-muted); margin-bottom: 4px;">Document File (PDF / Image)</label>
                <input type="file" name="document_files[]" multiple accept=".pdf,.png,.jpg,.jpeg,.webp" class="admin-input" style="padding: 5px; font-size: 11.5px;" required>
              </div>
              <div>
                <label style="display: block; font-size: 10.5px; font-weight: 600; color: var(--admin-text-muted); margin-bottom: 4px;">Document Name</label>
                <input type="text" name="certificate_names[]" placeholder="e.g. BIS Hallmark Certificate" list="cert_names_list" class="admin-input" style="font-size: 12px;">
              </div>
              <div>
                <button type="button" onclick="this.closest('.doc-row').remove()" style="background: none; border: none; color: #999; font-size: 16px; cursor: pointer; padding: 8px;" title="Remove this row">&times;</button>
              </div>
            `;
            container.appendChild(row);
          }
        </script>
      </div>

      <!-- Price Breakdown -->
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--admin-border); display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; color: var(--admin-text-secondary);">
          <span>Subtotal</span>
          <span>₹{{ number_format($order->subtotal, 2) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: var(--admin-text-secondary);">
          <span>GST (3% Fine Jewelry)</span>
          <span>₹{{ number_format($order->gst_amount, 2) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 800; color: var(--admin-text-primary); padding-top: 10px; border-top: 1px solid var(--admin-border-light);">
          <span>Total Payable</span>
          <span>₹{{ number_format($order->total_amount, 2) }}</span>
        </div>
      </div>
    </div>

    <!-- Customer & Shipping -->
    <div class="no-print" style="display: flex; flex-direction: column; gap: 20px;">
      
      <div class="admin-card" style="padding: 22px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 14px 0; color: var(--admin-text-primary);">
          Client Details
        </h3>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
          <div>
            <div style="font-size: 11px; color: var(--admin-text-muted);">Name</div>
            <div style="font-weight: 600; color: var(--admin-text-primary);">{{ $order->customer_name ?: 'PINTAARA Patron' }}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: var(--admin-text-muted);">Email</div>
            <div style="color: var(--admin-text-primary);">{{ $order->customer_email ?: '—' }}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: var(--admin-text-muted);">Phone</div>
            <div style="color: var(--admin-text-primary);">{{ $order->customer_phone ?: '—' }}</div>
          </div>
        </div>
      </div>

      <div class="admin-card" style="padding: 22px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 14px 0; color: var(--admin-text-primary);">
          Delivery Destination
        </h3>
        <div style="font-size: 13px; line-height: 1.5; color: var(--admin-text-secondary); white-space: pre-line;">
          {{ $order->shipping_address ?: 'Armored courier delivery destination not specified.' }}
        </div>
      </div>

      <!-- Sequel 247 Armored Delivery Dispatch Card -->
      <div class="admin-card" style="padding: 22px; border-radius: 16px; background: var(--admin-surface); border: 1px solid var(--admin-border);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="font-size: 15px; font-weight: 700; margin: 0; color: var(--admin-text-primary); display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BD7F68" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              Sequel 247 Armored Logistics
            </h3>
            <div style="font-size: 11.5px; color: var(--admin-text-muted); margin-top: 2px;">
              Door-to-door armored transport with 100% transit insurance
            </div>
          </div>
          @if(!empty($order->docket_number))
            <span style="background: #ECFDF5; color: #059669; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 5px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #059669;"></span>
              Docket Dispatched
            </span>
          @else
            <span style="background: #FFFBEB; color: #D97706; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 5px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #D97706;"></span>
              Ready to Dispatch
            </span>
          @endif
        </div>

        <!-- Visual Multi-Step Delivery Progress Tracker -->
        @php
          $currentStep = 1;
          if (!empty($order->docket_number)) {
            $currentStep = 2; // Docket Created
            if ($order->fulfillment_status === 'Armored In-Transit' || in_array($order->status, ['shipped', 'dispatched'])) {
              $currentStep = 3; // In Transit
            }
            if ($order->status === 'out_for_delivery') {
              $currentStep = 4; // Out for Delivery
            }
            if ($order->status === 'delivered') {
              $currentStep = 5; // Delivered
            }
          }
          $steps = [
            1 => ['title' => 'Atelier', 'sub' => 'Piece Packed', 'icon' => '📦'],
            2 => ['title' => 'Docket Created', 'sub' => !empty($order->docket_number) ? ('#' . $order->docket_number) : 'Pending', 'icon' => '🏷️'],
            3 => ['title' => 'Armored Transit', 'sub' => 'Armed Escort', 'icon' => '🛡️'],
            4 => ['title' => 'Out for Delivery', 'sub' => 'Arriving Today', 'icon' => '🚚'],
            5 => ['title' => 'Delivered', 'sub' => 'OTP & Signed', 'icon' => '✨'],
          ];
        @endphp

        <div style="margin: 16px 0; padding: 16px 10px; background: var(--admin-bg); border-radius: 12px; border: 1px solid var(--admin-border-light);">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; position: relative;">
            <!-- Connector Line -->
            <div style="position: absolute; top: 18px; left: 24px; right: 24px; height: 3px; background: var(--admin-border); z-index: 1;">
              <div style="height: 100%; width: {{ ($currentStep - 1) * 25 }}%; background: #BD7F68; transition: width 0.3s;"></div>
            </div>

            @foreach($steps as $sNum => $sInfo)
              @php
                $isDone = $sNum <= $currentStep;
                $isCurrent = $sNum === $currentStep;
              @endphp
              <div style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; text-align: center; width: 19%;">
                <div style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; transition: all 0.2s;
                  background: {{ $isDone ? '#BD7F68' : 'var(--admin-surface)' }};
                  color: {{ $isDone ? '#FFFFFF' : 'var(--admin-text-muted)' }};
                  border: 2px solid {{ $isDone ? '#BD7F68' : 'var(--admin-border)' }};
                  box-shadow: {{ $isCurrent ? '0 0 0 4px rgba(189, 127, 104, 0.25)' : 'none' }};
                ">
                  @if($sNum < $currentStep)
                    ✓
                  @else
                    {{ $sInfo['icon'] }}
                  @endif
                </div>
                <div style="font-size: 11px; font-weight: 700; margin-top: 8px; color: {{ $isDone ? 'var(--admin-text-primary)' : 'var(--admin-text-muted)' }};">
                  {{ $sInfo['title'] }}
                </div>
                <div style="font-size: 9.5px; color: var(--admin-text-muted); margin-top: 2px; font-family: {{ $sNum === 2 && !empty($order->docket_number) ? 'monospace' : 'inherit' }};">
                  {{ $sInfo['sub'] }}
                </div>
              </div>
            @endforeach
          </div>
        </div>

        @if(!empty($order->docket_number))
          <div style="background: var(--admin-bg); border: 1px solid var(--admin-border-light); border-radius: 10px; padding: 14px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; color: var(--admin-text-muted);">Docket / Tracking No:</span>
              <span style="font-size: 14px; font-family: monospace; font-weight: 700; color: #BD7F68;">{{ $order->docket_number }}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; color: var(--admin-text-muted);">Logistics Partner:</span>
              <span style="font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary);">{{ $order->courier_partner ?: 'Sequel 247 Logistics' }}</span>
            </div>
            @if(!empty($order->pickup_token))
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: var(--admin-text-muted);">Pickup BRN Token:</span>
                <span style="font-size: 12.5px; font-family: monospace; color: var(--admin-text-primary);">{{ $order->pickup_token }}</span>
              </div>
            @endif
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a 
              href="{{ $order->tracking_link ?: ('https://sequel247.com/tracking?docket=' . urlencode($order->docket_number)) }}" 
              target="_blank" 
              class="admin-btn admin-btn-secondary" 
              style="font-size: 12px; display: inline-flex; align-items: center; gap: 6px;"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
              Live Tracking &nearr;
            </a>

            @if(!empty($order->docket_print_url))
              <a 
                href="{{ $order->docket_print_url }}" 
                target="_blank" 
                class="admin-btn admin-btn-primary" 
                style="font-size: 12px; display: inline-flex; align-items: center; gap: 6px;"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Print Official Sequel Docket &nearr;
              </a>
            @endif
          </div>
        @else
          @php
            $extractedPin = '';
            if (!empty($order->shipping_address) && preg_match('/\b[1-9][0-9]{5}\b/', $order->shipping_address, $pm)) {
              $extractedPin = $pm[0];
            }
          @endphp
          <form action="{{ route('admin.orders.sequel-docket', $order->id) }}" method="POST" style="display: flex; flex-direction: column; gap: 12px;">
            @csrf
            
            <div style="font-size: 12.5px; color: var(--admin-text-secondary); line-height: 1.5;">
              Generate an official Sequel Armored Docket (AWB) directly from the registered Vadodara vault to client destination with high-value insurance.
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="admin-label" style="font-size: 11px; margin-bottom: 3px;">Destination Pincode *</label>
                <input type="text" name="pin_code" value="{{ $extractedPin ?: '390007' }}" required class="admin-input" style="font-size: 12px; padding: 6px 10px; font-family: monospace;">
              </div>
              <div>
                <label class="admin-label" style="font-size: 11px; margin-bottom: 3px;">City</label>
                <input type="text" name="city" value="Vadodara" class="admin-input" style="font-size: 12px; padding: 6px 10px;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="admin-label" style="font-size: 11px; margin-bottom: 3px;">Gross Weight (kg)</label>
                <input type="number" step="0.001" name="gross_weight" value="0.250" class="admin-input" style="font-size: 12px; padding: 6px 10px;">
              </div>
              <div>
                <label class="admin-label" style="font-size: 11px; margin-bottom: 3px;">Boxes Count</label>
                <input type="number" name="boxes" value="1" min="1" class="admin-input" style="font-size: 12px; padding: 6px 10px;">
              </div>
            </div>

            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: var(--admin-text-primary); margin-top: 4px;">
              <input type="checkbox" name="notify_customer" value="1" checked style="accent-color: #BD7F68;">
              <span>Send Order Dispatched (A-3) certified email to client</span>
            </label>

            <button type="submit" class="admin-btn admin-btn-primary" style="margin-top: 4px; padding: 10px 16px; font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              Generate Sequel 247 Docket Now
            </button>
          </form>
        @endif

        <!-- Docket & Delivery Explanation Box -->
        <div style="background: rgba(189, 127, 104, 0.06); border: 1px solid rgba(189, 127, 104, 0.2); border-radius: 10px; padding: 12px 14px; margin-top: 14px;">
          <div style="display: flex; gap: 10px; align-items: flex-start;">
            <span style="font-size: 16px; line-height: 1;">💡</span>
            <div style="font-size: 11.5px; color: var(--admin-text-secondary); line-height: 1.5;">
              <strong style="color: var(--admin-text-primary);">What is Sequel Docket?</strong>
              A Docket is the official tracking ID & barcode label for high-value jewelry. Once generated, print and stick it on your sealed tamper pouch. Sequel's bulletproof van with armed escort will collect it directly from your studio vault with 100% insurance coverage.
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>

</div>

<!-- ============================================================ -->
<!-- OFFICIAL TAX INVOICE POPUP MODAL -->
<!-- ============================================================ -->
<div id="invoiceModal" style="display: none; position: fixed; inset: 0; background: rgba(18, 16, 14, 0.85); backdrop-filter: blur(8px); z-index: 99999; overflow-y: auto; align-items: flex-start; justify-content: center; padding: 40px 15px; box-sizing: border-box;">
  
  <div style="width: 100%; max-width: 680px; display: flex; flex-direction: column; align-items: center; margin: 0 auto;" onclick="event.stopPropagation()">
    
    <!-- Floating Toolbar Bar -->
    <div class="no-print" style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: #1C1917; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px 8px 0 0; padding: 12px 20px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: #D6D2C8; font-weight: 700;">Tax Invoice</span>
        <span style="font-size: 11px; background: rgba(255, 255, 255, 0.08); color: #A39E93; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.06em; font-family: monospace;">
          {{ $order->order_number ?: ('#PIN-' . $order->id) }}
        </span>
      </div>

      <div style="display: flex; align-items: center; gap: 10px;">
        <a href="{{ route('admin.orders.invoice', $order->id) }}" target="_blank" style="padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none; color: #BD7F68; border: 1px solid rgba(189, 127, 104, 0.4); display: inline-flex; align-items: center; gap: 4px;">
          <span>&#8599; Direct URL</span>
        </a>

        <button type="button" onclick="printInvoiceFromModal()" style="padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; background: rgba(255, 255, 255, 0.08); color: #E5E1DA; border: 1px solid rgba(255, 255, 255, 0.16); display: inline-flex; align-items: center; gap: 6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          <span>Print</span>
        </button>

        <button type="button" id="modalDownloadPdfBtn" onclick="downloadInvoiceFromModal()" style="padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; background: #BD7F68; color: #FFFFFF; border: none; display: inline-flex; align-items: center; gap: 6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download PDF</span>
        </button>

        <button type="button" onclick="closeInvoiceModal()" style="background: rgba(255, 255, 255, 0.12); color: #FFFFFF; border: none; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; line-height: 1;">
          &times;
        </button>
      </div>
    </div>

    <!-- The Luxury Invoice Sheet -->
    @include('admin.orders.partials.invoice_sheet')

  </div>

</div>

<style>
  /* Print Media Rules: strictly isolate the invoice sheet when printing */
  @media print {
    body, html {
      background: #FFFFFF !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Hide outer admin layout components */
    .admin-sidebar, 
    #adminSidebar, 
    aside, 
    header, 
    nav, 
    .no-print, 
    .order-detail-view {
      display: none !important;
    }

    /* Force invoice modal to render cleanly as standard document */
    #invoiceModal {
      display: block !important;
      position: static !important;
      inset: auto !important;
      background: none !important;
      backdrop-filter: none !important;
      padding: 0 !important;
      overflow: visible !important;
      width: 100% !important;
    }

    .pnt-invoice-sheet {
      box-shadow: none !important;
      max-width: 100% !important;
      width: 100% !important;
      min-height: auto !important;
      padding: 10mm 14mm !important;
      margin: 0 !important;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
    }
  }
</style>

<script>
  function openInvoiceModal() {
    document.getElementById('invoiceModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeInvoiceModal() {
    document.getElementById('invoiceModal').style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  function printInvoiceFromModal() {
    window.print();
  }

  function downloadInvoiceFromModal() {
    const btn = document.getElementById('modalDownloadPdfBtn');
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<span>Generating PDF...</span>';
    btn.disabled = true;

    const element = document.getElementById('official-invoice-print-area');
    const opt = {
      margin:       [0, 0, 0, 0],
      filename:     'Invoice-{{ $order->order_number ?: $order->id }}.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(function() {
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    }).catch(function(err) {
      console.error('PDF error, triggering print fallback:', err);
      window.print();
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    });
  }

  // Close modal when clicking dark backdrop
  document.getElementById('invoiceModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeInvoiceModal();
    }
  });

  // Close modal on Escape
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeInvoiceModal();
    }
  });
</script>
@endsection
