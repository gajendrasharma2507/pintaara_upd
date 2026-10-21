"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./admin.css";
import { API_BASE_URL } from "@/lib/api";



const atelierNavigationItems = [
  {
    name: "Executive Overview",
    href: "/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    name: "Orders & Invoices",
    href: "/orders",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    name: "Jewellery Catalog",
    href: "/products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    name: "Collections",
    href: "/collections",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    name: "Customers",
    href: "/customers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    name: "Live Gold Spot Rates",
    href: "/gold-rates",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    name: "Pricing Masters",
    href: "/masters",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    name: "Atelier Settings",
    href: "/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const managementItems = atelierNavigationItems;
/*
const managementItemsPlaceholder = [
  {
    name: "Products",
    href: "/products",
    badge: "142",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    name: "Collections",
    href: "/collections",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    name: "Masters",
    href: "/masters",
    badge: "5",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    name: "Orders",
    href: "/orders",
    badge: "3 New",
    badgeVariant: "gold",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    name: "Customers",
    href: "/customers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    name: "Gold Rates",
    href: "/gold-rates",
    badge: "Live",
    badgeVariant: "success",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];
*/

export default function RootAdminLayout({ children }) {
  const pathname = usePathname();
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Admin Authentication State
  const [adminToken, setAdminToken] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("admin@pintaara.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [submittingLogin, setSubmittingLogin] = useState(false);

  const handleQuickFillDemo = () => {
    setLoginEmail("admin@pintaara.com");
    setLoginPassword("PintaaraAdmin@2026!");
    setLoginError("");
  };

  useEffect(() => {
    // Check saved theme preference
    const savedTheme = localStorage.getItem("nextadmin_theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }

    // Check saved admin credentials
    const token = localStorage.getItem("pintaara_admin_token");
    const userStr = localStorage.getItem("pintaara_admin_user");
    if (token) {
      setAdminToken(token);
      if (userStr) {
        try {
          setAdminUser(JSON.parse(userStr));
        } catch (e) {}
      }
      // Stop loading immediately so session renders without flicker on refresh
      setAuthLoading(false);

      // Validate/sync latest admin details with backend in background
      fetch(`${API_BASE_URL}/admin/auth/me`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      .then(r => r.json())
      .then(res => {
        if (res && res.user && (res.user.role === 'admin' || res.user.role === 'super_admin')) {
          setAdminUser(res.user);
          localStorage.setItem("pintaara_admin_user", JSON.stringify(res.user));
        } else if (res && (res.message === 'Unauthenticated.' || res.message?.includes('Unauthenticated') || res.message?.includes('Access denied'))) {
          localStorage.removeItem("pintaara_admin_token");
          localStorage.removeItem("pintaara_admin_user");
          setAdminToken(null);
          setAdminUser(null);
        }
      })
      .catch((err) => {
        console.warn("Background auth sync warning:", err);
      });
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOverlayInteractions = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        if (window.innerWidth <= 640) {
          setSidebarOpen(false);
        }
        return;
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleOverlayInteractions);
    document.addEventListener("pointerdown", handleOverlayInteractions);
    return () => {
      document.removeEventListener("keydown", handleOverlayInteractions);
      document.removeEventListener("pointerdown", handleOverlayInteractions);
    };
  }, []);

  useEffect(() => {
    const syncMobileSidebar = () => {
      if (window.innerWidth <= 640) {
        setSidebarOpen(false);
      }
    };

    syncMobileSidebar();
    window.addEventListener("resize", syncMobileSidebar);
    return () => window.removeEventListener("resize", syncMobileSidebar);
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setSubmittingLogin(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      }).then(r => r.json());

      if (res && res.success && res.token) {
        setAdminToken(res.token);
        setAdminUser(res.user);
        localStorage.setItem("pintaara_admin_token", res.token);
        localStorage.setItem("pintaara_admin_user", JSON.stringify(res.user));
      } else {
        setLoginError(res?.message || "Invalid administrative credentials.");
      }
    } catch (err) {
      setLoginError("Failed to connect to authentication backend: " + err.message);
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleAdminLogout = async () => {
    setProfileOpen(false);
    try {
      const token = localStorage.getItem("pintaara_admin_token");
      if (token) {
        await fetch(`${API_BASE_URL}/admin/auth/logout`, {
          method: "POST",
          headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
        });
      }
    } catch (e) {}
    localStorage.removeItem("pintaara_admin_token");
    localStorage.removeItem("pintaara_admin_user");
    setAdminToken(null);
    setAdminUser(null);
  };

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("nextadmin_theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("nextadmin_theme", "light");
    }
  };

  if (authLoading) {
    return (
      <html lang="en" data-theme={isDarkMode ? "dark" : "light"}>
        <head>
          <title>NextAdmin — Pintaara Atelier</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: isDarkMode ? "#0B0F19" : "#F4F7FE" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", border: "3px solid rgba(60, 80, 224, 0.2)", borderTopColor: "#3C50E0", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: "12px", letterSpacing: "0.12em", color: isDarkMode ? "#94A3B8" : "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
              Verifying Authorization...
            </div>
          </div>
        </body>
      </html>
    );
  }

  if (!adminToken) {
    return (
      <html lang="en" data-theme={isDarkMode ? "dark" : "light"}>
        <head>
          <title>Administrative Authorization — Pintaara Atelier</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style={{ margin: 0, minHeight: "100vh", background: isDarkMode ? "#0B0F19" : "#F4F7FE", color: isDarkMode ? "#F8FAFC" : "#1C2434", fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
          {/* Top Utility Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px" }}>
            <a
              href="https://pintaara.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: 500,
                color: isDarkMode ? "#94A3B8" : "#64748B",
                textDecoration: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                transition: "all 0.2s"
              }}
            >
              <span>←</span>
              <span>Return to Storefront</span>
            </a>

            <button
              type="button"
              onClick={toggleDarkMode}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                background: isDarkMode ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                color: isDarkMode ? "#F8FAFC" : "#1C2434",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}
            >
              {isDarkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>

          {/* Centered Luxury Login Card Container */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 140px)", padding: "20px 24px" }}>
            <div
              style={{
                width: "100%",
                maxWidth: "460px",
                background: isDarkMode ? "#161F30" : "#FFFFFF",
                borderRadius: "20px",
                border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
                boxShadow: isDarkMode ? "0 25px 50px -12px rgba(0,0,0,0.6)" : "0 20px 40px -15px rgba(0,0,0,0.07)",
                padding: "40px 36px",
                position: "relative"
              }}
            >
              {/* Luxury Atelier Emblem */}
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
                  <img
                    src="/images/logo-wordmark.png"
                    alt="PINTAARA"
                    style={{
                      height: "36px",
                      width: "auto",
                      maxWidth: "240px",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: isDarkMode ? "#FFFFFF" : "#1C2434", margin: "0 0 8px 0" }}>
                  Administrative Authorization
                </h1>
                <p style={{ fontSize: "13px", color: isDarkMode ? "#94A3B8" : "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Sign in with executive credentials to access catalog masters, orders, and jewelry ledger.
                </p>
              </div>

              {/* Login Error Notification */}
              {loginError && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: isDarkMode ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2",
                    border: isDarkMode ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid #FECACA",
                    color: "#EF4444",
                    fontSize: "13px",
                    marginBottom: "22px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: isDarkMode ? "#94A3B8" : "#475569", textTransform: "uppercase", marginBottom: "8px" }}>
                    Executive Email
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@pintaara.com"
                      style={{
                        width: "100%",
                        padding: "12px 16px 12px 42px",
                        borderRadius: "10px",
                        border: isDarkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid #CBD5E1",
                        background: isDarkMode ? "rgba(15, 23, 42, 0.6)" : "#F8FAFC",
                        color: isDarkMode ? "#FFFFFF" : "#1C2434",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: isDarkMode ? "#64748B" : "#94A3B8" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: isDarkMode ? "#94A3B8" : "#475569", textTransform: "uppercase", marginBottom: "8px" }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      style={{
                        width: "100%",
                        padding: "12px 42px 12px 42px",
                        borderRadius: "10px",
                        border: isDarkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid #CBD5E1",
                        background: isDarkMode ? "rgba(15, 23, 42, 0.6)" : "#F8FAFC",
                        color: isDarkMode ? "#FFFFFF" : "#1C2434",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: isDarkMode ? "#64748B" : "#94A3B8" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: isDarkMode ? "#94A3B8" : "#64748B",
                        padding: "4px"
                      }}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Auto-fill for convenience */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                  <button
                    type="button"
                    onClick={handleQuickFillDemo}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "#3C50E0",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>⚡ Fill Default Admin Credentials</span>
                  </button>

                  <span style={{ fontSize: "11px", color: isDarkMode ? "#64748B" : "#94A3B8" }}>
                    Darshit Soni (Super Admin)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submittingLogin}
                  style={{
                    marginTop: "12px",
                    padding: "14px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #3C50E0 0%, #465FFF 100%)",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: submittingLogin ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(60, 80, 224, 0.35)",
                    transition: "all 0.2s"
                  }}
                >
                  {submittingLogin ? "Authenticating Session..." : "SIGN IN TO ATELIER PORTAL"}
                </button>
              </form>

              {/* Security Audit Badge */}
              <div
                style={{
                  marginTop: "28px",
                  paddingTop: "20px",
                  borderTop: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: isDarkMode ? "#64748B" : "#94A3B8",
                  fontSize: "12px"
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Encrypted RBAC &middot; Bureau of Indian Standards Assayed</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>Pintaara Atelier — Company Administration</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="admin-shell admin-app-shell" style={{ display: "flex", flexDirection: "row", minHeight: "100vh" }}>
          
          {/* SIDEBAR */}
          <aside
            className={`admin-sidebar ${sidebarOpen ? "is-open" : "is-closed"}`}
            style={{
              width: sidebarOpen ? "256px" : "80px",
              minWidth: sidebarOpen ? "256px" : "80px",
              background: "var(--admin-surface)",
              borderRight: "1px solid var(--admin-border)",
              display: "flex",
              flexDirection: "column",
              transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "sticky",
              top: 0,
              height: "100vh",
              zIndex: 50,
            }}
          >
            {/* Logo & Toggle Header */}
            <div
              style={{
                height: "70px",
                padding: sidebarOpen ? "0 20px" : "0 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: sidebarOpen ? "10px" : "4px",
                borderBottom: "1px solid var(--admin-border)",
              }}
            >
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                  overflow: "hidden",
                  flexShrink: 0,
                  minWidth: sidebarOpen ? 0 : "36px",
                }}
              >
                {sidebarOpen ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <img
                      src="/images/logo-wordmark.png"
                      alt="PINTAARA"
                      style={{
                        height: "22px",
                        width: "auto",
                        maxWidth: "165px",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #D4AF37 0%, #C9A961 50%, #9A7C38 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 10px rgba(201, 169, 97, 0.3)",
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      fontFamily: "serif",
                    }}
                  >
                    P
                  </div>
                )}
              </Link>

              {/* Sidebar Collapse Toggle Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--admin-text-secondary)",
                  padding: sidebarOpen ? "6px" : "4px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <path d={sidebarOpen ? "m14 9-3 3 3 3" : "m10 9 3 3-3 3"} />
                </svg>
              </button>
            </div>

            {/* Navigation Menus */}
            <div
              style={{
                flex: 1,
                padding: "20px 14px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {sidebarOpen && (
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: "var(--admin-text-muted)",
                    textTransform: "uppercase",
                    padding: "4px 10px 8px 10px",
                  }}
                >
                  ATELIER OPERATIONS
                </div>
              )}

              {atelierNavigationItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "13.5px",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--admin-primary)" : "var(--admin-text-secondary)",
                      background: isActive ? "var(--admin-primary-light)" : "transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ display: "flex", color: isActive ? "var(--admin-primary)" : "currentColor" }}>
                        {item.icon}
                      </span>
                      {sidebarOpen && <span>{item.name}</span>}
                    </div>

                    {sidebarOpen && item.badge && (
                      <span
                        className={
                          item.badgeVariant === "gold"
                            ? "admin-badge admin-badge-gold"
                            : item.badgeVariant === "success"
                            ? "admin-badge admin-badge-success"
                            : "admin-badge"
                        }
                        style={{
                          background: !item.badgeVariant ? "var(--admin-surface-hover)" : undefined,
                          color: !item.badgeVariant ? "var(--admin-text-secondary)" : undefined,
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          padding: "2px 7px",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Storefront Link */}
            {sidebarOpen && (
              <div
                style={{
                  padding: "14px 18px",
                  borderTop: "1px solid var(--admin-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <a
                  href="https://pintaara.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--admin-primary)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  <span>Visit Storefront</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <span className="admin-pulse-dot" title="Live System Active" />
              </div>
            )}
          </aside>

          {sidebarOpen && (
            <button
              type="button"
              className="admin-mobile-nav-backdrop"
              aria-label="Close navigation menu"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* MAIN VIEWPORT */}
          <div className="admin-main-viewport" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            
            {/* TOPBAR HEADER */}
            <header
              className="admin-topbar"
              style={{
                height: "70px",
                background: "var(--admin-surface)",
                borderBottom: "1px solid var(--admin-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 28px",
                position: "sticky",
                top: 0,
                zIndex: 40,
              }}
            >
              <button
                type="button"
                className="admin-mobile-nav-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={sidebarOpen}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>

              {/* Search Bar matching screenshot */}
              <div className="admin-search-wrap" style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: "420px" }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg
                    style={{
                      position: "absolute",
                      left: "14px",
                      color: "var(--admin-text-muted)",
                    }}
                    width="17"
                    height="17"
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jewelry pieces, orders, HUIDs, clients..."
                    style={{
                      width: "100%",
                      background: "var(--admin-surface)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: "10px",
                      padding: "9px 56px 9px 40px",
                      color: "var(--admin-text-primary)",
                      fontSize: "13px",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                  />
                  {/* Keyboard shortcut badge */}
                  <div
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "var(--admin-surface-hover)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: "6px",
                      padding: "2px 7px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--admin-text-secondary)",
                      pointerEvents: "none",
                    }}
                  >
                    ⌘K
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                
                {/* Dark / Light Mode Switcher */}
                <button
                  onClick={toggleDarkMode}
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "var(--admin-surface-hover)",
                    border: "1px solid var(--admin-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--admin-text-secondary)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isDarkMode ? (
                    // Sun Icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    // Moon Icon (as shown in user screenshot)
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>

                {/* Notification Bell with red dot */}
                <div ref={profileMenuRef} style={{ position: "relative" }}>
                  <button
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "var(--admin-surface-hover)",
                      border: "1px solid var(--admin-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--admin-text-secondary)",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </button>
                  {/* Red notification dot */}
                  <span
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#EF4444",
                      border: "2px solid var(--admin-surface)",
                    }}
                  />
                </div>

                {/* User Profile Pill matching screenshot */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #D4AF37, #9A7C38)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "14px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}
                    >
                      DS
                    </div>

                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--admin-text-primary)",
                      }}
                    >
                      {adminUser?.name || "Darshit Soni"}
                    </span>

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: "var(--admin-text-muted)" }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "48px",
                        width: "220px",
                        background: "var(--admin-surface)",
                        border: "1px solid var(--admin-border)",
                        borderRadius: "12px",
                        boxShadow: "var(--admin-shadow-lg)",
                        padding: "8px 0",
                        zIndex: 100,
                      }}
                    >
                      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--admin-border)" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                          {adminUser?.name || "Darshit Soni"}
                        </div>
                        <div style={{ fontSize: "11px", color: "#C9A961", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: "2px" }}>
                          {adminUser?.role ? adminUser.role.replace('_', ' ') : "Super Admin"} &middot; Founder
                        </div>
                      </div>
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: "block",
                          padding: "8px 16px",
                          fontSize: "13px",
                          color: "var(--admin-text-secondary)",
                          textDecoration: "none",
                        }}
                      >
                        Account Settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleAdminLogout}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 16px",
                          fontSize: "13px",
                          color: "var(--admin-danger)",
                          textDecoration: "none",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </header>

            {/* PAGE VIEWPORT */}
            <main className="admin-page-content" style={{ flex: 1, padding: "28px 32px 48px 32px" }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
