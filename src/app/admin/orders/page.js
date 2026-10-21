"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";

const STATUS_COLORS = {
  confirmed: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", label: "Confirmed" },
  processing: { bg: "rgba(234,179,8,0.12)", color: "#facc15", label: "Processing" },
  crafting: { bg: "rgba(168,85,247,0.12)", color: "#c084fc", label: "Crafting" },
  shipped: { bg: "rgba(6,182,212,0.12)", color: "#22d3ee", label: "Shipped" },
  delivered: { bg: "rgba(34,197,94,0.12)", color: "#4ade80", label: "Delivered" },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "#f87171", label: "Cancelled" },
};

const PAYMENT_COLORS = {
  paid: { color: "#4ade80" },
  pending: { color: "#facc15" },
  failed: { color: "#f87171" },
  refunded: { color: "#60a5fa" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("pintaara_token");
      if (!token) throw new Error("Not authenticated");
      const res = await api.getAdminOrders(statusFilter);
      const list = res?.data || res?.orders || res || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (o.order_number || "").toLowerCase().includes(q) ||
      (o.customer_name || "").toLowerCase().includes(q) ||
      (o.customer_email || "").toLowerCase().includes(q)
    );
  });

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setUpdatingStatus(true);
    setStatusMsg(null);
    try {
      await api.updateAdminOrderStatus(selectedOrder.id, newStatus);
      setStatusMsg({ type: "success", text: "Order status updated successfully" });
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
      );
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message || "Failed to update status" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusStyle = (status) =>
    STATUS_COLORS[status] || { bg: "rgba(255,255,255,0.08)", color: "#9CA3AF", label: status };

  const formatCurrency = (val) =>
    val
      ? "₹" + Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 })
      : "—";

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch { return d; }
  };

  const cardStyle = {
    background: "var(--admin-surface)",
    border: "1px solid var(--admin-border)",
    borderRadius: "12px",
    overflow: "hidden",
  };

  return (
    <div style={{ display: "flex", gap: "24px", minHeight: "100%" }}>
      {/* Main Orders Table */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--admin-text-primary)", margin: 0 }}>
              Orders
            </h1>
            <p style={{ fontSize: "13px", color: "var(--admin-text-muted)", margin: "4px 0 0 0" }}>
              {loading ? "Loading..." : `${filteredOrders.length} orders`}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            style={{
              background: "var(--admin-surface-elevated)",
              border: "1px solid var(--admin-border)",
              borderRadius: "8px",
              color: "var(--admin-text-secondary)",
              cursor: "pointer",
              padding: "8px 14px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, name, email..."
            style={{
              flex: 1,
              minWidth: "200px",
              background: "var(--admin-surface-elevated)",
              border: "1px solid var(--admin-border)",
              borderRadius: "8px",
              padding: "9px 14px",
              color: "var(--admin-text-primary)",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: "var(--admin-surface-elevated)",
              border: "1px solid var(--admin-border)",
              borderRadius: "8px",
              padding: "9px 14px",
              color: "var(--admin-text-primary)",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_COLORS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div style={cardStyle}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "14px" }}>
              Loading orders from backend...
            </div>
          ) : error ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#f87171", fontSize: "14px" }}>
              {error}
              <br />
              <button
                onClick={fetchOrders}
                style={{ marginTop: "12px", background: "transparent", border: "1px solid #f87171", borderRadius: "6px", color: "#f87171", padding: "6px 14px", cursor: "pointer", fontSize: "12px" }}
              >
                Retry
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "14px" }}>
              No orders found
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--admin-border)" }}>
                    {["Order", "Customer", "Amount", "Status", "Payment", "Date", ""].map((h) => (
                      <th key={h} style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--admin-text-muted)",
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, idx) => {
                    const st = statusStyle(order.status);
                    const pt = PAYMENT_COLORS[order.payment_status] || { color: "#9CA3AF" };
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <tr
                        key={order.id}
                        style={{
                          borderBottom: idx < filteredOrders.length - 1 ? "1px solid var(--admin-border)" : "none",
                          background: isSelected ? "rgba(201,169,97,0.06)" : "transparent",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onClick={() => { setSelectedOrder(order); setNewStatus(order.status); setStatusMsg(null); }}
                        onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--admin-gold)", fontWeight: 600 }}>
                            {order.order_number || `#${order.id}`}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--admin-text-primary)" }}>
                            {order.customer_name || "—"}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                            {order.customer_email}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--admin-text-primary)", fontSize: "13px", whiteSpace: "nowrap" }}>
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: st.bg,
                            color: st.color,
                            whiteSpace: "nowrap",
                          }}>
                            {st.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: pt.color, textTransform: "capitalize" }}>
                            {order.payment_status || "—"}
                          </span>
                          <div style={{ fontSize: "10px", color: "var(--admin-text-muted)", textTransform: "uppercase" }}>
                            {order.payment_method}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "12px", color: "var(--admin-text-muted)", whiteSpace: "nowrap" }}>
                          {formatDate(order.created_at)}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setNewStatus(order.status); setStatusMsg(null); }}
                            style={{
                              background: "transparent",
                              border: "1px solid var(--admin-border)",
                              borderRadius: "6px",
                              color: "var(--admin-text-secondary)",
                              cursor: "pointer",
                              padding: "5px 10px",
                              fontSize: "11px",
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Panel */}
      {selectedOrder && (
        <div style={{
          width: "340px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "sticky",
          top: "20px",
          maxHeight: "calc(100vh - 160px)",
          overflowY: "auto",
        }}>
          {/* Header */}
          <div style={{ ...cardStyle, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-primary)", margin: 0 }}>
                {selectedOrder.order_number}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: "transparent", border: "none", color: "var(--admin-text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Customer info */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Customer</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-primary)" }}>{selectedOrder.customer_name}</div>
              <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>{selectedOrder.customer_email}</div>
              {selectedOrder.customer_phone && (
                <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>{selectedOrder.customer_phone}</div>
              )}
            </div>

            {/* Shipping */}
            {selectedOrder.shipping_address && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Ship To</div>
                <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", lineHeight: "1.5" }}>
                  {selectedOrder.shipping_address}
                </div>
              </div>
            )}

            {/* Financials */}
            <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>Total Amount</span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-gold)" }}>{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>Payment</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: PAYMENT_COLORS[selectedOrder.payment_status]?.color || "#9CA3AF", textTransform: "capitalize" }}>
                  {selectedOrder.payment_status} ({selectedOrder.payment_method})
                </span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div style={{ ...cardStyle, padding: "20px" }}>
            <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Update Status</div>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{
                width: "100%",
                background: "var(--admin-surface-elevated)",
                border: "1px solid var(--admin-border)",
                borderRadius: "8px",
                padding: "9px 12px",
                color: "var(--admin-text-primary)",
                fontSize: "13px",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              {Object.entries(STATUS_COLORS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            {statusMsg && (
              <div style={{
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                marginBottom: "10px",
                background: statusMsg.type === "success" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                color: statusMsg.type === "success" ? "#4ade80" : "#f87171",
                border: `1px solid ${statusMsg.type === "success" ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
              }}>
                {statusMsg.text}
              </div>
            )}
            <button
              onClick={handleUpdateStatus}
              disabled={updatingStatus || newStatus === selectedOrder.status}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                background: newStatus !== selectedOrder.status ? "var(--admin-gold)" : "rgba(255,255,255,0.06)",
                border: "none",
                color: newStatus !== selectedOrder.status ? "#000" : "var(--admin-text-muted)",
                fontWeight: 600,
                fontSize: "13px",
                cursor: newStatus !== selectedOrder.status ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              {updatingStatus ? "Updating..." : "Update Status"}
            </button>
          </div>

          {/* Order Items */}
          {selectedOrder.items && selectedOrder.items.length > 0 && (
            <div style={{ ...cardStyle, padding: "20px" }}>
              <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
                Items ({selectedOrder.items.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{
                    padding: "12px",
                    background: "var(--admin-surface-elevated)",
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border)",
                  }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                      {item.product_name || item.name}
                    </div>
                    {item.design_code && (
                      <div style={{ fontSize: "10px", color: "var(--admin-gold)", fontFamily: "monospace" }}>{item.design_code}</div>
                    )}
                    <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "4px" }}>
                      {[item.metal_purity, item.finish, item.size && `Size ${item.size}`].filter(Boolean).join(" · ")}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                      <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>Qty: {item.quantity}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-primary)" }}>
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {selectedOrder.notes && (
            <div style={{ ...cardStyle, padding: "20px" }}>
              <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Notes</div>
              <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", lineHeight: "1.5" }}>
                {selectedOrder.notes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
