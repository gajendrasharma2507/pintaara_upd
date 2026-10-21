"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/lib/api";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  const fetchCustomers = useCallback(async (query = search) => {
    setLoading(true);
    try {
      const res = await api.getCustomers(query);
      if (res && res.status === "success" && Array.isArray(res.data)) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch live customers:", err);
      showToast("Failed to load clientele records.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, fetchCustomers]);

  // Aggregate KPI stats
  const metrics = useMemo(() => {
    const total = customers.length;
    const registered = customers.filter((c) => c.isRegistered).length;
    const pendingApproval = customers.filter(
      (c) => c.isRegistered && (!c.is_approved || c.status === "pending") && !c.is_disabled
    ).length;
    const approvedActive = customers.filter(
      (c) => c.isRegistered && c.is_approved && !c.is_disabled
    ).length;
    const disabledLogin = customers.filter(
      (c) => c.isRegistered && (c.is_disabled || c.status === "disabled")
    ).length;
    const guestPatrons = customers.filter((c) => !c.isRegistered).length;

    const totalSpendNum = customers.reduce(
      (acc, c) => acc + (Number(c.totalSpendRaw) || 0),
      0
    );
    const spendFormatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(totalSpendNum);

    return {
      total,
      registered,
      pendingApproval,
      approvedActive,
      disabledLogin,
      guestPatrons,
      spendFormatted,
    };
  }, [customers]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter === "pending") {
        return c.isRegistered && (!c.is_approved || c.status === "pending") && !c.is_disabled;
      }
      if (statusFilter === "approved") {
        return c.isRegistered && c.is_approved && !c.is_disabled;
      }
      if (statusFilter === "disabled") {
        return c.isRegistered && (c.is_disabled || c.status === "disabled");
      }
      if (statusFilter === "guest") {
        return !c.isRegistered;
      }
      return true;
    });
  }, [customers, statusFilter]);

  // Handle Action (Approve, Reject, Disable, Enable)
  const handleStatusAction = async (id, action, customNotes = null) => {
    if (actionLoading[id]) return;
    setActionLoading((prev) => ({ ...prev, [id]: action }));

    try {
      const notesToSend = customNotes !== null ? customNotes : adminNotes;
      const res = await api.updateCustomerStatus(id, action, notesToSend);

      if (res && res.status === "success") {
        showToast(
          res.message || `Customer status updated to ${action}.`,
          action === "disable" || action === "reject" ? "warning" : "success"
        );

        // Update local state immediately
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              const isApproved = action === "approve" ? true : action === "reject" ? false : c.is_approved;
              const isDisabled =
                action === "disable"
                  ? true
                  : action === "enable"
                  ? false
                  : action === "reject"
                  ? true
                  : action === "approve"
                  ? false
                  : c.is_disabled;

              let newStatus = c.status;
              if (action === "approve") newStatus = "active";
              if (action === "reject") newStatus = "rejected";
              if (action === "disable") newStatus = "disabled";
              if (action === "enable") newStatus = isApproved ? "active" : "pending";

              return {
                ...c,
                status: newStatus,
                is_approved: isApproved,
                is_disabled: isDisabled,
                admin_notes: notesToSend || c.admin_notes,
              };
            }
            return c;
          })
        );

        // If modal was open for this customer, update modal state
        if (selectedCustomer && selectedCustomer.id === id) {
          setSelectedCustomer((prev) => ({
            ...prev,
            status:
              action === "approve"
                ? "active"
                : action === "reject"
                ? "rejected"
                : action === "disable"
                ? "disabled"
                : prev.is_approved
                ? "active"
                : "pending",
            is_approved: action === "approve" ? true : action === "reject" ? false : prev.is_approved,
            is_disabled: action === "disable" || action === "reject",
            admin_notes: notesToSend || prev.admin_notes,
          }));
        }
      } else {
        showToast(res?.message || "Failed to update customer status.", "error");
      }
    } catch (err) {
      console.error("Action error:", err);
      showToast(err?.message || "Error processing status request.", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const openCustomerDossier = (customer) => {
    setSelectedCustomer(customer);
    setAdminNotes(customer.admin_notes || "");
  };

  // Direct Raw File URL to open directly in a new tab
  const getDocumentUrl = (customer) => {
    if (!customer || !customer.id_proof_path) return "#";
    // Strip BOM (\uFEFF) and other invisible/zero-width characters that can corrupt URL checks
    const path = String(customer.id_proof_path).replace(/[\uFEFF\u200B-\u200D\u00A0]/g, '').trim();
    if (!path) return "#";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const apiHost = (process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') 
      : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://api.pintaara.com' : 'http://127.0.0.1:8000')
    ).replace(/[\uFEFF\u200B-\u200D\u00A0]/g, '').trim();
    if (path.startsWith("/storage/")) {
      return `${apiHost}${path}`;
    }
    if (path.startsWith("storage/")) {
      return `${apiHost}/${path}`;
    }
    return `${apiHost}/storage/id_proofs/${path}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 20px",
            borderRadius: "10px",
            background:
              toast.type === "error"
                ? "#FEF2F2"
                : toast.type === "warning"
                ? "#FFFBEB"
                : "#F0FDF4",
            border:
              toast.type === "error"
                ? "1px solid #FECACA"
                : toast.type === "warning"
                ? "1px solid #FDE68A"
                : "1px solid #BBF7D0",
            color:
              toast.type === "error"
                ? "#991B1B"
                : toast.type === "warning"
                ? "#92400E"
                : "#166534",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
            fontSize: "13px",
            fontWeight: 600,
            maxWidth: "460px",
          }}
        >
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "13px",
              padding: "0 4px",
              fontWeight: 700,
              opacity: 0.6,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--admin-gold)", fontWeight: 700, marginBottom: "4px" }}>
            Atelier Clientele &amp; Access Governance
          </div>
          <h1 className="admin-serif" style={{ fontSize: "28px", fontWeight: 700, color: "var(--admin-text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
            Patrons &amp; Profile Verification
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--admin-text-secondary)", margin: "4px 0 0 0" }}>
            Verify customer identity documentation, inspect uploaded government proofs, and manage storefront login privileges.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
          <input
            type="text"
            placeholder="Search patron, email, phone, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            style={{ fontSize: "13px" }}
          />
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
        }}
      >
        <div className="admin-card" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Registered
          </span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--admin-text-primary)", letterSpacing: "-0.02em" }}>
            {loading ? "—" : metrics.registered}
          </div>
          <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
            Registered client accounts
          </span>
        </div>

        <div
          className="admin-card"
          onClick={() => setStatusFilter("pending")}
          style={{
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            cursor: "pointer",
            border: metrics.pendingApproval > 0 ? "1px solid #FCD34D" : "1px solid var(--admin-border)",
            background: metrics.pendingApproval > 0 ? "rgba(254, 243, 199, 0.25)" : "var(--admin-surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Pending Approval
            </span>
            {metrics.pendingApproval > 0 && (
              <span className="admin-badge admin-badge-warning" style={{ fontSize: "10px", padding: "2px 8px" }}>
                Needs Review
              </span>
            )}
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#B45309", letterSpacing: "-0.02em" }}>
            {loading ? "—" : metrics.pendingApproval}
          </div>
          <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
            Profiles awaiting ID verification
          </span>
        </div>

        <div
          className="admin-card"
          onClick={() => setStatusFilter("approved")}
          style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "8px", cursor: "pointer" }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Approved &amp; Active
          </span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--admin-success)", letterSpacing: "-0.02em" }}>
            {loading ? "—" : metrics.approvedActive}
          </div>
          <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
            Login enabled and verified
          </span>
        </div>

        <div
          className="admin-card"
          onClick={() => setStatusFilter("disabled")}
          style={{
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            cursor: "pointer",
            border: metrics.disabledLogin > 0 ? "1px solid #FECACA" : "1px solid var(--admin-border)",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#991B1B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Login Disabled
          </span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--admin-danger)", letterSpacing: "-0.02em" }}>
            {loading ? "—" : metrics.disabledLogin}
          </div>
          <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
            Access restricted or suspended
          </span>
        </div>

        <div className="admin-card" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Cumulative Portfolio
          </span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--admin-text-primary)", letterSpacing: "-0.02em" }}>
            {loading ? "—" : metrics.spendFormatted}
          </div>
          <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
            Lifetime client acquisitions
          </span>
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setStatusFilter("all")}
            className={`admin-filter-btn ${statusFilter === "all" ? "active" : ""}`}
          >
            All Patrons ({metrics.total})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`admin-filter-btn ${statusFilter === "pending" ? "active" : ""}`}
            style={{
              borderColor: statusFilter === "pending" ? "#F59E0B" : undefined,
              color: statusFilter === "pending" ? "#B45309" : undefined,
            }}
          >
            Pending Approval ({metrics.pendingApproval})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`admin-filter-btn ${statusFilter === "approved" ? "active" : ""}`}
            style={{
              borderColor: statusFilter === "approved" ? "var(--admin-success)" : undefined,
              color: statusFilter === "approved" ? "var(--admin-success)" : undefined,
            }}
          >
            Approved ({metrics.approvedActive})
          </button>
          <button
            onClick={() => setStatusFilter("disabled")}
            className={`admin-filter-btn ${statusFilter === "disabled" ? "active" : ""}`}
            style={{
              borderColor: statusFilter === "disabled" ? "var(--admin-danger)" : undefined,
              color: statusFilter === "disabled" ? "var(--admin-danger)" : undefined,
            }}
          >
            Disabled ({metrics.disabledLogin})
          </button>
          <button
            onClick={() => setStatusFilter("guest")}
            className={`admin-filter-btn ${statusFilter === "guest" ? "active" : ""}`}
          >
            Guest Patrons ({metrics.guestPatrons})
          </button>
        </div>

        <div style={{ fontSize: "12.5px", color: "var(--admin-text-muted)" }}>
          Showing <b>{filteredCustomers.length}</b> of <b>{customers.length}</b> clientele records
        </div>
      </div>

      {/* Main Customers Table Card */}
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: "220px" }}>Patron &amp; Account</th>
                <th style={{ minWidth: "180px" }}>Contact Details</th>
                <th style={{ minWidth: "180px" }}>Identity Document</th>
                <th style={{ minWidth: "140px" }}>Login Status</th>
                <th style={{ minWidth: "120px", textAlign: "right" }}>Portfolio Value</th>
                <th style={{ minWidth: "240px", textAlign: "center" }}>Governance Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "48px 24px", color: "var(--admin-text-secondary)" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 500 }}>
                      <span className="admin-pulse-dot" />
                      <span>Loading patron records from Atelier registry...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "48px 24px" }}>
                    <div style={{ color: "var(--admin-text-primary)", fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>
                      No patrons found matching this filter
                    </div>
                    <div style={{ color: "var(--admin-text-secondary)", fontSize: "13px" }}>
                      {search
                        ? `No records match "${search}". Try resetting the search.`
                        : "Switch filter tabs to view other patron statuses."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const initial = (c.name || "P").trim().charAt(0).toUpperCase();
                  const isUpdating = !!actionLoading[c.id];

                  // Status determination
                  const isGuest = !c.isRegistered;
                  const isDisabled = c.is_disabled || c.status === "disabled";
                  const isApproved = c.is_approved && !isDisabled;
                  const isPending = !isGuest && (!c.is_approved || c.status === "pending") && !isDisabled;
                  const isRejected = c.status === "rejected";

                  return (
                    <tr
                      key={c.id}
                      style={{
                        background: isDisabled
                          ? "rgba(254, 242, 242, 0.4)"
                          : isPending
                          ? "rgba(254, 243, 199, 0.2)"
                          : undefined,
                      }}
                    >
                      {/* Patron Name with Avatar */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "50%",
                              background: isDisabled
                                ? "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)"
                                : "var(--admin-surface-elevated)",
                              border: isDisabled
                                ? "1px solid #FCA5A5"
                                : "1px solid var(--admin-border)",
                              color: isDisabled ? "#991B1B" : "var(--admin-text-primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--admin-text-primary)" }}>
                              {c.name}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                              <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                                {isGuest ? "Guest Patron" : `Account #${c.id}`} • {c.createdAt}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--admin-text-primary)" }}>
                          {c.email || "—"}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "2px" }}>
                          {c.phone || "—"} • {c.city || "India"}
                        </div>
                      </td>

                      {/* Identity Document - Direct Link Opening File in New Tab */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                          {isGuest ? (
                            <span className="admin-badge admin-badge-neutral">
                              Guest Checkout
                            </span>
                          ) : isApproved ? (
                            <span className="admin-badge admin-badge-success">
                              Approved Profile
                            </span>
                          ) : isPending ? (
                            <span className="admin-badge admin-badge-warning">
                              Pending Review
                            </span>
                          ) : isRejected ? (
                            <span className="admin-badge admin-badge-danger">
                              Rejected
                            </span>
                          ) : (
                            <span className="admin-badge admin-badge-neutral">
                              {c.status}
                            </span>
                          )}

                          {c.id_proof_path ? (
                            <a
                              href={getDocumentUrl(c)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: "var(--admin-surface-elevated)",
                                border: "1px solid var(--admin-border)",
                                color: "var(--admin-primary)",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "5px 12px",
                                borderRadius: "6px",
                                marginTop: "2px",
                                textDecoration: "none",
                              }}
                              title="Click to open uploaded file in new tab"
                            >
                              <span>View Document</span>
                            </a>
                          ) : !isGuest ? (
                            <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                              No Document Attached
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Login Status */}
                      <td>
                        {isGuest ? (
                          <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                            No login account
                          </span>
                        ) : isDisabled ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span className="admin-badge admin-badge-danger">
                              Login Disabled
                            </span>
                            <span style={{ fontSize: "10.5px", color: "var(--admin-danger)", fontWeight: 500 }}>
                              Storefront blocked
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span className="admin-badge admin-badge-success">
                              Login Active
                            </span>
                            <span style={{ fontSize: "10.5px", color: "var(--admin-success)", fontWeight: 500 }}>
                              Storefront accessible
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Total Valuation */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--admin-text-primary)", letterSpacing: "-0.01em" }}>
                          {c.totalSpend || "₹0"}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "2px" }}>
                          {c.ordersCount || 0} {c.ordersCount === 1 ? "order" : "orders"}
                        </div>
                      </td>

                      {/* Governance Actions Column */}
                      <td>
                        {isGuest ? (
                          <div style={{ textAlign: "center", fontSize: "12px", color: "var(--admin-text-muted)" }}>
                            —
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                            {/* Approve Button (when pending or not approved) */}
                            {(!isApproved || isRejected) && (
                              <button
                                onClick={() => handleStatusAction(c.id, "approve")}
                                disabled={isUpdating}
                                className="admin-btn-primary"
                                style={{
                                  padding: "6px 12px",
                                  fontSize: "11.5px",
                                  background: "#059669",
                                  borderColor: "#059669",
                                  opacity: isUpdating ? 0.6 : 1,
                                }}
                                title="Verify ID proof and approve customer profile"
                              >
                                {isUpdating && actionLoading[c.id] === "approve" ? "Updating..." : "Approve"}
                              </button>
                            )}

                            {/* Disable Login Button (when active) */}
                            {!isDisabled ? (
                              <button
                                onClick={() => handleStatusAction(c.id, "disable")}
                                disabled={isUpdating}
                                style={{
                                  padding: "6px 10px",
                                  fontSize: "11.5px",
                                  fontWeight: 600,
                                  background: "#FEF2F2",
                                  color: "#DC2626",
                                  border: "1px solid #FECACA",
                                  borderRadius: "8px",
                                  cursor: isUpdating ? "not-allowed" : "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  transition: "all 0.15s ease",
                                }}
                                title="Immediately disable customer login and revoke active sessions"
                              >
                                {isUpdating && actionLoading[c.id] === "disable" ? "Updating..." : "Disable Login"}
                              </button>
                            ) : (
                              /* Enable Login Button (when disabled) */
                              <button
                                onClick={() => handleStatusAction(c.id, "enable")}
                                disabled={isUpdating}
                                style={{
                                  padding: "6px 10px",
                                  fontSize: "11.5px",
                                  fontWeight: 600,
                                  background: "#ECFDF5",
                                  color: "#059669",
                                  border: "1px solid #A7F3D0",
                                  borderRadius: "8px",
                                  cursor: isUpdating ? "not-allowed" : "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  transition: "all 0.15s ease",
                                }}
                                title="Re-enable login privileges for this customer"
                              >
                                {isUpdating && actionLoading[c.id] === "enable" ? "Updating..." : "Enable Login"}
                              </button>
                            )}

                            {/* Reject Button (if pending) */}
                            {isPending && (
                              <button
                                onClick={() => handleStatusAction(c.id, "reject")}
                                disabled={isUpdating}
                                style={{
                                  padding: "6px 10px",
                                  fontSize: "11.5px",
                                  fontWeight: 500,
                                  background: "transparent",
                                  color: "var(--admin-danger)",
                                  border: "1px solid #FECACA",
                                  borderRadius: "8px",
                                  cursor: isUpdating ? "not-allowed" : "pointer",
                                }}
                                title="Reject registration ID"
                              >
                                {isUpdating && actionLoading[c.id] === "reject" ? "..." : "Reject"}
                              </button>
                            )}

                            {/* View Full Dossier */}
                            <button
                              onClick={() => openCustomerDossier(c)}
                              className="admin-btn-outline"
                              style={{
                                padding: "6px 10px",
                                fontSize: "11.5px",
                              }}
                              title="View full customer dossier and review documents"
                            >
                              Dossier
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Verification & Governance Dossier Modal */}
      {selectedCustomer && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedCustomer(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: "620px", padding: "28px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "var(--admin-primary-light)",
                    border: "1px solid var(--admin-primary)",
                    color: "var(--admin-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  {(selectedCustomer.name || "P").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                    {selectedCustomer.name}
                  </h2>
                  <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "2px" }}>
                    Customer Account #{selectedCustomer.id} • Registered {selectedCustomer.createdAt}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--admin-text-muted)",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                Close
              </button>
            </div>

            {/* Account Status Matrix Banner */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                padding: "16px",
                background: "var(--admin-surface-elevated)",
                borderRadius: "10px",
                marginBottom: "20px",
                border: "1px solid var(--admin-border)",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-muted)", textTransform: "uppercase" }}>
                  Profile Verification
                </div>
                <div style={{ marginTop: "4px" }}>
                  {selectedCustomer.is_approved && !selectedCustomer.is_disabled ? (
                    <span className="admin-badge admin-badge-success">Verified and Approved</span>
                  ) : selectedCustomer.status === "pending" || !selectedCustomer.is_approved ? (
                    <span className="admin-badge admin-badge-warning">Verification Pending</span>
                  ) : (
                    <span className="admin-badge admin-badge-danger">Profile Rejected</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-muted)", textTransform: "uppercase" }}>
                  Storefront Login Access
                </div>
                <div style={{ marginTop: "4px" }}>
                  {selectedCustomer.is_disabled ? (
                    <span className="admin-badge admin-badge-danger">Disabled and Blocked</span>
                  ) : (
                    <span className="admin-badge admin-badge-success">Login Allowed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid var(--admin-border-light)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--admin-text-muted)" }}>Email Address</span>
                <span style={{ fontWeight: 600, color: "var(--admin-text-primary)" }}>{selectedCustomer.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid var(--admin-border-light)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--admin-text-muted)" }}>Phone Number</span>
                <span style={{ fontWeight: 600, color: "var(--admin-text-primary)" }}>{selectedCustomer.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid var(--admin-border-light)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--admin-text-muted)" }}>Acquisitions</span>
                <span style={{ fontWeight: 600, color: "var(--admin-text-primary)" }}>
                  {selectedCustomer.ordersCount} orders • {selectedCustomer.totalSpend}
                </span>
              </div>
            </div>

            {/* Government ID Proof Inspection Card */}
            <div
              style={{
                border: "1px dashed var(--admin-border)",
                borderRadius: "12px",
                padding: "16px",
                background: "var(--admin-surface)",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--admin-text-primary)" }}>
                  Government Identity Document
                </span>
                {selectedCustomer.id_proof_path ? (
                  <span className="admin-badge admin-badge-info" style={{ fontSize: "10.5px" }}>
                    Uploaded Document
                  </span>
                ) : (
                  <span className="admin-badge admin-badge-neutral" style={{ fontSize: "10.5px" }}>
                    Not Provided
                  </span>
                )}
              </div>

              {selectedCustomer.id_proof_path ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--admin-surface-elevated)", padding: "12px 14px", borderRadius: "8px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--admin-text-primary)" }}>
                      Identity Verification Document
                    </span>
                  </div>
                  <a
                    href={getDocumentUrl(selectedCustomer)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn-primary"
                    style={{ fontSize: "12px", padding: "6px 14px", background: "var(--admin-primary)", textDecoration: "none" }}
                  >
                    Open Uploaded File in New Tab
                  </a>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: "12.5px", color: "var(--admin-text-secondary)" }}>
                  This patron registered without attaching a digital identity document. Admin discretion applies.
                </p>
              )}
            </div>

            {/* Admin Audit Notes */}
            <div style={{ marginBottom: "24px" }}>
              <label className="admin-label" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 600 }}>
                Administration Audit Notes
              </label>
              <textarea
                rows={3}
                className="admin-input"
                style={{ width: "100%", fontSize: "13px", resize: "vertical" }}
                placeholder="Add verification notes, reason for approval, suspension, or identity check details..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap", borderTop: "1px solid var(--admin-border)", paddingTop: "18px" }}>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="admin-btn-outline"
                style={{ fontSize: "13px" }}
              >
                Close
              </button>

              {/* Login Enable / Disable Toggle */}
              {selectedCustomer.is_disabled ? (
                <button
                  type="button"
                  onClick={() => handleStatusAction(selectedCustomer.id, "enable", adminNotes)}
                  disabled={actionLoading[selectedCustomer.id]}
                  style={{
                    background: "#059669",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Enable Login
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStatusAction(selectedCustomer.id, "disable", adminNotes)}
                  disabled={actionLoading[selectedCustomer.id]}
                  style={{
                    background: "#DC2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Disable Login
                </button>
              )}

              {/* Approve Profile */}
              {(!selectedCustomer.is_approved || selectedCustomer.status === "rejected") && (
                <button
                  type="button"
                  onClick={() => handleStatusAction(selectedCustomer.id, "approve", adminNotes)}
                  disabled={actionLoading[selectedCustomer.id]}
                  className="admin-btn-primary"
                  style={{ fontSize: "13px", background: "#059669" }}
                >
                  Approve Profile
                </button>
              )}

              {/* Reject Profile */}
              {selectedCustomer.status === "pending" && (
                <button
                  type="button"
                  onClick={() => handleStatusAction(selectedCustomer.id, "reject", adminNotes)}
                  disabled={actionLoading[selectedCustomer.id]}
                  style={{
                    background: "transparent",
                    color: "#DC2626",
                    border: "1px solid #FCA5A5",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Reject Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
