"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { safeStorage } from "@/lib/storage";
import api from "@/lib/api";

export default function PasswordGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.startsWith("/admin");
  const isPasswordPage = pathname === "/password" || pathname?.startsWith("/password");
  const isHome = pathname === "/" || pathname === "";
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showGateOnHome, setShowGateOnHome] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const checkLocalUnlocked = () => {
    const unlocked = safeStorage.getItem("pintaara_unlocked");
    const expiresAt = Number(safeStorage.getItem("pintaara_unlocked_expires_at") || "0");
    if (unlocked === "1" && expiresAt > Date.now()) {
      return true;
    }
    if (typeof document !== "undefined" && document.cookie.split(";").some((c) => c.trim().startsWith("pintaara_unlocked=1"))) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Listen for custom trigger to open password gate from homepage enter screen
    const handleOpenGate = () => {
      if (checkLocalUnlocked()) {
        setIsUnlocked(true);
        setShowGateOnHome(false);
        return;
      }
      setShowGateOnHome(true);
    };

    const handleUnlockedEvent = () => {
      setIsUnlocked(true);
      setShowGateOnHome(false);
      setLoading(false);
    };

    window.addEventListener("pintaara_open_password_gate", handleOpenGate);
    window.addEventListener("pintaara_unlocked", handleUnlockedEvent);
    window.addEventListener("storage", handleUnlockedEvent);
    return () => {
      window.removeEventListener("pintaara_open_password_gate", handleOpenGate);
      window.removeEventListener("pintaara_unlocked", handleUnlockedEvent);
      window.removeEventListener("storage", handleUnlockedEvent);
    };
  }, []);

  useEffect(() => {
    // Close modal on Escape if opened over home
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isHome && showGateOnHome) {
        setShowGateOnHome(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHome, showGateOnHome]);

  useEffect(() => {
    // If navigating to /admin, don't lock
    if (isAdmin || (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"))) {
      setIsUnlocked(true);
      setLoading(false);
      return;
    }

    // Fast path: if already unlocked within the 24-hour window, unlock immediately without re-prompting
    if (checkLocalUnlocked()) {
      setIsUnlocked(true);
      setShowGateOnHome(false);
      setLoading(false);
      const expiresAt = Number(safeStorage.getItem("pintaara_unlocked_expires_at") || "0");
      if (expiresAt > Date.now()) {
        const timer = setTimeout(() => {
          safeStorage.removeItem("pintaara_unlocked");
          safeStorage.removeItem("pintaara_unlocked_expires_at");
          try {
            document.cookie = "pintaara_unlocked=; path=/; max-age=0";
          } catch (err) { }
          setIsUnlocked(false);
        }, expiresAt - Date.now());
        return () => clearTimeout(timer);
      }
      return;
    }

    let isCancelled = false;
    api.getStorefrontPasscodeStatus().then((res) => {
      if (isCancelled) return;
      if (res && res.enabled === false) {
        setIsUnlocked(true);
        setLoading(false);
        return;
      }

      if (checkLocalUnlocked()) {
        setIsUnlocked(true);
        setLoading(false);
      } else {
        // 24 hours elapsed or not unlocked — require entering passcode
        safeStorage.removeItem("pintaara_unlocked");
        safeStorage.removeItem("pintaara_unlocked_expires_at");
        try {
          document.cookie = "pintaara_unlocked=; path=/; max-age=0";
        } catch (err) { }
        setIsUnlocked(false);
        setLoading(false);
      }
    }).catch(() => {
      if (isCancelled) return;
      setIsUnlocked(checkLocalUnlocked());
      setLoading(false);
    });

    return () => { isCancelled = true; };
  }, [isAdmin, pathname]);

  // Immediately render admin or password page without any password gate or spinner
  if (isAdmin || isPasswordPage) {
    return <>{children}</>;
  }

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
      // Verify passcode against dynamic backend setting
      const res = await api.verifyStorefrontPasscode(val);
      if (res && res.success) {
        const expiresInSec = res.expires_in || 86400; // 24 hours
        const expiresAt = Date.now() + expiresInSec * 1000;

        safeStorage.setItem("pintaara_unlocked", "1");
        safeStorage.setItem("pintaara_unlocked_expires_at", String(expiresAt));

        try {
          const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
          document.cookie = `pintaara_unlocked=1; path=/; max-age=${expiresInSec}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        } catch (err) { }

        setIsUnlocked(true);
        setShowGateOnHome(false);

        // Notify that storefront has been unlocked
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("pintaara_unlocked"));
        }
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

  if (loading) {
    if (isAdmin || isHome || isPasswordPage) {
      return <>{children}</>;
    }
    return (
      <div style={styles.overlay}>
        <div style={styles.spinner}></div>
        <style>{spinnerAnim}</style>
      </div>
    );
  }

  if (!isUnlocked) {
    if (isPasswordPage) {
      return <>{children}</>;
    }

    // On home, only display the password popup when triggered from the ENTER screen
    if (isHome && !showGateOnHome) {
      return <>{children}</>;
    }

    return (
      <>
        {/* Blurred site preview behind the gate */}
        <div style={styles.blurredBg}>
          {children}
        </div>

        {/* Frosted overlay */}
        <div
          style={styles.overlay}
          onClick={() => {
            if (isHome) setShowGateOnHome(false);
          }}
        >
          {/* Ambient glow */}
          <div style={styles.glowOrb}></div>

          {/* Card */}
          <div style={styles.card} onClick={(e) => e.stopPropagation()}>
            {/* Close button if on home */}
            {isHome && (
              <button
                type="button"
                onClick={() => setShowGateOnHome(false)}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: "none",
                  border: "none",
                  color: "#A69D92",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "4px 8px",
                  lineHeight: 1,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#A69D92")}
                aria-label="Close"
              >
                ✕
              </button>
            )}
            {/* Logo Lockup */}
            <div style={styles.logoWrap}>
              <img
                src="/images/logo-lockup.png"
                alt="PINTAARA"
                style={{
                  width: "220px",
                  maxWidth: "85%",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto",
                }}
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

  /* ── Content Container (No Box / No Card Background) ── */
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "380px",
    background: "transparent",
    border: "none",
    borderRadius: "0",
    padding: "0",
    boxShadow: "none",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  /* ── Logo Lockup ── */
  logoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 0 2px 0",
  },
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
    transition: "filter 0.2s, transform 0.1s",
    boxShadow: "0 6px 30px rgba(212,172,100,0.35)",
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
