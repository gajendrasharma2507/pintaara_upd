"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { safeStorage, safeSessionStorage } from "@/lib/storage";
import api from "@/lib/api";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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

        router.push("/");
      } else {
        throw new Error(res?.message || "Incorrect passcode.");
      }
    } catch (err) {
      setError(err?.message || "Incorrect PINTAARA passcode. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14120F] text-[#F5EDE4] flex items-center justify-center p-4 selection:bg-[#C9A961] selection:text-[#1C1814]">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A961]/5 rounded-full blur-[140px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm text-center space-y-6">
        <div className="flex items-center justify-center py-2">
          <img
            src="/images/logo-lockup.png"
            alt="PINTAARA"
            className="w-56 max-w-[85%] h-auto object-contain mx-auto"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode"
              autoFocus
              required
              className="w-full px-6 py-4 bg-[#181512] rounded-full text-center text-sm font-mono text-[#F5EDE4] placeholder:text-[#6E665D] placeholder:font-sans placeholder:text-xs focus:outline-none transition-all tracking-wider"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] text-[#8E847A] hover:text-[#C9A961] uppercase tracking-wider"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 py-2 px-3 rounded-full">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-full bg-gradient-to-b from-[#E6C88A] to-[#D4AC64] text-[#181410] font-semibold text-xs uppercase tracking-[0.22em] hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_6px_30px_rgba(212,172,100,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? "VERIFYING..." : "ENTER"}
          </button>
        </form>
      </div>
    </div>
  );
}
