@php
  // Formatting Dates
  $orderDate = $order->created_at ? strtoupper($order->created_at->format('d F Y')) : '24 OCTOBER 2026';
  
  // Invoice Numbers & References
  $orderRefKey = strtoupper(substr(md5($order->id . ($order->order_number ?: 'PNT')), 0, 6));
  $invoiceNo = 'INV-PT-' . ($order->created_at ? $order->created_at->format('Y') : '2026') . '-' . $orderRefKey;
  $orderRef = 'REF-PT-' . ($order->created_at ? $order->created_at->format('Y') : '2026') . '-' . $orderRefKey;

  // Customer / Patron Information
  $customerName = ($order->customer_name && $order->customer_name !== 'No name provided') ? $order->customer_name : 'Customer';
  $customerPhone = $order->customer_phone ?: '';
  $customerEmail = $order->customer_email ?: '';

  // Address parsing helper
  $parseAddress = function($rawAddr, $fallbackName, $fallbackPhone) {
      $res = [
          'name' => $fallbackName,
          'line1' => '',
          'city_state' => '',
          'country' => 'India',
          'pincode' => '',
          'contact' => $fallbackPhone,
      ];
      if (empty($rawAddr) || $rawAddr === 'No shipping address provided') {
          return $res;
      }
      
      // 1. Check if JSON array or JSON string
      $decoded = is_string($rawAddr) ? json_decode($rawAddr, true) : (is_array($rawAddr) ? $rawAddr : null);
      if (is_array($decoded)) {
          $res['name'] = $decoded['recipient_name'] ?? $decoded['full_name'] ?? $decoded['name'] ?? $fallbackName;
          $l1 = $decoded['address_line1'] ?? $decoded['address'] ?? '';
          $l2 = $decoded['address_line2'] ?? '';
          $res['line1'] = trim($l1 . (!empty($l2) ? ', ' . $l2 : ''));
          $city = $decoded['city'] ?? '';
          $state = $decoded['state'] ?? '';
          $res['city_state'] = trim($city . (!empty($state) ? ', ' . $state : ''), ', ');
          $res['pincode'] = $decoded['postal_code'] ?? $decoded['pincode'] ?? $decoded['pin_code'] ?? '';
          $res['country'] = $decoded['country'] ?? 'India';
          $res['contact'] = $decoded['phone'] ?? $decoded['contact'] ?? $fallbackPhone;
          return $res;
      }

      // 2. Formatted string: line1, city, state, country - pincode
      $str = trim((string)$rawAddr);
      if (preg_match('/^(.*),\s*([^,]+),\s*([^,]+),\s*([^-]+?)\s*-\s*([0-9a-zA-Z\s]+)$/u', $str, $m)) {
          $res['line1'] = trim($m[1]);
          $res['city_state'] = trim($m[2]) . ', ' . trim($m[3]);
          $res['country'] = trim($m[4]);
          $res['pincode'] = trim($m[5]);
          return $res;
      }

      // 3. Plain string
      $res['line1'] = $str;
      $res['country'] = '';
      $res['pincode'] = '';
      return $res;
  };

  // Shipping Address
  $rawShipping = $order->shipping_address;
  if ((empty($rawShipping) || $rawShipping === 'No shipping address provided') && $order->user && $order->user->addresses()->exists()) {
      $defAddr = $order->user->addresses()->where('is_default', 1)->first() ?: $order->user->addresses()->first();
      if ($defAddr) {
          $rawShipping = $defAddr->address_line1 . ($defAddr->address_line2 ? ', ' . $defAddr->address_line2 : '') . ', ' . $defAddr->city . ', ' . $defAddr->state . ', ' . ($defAddr->country ?: 'India') . ' - ' . $defAddr->pincode;
      }
  }

  $shipping = $parseAddress($rawShipping, $customerName, $customerPhone);
  $shippingName = $shipping['name'];
  $shippingLine1 = $shipping['line1'];
  $shippingCityState = $shipping['city_state'];
  $shippingPostal = $shipping['pincode'];
  $shippingCountry = $shipping['country'];
  $shippingContact = $shipping['contact'];

  // Billing Address (defaults to Shipping Address)
  $rawBilling = $order->billing_address ?: $rawShipping;
  $billing = $parseAddress($rawBilling, $customerName, $customerPhone);
  $billingName = $billing['name'];
  $billingLine1 = $billing['line1'];
  $billingCityState = $billing['city_state'];
  $billingPincode = $billing['pincode'];
  $billingCountry = $billing['country'];
  $billingContact = $billing['contact'];

  // Payment details
  $rawPayment = $order->payment_method ?: 'Gpay';
  $paymentMethod = (stripos($rawPayment, 'card') !== false || stripos($rawPayment, 'upi') !== false || stripos($rawPayment, 'gpay') !== false) ? 'Gpay' : ucfirst($rawPayment);
  $paymentTxnId = $order->razorpay_payment_id ?: ('pay_' . substr(md5('txn_' . $order->id . $order->created_at), 0, 14));

  // Items list (fallback to demo item if empty)
  $items = $order->items;
  if ($items->isEmpty()) {
      $items = collect([
          (object)[
              'design_code' => 'PD-SG-OR-001',
              'product_name' => 'Mountain Star Grand Necklace',
              'metal_purity' => '18KT',
              'finish' => 'Yellow Gold',
              'size' => 'Standard',
              'gem' => 'No Stone / Solid Gold',
              'huid' => '',
              'price' => $order->subtotal ?: 54611.25,
              'quantity' => 1,
              'total' => $order->subtotal ?: 54611.25,
          ]
      ]);
  }
@endphp

<style>
  /* A4 Luxury Invoice Sheet Styles */
  .pnt-invoice-sheet {
    background: #FFFFFF !important;
    width: 100% !important;
    max-width: 680px !important;
    min-height: 940px !important;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35) !important;
    padding: 46px 48px 36px 48px !important;
    box-sizing: border-box !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    color: #111111 !important;
    display: flex !important;
    flex-direction: column !important;
    text-align: left !important;
    margin: 0 auto !important;
  }

  /* 1. Header */
  .pnt-inv-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 30px !important;
    padding-top: 2px !important;
  }

  .pnt-inv-lockup-img {
    width: 185px !important;
    height: auto !important;
    max-height: 56px !important;
    object-fit: contain !important;
    display: block !important;
  }

  .pnt-inv-title {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    font-size: 20px !important;
    font-weight: 600 !important;
    letter-spacing: 0.08em !important;
    color: #1A1A1A !important;
    margin: 0 !important;
    line-height: 1 !important;
    text-align: right !important;
  }

  /* 2. Created For & Metadata Row */
  .pnt-inv-meta-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    margin-bottom: 16px !important;
  }

  .pnt-inv-meta-left {
    width: 46% !important;
  }

  .pnt-inv-section-label {
    font-size: 11px !important;
    font-weight: 500 !important;
    color: #555555 !important;
    letter-spacing: 0.03em !important;
    text-transform: uppercase !important;
    margin-bottom: 8px !important;
  }

  .pnt-inv-cust-name {
    font-size: 13.5px !important;
    font-weight: 700 !important;
    color: #111111 !important;
    margin-bottom: 3px !important;
  }

  .pnt-inv-cust-detail {
    font-size: 12px !important;
    color: #333333 !important;
    line-height: 1.45 !important;
  }

  .pnt-inv-v-col {
    width: 4% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }

  .pnt-inv-v-line {
    width: 1px !important;
    background-color: #9E9E9E !important;
  }

  .pnt-inv-v-line-top {
    height: 48px !important;
    margin-top: 18px !important;
  }

  .pnt-inv-v-line-addr {
    height: 64px !important;
    margin-top: 20px !important;
  }

  .pnt-inv-meta-right {
    width: 46% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
    gap: 8px !important;
  }

  .pnt-inv-meta-val {
    font-size: 12px !important;
    color: #333333 !important;
    font-weight: 500 !important;
  }

  /* Full-width horizontal divider lines */
  .pnt-inv-h-line {
    width: 100% !important;
    height: 1px !important;
    background-color: #9E9E9E !important;
    margin: 0 0 16px 0 !important;
  }

  /* 3. Address Row */
  .pnt-inv-address-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    margin-bottom: 16px !important;
  }

  .pnt-inv-addr-left {
    width: 46% !important;
  }

  .pnt-inv-addr-right {
    width: 46% !important;
    text-align: right !important;
  }

  .pnt-inv-addr-name {
    font-size: 13.5px !important;
    font-weight: 700 !important;
    color: #111111 !important;
    margin-bottom: 3px !important;
  }

  .pnt-inv-addr-line {
    font-size: 12px !important;
    color: #333333 !important;
    line-height: 1.4 !important;
  }

  .pnt-inv-addr-split {
    font-size: 12px !important;
    color: #333333 !important;
    line-height: 1.4 !important;
    display: flex !important;
    justify-content: space-between !important;
    padding-right: 18px !important;
  }

  .pnt-inv-addr-split-right {
    font-size: 12px !important;
    color: #333333 !important;
    line-height: 1.4 !important;
    display: flex !important;
    justify-content: space-between !important;
    padding-left: 18px !important;
  }

  .pnt-inv-pin-center {
    color: #333333 !important;
  }

  .pnt-inv-addr-contact {
    font-size: 12px !important;
    color: #333333 !important;
    line-height: 1.4 !important;
    margin-top: 6px !important;
  }

  /* 4. Table Section */
  .pnt-inv-table-section {
    width: 100% !important;
    margin-bottom: 28px !important;
  }

  .pnt-inv-tbl-header {
    display: flex !important;
    align-items: flex-start !important;
    width: 100% !important;
    font-size: 12px !important;
    color: #222222 !important;
    font-weight: 500 !important;
  }

  .pnt-inv-th-piece-col {
    width: 48% !important;
    display: flex !important;
    flex-direction: column !important;
  }

  .pnt-th-text {
    font-size: 12px !important;
    color: #222222 !important;
  }

  .pnt-inv-piece-underline {
    width: 100% !important;
    height: 1px !important;
    background-color: #9E9E9E !important;
    margin-top: 6px !important;
  }

  .pnt-inv-th-unit-col {
    width: 17% !important;
    text-align: right !important;
  }

  .pnt-inv-th-qty-col {
    width: 17% !important;
    text-align: right !important;
  }

  .pnt-inv-th-net-col {
    width: 18% !important;
    text-align: right !important;
  }

  .pnt-inv-tbl-row {
    display: flex !important;
    align-items: flex-start !important;
    width: 100% !important;
    padding-top: 14px !important;
    padding-bottom: 10px !important;
  }

  .pnt-inv-td-piece-col {
    width: 48% !important;
  }

  .pnt-item-code {
    font-size: 15px !important;
    font-weight: 700 !important;
    color: #111111 !important;
    margin-bottom: 5px !important;
  }

  .pnt-item-specs {
    font-size: 12px !important;
    color: #7D7D7D !important;
    line-height: 1.45 !important;
  }

  .pnt-inv-td-unit-col,
  .pnt-inv-td-qty-col,
  .pnt-inv-td-net-col {
    font-size: 12.5px !important;
    color: #111111 !important;
    text-align: right !important;
  }
  .pnt-inv-td-unit-col { width: 17% !important; }
  .pnt-inv-td-qty-col { width: 17% !important; }
  .pnt-inv-td-net-col { width: 18% !important; }

  /* 5. Payment Details & Summary Breakdown */
  .pnt-inv-financial-section {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    margin-top: 24px !important;
  }

  .pnt-inv-payment-col {
    width: 44% !important;
  }

  .pnt-payment-heading {
    font-size: 13.5px !important;
    font-weight: 700 !important;
    color: #111111 !important;
    margin-bottom: 4px !important;
  }

  .pnt-payment-detail {
    font-size: 12px !important;
    color: #333333 !important;
    line-height: 1.45 !important;
  }

  .pnt-inv-summary-col {
    width: 32% !important;
    display: flex !important;
    flex-direction: column !important;
  }

  .pnt-inv-subtotal-line {
    width: 100% !important;
    height: 1px !important;
    background-color: #9E9E9E !important;
    margin-bottom: 8px !important;
  }

  .pnt-summary-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    font-size: 12px !important;
    color: #333333 !important;
    margin-bottom: 5px !important;
  }

  .pnt-inv-total-line-wrapper {
    width: 100% !important;
    display: flex !important;
    justify-content: flex-end !important;
    margin-top: 8px !important;
    margin-bottom: 8px !important;
  }

  .pnt-inv-total-line {
    width: 48% !important;
    height: 1.5px !important;
    background-color: #1A1A1A !important;
  }

  .pnt-inv-total-row {
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 16px !important;
  }

  .pnt-total-label {
    font-size: 14.5px !important;
    font-weight: 800 !important;
    color: #000000 !important;
    letter-spacing: 0.04em !important;
  }

  .pnt-total-val {
    font-size: 16px !important;
    font-weight: 800 !important;
    color: #000000 !important;
    letter-spacing: 0.02em !important;
  }

  /* 6. Signature */
  .pnt-inv-signature-wrapper {
    display: flex !important;
    justify-content: flex-end !important;
    margin-top: 18px !important;
    margin-bottom: 20px !important;
  }

  .pnt-inv-signature-box {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    width: 180px !important;
  }

  .pnt-inv-signature-img {
    width: 154px !important;
    height: auto !important;
    display: block !important;
    margin-bottom: 4px !important;
  }

  .pnt-inv-signatory-title {
    font-size: 11px !important;
    color: #222222 !important;
    text-align: center !important;
    letter-spacing: 0.02em !important;
  }

  /* 7. Footer */
  .pnt-inv-footer-h-line {
    margin-top: auto !important;
    margin-bottom: 12px !important;
  }

  .pnt-inv-footer {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
  }

  .pnt-inv-footer-brand {
    font-family: serif !important;
    font-size: 12px !important;
    font-weight: 800 !important;
    letter-spacing: 0.05em !important;
    color: #111111 !important;
    margin-bottom: 2px !important;
  }

  .pnt-inv-footer-dash {
    width: 22px !important;
    height: 1.5px !important;
    background-color: #333333 !important;
    margin: 4px 0 6px 0 !important;
  }

  .pnt-inv-footer-text {
    font-size: 10px !important;
    color: #555555 !important;
    line-height: 1.45 !important;
  }

  .pnt-inv-footer-right {
    text-align: right !important;
  }
</style>

<!-- The Exact Luxury Invoice Sheet Element -->
<div id="official-invoice-print-area" class="pnt-invoice-sheet">

  <!-- 1. Header: Brand Left & INVOICE Right -->
  <div class="pnt-inv-header">
    <div class="pnt-inv-brand-col">
      <img 
        src="/images/logo-lockup.png" 
        alt="Pintaara" 
        class="pnt-inv-lockup-img" 
      />
    </div>
    <div class="pnt-inv-title-col">
      <h1 class="pnt-inv-title">INVOICE</h1>
    </div>
  </div>

  <!-- 2. Created For & Invoice Meta Row -->
  <div class="pnt-inv-meta-row">
    <div class="pnt-inv-meta-left">
      <div class="pnt-inv-section-label">CREATED FOR</div>
      <div class="pnt-inv-cust-name">{{ $customerName }}</div>
      <div class="pnt-inv-cust-detail">{{ $customerPhone }}</div>
      <div class="pnt-inv-cust-detail">{{ $customerEmail }}</div>
    </div>

    <!-- Line 1: Short floating vertical line -->
    <div class="pnt-inv-v-col">
      <div class="pnt-inv-v-line pnt-inv-v-line-top"></div>
    </div>

    <div class="pnt-inv-meta-right">
      <div class="pnt-inv-meta-val">{{ $invoiceNo }}</div>
      <div class="pnt-inv-meta-val">{{ $orderDate }}</div>
      <div class="pnt-inv-meta-val">{{ $orderRef }}</div>
    </div>
  </div>

  <!-- Line 2: Full width horizontal rule -->
  <div class="pnt-inv-h-line"></div>

  <!-- 3. Billing & Shipping Address Row -->
  <div class="pnt-inv-address-row">
    <div class="pnt-inv-addr-left">
      <div class="pnt-inv-section-label">BILLING ADDRESS</div>
      <div class="pnt-inv-addr-name">{{ $billingName }}</div>
      <div class="pnt-inv-addr-line">{{ $billingLine1 }}</div>
      @if(!empty($billingCityState))
        <div class="pnt-inv-addr-line">{{ $billingCityState }}</div>
      @endif
      @if(!empty($billingCountry) || !empty($billingPincode))
        <div class="pnt-inv-addr-split">
          <span>{{ $billingCountry }}</span>
          @if(!empty($billingPincode))
            <span class="pnt-inv-pin-center">{{ $billingPincode }}</span>
          @endif
        </div>
      @endif
      @if(!empty($billingContact))
        <div class="pnt-inv-addr-contact">Contact No.: {{ $billingContact }}</div>
      @endif
    </div>

    <!-- Line 3: Short floating vertical line -->
    <div class="pnt-inv-v-col">
      <div class="pnt-inv-v-line pnt-inv-v-line-addr"></div>
    </div>

    <div class="pnt-inv-addr-right">
      <div class="pnt-inv-section-label">SHIPPING ADDRESS</div>
      <div class="pnt-inv-addr-name">{{ $shippingName }}</div>
      <div class="pnt-inv-addr-line">{{ $shippingLine1 }}</div>
      @if(!empty($shippingCityState))
        <div class="pnt-inv-addr-line">{{ $shippingCityState }}</div>
      @endif
      @if(!empty($shippingCountry) || !empty($shippingPostal))
        <div class="pnt-inv-addr-split-right">
          @if(!empty($shippingPostal))
            <span class="pnt-inv-pin-center">{{ $shippingPostal }}</span>
          @endif
          <span>{{ $shippingCountry }}</span>
        </div>
      @endif
      @if(!empty($shippingContact))
        <div class="pnt-inv-addr-contact">Contact No.: {{ $shippingContact }}</div>
      @endif
    </div>
  </div>

  <!-- Line 4: Full width horizontal rule above table -->
  <div class="pnt-inv-h-line"></div>

  <!-- 4. Line Items Table -->
  <div class="pnt-inv-table-section">
    <div class="pnt-inv-tbl-header">
      <div class="pnt-inv-th-piece-col">
        <span class="pnt-th-text">Piece</span>
        <!-- Line 5: Horizontal line ONLY under Piece column header! -->
        <div class="pnt-inv-piece-underline"></div>
      </div>
      <div class="pnt-inv-th-unit-col">Unit price</div>
      <div class="pnt-inv-th-qty-col">Qunatity</div>
      <div class="pnt-inv-th-net-col">Net Amount</div>
    </div>

    @foreach($items as $item)
      @php
        $purity = $item->metal_purity ?: '18KT';
        $goldPercent = ($purity === '24KT') ? '99.9%' : (($purity === '22KT') ? '91.6%' : '75.0%');
        $finish = $item->finish ?: 'Yellow Gold';
        $pieceCode = $item->design_code ?: ($item->product_name ?: 'PD-SG-OR-001');
        $unitPrice = $item->price ?: ($item->metal_value ?: ($item->total / max(1, $item->quantity ?: 1)));
        $quantity = $item->quantity ?: 1;
        $netTotal = $item->total ?: ($unitPrice * $quantity);
      @endphp
      <div class="pnt-inv-tbl-row">
        <div class="pnt-inv-td-piece-col">
          <div class="pnt-item-code">{{ $pieceCode }}</div>
          <div class="pnt-item-specs">
            <div>{{ $purity }} ({{ $goldPercent }} Fine Gold) {{ $finish }}</div>
            <div>Size: {{ $item->size ?: 'Standard' }}</div>
            <div>Stone: {{ ($item->gem && $item->gem !== 'None') ? $item->gem : 'No Stone / Solid Gold' }}</div>
            <div>HUID: {{ $item->huid ?: '' }}</div>
          </div>
        </div>
        <div class="pnt-inv-td-unit-col">{{ number_format($unitPrice, 2) }}</div>
        <div class="pnt-inv-td-qty-col">{{ $quantity }}</div>
        <div class="pnt-inv-td-net-col">&#8377;{{ number_format($netTotal, 2) }}</div>
      </div>
    @endforeach
  </div>

  <!-- 5. Payment Details & Summary Breakdown -->
  <div class="pnt-inv-financial-section">
    <div class="pnt-inv-payment-col">
      <div class="pnt-payment-heading">Payment Detail</div>
      <div class="pnt-payment-detail">{{ $paymentMethod }}</div>
      <div class="pnt-payment-detail">{{ $orderDate }}</div>
      <div class="pnt-payment-detail">Txn. ID: {{ $paymentTxnId }}</div>
    </div>

    <div class="pnt-inv-summary-col">
      <!-- Line 6: Line above Sub Total -->
      <div class="pnt-inv-subtotal-line"></div>
      
      <div class="pnt-summary-row">
        <span class="pnt-summary-label">Sub Total</span>
        <span class="pnt-summary-val">&#8377;{{ number_format($order->subtotal ?: 54611.25, 2) }}</span>
      </div>
      <div class="pnt-summary-row">
        <span class="pnt-summary-label">Tax 3%</span>
        <span class="pnt-summary-val">&#8377;{{ number_format($order->gst_amount ?: ($order->total_amount ? ($order->total_amount - ($order->subtotal ?: 0)) : 1638.34), 2) }}</span>
      </div>
      <div class="pnt-summary-row">
        <span class="pnt-summary-label">Shipping</span>
        <span class="pnt-summary-val">&#8377;0.00</span>
      </div>
    </div>
  </div>

  <!-- Line 7: Dark line above TOTAL AMOUNT (starts at right edge) -->
  <div class="pnt-inv-total-line-wrapper">
    <div class="pnt-inv-total-line"></div>
  </div>

  <!-- Total Amount Row -->
  <div class="pnt-inv-total-row">
    <span class="pnt-total-label">TOTAL AMOUNT</span>
    <span class="pnt-total-val">&#8377;{{ number_format($order->total_amount ?: 54611.25, 2) }}</span>
  </div>

  <!-- 6. Signature Section -->
  <div class="pnt-inv-signature-wrapper">
    <div class="pnt-inv-signature-box">
      <img 
        src="/images/invoice-signature-darshit-soni.png" 
        alt="Darshit Soni" 
        class="pnt-inv-signature-img" 
      />
      <div class="pnt-inv-signatory-title">Authorised Signatory</div>
    </div>
  </div>

  <!-- Line 8: Full width line above footer -->
  <div class="pnt-inv-h-line pnt-inv-footer-h-line"></div>

  <!-- 7. Footer -->
  <div class="pnt-inv-footer">
    <div class="pnt-inv-footer-left">
      <div class="pnt-inv-footer-brand">PINTAARA&#8482;</div>
      <!-- Line 9: Short dash under brand -->
      <div class="pnt-inv-footer-dash"></div>
      <div class="pnt-inv-footer-text">Shop 1 &middot; Ground Floor, Suvarnaj Complex</div>
      <div class="pnt-inv-footer-text">Vadodara, Gujarat - 390001</div>
      <div class="pnt-inv-footer-text">INDIA</div>
    </div>
    <div class="pnt-inv-footer-right">
      <div class="pnt-inv-footer-text">+91 95104 00753</div>
      <div class="pnt-inv-footer-text">pintaarainfo@gmail.com</div>
      <div class="pnt-inv-footer-text">www.pintaara.com</div>
      <div class="pnt-inv-footer-text">Instagram @Pintaara753</div>
    </div>
  </div>

</div>

