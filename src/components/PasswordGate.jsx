"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { safeStorage } from "@/lib/storage";

export default function PasswordGate({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // If navigating to /admin or /password, don't lock
    if (isAdmin || (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"))) {
      setIsUnlocked(true);
      setLoading(false);
      return;
    }
    const unlocked = safeStorage.getItem("pintaara_unlocked");
    if (unlocked === "1") {
      setIsUnlocked(true);
    }
    setLoading(false);
  }, [isAdmin]);

  // Immediately render admin without any password gate or spinner
  if (isAdmin) {
    return <>{children}</>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const val = password.trim();
    if (val.toLowerCase() === "admin") {
      // Redirect directly to internal frontend admin panel
      window.location.href = "/admin";
    } else {
      safeStorage.setItem("pintaara_unlocked", "1");
      try {
        document.cookie = "pintaara_unlocked=1; path=/; max-age=2592000";
      } catch (err) {}
      setIsUnlocked(true);
    }
  };

  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.spinner}></div>
        <style>{spinnerAnim}</style>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <>
        {/* Blurred site preview behind the gate */}
        <div style={styles.blurredBg}>
          {children}
        </div>

        {/* Frosted overlay */}
        <div style={styles.overlay}>
          {/* Ambient glow */}
          <div style={styles.glowOrb}></div>

          {/* Card */}
          <div style={styles.card}>
            {/* Emblem */}
            <div style={styles.emblemWrap}>
              <div style={styles.emblem}>
                <span style={styles.emblemLetter}>P</span>
              </div>
              <div>
                <h1 style={styles.brandName}>PINTAARA</h1>
                <p style={styles.brandTagline}>Fine Jewelry Atelier</p>
              </div>
            </div>

            {/* Divider */}
            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerDiamond}>✦</span>
              <span style={styles.dividerLine}></span>
            </div>

            {/* Heading */}
            <div style={styles.headingWrap}>
              <h2 style={styles.heading}>Private Access</h2>
              <p style={styles.subheading}>
                Please enter your exclusive atelier passcode to enter the boutique.
              </p>
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
                  onFocus={(e) => {
                    e.target.style.borderColor = "#C9A961";
                    e.target.style.boxShadow = "0 0 0 2px rgba(201,169,97,0.18)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#3D362F";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.showToggle}
                  onMouseEnter={(e) => (e.target.style.color = "#C9A961")}
                  onMouseLeave={(e) => (e.target.style.color = "#A69D92")}
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
                style={styles.submitBtn}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
              >
                Enter Atelier
              </button>
            </form>

            {/* Footer */}
            <div style={styles.footer}>
              <span>Security Protected</span>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>·</span>
              <span style={{ fontStyle: "italic", fontFamily: "Cormorant Garamond, serif", color: "rgba(201,169,97,0.75)" }}>
                Pintaara Haute Joaillerie
              </span>
            </div>
          </div>
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
          @keyframes pintSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  return <>{children}</>;
}

const spinnerAnim = `@keyframes pintSpin { to { transform: rotate(360deg); } }`;

const styles = {
  /* ── Blurred bg behind gate ── */
  blurredBg: {
    position: "fixed",
    inset: 0,
    zIndex: 99990,
    filter: "blur(18px) brightness(0.45)",
    pointerEvents: "none",
    overflow: "hidden",
    transform: "scale(1.04)", // prevent blur edge bleed
  },

  /* ── Dark frosted overlay ── */
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    background: "rgba(14,11,9,0.72)",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    fontFamily: "'Avenir Next', sans-serif",
  },

  /* ── Ambient glow orb ── */
  glowOrb: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "560px",
    height: "560px",
    background: "radial-gradient(circle, rgba(201,169,97,0.09) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },

  /* ── Card ── */
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "420px",
    background: "rgba(29,25,21,0.96)",
    border: "1px solid rgba(201,169,97,0.3)",
    borderRadius: "20px",
    padding: "40px 36px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(201,169,97,0.08)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },

  /* ── Emblem row ── */
  emblemWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
  },
  emblem: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2A2218 0%, #1C1814 100%)",
    border: "1px solid rgba(201,169,97,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,169,97,0.1)",
  },
  emblemLetter: {
    fontFamily: "Bodoni Moda, Cormorant Garamond, serif",
    fontSize: "26px",
    fontWeight: 700,
    color: "#C9A961",
    letterSpacing: "0.05em",
  },
  brandName: {
    fontFamily: "Bodoni Moda, Cormorant Garamond, serif",
    fontSize: "26px",
    fontWeight: 700,
    letterSpacing: "0.28em",
    color: "#F5EDE4",
    textTransform: "uppercase",
    margin: 0,
  },
  brandTagline: {
    fontSize: "10px",
    letterSpacing: "0.32em",
    color: "#C9A961",
    textTransform: "uppercase",
    fontWeight: 500,
    marginTop: "4px",
  },

  /* ── Divider ── */
  divider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "rgba(201,169,97,0.4)",
  },
  dividerLine: {
    display: "block",
    height: "1px",
    width: "44px",
    background: "linear-gradient(90deg, transparent, rgba(201,169,97,0.4))",
  },
  dividerDiamond: {
    fontSize: "10px",
  },

  /* ── Heading ── */
  headingWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  heading: {
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#E8DFD3",
    margin: 0,
  },
  subheading: {
    fontSize: "12px",
    color: "#A69D92",
    lineHeight: 1.7,
    maxWidth: "280px",
    margin: "0 auto",
  },

  /* ── Form ── */
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  inputWrap: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "14px 56px 14px 16px",
    background: "rgba(14,12,9,0.7)",
    border: "1px solid #3D362F",
    borderRadius: "12px",
    textAlign: "center",
    fontSize: "18px",
    fontFamily: "monospace",
    color: "#F5EDE4",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    letterSpacing: "0.15em",
  },
  showToggle: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "10px",
    color: "#A69D92",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontFamily: "'Avenir Next', sans-serif",
    transition: "color 0.2s",
    padding: "4px",
  },
  errorMsg: {
    fontSize: "12px",
    color: "#f87171",
    background: "rgba(127,29,29,0.25)",
    border: "1px solid rgba(127,29,29,0.5)",
    borderRadius: "10px",
    padding: "10px 14px",
    margin: 0,
  },
  submitBtn: {
    width: "100%",
    padding: "14px 24px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #C9A961 0%, #DFCA8E 50%, #C9A961 100%)",
    color: "#1C1814",
    border: "none",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    fontFamily: "'Avenir Next', sans-serif",
    transition: "filter 0.2s, transform 0.1s",
    boxShadow: "0 4px 24px rgba(201,169,97,0.28), 0 1px 0 rgba(255,255,255,0.15) inset",
  },

  /* ── Footer ── */
  footer: {
    fontSize: "11px",
    color: "#7A7268",
    borderTop: "1px solid #2E2822",
    paddingTop: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Loading spinner ── */
  spinner: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "2px solid rgba(201,169,97,0.2)",
    borderTopColor: "#C9A961",
    animation: "pintSpin 0.75s linear infinite",
  },
};
