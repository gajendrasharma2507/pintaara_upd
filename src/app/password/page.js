"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password.trim() === "1") {
      localStorage.setItem("pintaara_unlocked", "1");
      document.cookie = "pintaara_unlocked=1; path=/; max-age=2592000";
      router.push("/");
    } else {
      setError("Incorrect atelier passcode. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#14120F] text-[#F5EDE4] flex items-center justify-center p-4 selection:bg-[#C9A961] selection:text-[#1C1814]">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A961]/5 rounded-full blur-[140px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#1D1915]/95 border border-[#C9A961]/30 rounded-2xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#27221C] border border-[#C9A961]/40 shadow-inner">
            <span className="font-serif text-[#C9A961] font-bold text-2xl tracking-widest">P</span>
          </div>
          
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.25em] text-[#F5EDE4] uppercase">
              PINTAARA
            </h1>
            <p className="text-[11px] font-sans tracking-[0.3em] text-[#C9A961] uppercase mt-1 font-medium">
              Fine Jewelry Atelier
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3 text-[#C9A961]/40">
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#C9A961]/40"></span>
          <span className="text-xs">✦</span>
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#C9A961]/40"></span>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wider uppercase text-[#E8DFD3]">
            Private Access
          </h2>
          <p className="text-xs text-[#A69D92] leading-relaxed max-w-xs mx-auto">
            Please enter your exclusive atelier passcode to enter the boutique.
          </p>
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
              className="w-full px-4 py-3.5 bg-[#14120F]/80 border border-[#3D362F] focus:border-[#C9A961] rounded-xl text-center text-lg font-mono text-[#F5EDE4] placeholder:text-[#6E665D] placeholder:font-sans placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A961] transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A69D92] hover:text-[#C9A961] p-1 uppercase tracking-wider"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 py-2 px-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#C9A961] via-[#DFCA8E] to-[#C9A961] text-[#1C1814] font-semibold text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(201,169,97,0.25)]"
          >
            Enter Atelier
          </button>
        </form>

        <div className="pt-4 border-t border-[#2E2822] text-[11px] text-[#7A7268] flex items-center justify-center space-x-2">
          <span>Security Protected</span>
          <span>·</span>
          <span className="italic font-serif text-[#C9A961]/70">Pintaara Haute Joaillerie</span>
        </div>
      </div>
    </div>
  );
}
