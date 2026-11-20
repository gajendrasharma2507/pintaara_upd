"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { safeStorage, safeSessionStorage } from "@/lib/storage";
import api from "@/lib/api";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.getStorefrontPasscodeStatus().then((res) => {
      if (res && res.enabled === false) {
        safeStorage.setItem("pintaara_unlocked", "1");
        router.replace("/");
        return;
      }
      const unlocked = safeStorage.getItem("pintaara_unlocked");
      const expiresAt = Number(safeStorage.getItem("pintaara_unlocked_expires_at") || "0");
      if (unlocked === "1" && expiresAt > Date.now()) {
        router.replace("/");
      }
    }).catch(() => {
      const unlocked = safeStorage.getItem("pintaara_unlocked");
      const expiresAt = Number(safeStorage.getItem("pintaara_unlocked_expires_at") || "0");
      if (unlocked === "1" && expiresAt > Date.now()) {
        router.replace("/");
      }
    });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const val = password.trim();
    if (!val) {
      setError("Please enter passcode.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.verifyStorefrontPasscode(val);
      if (res && res.success) {
        const expiresInSec = res.expires_in || 86400; // 24 hours
        const expiresAt = Date.now() + expiresInSec * 1000;

        safeStorage.setItem("pintaara_unlocked", "1");
        safeStorage.setItem("pintaara_unlocked_expires_at", String(expiresAt));
        safeStorage.setItem("pintaara_entered", "true");
        safeSessionStorage.setItem("pintaara_entered", "true");

        try {
          const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
          document.cookie = `pintaara_unlocked=1; path=/; max-age=${expiresInSec}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        } catch (err) {}

        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const redirectUrl = urlParams?.get("redirect") || "/";
        router.push(redirectUrl);
      } else {
        throw new Error(res?.message || "Incorrect passcode.");
      }
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setError(err?.message || "Incorrect PINTAARA passcode. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Ambient background glow */}
      <div style={styles.glowOrb} />

      {/* Card container */}
      <div style={styles.card}>
        {/* Logo Lockup */}
        <div style={styles.logoWrap}>
          <img
            src="/images/logo-lockup.png"
            alt="PINTAARA"
            style={styles.logoImg}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrap}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode"
              autoFocus
              required
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.showToggle}
              onMouseEnter={(e) => (e.target.style.color = "#C9A961")}
              onMouseLeave={(e) => (e.target.style.color = "#8E847A")}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <p style={{ ...styles.errorMsg, animation: shake ? "pintShake 0.5s ease" : "none" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitBtn,
              opacity: submitting ? 0.75 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.filter = "brightness(1.12)";
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.currentTarget.style.filter = "brightness(1)";
            }}
          >
            {submitting ? "VERIFYING..." : "ENTER"}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes pintShake {
          0%,100%{transform:translateX(0)}
          15%{transform:translateX(-6px)}
          30%{transform:translateX(6px)}
          45%{transform:translateX(-4px)}
          60%{transform:translateX(4px)}
          75%{transform:translateX(-2px)}
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#14120F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    fontFamily: "'Avenir Next', sans-serif",
  },
  glowOrb: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(201,169,97,0.08) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "380px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    margin: "0 auto",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 0 2px 0",
  },
  logoImg: {
    width: "220px",
    maxWidth: "85%",
    height: "auto",
    objectFit: "contain",
    display: "block",
    margin: "0 auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    width: "100%",
  },
  inputWrap: {
    position: "relative",
    width: "100%",
  },
  input: {
    width: "100%",
    padding: "16px 64px 16px 24px",
    background: "#181512",
    border: "none",
    borderRadius: "9999px",
    textAlign: "center",
    fontSize: "15px",
    fontFamily: "monospace",
    color: "#F5EDE4",
    outline: "none",
    boxSizing: "border-box",
    letterSpacing: "0.14em",
  },
  showToggle: {
    position: "absolute",
    right: "22px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "11px",
    color: "#8E847A",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    fontFamily: "'Avenir Next', sans-serif",
    transition: "color 0.2s",
    padding: "4px",
  },
  errorMsg: {
    fontSize: "12px",
    color: "#f87171",
    background: "rgba(127,29,29,0.25)",
    border: "1px solid rgba(127,29,29,0.5)",
    borderRadius: "16px",
    padding: "10px 14px",
    margin: 0,
    fontFamily: "'Avenir Next', sans-serif",
  },
  submitBtn: {
    width: "100%",
    padding: "16px 24px",
    borderRadius: "9999px",
    background: "linear-gradient(180deg, #E6C88A 0%, #D4AC64 100%)",
    color: "#181410",
    border: "none",
    cursor: "pointer",
    fontSize: "11.5px",
    fontWeight: 600,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    fontFamily: "'Avenir Next', sans-serif",
    boxShadow: "0 6px 30px rgba(212,172,100,0.35)",
    transition: "filter 0.2s, transform 0.1s",
    boxSizing: "border-box",
  },
};
