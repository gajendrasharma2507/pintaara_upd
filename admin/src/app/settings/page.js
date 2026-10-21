"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api";

function InfoTip({ content }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (!content) return null;

  return (
    <span
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        marginLeft: "6px",
        verticalAlign: "middle",
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Information"
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          border: "1px solid #CBD5E1",
          backgroundColor: "#F8FAFC",
          color: "#64748B",
          fontSize: "11px",
          fontWeight: 600,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          lineHeight: "1",
          transition: "all 0.15s ease",
          outline: "none",
        }}
      >
        i
      </button>

      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#FFFFFF",
            color: "#334155",
            border: "1px solid #E2E8F0",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            lineHeight: "1.45",
            fontWeight: 400,
            whiteSpace: "normal",
            width: "250px",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.04)",
            zIndex: 1000,
            textAlign: "left",
            pointerEvents: "none",
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("razorpay");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSecrets, setShowSecrets] = useState({});
  const [testingConnection, setTestingConnection] = useState({});
  const [connectionResults, setConnectionResults] = useState({});

  const [settings, setSettings] = useState({
    atelier: {
      brand_name: "PINTAARA Fine Jewelry",
      currency: "INR (₹)",
      currency_symbol: "₹",
      gst_percent: 3.0,
      default_wastage_percent: 0.0,
      support_email: "concierge@pintaara.com",
      support_phone: "+91 98765 43210",
      address: "Atelier Suite 402, Platinum Tower, Bandra West, Mumbai, Maharashtra 400050",
    },
    razorpay: {
      mode: "test",
      test_key_id: "rzp_test_placeholder",
      test_key_secret: "",
      test_key_secret_masked: "••••••••",
      live_key_id: "",
      live_key_secret: "",
      live_key_secret_masked: "",
      webhook_secret: "",
      webhook_secret_masked: "",
      merchant_name: "PINTAARA",
      currency: "INR",
      auto_capture: true,
      has_test_secret: false,
      has_live_secret: false,
    },
    sequel: {
      mode: "test",
      client_code: "31492",
      store_code: "PINTARA",
      origin_pincode: "400001",
      test_token: "",
      test_token_masked: "••••••••",
      test_endpoint: "https://test.sequel247.com/",
      prod_token: "",
      prod_token_masked: "",
      prod_endpoint: "https://sequel247.com/",
      has_test_token: false,
      has_prod_token: false,
    },
    email: {
      mode: "test",
      driver: "smtp",
      smtp_host: "sandbox.smtp.mailtrap.io",
      smtp_port: 2525,
      smtp_encryption: "tls",
      smtp_username: "",
      smtp_password: "",
      smtp_password_masked: "",
      resend_api_key: "",
      resend_api_key_masked: "",
      from_address: "concierge@pintaara.com",
      from_name: "PINTAARA Fine Jewelry",
    },
    pabbly: {
      is_enabled: false,
      mode: "test",
      api_key: "",
      api_key_masked: "",
      secret_key: "",
      secret_key_masked: "",
      webhook_url: "",
      product_id: "",
    },
    sms: {
      is_enabled: false,
      mode: "test",
      provider: "twilio",
      account_sid: "",
      auth_token: "",
      auth_token_masked: "",
      sender_number: "",
    },
  });

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await api.getSettings();
        if (res && res.success && res.data) {
          setSettings((prev) => ({
            ...prev,
            atelier: { ...prev.atelier, ...(res.data.atelier || {}) },
            razorpay: { ...prev.razorpay, ...(res.data.razorpay || {}) },
            sequel: { ...prev.sequel, ...(res.data.sequel || {}) },
            email: { ...prev.email, ...(res.data.email || {}) },
            pabbly: { ...prev.pabbly, ...(res.data.pabbly || {}) },
            sms: { ...prev.sms, ...(res.data.sms || {}) },
          }));
        }
      } catch (err) {
        console.warn("Could not load backend settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSaveSuccess(false);

    try {
      const res = await api.updateSettings(settings);
      if (res && res.success) {
        setSaveSuccess(true);
        if (res.data) {
          setSettings((prev) => ({
            ...prev,
            atelier: { ...prev.atelier, ...(res.data.atelier || {}) },
            razorpay: { ...prev.razorpay, ...(res.data.razorpay || {}) },
            sequel: { ...prev.sequel, ...(res.data.sequel || {}) },
            email: { ...prev.email, ...(res.data.email || {}) },
            pabbly: { ...prev.pabbly, ...(res.data.pabbly || {}) },
            sms: { ...prev.sms, ...(res.data.sms || {}) },
          }));
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage(res?.message || "Failed to save settings.");
      }
    } catch (err) {
      setErrorMessage("Error saving settings: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (gateway, mode) => {
    const key = `${gateway}_${mode}`;
    setTestingConnection((prev) => ({ ...prev, [key]: true }));
    setConnectionResults((prev) => ({ ...prev, [key]: null }));

    try {
      let payload = { gateway, mode };
      if (gateway === "razorpay") {
        payload.key_id = mode === "live" ? settings.razorpay.live_key_id : settings.razorpay.test_key_id;
        payload.key_secret = mode === "live" ? settings.razorpay.live_key_secret : settings.razorpay.test_key_secret;
      } else if (gateway === "sequel") {
        payload.endpoint = mode === "prod" ? settings.sequel.prod_endpoint : settings.sequel.test_endpoint;
        payload.token = mode === "prod" ? settings.sequel.prod_token : settings.sequel.test_token;
        payload.pincode = settings.sequel.origin_pincode;
      } else if (gateway === "pabbly") {
        payload.api_key = settings.pabbly.api_key;
      }

      const res = await api.testConnection(payload);
      if (res) {
        setConnectionResults((prev) => ({
          ...prev,
          [key]: {
            success: res.success,
            message: res.message,
            latency: res.latency_ms,
          },
        }));
      } else {
        setConnectionResults((prev) => ({
          ...prev,
          [key]: {
            success: false,
            message: "No response from test service.",
          },
        }));
      }
    } catch (err) {
      setConnectionResults((prev) => ({
        ...prev,
        [key]: {
          success: false,
          message: err.message || "Connection test failed.",
        },
      }));
    } finally {
      setTestingConnection((prev) => ({ ...prev, [key]: false }));
    }
  };

  const updateCategory = (category, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const toggleShowSecret = (field) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const tabs = [
    { id: "razorpay", label: "Payments", badge: settings.razorpay.mode === "live" ? "Live" : "Test" },
    { id: "sequel", label: "Logistics", badge: settings.sequel.mode === "prod" ? "Live" : "Test" },
    { id: "email", label: "Email", badge: settings.email.mode === "live" ? "Live" : "Test" },
    { id: "pabbly", label: "Subscriptions", badge: settings.pabbly.is_enabled ? "Enabled" : null },
    { id: "sms", label: "SMS & WhatsApp", badge: settings.sms.is_enabled ? "Enabled" : null },
    { id: "atelier", label: "General Preferences" },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "360px" }}>
        <p style={{ color: "#64748B", fontSize: "14px" }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "960px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid #E2E8F0" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0, color: "#0F172A" }}>
            Company Administration
          </h2>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "3px 0 0 0" }}>
            Platform integrations and operating parameters
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "8px 20px",
            backgroundColor: "#2563EB",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            fontWeight: 500,
            fontSize: "13px",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "all 0.15s ease",
          }}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div style={{ padding: "10px 14px", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "6px", color: "#166534", fontSize: "13px" }}>
          Settings updated successfully.
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: "10px 14px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "6px", color: "#991B1B", fontSize: "13px" }}>
          {errorMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid #E2E8F0", paddingBottom: "0" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                backgroundColor: "transparent",
                color: isActive ? "#0F172A" : "#64748B",
                border: "none",
                borderBottom: isActive ? "2px solid #2563EB" : "2px solid transparent",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                marginBottom: "-1px",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: "10px",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    fontWeight: 500,
                    backgroundColor: "#F1F5F9",
                    color: "#475569",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 1. PAYMENTS (RAZORPAY) */}
      {/* ======================================================== */}
      {activeTab === "razorpay" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Environment Switcher */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>
                  Environment
                </span>
                <InfoTip content="Toggle between Sandbox (test cards and mock transactions) and Live (real card and UPI charges)." />
              </div>

              <div style={{ display: "flex", backgroundColor: "#F1F5F9", padding: "2px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                <button
                  type="button"
                  onClick={() => updateCategory("razorpay", "mode", "test")}
                  style={{
                    padding: "5px 14px",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    backgroundColor: settings.razorpay.mode === "test" ? "#FFFFFF" : "transparent",
                    color: settings.razorpay.mode === "test" ? "#0F172A" : "#64748B",
                    boxShadow: settings.razorpay.mode === "test" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  Test
                </button>
                <button
                  type="button"
                  onClick={() => updateCategory("razorpay", "mode", "live")}
                  style={{
                    padding: "5px 14px",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    backgroundColor: settings.razorpay.mode === "live" ? "#FFFFFF" : "transparent",
                    color: settings.razorpay.mode === "live" ? "#0F172A" : "#64748B",
                    boxShadow: settings.razorpay.mode === "live" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  Live
                </button>
              </div>
            </div>
          </div>

          {/* Test Credentials Card */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0, color: "#0F172A" }}>Test Credentials</h4>
                <InfoTip content="Keys starting with rzp_test_. Used when environment is set to Test." />
              </div>
              <button
                type="button"
                onClick={() => handleTestConnection("razorpay", "test")}
                disabled={testingConnection["razorpay_test"]}
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                {testingConnection["razorpay_test"] ? "Testing..." : "Test Connection"}
              </button>
            </div>

            {connectionResults["razorpay_test"] && (
              <div style={{ padding: "8px 12px", marginBottom: "14px", borderRadius: "6px", fontSize: "12px", backgroundColor: connectionResults["razorpay_test"].success ? "#F0FDF4" : "#FEF2F2", color: connectionResults["razorpay_test"].success ? "#166534" : "#991B1B", border: `1px solid ${connectionResults["razorpay_test"].success ? "#BBF7D0" : "#FECACA"}` }}>
                {connectionResults["razorpay_test"].message}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Key ID
                  <InfoTip content="Razorpay Test Key ID identifier." />
                </label>
                <input
                  type="text"
                  placeholder="rzp_test_..."
                  value={settings.razorpay.test_key_id}
                  onChange={(e) => updateCategory("razorpay", "test_key_id", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>
                    Key Secret
                    <InfoTip content="Razorpay Test Key Secret used for verifying sandbox API calls." />
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleShowSecret("rzp_test_secret")}
                    style={{ background: "none", border: "none", fontSize: "12px", color: "#2563EB", cursor: "pointer", padding: 0 }}
                  >
                    {showSecrets["rzp_test_secret"] ? "Hide" : "Edit"}
                  </button>
                </div>
                <input
                  type={showSecrets["rzp_test_secret"] ? "text" : "password"}
                  placeholder={settings.razorpay.test_key_secret_masked || "Enter test secret"}
                  value={settings.razorpay.test_key_secret}
                  onChange={(e) => updateCategory("razorpay", "test_key_secret", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>

          {/* Live Credentials Card */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0, color: "#0F172A" }}>Live Credentials</h4>
                <InfoTip content="Keys starting with rzp_live_. Used when environment is set to Live." />
              </div>
              <button
                type="button"
                onClick={() => handleTestConnection("razorpay", "live")}
                disabled={testingConnection["razorpay_live"]}
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                {testingConnection["razorpay_live"] ? "Testing..." : "Test Connection"}
              </button>
            </div>

            {connectionResults["razorpay_live"] && (
              <div style={{ padding: "8px 12px", marginBottom: "14px", borderRadius: "6px", fontSize: "12px", backgroundColor: connectionResults["razorpay_live"].success ? "#F0FDF4" : "#FEF2F2", color: connectionResults["razorpay_live"].success ? "#166534" : "#991B1B", border: `1px solid ${connectionResults["razorpay_live"].success ? "#BBF7D0" : "#FECACA"}` }}>
                {connectionResults["razorpay_live"].message}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Key ID
                  <InfoTip content="Razorpay Live Production Key ID." />
                </label>
                <input
                  type="text"
                  placeholder="rzp_live_..."
                  value={settings.razorpay.live_key_id}
                  onChange={(e) => updateCategory("razorpay", "live_key_id", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>
                    Key Secret
                    <InfoTip content="Razorpay Live Production Key Secret." />
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleShowSecret("rzp_live_secret")}
                    style={{ background: "none", border: "none", fontSize: "12px", color: "#2563EB", cursor: "pointer", padding: 0 }}
                  >
                    {showSecrets["rzp_live_secret"] ? "Hide" : "Edit"}
                  </button>
                </div>
                <input
                  type={showSecrets["rzp_live_secret"] ? "text" : "password"}
                  placeholder={settings.razorpay.live_key_secret_masked || "Enter live secret"}
                  value={settings.razorpay.live_key_secret}
                  onChange={(e) => updateCategory("razorpay", "live_key_secret", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>
                    Webhook Secret
                    <InfoTip content="Used to verify webhook payloads from Razorpay on payments." />
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleShowSecret("rzp_webhook")}
                    style={{ background: "none", border: "none", fontSize: "12px", color: "#2563EB", cursor: "pointer", padding: 0 }}
                  >
                    {showSecrets["rzp_webhook"] ? "Hide" : "Edit"}
                  </button>
                </div>
                <input
                  type={showSecrets["rzp_webhook"] ? "text" : "password"}
                  placeholder={settings.razorpay.webhook_secret_masked || "Enter webhook secret"}
                  value={settings.razorpay.webhook_secret}
                  onChange={(e) => updateCategory("razorpay", "webhook_secret", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>

          {/* Checkout Parameters */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 16px 0", color: "#0F172A" }}>Display & Capture</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Merchant Name
                  <InfoTip content="Brand title rendered on the Razorpay payment modal." />
                </label>
                <input
                  type="text"
                  value={settings.razorpay.merchant_name}
                  onChange={(e) => updateCategory("razorpay", "merchant_name", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Currency
                  <InfoTip content="Billing currency ISO code (default INR)." />
                </label>
                <input
                  type="text"
                  value={settings.razorpay.currency}
                  onChange={(e) => updateCategory("razorpay", "currency", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Auto-Capture
                  <InfoTip content="When enabled, orders are automatically captured upon successful bank authorization." />
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", color: "#334155" }}>
                  <input
                    type="checkbox"
                    checked={settings.razorpay.auto_capture}
                    onChange={(e) => updateCategory("razorpay", "auto_capture", e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#2563EB" }}
                  />
                  <span>Enable auto capture</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. LOGISTICS (SEQUEL 247) */}
      {/* ======================================================== */}
      {activeTab === "sequel" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Mode */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>
                  Logistics Mode
                </span>
                <InfoTip content="Test connects to Sequel's sandbox API. Production books live armored dockets." />
              </div>

              <div style={{ display: "flex", backgroundColor: "#F1F5F9", padding: "2px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                <button
                  type="button"
                  onClick={() => updateCategory("sequel", "mode", "test")}
                  style={{
                    padding: "5px 14px",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    backgroundColor: settings.sequel.mode === "test" ? "#FFFFFF" : "transparent",
                    color: settings.sequel.mode === "test" ? "#0F172A" : "#64748B",
                    boxShadow: settings.sequel.mode === "test" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  Test
                </button>
                <button
                  type="button"
                  onClick={() => updateCategory("sequel", "mode", "prod")}
                  style={{
                    padding: "5px 14px",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    backgroundColor: settings.sequel.mode === "prod" ? "#FFFFFF" : "transparent",
                    color: settings.sequel.mode === "prod" ? "#0F172A" : "#64748B",
                    boxShadow: settings.sequel.mode === "prod" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  Live
                </button>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 16px 0", color: "#0F172A" }}>Account Identifiers</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Client Code
                  <InfoTip content="Corporate client code provided by Sequel 247." />
                </label>
                <input
                  type="text"
                  placeholder="31492"
                  value={settings.sequel.client_code}
                  onChange={(e) => updateCategory("sequel", "client_code", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Store Code
                  <InfoTip content="Fulfillment location store code assigned by Sequel." />
                </label>
                <input
                  type="text"
                  placeholder="PINTARA"
                  value={settings.sequel.store_code}
                  onChange={(e) => updateCategory("sequel", "store_code", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Origin Pincode
                  <InfoTip content="Dispatch workshop or vault pincode." />
                </label>
                <input
                  type="text"
                  placeholder="400001"
                  value={settings.sequel.origin_pincode}
                  onChange={(e) => updateCategory("sequel", "origin_pincode", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>

          {/* Test Environment */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0, color: "#0F172A" }}>Test Environment</h4>
                <InfoTip content="Configuration for Sequel testing sandbox API." />
              </div>
              <button
                type="button"
                onClick={() => handleTestConnection("sequel", "test")}
                disabled={testingConnection["sequel_test"]}
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                {testingConnection["sequel_test"] ? "Testing..." : "Test Connection"}
              </button>
            </div>

            {connectionResults["sequel_test"] && (
              <div style={{ padding: "8px 12px", marginBottom: "14px", borderRadius: "6px", fontSize: "12px", backgroundColor: connectionResults["sequel_test"].success ? "#F0FDF4" : "#FEF2F2", color: connectionResults["sequel_test"].success ? "#166534" : "#991B1B", border: `1px solid ${connectionResults["sequel_test"].success ? "#BBF7D0" : "#FECACA"}` }}>
                {connectionResults["sequel_test"].message}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Endpoint URL
                  <InfoTip content="Sandbox API endpoint base URL." />
                </label>
                <input
                  type="text"
                  value={settings.sequel.test_endpoint}
                  onChange={(e) => updateCategory("sequel", "test_endpoint", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>
                    Access Token
                    <InfoTip content="Sequel test access token key." />
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleShowSecret("sq_test_token")}
                    style={{ background: "none", border: "none", fontSize: "12px", color: "#2563EB", cursor: "pointer", padding: 0 }}
                  >
                    {showSecrets["sq_test_token"] ? "Hide" : "Edit"}
                  </button>
                </div>
                <input
                  type={showSecrets["sq_test_token"] ? "text" : "password"}
                  placeholder={settings.sequel.test_token_masked || "Enter test token"}
                  value={settings.sequel.test_token}
                  onChange={(e) => updateCategory("sequel", "test_token", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>

          {/* Production Environment */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0, color: "#0F172A" }}>Production Environment</h4>
                <InfoTip content="Live production credentials for armored logistics dispatch." />
              </div>
              <button
                type="button"
                onClick={() => handleTestConnection("sequel", "prod")}
                disabled={testingConnection["sequel_prod"]}
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                {testingConnection["sequel_prod"] ? "Testing..." : "Test Connection"}
              </button>
            </div>

            {connectionResults["sequel_prod"] && (
              <div style={{ padding: "8px 12px", marginBottom: "14px", borderRadius: "6px", fontSize: "12px", backgroundColor: connectionResults["sequel_prod"].success ? "#F0FDF4" : "#FEF2F2", color: connectionResults["sequel_prod"].success ? "#166534" : "#991B1B", border: `1px solid ${connectionResults["sequel_prod"].success ? "#BBF7D0" : "#FECACA"}` }}>
                {connectionResults["sequel_prod"].message}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Endpoint URL
                  <InfoTip content="Sequel 247 live production endpoint base URL." />
                </label>
                <input
                  type="text"
                  value={settings.sequel.prod_endpoint}
                  onChange={(e) => updateCategory("sequel", "prod_endpoint", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>
                    Access Token
                    <InfoTip content="Sequel production authorization token." />
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleShowSecret("sq_prod_token")}
                    style={{ background: "none", border: "none", fontSize: "12px", color: "#2563EB", cursor: "pointer", padding: 0 }}
                  >
                    {showSecrets["sq_prod_token"] ? "Hide" : "Edit"}
                  </button>
                </div>
                <input
                  type={showSecrets["sq_prod_token"] ? "text" : "password"}
                  placeholder={settings.sequel.prod_token_masked || "Enter live token"}
                  value={settings.sequel.prod_token}
                  onChange={(e) => updateCategory("sequel", "prod_token", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. EMAIL */}
      {/* ======================================================== */}
      {activeTab === "email" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>
                  Delivery Mode
                </span>
                <InfoTip content="Select Test for sandbox capture (Mailtrap/Log) or Live to send actual emails to patrons." />
              </div>

              <div style={{ display: "flex", backgroundColor: "#F1F5F9", padding: "2px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                <button
                  type="button"
                  onClick={() => updateCategory("email", "mode", "test")}
                  style={{
                    padding: "5px 14px",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    backgroundColor: settings.email.mode === "test" ? "#FFFFFF" : "transparent",
                    color: settings.email.mode === "test" ? "#0F172A" : "#64748B",
                    boxShadow: settings.email.mode === "test" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  Test
                </button>
                <button
                  type="button"
                  onClick={() => updateCategory("email", "mode", "live")}
                  style={{
                    padding: "5px 14px",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    backgroundColor: settings.email.mode === "live" ? "#FFFFFF" : "transparent",
                    color: settings.email.mode === "live" ? "#0F172A" : "#64748B",
                    boxShadow: settings.email.mode === "live" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  Live
                </button>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 16px 0", color: "#0F172A" }}>Server Configuration</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Driver
                  <InfoTip content="Mail delivery protocol: SMTP, Resend, Amazon SES, or local Log." />
                </label>
                <select
                  value={settings.email.driver}
                  onChange={(e) => updateCategory("email", "driver", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                >
                  <option value="smtp">SMTP</option>
                  <option value="resend">Resend API</option>
                  <option value="ses">Amazon SES</option>
                  <option value="log">Log</option>
                </select>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Host
                  <InfoTip content="SMTP host address." />
                </label>
                <input
                  type="text"
                  placeholder="sandbox.smtp.mailtrap.io"
                  value={settings.email.smtp_host}
                  onChange={(e) => updateCategory("email", "smtp_host", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Port
                  <InfoTip content="SMTP port number (587, 465, or 2525)." />
                </label>
                <input
                  type="number"
                  placeholder="2525"
                  value={settings.email.smtp_port}
                  onChange={(e) => updateCategory("email", "smtp_port", parseInt(e.target.value) || 2525)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Encryption
                  <InfoTip content="Transport security type (TLS, SSL, or None)." />
                </label>
                <select
                  value={settings.email.smtp_encryption}
                  onChange={(e) => updateCategory("email", "smtp_encryption", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Username
                  <InfoTip content="SMTP user credentials." />
                </label>
                <input
                  type="text"
                  value={settings.email.smtp_username}
                  onChange={(e) => updateCategory("email", "smtp_username", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>
                    Password
                    <InfoTip content="SMTP authentication password." />
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleShowSecret("mail_pass")}
                    style={{ background: "none", border: "none", fontSize: "12px", color: "#2563EB", cursor: "pointer", padding: 0 }}
                  >
                    {showSecrets["mail_pass"] ? "Hide" : "Edit"}
                  </button>
                </div>
                <input
                  type={showSecrets["mail_pass"] ? "text" : "password"}
                  placeholder={settings.email.smtp_password_masked || "Enter password"}
                  value={settings.email.smtp_password}
                  onChange={(e) => updateCategory("email", "smtp_password", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              {settings.email.driver === "resend" && (
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>
                      Resend API Key
                      <InfoTip content="Resend production API key starting with re_." />
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleShowSecret("resend_key")}
                      style={{ background: "none", border: "none", fontSize: "12px", color: "#2563EB", cursor: "pointer", padding: 0 }}
                    >
                      {showSecrets["resend_key"] ? "Hide" : "Edit"}
                    </button>
                  </div>
                  <input
                    type={showSecrets["resend_key"] ? "text" : "password"}
                    placeholder={settings.email.resend_api_key_masked || "re_..."}
                    value={settings.email.resend_api_key}
                    onChange={(e) => updateCategory("email", "resend_api_key", e.target.value)}
                    style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  From Address
                  <InfoTip content="Sender email address displayed to recipients." />
                </label>
                <input
                  type="email"
                  value={settings.email.from_address}
                  onChange={(e) => updateCategory("email", "from_address", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  From Name
                  <InfoTip content="Sender brand name displayed in inboxes." />
                </label>
                <input
                  type="text"
                  value={settings.email.from_name}
                  onChange={(e) => updateCategory("email", "from_name", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SUBSCRIPTIONS (PABBLY) */}
      {/* ======================================================== */}
      {activeTab === "pabbly" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>
                  Pabbly Integration
                </span>
                <InfoTip content="Automates recurring billing and membership plans via Pabbly Subscriptions." />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", color: "#334155" }}>
                  <input
                    type="checkbox"
                    checked={settings.pabbly.is_enabled}
                    onChange={(e) => updateCategory("pabbly", "is_enabled", e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#2563EB" }}
                  />
                  <span>Enable</span>
                </label>

                <div style={{ display: "flex", backgroundColor: "#F1F5F9", padding: "2px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                  <button
                    type="button"
                    onClick={() => updateCategory("pabbly", "mode", "test")}
                    style={{
                      padding: "5px 12px",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      backgroundColor: settings.pabbly.mode === "test" ? "#FFFFFF" : "transparent",
                      color: settings.pabbly.mode === "test" ? "#0F172A" : "#64748B",
                      boxShadow: settings.pabbly.mode === "test" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    Test
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCategory("pabbly", "mode", "live")}
                    style={{
                      padding: "5px 12px",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      backgroundColor: settings.pabbly.mode === "live" ? "#FFFFFF" : "transparent",
                      color: settings.pabbly.mode === "live" ? "#0F172A" : "#64748B",
                      boxShadow: settings.pabbly.mode === "live" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    Live
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0, color: "#0F172A" }}>Credentials</h4>
                <InfoTip content="Pabbly Subscriptions API keys and configuration." />
              </div>
              <button
                type="button"
                onClick={() => handleTestConnection("pabbly", settings.pabbly.mode)}
                disabled={testingConnection[`pabbly_${settings.pabbly.mode}`]}
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                {testingConnection[`pabbly_${settings.pabbly.mode}`] ? "Validating..." : "Validate"}
              </button>
            </div>

            {connectionResults[`pabbly_${settings.pabbly.mode}`] && (
              <div style={{ padding: "8px 12px", marginBottom: "14px", borderRadius: "6px", fontSize: "12px", backgroundColor: connectionResults[`pabbly_${settings.pabbly.mode}`].success ? "#F0FDF4" : "#FEF2F2", color: connectionResults[`pabbly_${settings.pabbly.mode}`].success ? "#166534" : "#991B1B", border: `1px solid ${connectionResults[`pabbly_${settings.pabbly.mode}`].success ? "#BBF7D0" : "#FECACA"}` }}>
                {connectionResults[`pabbly_${settings.pabbly.mode}`].message}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>
                    API Key
                    <InfoTip content="Pabbly Subscriptions API Key." />
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleShowSecret("pb_api_key")}
                    style={{ background: "none", border: "none", fontSize: "12px", color: "#2563EB", cursor: "pointer", padding: 0 }}
                  >
                    {showSecrets["pb_api_key"] ? "Hide" : "Edit"}
                  </button>
                </div>
                <input
                  type={showSecrets["pb_api_key"] ? "text" : "password"}
                  placeholder={settings.pabbly.api_key_masked || "Enter API Key"}
                  value={settings.pabbly.api_key}
                  onChange={(e) => updateCategory("pabbly", "api_key", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>
                    Secret Key
                    <InfoTip content="Pabbly Subscriptions Secret Key." />
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleShowSecret("pb_secret")}
                    style={{ background: "none", border: "none", fontSize: "12px", color: "#2563EB", cursor: "pointer", padding: 0 }}
                  >
                    {showSecrets["pb_secret"] ? "Hide" : "Edit"}
                  </button>
                </div>
                <input
                  type={showSecrets["pb_secret"] ? "text" : "password"}
                  placeholder={settings.pabbly.secret_key_masked || "Enter Secret Key"}
                  value={settings.pabbly.secret_key}
                  onChange={(e) => updateCategory("pabbly", "secret_key", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Webhook URL
                  <InfoTip content="Endpoint where Pabbly delivers billing events." />
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={settings.pabbly.webhook_url}
                  onChange={(e) => updateCategory("pabbly", "webhook_url", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Default Plan ID
                  <InfoTip content="Identifier of active jewelry plan in Pabbly." />
                </label>
                <input
                  type="text"
                  placeholder="plan_..."
                  value={settings.pabbly.product_id}
                  onChange={(e) => updateCategory("pabbly", "product_id", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SMS & WHATSAPP */}
      {/* ======================================================== */}
      {activeTab === "sms" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>
                  Notifications Gateway
                </span>
                <InfoTip content="Dispatches OTP and status updates via SMS and WhatsApp." />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", color: "#334155" }}>
                  <input
                    type="checkbox"
                    checked={settings.sms.is_enabled}
                    onChange={(e) => updateCategory("sms", "is_enabled", e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#2563EB" }}
                  />
                  <span>Enable</span>
                </label>

                <div style={{ display: "flex", backgroundColor: "#F1F5F9", padding: "2px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                  <button
                    type="button"
                    onClick={() => updateCategory("sms", "mode", "test")}
                    style={{
                      padding: "5px 12px",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      backgroundColor: settings.sms.mode === "test" ? "#FFFFFF" : "transparent",
                      color: settings.sms.mode === "test" ? "#0F172A" : "#64748B",
                      boxShadow: settings.sms.mode === "test" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    Test
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCategory("sms", "mode", "live")}
                    style={{
                      padding: "5px 12px",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      backgroundColor: settings.sms.mode === "live" ? "#FFFFFF" : "transparent",
                      color: settings.sms.mode === "live" ? "#0F172A" : "#64748B",
                      boxShadow: settings.sms.mode === "live" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    Live
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 16px 0", color: "#0F172A" }}>Gateway Provider</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Provider
                  <InfoTip content="Select SMS/WhatsApp communication gateway." />
                </label>
                <select
                  value={settings.sms.provider}
                  onChange={(e) => updateCategory("sms", "provider", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                >
                  <option value="twilio">Twilio</option>
                  <option value="meta">Meta WhatsApp Cloud</option>
                  <option value="gupshup">Gupshup</option>
                  <option value="fast2sms">Fast2SMS</option>
                </select>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Account SID / API Key
                  <InfoTip content="Provider identification key or Account SID." />
                </label>
                <input
                  type="text"
                  placeholder="AC..."
                  value={settings.sms.account_sid}
                  onChange={(e) => updateCategory("sms", "account_sid", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>
                    Auth Token
                    <InfoTip content="Provider authentication token or secret." />
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleShowSecret("sms_auth")}
                    style={{ background: "none", border: "none", fontSize: "12px", color: "#2563EB", cursor: "pointer", padding: 0 }}
                  >
                    {showSecrets["sms_auth"] ? "Hide" : "Edit"}
                  </button>
                </div>
                <input
                  type={showSecrets["sms_auth"] ? "text" : "password"}
                  placeholder={settings.sms.auth_token_masked || "Enter token"}
                  value={settings.sms.auth_token}
                  onChange={(e) => updateCategory("sms", "auth_token", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Sender ID / Number
                  <InfoTip content="Approved SMS sender ID or WhatsApp registered phone number." />
                </label>
                <input
                  type="text"
                  placeholder="+14155238886"
                  value={settings.sms.sender_number}
                  onChange={(e) => updateCategory("sms", "sender_number", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. GENERAL PREFERENCES */}
      {/* ======================================================== */}
      {activeTab === "atelier" && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "20px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 16px 0", color: "#0F172A" }}>Store & Pricing Parameters</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                Brand Name
                <InfoTip content="Official name printed on order invoices and client certificates." />
              </label>
              <input
                type="text"
                value={settings.atelier.brand_name}
                onChange={(e) => updateCategory("atelier", "brand_name", e.target.value)}
                style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Operating Currency
                  <InfoTip content="Base currency format for storefront and administration." />
                </label>
                <input
                  type="text"
                  value={settings.atelier.currency}
                  onChange={(e) => updateCategory("atelier", "currency", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  GST Rate (%)
                  <InfoTip content="Applicable GST rate on fine jewelry and precious metals (Standard in India is 3%)." />
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.atelier.gst_percent}
                  onChange={(e) => updateCategory("atelier", "gst_percent", parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Default Wastage (%)
                  <InfoTip content="Default metal making loss percentage applied when calculating dynamic jewelry prices." />
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.atelier.default_wastage_percent}
                  onChange={(e) => updateCategory("atelier", "default_wastage_percent", parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Support Email
                  <InfoTip content="Official concierge email address shown on client receipts." />
                </label>
                <input
                  type="email"
                  value={settings.atelier.support_email}
                  onChange={(e) => updateCategory("atelier", "support_email", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                  Support Phone
                  <InfoTip content="Concierge desk contact phone number." />
                </label>
                <input
                  type="text"
                  value={settings.atelier.support_phone}
                  onChange={(e) => updateCategory("atelier", "support_phone", e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                Physical Workshop Address
                <InfoTip content="Workshop and flagship atelier address printed on official invoices." />
              </label>
              <input
                type="text"
                value={settings.atelier.address}
                onChange={(e) => updateCategory("atelier", "address", e.target.value)}
                style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
