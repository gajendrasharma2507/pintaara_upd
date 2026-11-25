<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice {{ $order->order_number ?: ('#PIN-' . $order->id) }} — Pintaara</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #141210;
      color: #111111;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 15px 60px 15px;
    }

    /* Top Floating Toolbar */
    .invoice-toolbar {
      width: 100%;
      max-width: 680px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #1C1917;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px 8px 0 0;
      padding: 12px 20px;
    }

    .toolbar-title {
      font-size: 13px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #D6D2C8;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .toolbar-tag {
      font-size: 11px;
      background: rgba(255, 255, 255, 0.08);
      color: #A39E93;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.06em;
      font-family: monospace;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .toolbar-btn {
      padding: 7px 14px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-back {
      background: transparent;
      color: #D6D2C8;
      border: 1px solid rgba(255, 255, 255, 0.16);
    }
    .btn-back:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #FFFFFF;
    }

    .btn-print {
      background: rgba(255, 255, 255, 0.08);
      color: #E5E1DA;
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
    .btn-print:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #FFFFFF;
    }

    .btn-download {
      background: #BD7F68;
      color: #FFFFFF;
    }
    .btn-download:hover {
      background: #A86D58;
    }

    /* Print Media Styles */
    @media print {
      body {
        background: #FFFFFF !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .no-print {
        display: none !important;
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
</head>
<body>

  <!-- Floating Bar -->
  <div class="invoice-toolbar no-print">
    <div class="toolbar-title">
      <a href="{{ route('admin.orders.show', $order->id) }}" class="toolbar-btn btn-back">
        &larr; Back to Order
      </a>
      <span>Tax Invoice</span>
      <span class="toolbar-tag">{{ $order->order_number ?: ('#PIN-' . $order->id) }}</span>
    </div>

    <div class="toolbar-actions">
      <button type="button" onclick="window.print()" class="toolbar-btn btn-print">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        <span>Print Invoice</span>
      </button>

      <button type="button" id="btnDownloadPdf" onclick="downloadInvoicePdf()" class="toolbar-btn btn-download">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>Download PDF</span>
      </button>
    </div>
  </div>

  <!-- Reusable Luxury Invoice Sheet -->
  @include('admin.orders.partials.invoice_sheet')

  <script>
    function downloadInvoicePdf() {
      const btn = document.getElementById('btnDownloadPdf');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Generating PDF...';
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
        btn.innerHTML = originalText;
        btn.disabled = false;
      }).catch(function(err) {
        console.error('PDF error:', err);
        window.print();
        btn.innerHTML = originalText;
        btn.disabled = false;
      });
    }
  </script>
</body>
</html>
