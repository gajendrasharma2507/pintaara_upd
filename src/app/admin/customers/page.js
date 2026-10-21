"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminUsers();
      const list = res?.data || res?.users || res || [];
      setCustomers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q)
    );
  });

  const cardStyle = {
    background: "var(--admin-surface)",
    border: "1px solid var(--admin-border)",
    borderRadius: "12px",
    overflow: "hidden",
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div style={{ display: "flex", gap: "24px", minHeight: "100%" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--admin-text-primary)", margin: 0 }}>Customers</h1>
            <p style={{ fontSize: "13px", color: "var(--admin-text-muted)", margin: "4px 0 0 0" }}>
              {loading ? "Loading..." : `${filtered.length} patrons registered`}
            </p>
          </div>
          <button
            onClick={fetchCustomers}
            style={{
              background: "var(--admin-surface-elevated)",
              border: "1px solid var(--admin-border)",
              borderRadius: "8px",
              color: "var(--admin-text-secondary)",
              cursor: "pointer",
              padding: "8px 14px",
              fontSize: "13px",
            }}
          >
            Refresh
          </button>
        </div>

        {/* Search */}
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or phone..."
          style={{
            background: "var(--admin-surface-elevated)",
            border: "1px solid var(--admin-border)",
            borderRadius: "8px",
            padding: "9px 14px",
            color: "var(--admin-text-primary)",
            fontSize: "13px",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
          }}
        />

        {/* Table */}
        <div style={cardStyle}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "14px" }}>Loading customers...</div>
          ) : error ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#f87171", fontSize: "14px" }}>
              {error}
              <br />
              <button onClick={fetchCustomers} style={{ marginTop: "12px", background: "transparent", border: "1px solid #f87171", borderRadius: "6px", color: "#f87171", padding: "6px 14px", cursor: "pointer", fontSize: "12px" }}>
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "14px" }}>No customers found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--admin-border)" }}>
                    {["Patron", "Contact", "Joined", "Status", ""].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--admin-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => {
                    const isSelected = selected?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelected(c)}
                        style={{
                          borderBottom: idx < filtered.length - 1 ? "1px solid var(--admin-border)" : "none",
                          background: isSelected ? "rgba(201,169,97,0.06)" : "transparent",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #C9A961 0%, #7E6326 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#000",
                              fontWeight: 700,
                              fontSize: "11px",
                              flexShrink: 0,
                            }}>{getInitials(c.name)}</div>
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--admin-text-primary)" }}>{c.name || "—"}</div>
                              {c.role === "admin" && (
                                <span style={{ fontSize: "10px", color: "var(--admin-gold)", background: "rgba(201,169,97,0.1)", padding: "1px 6px", borderRadius: "10px" }}>Admin</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>{c.email}</div>
                          {c.phone && <div style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>{c.phone}</div>}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "12px", color: "var(--admin-text-muted)" }}>{formatDate(c.created_at)}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: c.email_verified_at ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)",
                            color: c.email_verified_at ? "#4ade80" : "#facc15",
                          }}>
                            {c.email_verified_at ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                            style={{ background: "transparent", border: "1px solid var(--admin-border)", borderRadius: "6px", color: "var(--admin-text-secondary)", cursor: "pointer", padding: "5px 10px", fontSize: "11px" }}
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

      {/* Detail Panel */}
      {selected && (
        <div style={{
          width: "300px",
          flexShrink: 0,
          position: "sticky",
          top: "20px",
          maxHeight: "calc(100vh - 160px)",
          overflowY: "auto",
        }}>
          <div style={{ ...cardStyle, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-primary)", margin: 0 }}>Patron Profile</h2>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "var(--admin-text-muted)", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C9A961 0%, #7E6326 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: 700,
                fontSize: "20px",
                margin: "0 auto 10px",
              }}>{getInitials(selected.name)}</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-primary)" }}>{selected.name}</div>
              <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>{selected.email}</div>
            </div>

            {[
              { label: "Phone", value: selected.phone || "—" },
              { label: "Role", value: selected.role || "customer" },
              { label: "Joined", value: formatDate(selected.created_at) },
              { label: "Email Status", value: selected.email_verified_at ? "Verified" : "Unverified" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--admin-border)" }}>
                <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>{label}</span>
                <span style={{ fontSize: "12px", color: "var(--admin-text-primary)", fontWeight: 500 }}>{value}</span>
              </div>
            ))}

            {selected.identity_proof_path && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>ID Proof</div>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${selected.identity_proof_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "var(--admin-gold)", textDecoration: "none" }}
                >
                  View Document →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
