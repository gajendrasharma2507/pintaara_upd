'use client';

import React, { useState } from 'react';
import { downloadInvoicePdfFromElement } from '@/lib/downloadInvoicePdf';

/**
 * Official Pintaara Tax Invoice Component
 * Recreates the exact lines, positioning, typography, and styling
 * shown in the official reference invoice template.
 */
export default function OfficialInvoice({ invoice, user, onClose, isStandalone = false }) {
    const [copied, setCopied] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    if (!invoice) return null;

    // Normalize invoice data with fallback to official reference values
    const invoiceNo = invoice.invoice_number || (invoice.order_number ? `INV-${invoice.order_number}` : 'INV-001');
    const orderRef = invoice.order_number ? `REF-${invoice.order_number}` : 'REF-PNT001';
    const directInvoiceUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/invoice/${invoice.order_number || invoice.id || 'INV-001'}?download=true`
        : `/invoice/${invoice.order_number || invoice.id || 'INV-001'}?download=true`;

    const handleCopyLink = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(directInvoiceUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleDirectPdfDownload = async () => {
        if (isGeneratingPdf) return;
        try {
            setIsGeneratingPdf(true);
            const sheet = document.getElementById('official-invoice-print-area');
            if (sheet) {
                const fname = `Invoice-${invoice.order_number || invoice.id || 'PNT001'}.pdf`;
                await downloadInvoicePdfFromElement(sheet, fname);
            } else {
                window.print();
            }
        } catch (err) {
            console.error('Direct PDF error, printing:', err);
            window.print();
        } finally {
            setIsGeneratingPdf(false);
        }
    };
    
    // Formatting date
    const formatDate = (dateStr) => {
        if (!dateStr) return '16 JULY 2026';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return String(dateStr).toUpperCase();
            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
        } catch {
            return String(dateStr).toUpperCase();
        }
    };

    const invoiceDate = formatDate(invoice.acquired_at || invoice.created_at || invoice.date);
    const paymentDate = formatDate(invoice.payment_date || invoice.created_at || invoice.acquired_at || new Date());

    // Customer / Created For info
    const customerName = invoice.customer_name || user?.name || 'Shreevaths Nair';
    const customerPhone = invoice.customer_phone || user?.phone || '+91 98989 45454';
    const customerEmail = invoice.customer_email || user?.email || 'shvnair1995@gmail.com';

    // Billing Address
    const billingName = invoice.billing_name || customerName;
    const billingLine1 = invoice.billing_address || user?.address || 'Unit 1011, 42 Skyvilla, Gorti Road,';
    const billingCityState = invoice.billing_city_state || (user?.city ? `${user.city}, ${user.state || 'Gujarat'}` : 'Vadodara, Gujarat');
    const billingCountry = invoice.billing_country || 'India';
    const billingPincode = invoice.billing_pincode || '390040';
    const billingContact = invoice.billing_phone || customerPhone || '+91 98942 43549';

    // Shipping Address
    const shippingName = invoice.shipping_name || 'Darshit Soni';
    const shippingLine1 = invoice.shipping_address || 'Unit 12A, 451 The West Mall';
    const shippingCityState = invoice.shipping_city_state || 'Etobicoke, Ontario';
    const shippingPostal = invoice.shipping_postal || 'M1K5J7';
    const shippingCountry = invoice.shipping_country || 'Canada';
    const shippingContact = invoice.shipping_phone || billingContact || '+91 98942 43549';

    // Line Item
    const pieceCode = invoice.piece_code || invoice.name || 'PD-SD-OR-001';
    const metalPurity = invoice.metal_purity || '18KT';
    const metalFinish = invoice.finish || invoice.metal_color || 'Rose gold';
    const metalDesc = `${metalPurity} ${metalFinish}`;
    const pieceSize = invoice.size ? `Size: ${invoice.size}` : 'Size: 12';
    const stoneDesc = invoice.stone || invoice.gem ? `Stone: ${invoice.stone || invoice.gem}` : 'Stone: 0.7CT';
    const huidText = invoice.huid ? `HUID: ${invoice.huid}` : 'HUID:';

    // Financial Calculation
    const totalAmountNum = Number(invoice.total || invoice.price || 26250);
    const subTotalNum = Number(invoice.metal_value || (invoice.price ? Math.round(invoice.price / 1.05) : 25000));
    const subTotalFormatted = subTotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const unitPriceFormatted = subTotalNum.toLocaleString('en-IN');
    
    // Total Amount Formatted
    const totalAmountFormatted = `₹${totalAmountNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const taxAmountFormatted = `₹${totalAmountNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Payment Info from Razorpay / Order
    const resolvePaymentMethod = () => {
        const raw = invoice.payment_method || invoice.method;
        if (!raw) return 'Gpay';
        const lower = String(raw).toLowerCase();
        if (lower.includes('gpay') || lower.includes('google')) return 'Gpay';
        if (lower.includes('phonepe')) return 'PhonePe';
        if (lower.includes('paytm')) return 'Paytm';
        if (lower.includes('upi')) return 'Gpay';
        if (lower.includes('card')) return 'Credit / Debit Card';
        if (lower.includes('netbanking')) return 'Net Banking';
        if (lower === 'razorpay') return 'Gpay';
        return raw;
    };

    const paymentMethod = resolvePaymentMethod();
    const paymentTxnId = invoice.razorpay_payment_id || invoice.payment_id || invoice.transaction_id || 
        (invoice.order_number ? `UPI${invoice.order_number.replace(/\D/g, '') || '2026'}` : 'UPI2026');

    const containerClass = isStandalone ? "pnt-invoice-standalone-container" : "pnt-invoice-modal-overlay";

    return (
        <div className={containerClass} onClick={!isStandalone ? onClose : undefined}>
            {/* Modal / Standalone Top Actions Bar (hidden in print) */}
            <div className="pnt-invoice-floating-bar no-print" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isStandalone ? (
                        <a 
                            href="/account/collection" 
                            className="pnt-inv-back-link"
                            title="Return to My Collection"
                        >
                            ← My Collection
                        </a>
                    ) : (
                        <span className="pnt-invoice-bar-title">Tax Invoice</span>
                    )}
                    <span className="pnt-inv-order-tag">{invoiceNo}</span>
                </div>

                <div className="pnt-invoice-bar-actions">
                    <button
                        type="button"
                        className="pnt-inv-btn pnt-inv-copy-btn"
                        onClick={handleCopyLink}
                        title="Copy direct invoice link"
                    >
                        {copied ? '✓ URL Copied' : '🔗 Copy URL'}
                    </button>

                    {!isStandalone && (
                        <a
                            href={directInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pnt-inv-btn pnt-inv-link-btn"
                            title="Open direct URL in new tab"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                        >
                            ↗ Direct URL
                        </a>
                    )}

                    <button
                        type="button"
                        className="pnt-inv-btn pnt-inv-print-btn"
                        onClick={handleDirectPdfDownload}
                        disabled={isGeneratingPdf}
                        title="Download Invoice as PDF"
                    >
                        {isGeneratingPdf ? '⏳ Generating PDF...' : '⬇ Download PDF'}
                    </button>

                    {!isStandalone && onClose && (
                        <button
                            type="button"
                            className="pnt-inv-btn pnt-inv-close-btn"
                            onClick={onClose}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Exact Invoice Sheet Container */}
            <div 
                id="official-invoice-print-area" 
                className="pnt-invoice-sheet" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* 1. Header: Brand Left & INVOICE Right */}
                <div className="pnt-inv-header">
                    <div className="pnt-inv-brand-col">
                        <img 
                            src="/images/logo-lockup.png" 
                            alt="Pintaara" 
                            className="pnt-inv-lockup-img" 
                        />
                    </div>
                    <div className="pnt-inv-title-col">
                        <h1 className="pnt-inv-title">INVOICE</h1>
                    </div>
                </div>

                {/* 2. Created For & Invoice Meta Row */}
                <div className="pnt-inv-meta-row">
                    <div className="pnt-inv-meta-left">
                        <div className="pnt-inv-section-label">CREATED FOR</div>
                        <div className="pnt-inv-cust-name">{customerName}</div>
                        <div className="pnt-inv-cust-detail">{customerPhone}</div>
                        <div className="pnt-inv-cust-detail">{customerEmail}</div>
                    </div>

                    {/* Line 1: Short floating vertical line */}
                    <div className="pnt-inv-v-col">
                        <div className="pnt-inv-v-line pnt-inv-v-line-top" />
                    </div>

                    <div className="pnt-inv-meta-right">
                        <div className="pnt-inv-meta-val">{invoiceNo}</div>
                        <div className="pnt-inv-meta-val">{invoiceDate}</div>
                        <div className="pnt-inv-meta-val">{orderRef}</div>
                    </div>
                </div>

                {/* Line 2: Full width horizontal rule */}
                <div className="pnt-inv-h-line" />

                {/* 3. Billing & Shipping Address Row */}
                <div className="pnt-inv-address-row">
                    <div className="pnt-inv-addr-left">
                        <div className="pnt-inv-section-label">BILLING ADDRESS</div>
                        <div className="pnt-inv-addr-name">{billingName}</div>
                        <div className="pnt-inv-addr-line">{billingLine1}</div>
                        <div className="pnt-inv-addr-line">{billingCityState}</div>
                        <div className="pnt-inv-addr-split">
                            <span>{billingCountry}</span>
                            <span className="pnt-inv-pin-center">{billingPincode}</span>
                        </div>
                        <div className="pnt-inv-addr-contact">Contact No.: {billingContact}</div>
                    </div>

                    {/* Line 3: Short floating vertical line */}
                    <div className="pnt-inv-v-col">
                        <div className="pnt-inv-v-line pnt-inv-v-line-addr" />
                    </div>

                    <div className="pnt-inv-addr-right">
                        <div className="pnt-inv-section-label">SHIPPING ADDRESS</div>
                        <div className="pnt-inv-addr-name">{shippingName}</div>
                        <div className="pnt-inv-addr-line">{shippingLine1}</div>
                        <div className="pnt-inv-addr-line">{shippingCityState}</div>
                        <div className="pnt-inv-addr-split-right">
                            <span className="pnt-inv-pin-center">{shippingPostal}</span>
                            <span>{shippingCountry}</span>
                        </div>
                        <div className="pnt-inv-addr-contact">Contact No.: {shippingContact}</div>
                    </div>
                </div>

                {/* Line 4: Full width horizontal rule above table */}
                <div className="pnt-inv-h-line" />

                {/* 4. Line Items Table */}
                <div className="pnt-inv-table-section">
                    <div className="pnt-inv-tbl-header">
                        <div className="pnt-inv-th-piece-col">
                            <span className="pnt-th-text">Piece</span>
                            {/* Line 5: Horizontal line ONLY under Piece column header! */}
                            <div className="pnt-inv-piece-underline" />
                        </div>
                        <div className="pnt-inv-th-unit-col">Unit price</div>
                        <div className="pnt-inv-th-qty-col">Qunatity</div>
                        <div className="pnt-inv-th-net-col">Net Amount</div>
                    </div>

                    <div className="pnt-inv-tbl-row">
                        <div className="pnt-inv-td-piece-col">
                            <div className="pnt-item-code">{pieceCode}</div>
                            <div className="pnt-item-specs">
                                <div>{metalDesc}</div>
                                <div>{pieceSize}</div>
                                <div>{stoneDesc}</div>
                                <div>{huidText}</div>
                            </div>
                        </div>
                        <div className="pnt-inv-td-unit-col">{unitPriceFormatted}</div>
                        <div className="pnt-inv-td-qty-col">1</div>
                        <div className="pnt-inv-td-net-col">₹{subTotalFormatted}</div>
                    </div>
                </div>

                {/* 5. Payment Details & Summary Breakdown */}
                <div className="pnt-inv-financial-section">
                    <div className="pnt-inv-payment-col">
                        <div className="pnt-payment-heading">Payment Detail</div>
                        <div className="pnt-payment-detail">{paymentMethod}</div>
                        <div className="pnt-payment-detail">{paymentDate}</div>
                        <div className="pnt-payment-detail">Txn. ID: {paymentTxnId}</div>
                    </div>

                    <div className="pnt-inv-summary-col">
                        {/* Line 6: Line above Sub Total */}
                        <div className="pnt-inv-subtotal-line" />
                        
                        <div className="pnt-summary-row">
                            <span className="pnt-summary-label">Sub Total</span>
                            <span className="pnt-summary-val">₹{subTotalFormatted}</span>
                        </div>
                        <div className="pnt-summary-row">
                            <span className="pnt-summary-label">Tax 3%</span>
                            <span className="pnt-summary-val">{taxAmountFormatted}</span>
                        </div>
                        <div className="pnt-summary-row">
                            <span className="pnt-summary-label">Shipping</span>
                            <span className="pnt-summary-val">₹0.00</span>
                        </div>
                    </div>
                </div>

                {/* Line 7: Dark line above TOTAL AMOUNT (starts at 50% width to right edge) */}
                <div className="pnt-inv-total-line-wrapper">
                    <div className="pnt-inv-total-line" />
                </div>

                {/* Total Amount Row */}
                <div className="pnt-inv-total-row">
                    <span className="pnt-total-label">TOTAL AMOUNT</span>
                    <span className="pnt-total-val">{totalAmountFormatted}</span>
                </div>

                {/* 6. Signature Section */}
                <div className="pnt-inv-signature-wrapper">
                    <div className="pnt-inv-signature-box">
                        <img 
                            src="/images/invoice-signature-darshit-soni.png" 
                            alt="Darshit Soni" 
                            className="pnt-inv-signature-img"
                        />
                        <div className="pnt-inv-signatory-title">Authorised Signatory</div>
                    </div>
                </div>

                {/* Line 8: Full width line above footer */}
                <div className="pnt-inv-h-line pnt-inv-footer-h-line" />

                {/* 7. Footer */}
                <div className="pnt-inv-footer">
                    <div className="pnt-inv-footer-left">
                        <div className="pnt-inv-footer-brand">PINTAARA™</div>
                        {/* Line 9: Short dash under brand */}
                        <div className="pnt-inv-footer-dash" />
                        <div className="pnt-inv-footer-text">Shop 1 · Ground Floor, Suvarnaj Complex</div>
                        <div className="pnt-inv-footer-text">Vadodara, Gujarat - 390001</div>
                        <div className="pnt-inv-footer-text">INDIA</div>
                    </div>
                    <div className="pnt-inv-footer-right">
                        <div className="pnt-inv-footer-text">+91 95104 00753</div>
                        <div className="pnt-inv-footer-text">pintaarainfo@gmail.com</div>
                        <div className="pnt-inv-footer-text">www.pintaara.com</div>
                        <div className="pnt-inv-footer-text">Instagram @Pintaara753</div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .pnt-invoice-modal-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    background-color: rgba(18, 16, 14, 0.78);
                    backdrop-filter: blur(8px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    padding: 2.5rem 1rem;
                    overflow-y: auto;
                    box-sizing: border-box;
                }

                .pnt-invoice-standalone-container {
                    min-height: 100vh;
                    width: 100%;
                    background: #141210;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    padding: 2.5rem 1rem 5rem 1rem;
                    box-sizing: border-box;
                }

                .pnt-inv-back-link {
                    color: #D6D2C8;
                    text-decoration: none;
                    font-size: 0.76rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    transition: color 0.2s ease;
                }
                .pnt-inv-back-link:hover {
                    color: #BD7F68;
                }

                .pnt-inv-order-tag {
                    font-size: 0.72rem;
                    background: rgba(255, 255, 255, 0.08);
                    color: #A39E93;
                    padding: 3px 8px;
                    border-radius: 4px;
                    letter-spacing: 0.06em;
                }

                .pnt-invoice-floating-bar {
                    width: 100%;
                    max-width: 680px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #1C1917;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 8px 8px 0 0;
                    padding: 10px 20px;
                    box-sizing: border-box;
                }

                .pnt-invoice-bar-title {
                    font-size: 0.78rem;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #D6D2C8;
                    font-weight: 600;
                }

                .pnt-invoice-bar-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .pnt-inv-btn {
                    padding: 6px 14px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    outline: none;
                    border: none;
                }

                .pnt-inv-print-btn {
                    background: #BD7F68;
                    color: #FFFFFF;
                }
                .pnt-inv-print-btn:hover {
                    background: #A86D58;
                }

                .pnt-inv-copy-btn {
                    background: rgba(255, 255, 255, 0.08);
                    color: #E5E1DA;
                    border: 1px solid rgba(255, 255, 255, 0.14);
                }
                .pnt-inv-copy-btn:hover {
                    background: rgba(255, 255, 255, 0.16);
                }

                .pnt-inv-link-btn {
                    background: transparent;
                    color: #BD7F68;
                    border: 1px solid rgba(189, 127, 104, 0.4);
                }
                .pnt-inv-link-btn:hover {
                    background: rgba(189, 127, 104, 0.12);
                }

                .pnt-inv-close-btn {
                    background: rgba(255, 255, 255, 0.12);
                    color: #FFFFFF;
                }
                .pnt-inv-close-btn:hover {
                    background: rgba(255, 255, 255, 0.22);
                }

                /* A4 Proportionate Printable Sheet */
                .pnt-invoice-sheet {
                    background: #FFFFFF;
                    width: 100%;
                    max-width: 680px;
                    min-height: 940px;
                    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
                    padding: 46px 48px 36px 48px;
                    box-sizing: border-box;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    color: #111111;
                    display: flex;
                    flex-direction: column;
                }

                /* 1. Header */
                .pnt-inv-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-top: 2px;
                }

                .pnt-inv-brand-col {
                    display: flex;
                    align-items: center;
                }

                .pnt-inv-lockup-img {
                    width: 185px;
                    height: auto;
                    max-height: 56px;
                    object-fit: contain;
                    display: block;
                }

                .pnt-inv-title-col {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                }

                .pnt-inv-title {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-size: 20px;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    color: #1A1A1A;
                    margin: 0;
                    line-height: 1;
                    text-align: right;
                }

                /* 2. Created For & Metadata Row */
                .pnt-inv-meta-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }

                .pnt-inv-meta-left {
                    width: 46%;
                }

                .pnt-inv-section-label {
                    font-size: 11px;
                    font-weight: 500;
                    color: #555555;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }

                .pnt-inv-cust-name {
                    font-size: 13.5px;
                    font-weight: 700;
                    color: #111111;
                    margin-bottom: 3px;
                }

                .pnt-inv-cust-detail {
                    font-size: 12px;
                    color: #333333;
                    line-height: 1.45;
                }

                /* Vertical column with centered short line */
                .pnt-inv-v-col {
                    width: 4%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .pnt-inv-v-line {
                    width: 1px;
                    background-color: #9E9E9E;
                }

                .pnt-inv-v-line-top {
                    height: 48px;
                    margin-top: 18px;
                }

                .pnt-inv-v-line-addr {
                    height: 64px;
                    margin-top: 20px;
                }

                .pnt-inv-meta-right {
                    width: 46%;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 8px;
                }

                .pnt-inv-meta-val {
                    font-size: 12px;
                    color: #333333;
                    font-weight: 500;
                }

                /* Full-width horizontal divider lines */
                .pnt-inv-h-line {
                    width: 100%;
                    height: 1px;
                    background-color: #9E9E9E;
                    margin: 0 0 16px 0;
                }

                /* 3. Address Row */
                .pnt-inv-address-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }

                .pnt-inv-addr-left {
                    width: 46%;
                }

                .pnt-inv-addr-right {
                    width: 46%;
                    text-align: right;
                }

                .pnt-inv-addr-name {
                    font-size: 13.5px;
                    font-weight: 700;
                    color: #111111;
                    margin-bottom: 3px;
                }

                .pnt-inv-addr-line {
                    font-size: 12px;
                    color: #333333;
                    line-height: 1.4;
                }

                .pnt-inv-addr-split {
                    font-size: 12px;
                    color: #333333;
                    line-height: 1.4;
                    display: flex;
                    justify-content: space-between;
                    padding-right: 18px;
                }

                .pnt-inv-addr-split-right {
                    font-size: 12px;
                    color: #333333;
                    line-height: 1.4;
                    display: flex;
                    justify-content: space-between;
                    padding-left: 18px;
                }

                .pnt-inv-pin-center {
                    color: #333333;
                }

                .pnt-inv-addr-contact {
                    font-size: 12px;
                    color: #333333;
                    line-height: 1.4;
                    margin-top: 6px;
                }

                /* 4. Table Section */
                .pnt-inv-table-section {
                    width: 100%;
                    margin-bottom: 28px;
                }

                .pnt-inv-tbl-header {
                    display: flex;
                    align-items: flex-start;
                    width: 100%;
                    font-size: 12px;
                    color: #222222;
                    font-weight: 500;
                }

                .pnt-inv-th-piece-col {
                    width: 48%;
                    display: flex;
                    flex-direction: column;
                }

                .pnt-th-text {
                    font-size: 12px;
                    color: #222222;
                }

                /* Line 5: Underline ONLY under Piece header */
                .pnt-inv-piece-underline {
                    width: 100%;
                    height: 1px;
                    background-color: #9E9E9E;
                    margin-top: 6px;
                }

                .pnt-inv-th-unit-col {
                    width: 17%;
                    text-align: right;
                }

                .pnt-inv-th-qty-col {
                    width: 17%;
                    text-align: right;
                }

                .pnt-inv-th-net-col {
                    width: 18%;
                    text-align: right;
                }

                .pnt-inv-tbl-row {
                    display: flex;
                    align-items: flex-start;
                    width: 100%;
                    padding-top: 12px;
                }

                .pnt-inv-td-piece-col {
                    width: 48%;
                }

                .pnt-item-code {
                    font-size: 15px;
                    font-weight: 700;
                    color: #111111;
                    margin-bottom: 5px;
                }

                .pnt-item-specs {
                    font-size: 12px;
                    color: #7D7D7D;
                    line-height: 1.45;
                }

                .pnt-inv-td-unit-col,
                .pnt-inv-td-qty-col,
                .pnt-inv-td-net-col {
                    font-size: 12.5px;
                    color: #111111;
                    text-align: right;
                }
                .pnt-inv-td-unit-col { width: 17%; }
                .pnt-inv-td-qty-col { width: 17%; }
                .pnt-inv-td-net-col { width: 18%; }

                /* 5. Payment Details & Summary Breakdown */
                .pnt-inv-financial-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-top: 24px;
                }

                .pnt-inv-payment-col {
                    width: 44%;
                }

                .pnt-payment-heading {
                    font-size: 13.5px;
                    font-weight: 700;
                    color: #111111;
                    margin-bottom: 4px;
                }

                .pnt-payment-detail {
                    font-size: 12px;
                    color: #333333;
                    line-height: 1.45;
                }

                .pnt-inv-summary-col {
                    width: 32%;
                    display: flex;
                    flex-direction: column;
                }

                /* Line 6: Line above Sub Total */
                .pnt-inv-subtotal-line {
                    width: 100%;
                    height: 1px;
                    background-color: #9E9E9E;
                    margin-bottom: 8px;
                }

                .pnt-summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: #333333;
                    margin-bottom: 5px;
                }

                /* Line 7: Dark line above TOTAL AMOUNT (starts at 50% width to right edge) */
                .pnt-inv-total-line-wrapper {
                    width: 100%;
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 8px;
                    margin-bottom: 8px;
                }

                .pnt-inv-total-line {
                    width: 48%;
                    height: 1.5px;
                    background-color: #1A1A1A;
                }

                /* Total Row */
                .pnt-inv-total-row {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 16px;
                }

                .pnt-total-label {
                    font-size: 14.5px;
                    font-weight: 800;
                    color: #000000;
                    letter-spacing: 0.04em;
                }

                .pnt-total-val {
                    font-size: 16px;
                    font-weight: 800;
                    color: #000000;
                    letter-spacing: 0.02em;
                }

                /* 6. Signature */
                .pnt-inv-signature-wrapper {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 18px;
                    margin-bottom: 20px;
                }

                .pnt-inv-signature-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 180px;
                }

                .pnt-inv-signature-img {
                    width: 154px;
                    height: auto;
                    display: block;
                    margin-bottom: 4px;
                }

                .pnt-inv-signatory-title {
                    font-size: 11px;
                    color: #222222;
                    text-align: center;
                    letter-spacing: 0.02em;
                }

                /* 7. Footer */
                .pnt-inv-footer-h-line {
                    margin-top: auto;
                    margin-bottom: 12px;
                }

                .pnt-inv-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .pnt-inv-footer-brand {
                    font-family: serif;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    color: #111111;
                    margin-bottom: 2px;
                }

                /* Line 9: Short dash under brand */
                .pnt-inv-footer-dash {
                    width: 22px;
                    height: 1.5px;
                    background-color: #333333;
                    margin: 4px 0 6px 0;
                }

                .pnt-inv-footer-text {
                    font-size: 10px;
                    color: #555555;
                    line-height: 1.45;
                }

                .pnt-inv-footer-right {
                    text-align: right;
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

                    .pnt-invoice-modal-overlay,
                    .pnt-invoice-standalone-container {
                        position: static !important;
                        inset: auto !important;
                        background: none !important;
                        backdrop-filter: none !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        min-height: auto !important;
                        width: 100% !important;
                    }

                    .pnt-invoice-sheet {
                        box-shadow: none !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        min-height: auto !important;
                        padding: 12mm 15mm !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    /* Hide all outer siblings when printing */
                    nav, header, footer, .acct-collection-header, .acct-pieces-container, .acct-collection-page {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
