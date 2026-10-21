"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import OfficialInvoice from "@/components/OfficialInvoice";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  // Invoice Download & Preview State
  const [previewInvoiceData, setPreviewInvoiceData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchApiOrders = async () => {
      try {
        setLoading(true);
        const res = await api.getOrders();
        if (res && res.status === "success" && Array.isArray(res.data)) {
          const apiFormatted = res.data.map((o) => ({
            id: String(o.id),
            order_number: o.order_number || String(o.id),
            client: o.customer_name || "No name provided",
            email: o.customer_email || "—",
            phone: o.customer_phone || "—",
            city: o.city || "Domestic Courier",
            address: o.shipping_address || "Standard Insured Transit",
            items: o.item_summary || `${o.items_count || 1} Bespoke Pieces`,
            amount: `₹${Number(o.total_amount || 0).toLocaleString("en-IN")}`,
            raw_amount: Number(o.total_amount || 0),
            status: o.status_label || "Crafting Atelier",
            fulfillment: ["shipped", "delivered"].includes(o.status) ? "Fulfilled" : "Unfulfilled",
            payment_method: o.payment_method || "Razorpay",
            payment_status: o.payment_status || "paid",
            date: o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Today",
            raw_order: o,
          }));

          setOrders(apiFormatted);
        }
      } catch (err) {
        console.warn("Could not fetch remote orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApiOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus, e) => {
    e.stopPropagation();
    const prev = orders.find((o) => o.id === orderId)?.status;
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`);
    } catch (err) {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: prev } : o)));
      showToast(`⚠ Failed to update status: ${err.message}`);
    }
  };

  // Helper to construct normalized luxury invoice payload matching OfficialInvoice spec
  const buildInvoiceDataFromOrder = (ord) => {
    const items = ord.items || [];
    const firstItem = items[0] || {};
    const totalAmount = ord.pricing?.total_amount || ord.total_amount || ord.raw_amount || 26250;
    const subTotal = ord.pricing?.subtotal || ord.subtotal || Math.round(Number(totalAmount) / 1.03);

    return {
      id: ord.id,
      order_number: ord.order_number || ord.id,
      invoice_number: `INV-${ord.order_number || ord.id}`,
      date: ord.created_at || ord.date || new Date().toISOString(),
      payment_date: ord.payment_date || ord.created_at || new Date().toISOString(),
      total: Number(totalAmount),
      metal_value: Number(subTotal),
      piece_code: firstItem.design_code || firstItem.product_name || ord.item_summary || ord.items || 'PD-SD-OR-001',
      metal_purity: firstItem.metal_purity || '18KT',
      finish: firstItem.finish || 'Rose gold',
      size: firstItem.size || '12',
      stone: firstItem.gem || '0.7CT Real Diamond',
      huid: firstItem.huid || 'HUID-984210',
      payment_method: ord.payment_method || 'Gpay',
      razorpay_payment_id: ord.payment_id || ord.razorpay_payment_id || `UPI${String(ord.order_number || '').replace(/\D/g, '') || '2026'}`,
      customer_name: ord.customer?.name || ord.client || ord.customer_name || 'Patron Client',
      customer_phone: ord.customer?.phone || ord.phone || ord.customer_phone || '+91 98989 45454',
      customer_email: ord.customer?.email || ord.email || ord.customer_email || 'patron@pintaara.com',
      shipping_name: ord.shipping_address?.full_name || ord.client || ord.customer_name || 'Patron Client',
      shipping_address: typeof ord.shipping_address === 'string' ? ord.shipping_address : (ord.shipping_address?.address_line1 || ord.address || 'Unit 12A, The Atelier Luxury Estate'),
      shipping_city_state: ord.shipping_address?.city ? `${ord.shipping_address.city}, ${ord.shipping_address.state || ''}` : (ord.city || 'Vadodara, Gujarat'),
      shipping_postal: ord.shipping_address?.postal_code || ord.shipping_address?.pincode || '390001',
      shipping_country: ord.shipping_address?.country || 'India',
      shipping_phone: ord.shipping_address?.phone || ord.phone || '+91 98942 43549',
      billing_address: typeof ord.billing_address === 'string' ? ord.billing_address : 'Shop 1 · Ground Floor, Suvarnaj Complex',
      billing_city_state: 'Vadodara, Gujarat',
      billing_pincode: '390001',
    };
  };

  // Fetch complete order details from backend to ensure all item specs & address details are complete
  const fetchCompleteInvoiceData = async (order) => {
    try {
      const res = await api.getOrder(order.id);
      if (res && res.status === 'success' && res.data) {
        return buildInvoiceDataFromOrder(res.data);
      }
    } catch (e) {
      console.warn("Could not fetch full order details, falling back to row data:", e);
    }
    return buildInvoiceDataFromOrder(order.raw_order || order);
  };

  // Direct 1-Click PDF Download
  const handleDirectDownloadInvoice = async (order, e) => {
    e.stopPropagation();
    setDownloadingOrderId(order.id);
    showToast(`Generating Official Tax Invoice for Order #${order.order_number || order.id}...`);

    try {
      const invoiceData = await fetchCompleteInvoiceData(order);
      setPreviewInvoiceData(invoiceData);

      // Allow DOM off-screen element to render, then execute PDF capture
      setTimeout(async () => {
        try {
          const sheet = document.getElementById("official-invoice-print-area");
          if (sheet) {
            const { downloadInvoicePdfFromElement } = await import("@/lib/downloadInvoicePdf");
            const fname = `Invoice-${invoiceData.order_number || order.order_number || order.id}.pdf`;
            await downloadInvoicePdfFromElement(sheet, fname);
            showToast(`Invoice #${invoiceData.order_number} downloaded successfully!`);
          } else {
            // Storefront link fallback
            window.open(`https://pintaara.com/invoice/${order.order_number || order.id}?download=true`, '_blank');
          }
        } catch (err) {
          console.error("PDF generation error, opening storefront fallback:", err);
          window.open(`https://pintaara.com/invoice/${order.order_number || order.id}?download=true`, '_blank');
        } finally {
          setDownloadingOrderId(null);
        }
      }, 500);
    } catch (err) {
      console.error("Failed to prepare invoice:", err);
      setDownloadingOrderId(null);
      window.open(`https://pintaara.com/invoice/${order.order_number || order.id}?download=true`, '_blank');
    }
  };

  // Open Preview Modal
  const handlePreviewInvoice = async (order, e) => {
    e.stopPropagation();
    try {
      const invoiceData = await fetchCompleteInvoiceData(order);
      setPreviewInvoiceData(invoiceData);
      setShowPreviewModal(true);
    } catch (err) {
      console.error("Failed to load invoice for preview:", err);
    }
  };

  const filtered = orders.filter(o => filterStatus === "All" || o.status === filterStatus);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1400px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 99999,
            background: "#1E293B",
            color: "#FFFFFF",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            borderRadius: "8px",
            padding: "12px 20px",
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ color: "#3B82F6", fontSize: "16px" }}>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--admin-gold)", fontWeight: 600 }}>
            Client Commissions & Crafting Flow
          </span>
          <h2 className="admin-serif" style={{ fontSize: "28px", fontWeight: 700, margin: "4px 0 0 0" }}>
            Orders & Production Dispatch
          </h2>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="admin-card" style={{ padding: "12px 18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {["All", "Crafting Atelier", "Awaiting Assay", "Dispatched", "Delivered"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`admin-filter-btn ${filterStatus === status ? "active" : ""}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Client</th>
                <th>Jewelry Selection</th>
                <th>Valuation</th>
                <th>Timestamp</th>
                <th>Atelier Crafting Status</th>
                <th>Official Invoice</th>
                <th style={{ textAlign: "right" }}>Inspect Order</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "36px", color: "var(--admin-text-secondary)" }}>
                    Loading orders from Atelier ledger...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "36px", color: "var(--admin-text-secondary)" }}>
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const targetUrl = `/orders/${order.id}`;
                  const isDownloadingThis = downloadingOrderId === order.id;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => router.push(targetUrl)}
                      style={{ cursor: "pointer", transition: "background 0.15s" }}
                    >
                      <td>
                        <Link
                          href={targetUrl}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            color: "var(--admin-primary)",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          #{order.order_number || order.id}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.client}</div>
                        <div style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>{order.city}</div>
                      </td>
                      <td style={{ color: "var(--admin-text-secondary)" }}>{order.items}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--admin-text-primary)" }}>{order.amount}</div>
                        <div style={{ fontSize: "10px", fontWeight: 600, color: order.payment_method?.toLowerCase() === 'cod' ? '#b27d00' : 'var(--admin-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
                          {order.payment_method?.toLowerCase() === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
                        </div>
                      </td>
                      <td style={{ color: "var(--admin-text-muted)", fontSize: "12px" }}>{order.date}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value, e)}
                          className="admin-input"
                          style={{
                            width: "auto",
                            padding: "4px 8px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            height: "30px"
                          }}
                        >
                          <option value="Crafting Atelier">Crafting Atelier</option>
                          <option value="Awaiting Assay">Awaiting Assay</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>

                      {/* Official Tax Invoice Download & Preview Action */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={(e) => handleDirectDownloadInvoice(order, e)}
                            disabled={isDownloadingThis}
                            className="admin-btn-primary"
                            style={{
                              padding: "5px 11px",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              borderRadius: "6px",
                              whiteSpace: "nowrap",
                              background: isDownloadingThis ? "#93C5FD" : "var(--admin-primary, #3B82F6)",
                              cursor: isDownloadingThis ? "wait" : "pointer",
                            }}
                            title="Download Official Pintaara Tax Invoice PDF"
                          >
                            {isDownloadingThis ? (
                              <span>Downloading...</span>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                <span>Download PDF</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handlePreviewInvoice(order, e)}
                            className="admin-btn-outline"
                            style={{
                              padding: "5px 9px",
                              fontSize: "11px",
                              fontWeight: 600,
                              borderRadius: "6px",
                              color: "var(--admin-text-secondary)",
                            }}
                            title="Preview Official Tax Invoice"
                          >
                            Preview
                          </button>
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={targetUrl}
                          className="admin-btn-outline"
                          style={{ padding: "5px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <span>View Details</span>
                          <span>→</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Official Luxury Tax Invoice Preview Modal */}
      {showPreviewModal && previewInvoiceData && (
        <OfficialInvoice
          invoice={previewInvoiceData}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* Off-screen rendering target for direct 1-click PDF download */}
      {previewInvoiceData && !showPreviewModal && (
        <div style={{ position: "fixed", left: "-9999px", top: 0, opacity: 0, pointerEvents: "none", zIndex: -1 }}>
          <OfficialInvoice invoice={previewInvoiceData} isStandalone={true} />
        </div>
      )}
    </div>
  );
}
