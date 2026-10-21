"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import "./admin.css";

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
        <path d="M2 9h20" />
        <path d="m10 3 2 6" />
      </svg>
    ),
  },
  {
    name: "Collections",
    href: "/admin/collections",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    name: "Orders",
    href: "/admin/orders",
    badgeVariant: "gold",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    name: "Gold Rates",
    href: "/admin/gold-rates",
    badge: "Live",
    badgeVariant: "success",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live gold rate state (fetched from backend which proxies aaravbullion feed)
  const [goldRates, setGoldRates] = useState({ gold24k: null, gold22k: null, silver: null, source: null });
  const [adminUser, setAdminUser] = useState({ name: 'Admin', email: 'admin@pintaara.com' });

  // Fetch live gold rates from backend every 60 seconds
  const fetchGoldRates = async () => {
    try {
      const data = await api.getTodayGoldRate();
      if (data && data.status === 'success') {
        const gold22k = data.base_22kt_rate_per_10g;
        const gold24k = data.pure_24kt_rate_per_gram;
        const silver  = data.silver_base_per_10g;
        setGoldRates({
          gold24k: gold24k ? Math.round(gold24k) : null,
          gold22k: gold22k ? Math.round(gold22k / 10) : null,  // per gram
          silver: silver ? Math.round(silver / 10) : null,      // per gram
          source: data.source || 'live',
          refreshedAt: data.refreshed_at || null,
        });
      }
    } catch (e) {
      // silently fail — ticker shows last value
    }
  };

  // Fetch admin profile on mount
  const fetchAdminProfile = async () => {
    try {
      const data = await api.getProfile();
      if (data && (data.name || data.email)) {
        setAdminUser({ name: data.name || 'Admin', email: data.email || 'admin@pintaara.com' });
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchGoldRates();
    fetchAdminProfile();
    // Refresh gold rates every 60 seconds (matching aaravbullion cache TTL)
    const interval = setInterval(fetchGoldRates, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pintaara_token');
    }
    router.push('/login');
  };

  return (
    <div className="admin-shell">
      {/* Top Spot Bar — Live gold ticker from Aarav Bullion via backend API */}
      <div style={{
        background: "#080706",
        borderBottom: "1px solid rgba(212, 175, 55, 0.08)",
        padding: "6px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "11px",
        color: "var(--admin-text-secondary)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="admin-pulse-dot" />
            <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "var(--admin-gold)" }}>
              {goldRates.source === 'live' ? 'Live Spot' : 'Spot Rate'}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontFamily: "monospace" }}>
            <span>24K Gold: <strong style={{ color: "#FFF" }}>₹{goldRates.gold24k ? goldRates.gold24k.toLocaleString("en-IN") : "—"}/g</strong></span>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <span>22K Gold: <strong style={{ color: "#FFF" }}>₹{goldRates.gold22k ? goldRates.gold22k.toLocaleString("en-IN") : "—"}/g</strong></span>
            {goldRates.silver && (
              <>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                <span>Silver: <strong style={{ color: "#DDD" }}>₹{goldRates.silver.toLocaleString("en-IN")}/g</strong></span>
              </>
            )}
            {goldRates.source === 'live' && (
              <span style={{ color: "#4ade80", fontSize: "10px", marginLeft: "4px" }}>● LIVE</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--admin-gold-light)",
              textDecoration: "none",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.05em",
              transition: "color 0.2s"
            }}
          >
            <span>Preview Storefront</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 35px)" }}>
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(4px)",
              zIndex: 90,
            }}
          />
        )}

        {/* SIDEBAR */}
        <aside
          style={{
            width: "260px",
            background: "var(--admin-surface)",
            borderRight: "1px solid var(--admin-border)",
            display: "flex",
            flexDirection: "column",
            zIndex: 100,
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            position: typeof window !== "undefined" && window.innerWidth < 1024 ? "fixed" : "sticky",
            top: 0,
            height: "100vh",
            transform: typeof window !== "undefined" && window.innerWidth < 1024
              ? (mobileMenuOpen ? "translateX(0)" : "translateX(-100%)")
              : "none",
          }}
        >
          {/* Brand Header */}
          <div style={{
            height: "72px",
            padding: "0 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--admin-border)",
          }}>
            <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #2A251D 0%, #15130F 100%)",
                border: "1px solid rgba(201, 169, 97, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.5)"
              }}>
                <span className="admin-serif" style={{ color: "var(--admin-gold)", fontWeight: "bold", fontSize: "19px" }}>
                  P
                </span>
              </div>
              <div>
                <h1 className="admin-serif" style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  color: "var(--admin-text-primary)",
                  textTransform: "uppercase",
                  margin: 0
                }}>
                  PINTAARA
                </h1>
                <p style={{
                  fontSize: "9px",
                  letterSpacing: "0.25em",
                  color: "var(--admin-gold)",
                  textTransform: "uppercase",
                  margin: 0,
                  fontWeight: 600
                }}>
                  Atelier Executive
                </p>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "none",
                background: "transparent",
                border: "none",
                color: "var(--admin-text-secondary)",
                cursor: "pointer"
              }}
              className="admin-mobile-close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="admin-custom-scroll" style={{
            flex: 1,
            padding: "20px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            overflowY: "auto"
          }}>
            <div style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "var(--admin-text-muted)",
              textTransform: "uppercase",
              padding: "0 10px 8px 10px"
            }}>
              Management
            </div>

            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: "0.03em",
                    color: isActive ? "#FFF" : "var(--admin-text-secondary)",
                    backgroundColor: isActive ? "var(--admin-surface-elevated)" : "transparent",
                    border: isActive ? "1px solid rgba(201, 169, 97, 0.25)" : "1px solid transparent",
                    boxShadow: isActive ? "0 4px 14px rgba(0,0,0,0.3)" : "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: isActive ? "var(--admin-gold)" : "var(--admin-text-muted)" }}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className={item.badgeVariant === "gold" ? "admin-badge admin-badge-gold" : item.badgeVariant === "success" ? "admin-badge admin-badge-success" : "admin-badge"} style={{
                      background: !item.badgeVariant ? "rgba(255,255,255,0.06)" : undefined,
                      color: !item.badgeVariant ? "var(--admin-text-secondary)" : undefined,
                      fontSize: "10px"
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card Footer */}
          <div style={{
            padding: "16px",
            borderTop: "1px solid var(--admin-border)",
            background: "var(--admin-surface-elevated)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C9A961 0%, #7E6326 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: 700,
                fontSize: "13px"
              }}>
                {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--admin-text-primary)",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {adminUser.name}
                </p>
                <p style={{
                  fontSize: "11px",
                  color: "var(--admin-text-muted)",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {adminUser.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--admin-text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Topbar Header */}
          <header style={{
            height: "64px",
            background: "var(--admin-surface)",
            borderBottom: "1px solid var(--admin-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            gap: "16px",
            position: "sticky",
            top: 0,
            zIndex: 40
          }}>
            {/* Left: Mobile hamburger & Search */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, maxWidth: "480px" }}>
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--admin-text-primary)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "inline-flex",
                  alignItems: "center"
                }}
                className="admin-mobile-toggle"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              <div style={{
                position: "relative",
                width: "100%"
              }}>
                <svg
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--admin-text-muted)"
                  }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search jewelry, orders, clients..."
                  style={{
                    width: "100%",
                    background: "var(--admin-surface-elevated)",
                    border: "1px solid rgba(212, 175, 55, 0.15)",
                    borderRadius: "8px",
                    padding: "8px 12px 8px 36px",
                    color: "var(--admin-text-primary)",
                    fontSize: "13px",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--admin-gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(212, 175, 55, 0.15)")}
                />
              </div>
            </div>

            {/* Right Quick Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <Link href="/admin/products?new=1" className="admin-btn-gold" style={{ fontSize: "12px", padding: "8px 14px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Piece</span>
              </Link>

              {/* Notification button */}
              <button
                style={{
                  background: "var(--admin-surface-elevated)",
                  border: "1px solid var(--admin-border)",
                  borderRadius: "8px",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--admin-text-secondary)",
                  cursor: "pointer",
                  position: "relative"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--admin-gold)"
                }} />
              </button>
            </div>
          </header>

          {/* Main Content Viewport */}
          <main style={{ flex: 1, padding: "32px 28px 48px 28px" }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
