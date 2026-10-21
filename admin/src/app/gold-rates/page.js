"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import adminApi, { API_BASE_URL } from "@/lib/api";

const AARAV_BCAST_URL = "https://bcast.aaravbullion.in/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/aarav";

export default function AdminGoldRatesPage() {
  const [ratesData, setRatesData] = useState(null);
  const [liveStreamItems, setLiveStreamItems] = useState([]);
  const [tickerItems, setTickerItems] = useState({ gold: null, silver: null, usd: null });
  const [ticks, setTicks] = useState({}); // { [id]: 'up' | 'down' }
  const [activeTab, setActiveTab] = useState("gold"); // 'gold' | 'silver' | 'matrix' | 'rules' | 'history'
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'grid'
  const [currentTime, setCurrentTime] = useState("");
  const [lastTickTime, setLastTickTime] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Admin pricing rule inputs
  const [goldOffsetInput, setGoldOffsetInput] = useState("0");
  const [silverOffsetInput, setSilverOffsetInput] = useState("0");
  const [goldFloorInput, setGoldFloorInput] = useState("0");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // References to preserve previous values for tick comparison
  const prevItemsRef = useRef({});
  const tickTimeoutsRef = useRef({});

  // 1. Digital Clock (IST)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " IST"
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Parse Raw Aarav Bullion Stream
  const parseAaravStream = useCallback((rawText) => {
    if (!rawText || typeof rawText !== "string") return null;
    const lines = rawText.trim().split(/\r?\n/);
    const parsed = [];
    const ticker = { gold: null, silver: null, usd: null };

    lines.forEach((line) => {
      const rawCols = line.split("\t");
      const cols = rawCols.map((c) => c.trim()).filter((c) => c !== "");
      if (cols.length < 3) return;

      const rowId = cols[0];
      const name = cols[1];
      if (!name || name === "-") return;

      const bidRaw = parseFloat(cols[2]?.replace(/,/g, "")) || 0;
      const askRaw = cols[3] ? parseFloat(cols[3].replace(/,/g, "")) : bidRaw;
      const highRaw = cols[4] ? parseFloat(cols[4].replace(/,/g, "")) : 0;
      const lowRaw = cols[5] ? parseFloat(cols[5].replace(/,/g, "")) : 0;
      const price = askRaw > 0 ? askRaw : bidRaw;

      if (price <= 0) return;

      // Identify category & unit
      let category = "gold";
      let unit = "10 Grams";
      if (/silver/i.test(name)) {
        category = "silver";
        unit = /peti/i.test(name) ? "30kg Peti" : /1kg/i.test(name) ? "1 Kilogram" : "Troy Oz ($)";
      } else if (/usd/i.test(name) || /inr/i.test(name)) {
        category = "forex";
        unit = "Forex";
      } else if (/gold\(\$\)/i.test(name)) {
        category = "international";
        unit = "Troy Oz ($)";
      }

      const item = {
        id: rowId,
        name,
        bid: bidRaw,
        ask: askRaw,
        high: highRaw,
        low: lowRaw,
        price,
        category,
        unit,
      };

      if (rowId === "2124" || /gold\(\$\)/i.test(name)) {
        ticker.gold = item;
      } else if (rowId === "2125" || (/silver/i.test(name) && category === "silver" && bidRaw < 500)) {
        ticker.silver = item;
      } else if (rowId === "2126" || /usd/i.test(name)) {
        ticker.usd = item;
      } else {
        parsed.push(item);
      }
    });

    return { items: parsed, ticker };
  }, []);

  // 3. Fast Tick Evaluator
  const updateWithParsedData = useCallback((items, ticker) => {
    const newTicks = {};

    // Check ticker ticks
    ["gold", "silver", "usd"].forEach((key) => {
      const it = ticker[key];
      if (!it) return;
      const prev = prevItemsRef.current[it.id];
      if (prev && prev.price !== it.price) {
        newTicks[it.id] = it.price > prev.price ? "up" : "down";
      }
      prevItemsRef.current[it.id] = it;
    });

    // Check commodities ticks
    items.forEach((it) => {
      const prev = prevItemsRef.current[it.id];
      if (prev && prev.price !== it.price) {
        newTicks[it.id] = it.price > prev.price ? "up" : "down";
      }
      prevItemsRef.current[it.id] = it;
    });

    setLiveStreamItems(items);
    setTickerItems(ticker);
    setLastTickTime(new Date());
    setIsLiveConnected(true);

    if (Object.keys(newTicks).length > 0) {
      setTicks((prev) => ({ ...prev, ...newTicks }));

      // Clear tick colors after 1200ms
      Object.keys(newTicks).forEach((id) => {
        if (tickTimeoutsRef.current[id]) {
          clearTimeout(tickTimeoutsRef.current[id]);
        }
        tickTimeoutsRef.current[id] = setTimeout(() => {
          setTicks((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }, 1200);
      });
    }
  }, []);

  // 4. Poll Live Broadcast Directly from Aarav Bullion (Real-time 1.8s pulse)
  const pollAaravBroadcast = useCallback(async () => {
    try {
      const ts = Date.now();
      const res = await fetch(`${AARAV_BCAST_URL}?_=${ts}`, {
        headers: { Accept: "text/plain, */*", "Cache-Control": "no-cache" },
        cache: "no-store",
      });

      if (res.ok) {
        const text = await res.text();
        const parsed = parseAaravStream(text);
        if (parsed && (parsed.items.length > 0 || parsed.ticker.gold)) {
          updateWithParsedData(parsed.items, parsed.ticker);
          setIsLiveConnected(true);
        }
      }
    } catch (_) {
      setIsLiveConnected(false);
    }
  }, [parseAaravStream, updateWithParsedData]);

  // 5. Backend Rates & Configuration Sync
  const fetchBackendRates = useCallback(async () => {
    try {
      const ts = Date.now();
      let res = null;
      try {
        res = await adminApi.getGoldRates(`?t=${ts}&realtime=1`);
      } catch (_) {}

      if (!res || res.status !== "success") {
        const publicRes = await fetch(`${API_BASE_URL}/gold-rate/today?t=${ts}&realtime=1`, {
          headers: { Accept: "application/json", "Cache-Control": "no-cache" },
          cache: "no-store",
        });
        if (publicRes.ok) {
          res = await publicRes.json();
        }
      }

      if (res && res.status === "success") {
        setRatesData(res);
        if (res.gold_extra_offset !== undefined) setGoldOffsetInput(String(res.gold_extra_offset));
        if (res.silver_extra_offset !== undefined) setSilverOffsetInput(String(res.silver_extra_offset));
        if (res.gold_min_floor !== undefined) setGoldFloorInput(String(res.gold_min_floor));

        if (res.stream_items && res.stream_items.length > 0 && liveStreamItems.length === 0) {
          const streamTicker = { gold: null, silver: null, usd: null };
          const streamCommodities = [];

          res.stream_items.forEach((it) => {
            if (it.id === "2124" || /gold\(\$\)/i.test(it.name)) streamTicker.gold = it;
            else if (it.id === "2125" || (/silver/i.test(it.name) && it.bid < 500)) streamTicker.silver = it;
            else if (it.id === "2126" || /usd/i.test(it.name)) streamTicker.usd = it;
            else streamCommodities.push(it);
          });

          updateWithParsedData(streamCommodities, streamTicker);
        }
      }
    } catch (err) {
      console.warn("Backend rate sync error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [liveStreamItems.length, updateWithParsedData]);

  // 6. Save Pricing Rules
  const handleSaveRules = async (e, overridePayload = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const payload = overridePayload || {
        gold_extra_offset: Number(goldOffsetInput || 0),
        silver_extra_offset: Number(silverOffsetInput || 0),
        gold_min_floor: Number(goldFloorInput || 0),
      };

      let res = null;
      try {
        res = await adminApi.updateGoldRate(payload);
      } catch (_) {}

      if (!res || res.status !== "success") {
        const fallbackRes = await fetch(`${API_BASE_URL}/gold-rate/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (fallbackRes.ok) {
          res = await fallbackRes.json();
        }
      }

      if (res && res.status === "success") {
        setRatesData(res);
        if (overridePayload) {
          setGoldOffsetInput(String(overridePayload.gold_extra_offset || 0));
          setSilverOffsetInput(String(overridePayload.silver_extra_offset || 0));
          setGoldFloorInput(String(overridePayload.gold_min_floor || 0));
          setSaveSuccessMsg("✓ 0 Offset Applied! Store prices match Aarav Bullion 100% identically.");
        } else {
          setSaveSuccessMsg("✓ Atelier Pricing Rules Saved! Store prices updated.");
        }
        setTimeout(() => setSaveSuccessMsg(null), 5000);
      } else {
        alert("Could not update pricing rules. Check backend connection.");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save rules: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToZero = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    handleSaveRules(null, {
      gold_extra_offset: 0,
      silver_extra_offset: 0,
      gold_min_floor: 0,
    });
  };

  // 7. Initialize Timers
  useEffect(() => {
    pollAaravBroadcast();
    fetchBackendRates();

    const broadcastInterval = setInterval(() => {
      pollAaravBroadcast();
    }, 1800);

    const backendInterval = setInterval(() => {
      fetchBackendRates();
    }, 10000);

    return () => {
      clearInterval(broadcastInterval);
      clearInterval(backendInterval);
      Object.values(tickTimeoutsRef.current).forEach(clearTimeout);
    };
  }, [pollAaravBroadcast, fetchBackendRates]);

  // Derived Benchmark Values (Direct from Aarav Bullion)
  const lbmaRow = liveStreamItems.find((r) => r.id === "2148" || /lbma/i.test(r.name));
  const rawGold24k10g = lbmaRow?.price || ratesData?.market_raw_24kt_per_10g || ratesData?.pure_24kt_rate_per_10g || 150528;
  const rawGold24kGram = rawGold24k10g / 10;
  const rawGold22k10g = Math.round(rawGold24k10g * 0.916);
  const rawGold22kGram = Math.round(rawGold22k10g / 10);

  const silver1kgRow = liveStreamItems.find((r) => r.id === "2259" || /1kg/i.test(r.name));
  const rawSilverKg = silver1kgRow?.price || ratesData?.market_raw_silver_per_kg || ratesData?.silver_per_kg || 215479;
  const rawSilver10g = Math.round(rawSilverKg / 100);
  const rawSilverGram = Math.round(rawSilverKg / 1000);

  // Effective Store Rates with Atelier Offset (if any)
  const effective24k10g = rawGold24k10g + Number(goldOffsetInput || 0);
  const effective24kGram = effective24k10g / 10;
  const effective22k10g = Math.round(effective24kGram * 0.916 * 10);
  const effective22kGram = Math.round(effective22k10g / 10);
  const effective18kGram = Math.round(effective24kGram * 0.750);
  const effective14kGram = Math.round(effective24kGram * 0.585);

  const effectiveSilverKg = rawSilverKg + Number(silverOffsetInput || 0) * 100;
  const effectiveSilverGram = Math.round(effectiveSilverKg / 1000);
  const effectiveSilver10g = Math.round(effectiveSilverKg / 100);
  const effectiveSilver925Gram = Math.round(effectiveSilverGram * 0.925);
  const effectiveSilver925_10g = Math.round(effectiveSilver10g * 0.925);

  // Filtered lists for tabs
  const goldItems = liveStreamItems.filter((i) => i.category === "gold");
  const silverItems = liveStreamItems.filter((i) => i.category === "silver");

  // Karat Table
  const purities = [
    { name: "24KT", purity: "99.9%", desc: "Aarav Bullion GOLD 999 Benchmark", rateG: effective24kGram, rate10g: effective24k10g, type: "gold" },
    { name: "22KT", purity: "91.6%", desc: "Standard Indian 916 Jewellery Hallmark", rateG: effective22kGram, rate10g: effective22k10g, type: "gold" },
    { name: "18KT", purity: "75.0%", desc: "Atelier Diamond Jewellery Standard", rateG: effective18kGram, rate10g: effective18kGram * 10, type: "gold" },
    { name: "14KT", purity: "58.5%", desc: "Modern Everyday Fine Wear", rateG: effective14kGram, rate10g: effective14kGram * 10, type: "gold" },
    { name: "999 Silver", purity: "99.9%", desc: "Aarav Bullion 1KG Pure Silver Standard", rateG: effectiveSilverGram, rate10g: effectiveSilver10g, type: "silver" },
    { name: "925 Silver", purity: "92.5%", desc: "Sterling Atelier Pieces", rateG: effectiveSilver925Gram, rate10g: effectiveSilver925_10g, type: "silver" },
  ];

  const history = ratesData?.history || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1280px", margin: "0 auto", paddingBottom: "60px" }}>
      
      {/* 1. TOP AARAV BULLION DESK BAR */}
      <div style={{
        background: "var(--admin-surface)",
        borderRadius: "8px",
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        border: "1px solid var(--admin-border)",
        boxShadow: "var(--admin-shadow-sm)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--admin-primary)", fontSize: "14px" }}>📍</span>
            <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--admin-text-primary)", textTransform: "uppercase" }}>
              Ahmedabad &amp; Rajkot Trading Desk
            </span>
          </div>

          <div style={{ height: "14px", width: "1px", background: "var(--admin-border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--admin-primary)", fontSize: "13px" }}>📞</span>
            <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)", fontWeight: 600 }}>
              9825677940
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isLiveConnected ? "#10b981" : "#f59e0b",
              boxShadow: isLiveConnected ? "0 0 10px #10b981" : "none"
            }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: isLiveConnected ? "#10b981" : "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {isLiveConnected ? "LIVE STREAM ACTIVE" : "CONNECTING..."}
            </span>
          </div>

          <div style={{
            background: "var(--admin-surface-elevated)",
            padding: "5px 12px",
            borderRadius: "6px",
            border: "1px solid var(--admin-border)",
            fontSize: "12px",
            fontFamily: "monospace",
            color: "var(--admin-text-primary)",
            fontWeight: 700
          }}>
            🕒 {currentTime || "Loading IST..."}
          </div>
        </div>
      </div>

      {/* 2. BRAND & HEADER ACTION ROW (Standard Admin UI Buttons) */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        background: "var(--admin-surface)",
        padding: "20px 24px",
        borderRadius: "10px",
        border: "1px solid var(--admin-border)",
        boxShadow: "var(--admin-shadow-sm)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{
              fontSize: "24px",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.02em",
              color: "var(--admin-text-primary)"
            }}>
              Aarav Bullion Spot Terminal
            </h1>
            <span className="admin-badge admin-badge-primary" style={{ fontSize: "11px", fontWeight: 700 }}>
              Official Broadcast
            </span>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--admin-text-secondary)" }}>
            Synchronized directly with <a href="https://aaravbullion.in" target="_blank" rel="noopener noreferrer" style={{ color: "var(--admin-primary)", textDecoration: "underline", fontWeight: 600 }}>aaravbullion.in</a> &amp; <a href="https://www.aaravbullionspot.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--admin-primary)", textDecoration: "underline", fontWeight: 600 }}>aaravbullionspot.com</a>.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleResetToZero}
            disabled={isSaving}
            className="admin-btn admin-btn-outline"
            style={{ fontSize: "12px", padding: "8px 16px", borderColor: "#10b981", color: "#10b981" }}
          >
            Match Aarav Bullion Exactly (0 Offset)
          </button>

          <button
            type="button"
            onClick={() => { pollAaravBroadcast(); fetchBackendRates(); }}
            disabled={isLoading}
            className="admin-btn admin-btn-primary"
            style={{ fontSize: "12px", padding: "8px 18px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span>⚡</span> {isLoading ? "Syncing..." : "Refresh Spot Feed"}
          </button>
        </div>
      </div>

      {/* 3. ICONIC AARAV BULLION GLOBAL TICKER BAR (.globall - #1c1c1c) */}
      <div style={{
        background: "#1c1c1c",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #333333",
        boxShadow: "0 4px 14px rgba(0,0,0,0.25)"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
        }}>
          {/* Gold($).. */}
          <div style={{
            padding: "16px 20px",
            textAlign: "center",
            borderRight: "1px solid #2a2a2a",
            position: "relative"
          }}>
            <div style={{
              color: "#e06a00",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "6px"
            }}>
              Gold ($)..
            </div>
            <div style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "5px",
              fontSize: "24px",
              fontWeight: 800,
              fontFamily: "monospace",
              color: "#ffffff",
              background: ticks[tickerItems.gold?.id || "2124"] === "up"
                ? "#34b71f"
                : ticks[tickerItems.gold?.id || "2124"] === "down"
                ? "#f3392f"
                : "transparent",
              transition: "background 0.3s ease"
            }}>
              ${tickerItems.gold ? Number(tickerItems.gold.price).toFixed(2) : "4,169.55"}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
              High: ${tickerItems.gold?.high ? Number(tickerItems.gold.high).toFixed(2) : "4,190.25"} • Low: ${tickerItems.gold?.low ? Number(tickerItems.gold.low).toFixed(2) : "4,162.20"}
            </div>
          </div>

          {/* Silver */}
          <div style={{
            padding: "16px 20px",
            textAlign: "center",
            borderRight: "1px solid #2a2a2a"
          }}>
            <div style={{
              color: "#e06a00",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "6px"
            }}>
              Silver
            </div>
            <div style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "5px",
              fontSize: "24px",
              fontWeight: 800,
              fontFamily: "monospace",
              color: "#ffffff",
              background: ticks[tickerItems.silver?.id || "2125"] === "up"
                ? "#34b71f"
                : ticks[tickerItems.silver?.id || "2125"] === "down"
                ? "#f3392f"
                : "transparent",
              transition: "background 0.3s ease"
            }}>
              ${tickerItems.silver ? Number(tickerItems.silver.price).toFixed(2) : "57.67"}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
              High: ${tickerItems.silver?.high ? Number(tickerItems.silver.high).toFixed(2) : "57.85"} • Low: ${tickerItems.silver?.low ? Number(tickerItems.silver.low).toFixed(2) : "56.89"}
            </div>
          </div>

          {/* USD / INR */}
          <div style={{
            padding: "16px 20px",
            textAlign: "center"
          }}>
            <div style={{
              color: "#e06a00",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "6px"
            }}>
              USD
            </div>
            <div style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "5px",
              fontSize: "24px",
              fontWeight: 800,
              fontFamily: "monospace",
              color: "#ffffff",
              background: ticks[tickerItems.usd?.id || "2126"] === "up"
                ? "#34b71f"
                : ticks[tickerItems.usd?.id || "2126"] === "down"
                ? "#f3392f"
                : "transparent",
              transition: "background 0.3s ease"
            }}>
              ₹{tickerItems.usd ? Number(tickerItems.usd.price).toFixed(3) : "94.964"}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
              High: {tickerItems.usd?.high ? Number(tickerItems.usd.high).toFixed(3) : "94.965"} • Low: {tickerItems.usd?.low ? Number(tickerItems.usd.low).toFixed(3) : "94.740"}
            </div>
          </div>
        </div>
      </div>

      {/* 4. NAVIGATION TABS (Standard NextAdmin Blue Accent) */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        background: "var(--admin-surface)",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid var(--admin-border)",
        boxShadow: "var(--admin-shadow-sm)"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", flex: 1 }}>
          {[
            { id: "gold", label: "GOLD RATES", count: goldItems.length },
            { id: "silver", label: "SILVER RATES", count: silverItems.length },
            { id: "matrix", label: "ALLOY & KARAT MATRIX", count: purities.length },
            { id: "rules", label: "ATELIER PRICING RULES", count: null },
            { id: "history", label: "HISTORICAL LOGS", count: history.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: isActive ? 700 : 600,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  border: isActive ? "1px solid var(--admin-primary)" : "1px solid var(--admin-border)",
                  background: isActive ? "var(--admin-primary)" : "var(--admin-surface-elevated)",
                  color: isActive ? "#ffffff" : "var(--admin-text-secondary)",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span style={{
                    fontSize: "10px",
                    background: isActive ? "rgba(255,255,255,0.25)" : "var(--admin-border)",
                    color: isActive ? "#ffffff" : "var(--admin-text-muted)",
                    padding: "1px 6px",
                    borderRadius: "10px"
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* View toggle (Cards vs Grid) for rate tabs */}
        {(activeTab === "gold" || activeTab === "silver") && (
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`admin-btn ${viewMode === "cards" ? "admin-btn-primary" : "admin-btn-outline"}`}
              style={{ fontSize: "11px", padding: "5px 12px" }}
            >
              Cards View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`admin-btn ${viewMode === "grid" ? "admin-btn-primary" : "admin-btn-outline"}`}
              style={{ fontSize: "11px", padding: "5px 12px" }}
            >
              Grid Table
            </button>
          </div>
        )}
      </div>

      {/* 5. TAB CONTENT PANELS */}

      {/* --- TAB: GOLD RATES --- */}
      {activeTab === "gold" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {viewMode === "cards" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {goldItems.map((item) => {
                const isTicking = ticks[item.id];
                return (
                  <div
                    key={item.id}
                    style={{
                      background: "var(--admin-surface)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: "8px",
                      padding: "18px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "16px",
                      boxShadow: "var(--admin-shadow-sm)",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ minWidth: "260px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          fontSize: "17px",
                          fontWeight: 800,
                          color: "var(--admin-text-primary)",
                          letterSpacing: "-0.01em"
                        }}>
                          {item.name}
                        </span>
                        {item.id === "2148" && (
                          <span className="admin-badge admin-badge-primary" style={{ fontSize: "10px" }}>
                            LBMA BENCHMARK
                          </span>
                        )}
                        {item.id === "2252" && (
                          <span className="admin-badge admin-badge-info" style={{ fontSize: "10px" }}>
                            BIS-IND STANDARD
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "4px" }}>
                        Unit: <strong>{item.unit}</strong> • Row ID: #{item.id} • Live Feed Parity 100%
                      </div>
                    </div>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      flexWrap: "wrap"
                    }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{
                          display: "inline-block",
                          padding: "6px 16px",
                          borderRadius: "6px",
                          fontSize: "24px",
                          fontWeight: 800,
                          color: isTicking ? "#ffffff" : "var(--admin-text-primary)",
                          background: isTicking === "up"
                            ? "#34b71f"
                            : isTicking === "down"
                            ? "#f3392f"
                            : "var(--admin-surface-elevated)",
                          border: "1px solid var(--admin-border)",
                          transition: "background 0.3s ease"
                        }}>
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)", marginTop: "4px" }}>
                          <span style={{ color: "#10b981", fontWeight: 700 }}>▲ H: ₹{Number(item.high).toLocaleString("en-IN")}</span>
                          {" • "}
                          <span style={{ color: "#ef4444", fontWeight: 700 }}>▼ L: ₹{Number(item.low).toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        style={{ fontSize: "12px", padding: "8px 18px", letterSpacing: "0.04em" }}
                      >
                        LIVE SPOT
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="admin-card" style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Commodity Name</th>
                      <th>Unit</th>
                      <th>Row ID</th>
                      <th>Bid Price (₹)</th>
                      <th>Ask Price (₹)</th>
                      <th>Day High (₹)</th>
                      <th>Day Low (₹)</th>
                      <th>Trading Desk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goldItems.map((item) => {
                      const isTicking = ticks[item.id];
                      return (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 800, color: "var(--admin-text-primary)" }}>{item.name}</td>
                          <td style={{ color: "var(--admin-text-secondary)" }}>{item.unit}</td>
                          <td style={{ fontFamily: "monospace", color: "var(--admin-text-secondary)" }}>#{item.id}</td>
                          <td style={{
                            fontWeight: 800,
                            color: isTicking ? "#ffffff" : "var(--admin-text-primary)",
                            background: isTicking === "up" ? "#34b71f" : isTicking === "down" ? "#f3392f" : "transparent"
                          }}>
                            ₹{Number(item.bid).toLocaleString("en-IN")}
                          </td>
                          <td style={{ fontWeight: 700 }}>₹{Number(item.ask).toLocaleString("en-IN")}</td>
                          <td style={{ color: "#10b981", fontWeight: 700 }}>₹{Number(item.high).toLocaleString("en-IN")}</td>
                          <td style={{ color: "#ef4444", fontWeight: 700 }}>₹{Number(item.low).toLocaleString("en-IN")}</td>
                          <td>
                            <span className="admin-badge admin-badge-primary" style={{ fontSize: "10px" }}>
                              LIVE
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB: SILVER RATES --- */}
      {activeTab === "silver" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {viewMode === "cards" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {silverItems.map((item) => {
                const isTicking = ticks[item.id];
                return (
                  <div
                    key={item.id}
                    style={{
                      background: "var(--admin-surface)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: "8px",
                      padding: "18px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "16px",
                      boxShadow: "var(--admin-shadow-sm)"
                    }}
                  >
                    <div style={{ minWidth: "260px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          fontSize: "17px",
                          fontWeight: 800,
                          color: "var(--admin-text-primary)"
                        }}>
                          {item.name}
                        </span>
                        <span className="admin-badge" style={{ fontSize: "10px", background: "var(--admin-surface-elevated)", color: "var(--admin-text-secondary)" }}>
                          SILVER 999
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "4px" }}>
                        Unit: <strong>{item.unit}</strong> • Row ID: #{item.id}
                      </div>
                    </div>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      flexWrap: "wrap"
                    }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{
                          display: "inline-block",
                          padding: "6px 16px",
                          borderRadius: "6px",
                          fontSize: "24px",
                          fontWeight: 800,
                          color: isTicking ? "#ffffff" : "var(--admin-text-primary)",
                          background: isTicking === "up"
                            ? "#34b71f"
                            : isTicking === "down"
                            ? "#f3392f"
                            : "var(--admin-surface-elevated)",
                          border: "1px solid var(--admin-border)",
                          transition: "background 0.3s ease"
                        }}>
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)", marginTop: "4px" }}>
                          <span style={{ color: "#10b981", fontWeight: 700 }}>▲ H: ₹{Number(item.high).toLocaleString("en-IN")}</span>
                          {" • "}
                          <span style={{ color: "#ef4444", fontWeight: 700 }}>▼ L: ₹{Number(item.low).toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="admin-btn admin-btn-outline"
                        style={{ fontSize: "12px", padding: "8px 18px", letterSpacing: "0.04em" }}
                      >
                        LIVE SPOT
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="admin-card" style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Commodity Name</th>
                      <th>Unit</th>
                      <th>Row ID</th>
                      <th>Bid Price (₹)</th>
                      <th>Ask Price (₹)</th>
                      <th>Day High (₹)</th>
                      <th>Day Low (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {silverItems.map((item) => {
                      const isTicking = ticks[item.id];
                      return (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 800, color: "var(--admin-text-primary)" }}>{item.name}</td>
                          <td style={{ color: "var(--admin-text-secondary)" }}>{item.unit}</td>
                          <td style={{ fontFamily: "monospace", color: "var(--admin-text-secondary)" }}>#{item.id}</td>
                          <td style={{
                            fontWeight: 800,
                            color: isTicking ? "#ffffff" : "var(--admin-text-primary)",
                            background: isTicking === "up" ? "#34b71f" : isTicking === "down" ? "#f3392f" : "transparent"
                          }}>
                            ₹{Number(item.bid).toLocaleString("en-IN")}
                          </td>
                          <td style={{ fontWeight: 700 }}>₹{Number(item.ask).toLocaleString("en-IN")}</td>
                          <td style={{ color: "#10b981", fontWeight: 700 }}>₹{Number(item.high).toLocaleString("en-IN")}</td>
                          <td style={{ color: "#ef4444", fontWeight: 700 }}>₹{Number(item.low).toLocaleString("en-IN")}</td>
                          <td>
                            <span className="admin-badge admin-badge-info" style={{ fontSize: "10px" }}>
                              LIVE
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB: ALLOY & KARAT MATRIX --- */}
      {activeTab === "matrix" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quick Summary Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px"
          }}>
            {purities.map((p) => (
              <div
                key={p.name}
                style={{
                  background: "var(--admin-surface)",
                  border: p.name === "24KT" ? "2px solid var(--admin-primary)" : "1px solid var(--admin-border)",
                  borderRadius: "8px",
                  padding: "16px",
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: p.type === "gold" ? "var(--admin-primary)" : "var(--admin-text-secondary)" }}>
                    {p.name}
                  </span>
                  <span className="admin-badge admin-badge-primary" style={{ fontSize: "10px" }}>
                    {p.purity}
                  </span>
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--admin-text-primary)", margin: "8px 0" }}>
                  ₹{Number(p.rateG).toLocaleString("en-IN")}<span style={{ fontSize: "12px", color: "var(--admin-text-secondary)", fontWeight: 500 }}>/g</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                  ₹{Number(p.rate10g).toLocaleString("en-IN")} / 10g
                </div>
              </div>
            ))}
          </div>

          {/* Matrix Detailed Table */}
          <div className="admin-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                  Indian Hallmark Karat Conversion Formula
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                  Calculated dynamically from Aarav Bullion GOLD 999 (Row 2148: ₹{Number(rawGold24k10g).toLocaleString("en-IN")}/10g).
                </p>
              </div>
              <span className="admin-badge admin-badge-success" style={{ fontSize: "11px" }}>
                AUTO-DERIVED
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hallmark Metal</th>
                    <th>Purity Assay</th>
                    <th>Derivation Formula</th>
                    <th>Per Gram (₹)</th>
                    <th>Per 10 Grams (₹)</th>
                    <th>Jewellery Application</th>
                  </tr>
                </thead>
                <tbody>
                  {purities.map((row) => (
                    <tr key={row.name}>
                      <td style={{ fontWeight: 800, color: "var(--admin-text-primary)" }}>{row.name}</td>
                      <td style={{ fontWeight: 700, color: row.type === "gold" ? "var(--admin-primary)" : "var(--admin-text-secondary)" }}>{row.purity}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                        {row.type === "gold" ? `24KT Spot × ${row.purity}` : "Aarav Bullion 1KG / 1000"}
                      </td>
                      <td style={{ fontWeight: 800, fontSize: "15px", color: "var(--admin-text-primary)" }}>
                        ₹{Number(row.rateG).toLocaleString("en-IN")}
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--admin-text-primary)" }}>
                        ₹{Number(row.rate10g).toLocaleString("en-IN")}
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                        {row.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: ATELIER PRICING RULES --- */}
      {activeTab === "rules" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="admin-card" style={{ padding: "26px", border: "1px solid var(--admin-border)", background: "var(--admin-surface)" }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--admin-primary)", fontWeight: 800 }}>
                  Dynamic Pricing Engine
                </span>
                <span className="admin-badge admin-badge-success" style={{ fontSize: "10px" }}>
                  Active
                </span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "6px 0 0 0" }}>
                Aarav Bullion Parity &amp; Offset Configuration
              </h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--admin-text-secondary)" }}>
                Keep Extra Premium at <strong>₹0</strong> to match <a href="https://aaravbullion.in" target="_blank" rel="noopener noreferrer" style={{ color: "var(--admin-primary)", textDecoration: "underline", fontWeight: 600 }}>aaravbullion.in</a> 100% identically.
              </p>
            </div>

            {/* Formula Preview Box */}
            <div style={{
              background: "var(--admin-surface-elevated)",
              border: "1px dashed var(--admin-primary)",
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: "16px"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Aarav Live Spot (GOLD 999)
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--admin-text-primary)", marginTop: "4px" }}>
                  ₹{Number(rawGold24k10g).toLocaleString("en-IN")}<span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}> / 10g</span>
                </div>
              </div>

              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--admin-primary)" }}>+</div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "var(--admin-primary)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  Admin Extra Offset
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--admin-primary)", marginTop: "4px" }}>
                  +₹{Number(goldOffsetInput || 0).toLocaleString("en-IN")}<span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}> / 10g</span>
                </div>
              </div>

              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--admin-primary)" }}>=</div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  Store Effective 24K Rate
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#10b981", marginTop: "4px" }}>
                  ₹{Number(effective24k10g).toLocaleString("en-IN")}<span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}> / 10g</span>
                </div>
              </div>
            </div>

            {/* Controls Form */}
            <form onSubmit={handleSaveRules}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                    Gold Extra Offset (+₹ per 10g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    className="admin-input"
                    value={goldOffsetInput}
                    onChange={(e) => setGoldOffsetInput(e.target.value)}
                    style={{ width: "100%", fontSize: "15px", fontWeight: 800 }}
                    placeholder="0"
                  />
                  <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)", marginTop: "4px", display: "block" }}>
                    Enter 0 to match Aarav Bullion exactly.
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                    Silver Extra Offset (+₹ per 10g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="admin-input"
                    value={silverOffsetInput}
                    onChange={(e) => setSilverOffsetInput(e.target.value)}
                    style={{ width: "100%", fontSize: "15px", fontWeight: 800 }}
                    placeholder="0"
                  />
                  <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)", marginTop: "4px", display: "block" }}>
                    Enter 0 to match Aarav Bullion silver exactly.
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                    Minimum Gold Floor Price (₹ per 10g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="admin-input"
                    value={goldFloorInput}
                    onChange={(e) => setGoldFloorInput(e.target.value)}
                    style={{ width: "100%", fontSize: "15px", fontWeight: 800 }}
                    placeholder="0 (optional)"
                  />
                  <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)", marginTop: "4px", display: "block" }}>
                    Guaranteed price floor. If market rises above, system auto-upgrades.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ fontSize: "12px", color: "#10b981", fontWeight: 700 }}>
                  {saveSuccessMsg || (Number(goldOffsetInput || 0) === 0
                    ? "● Active: 100% exact parity with Aarav Bullion spot rates."
                    : `● Active: Base market spot + ₹${Number(goldOffsetInput).toLocaleString("en-IN")} atelier premium.`)}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleResetToZero}
                    disabled={isSaving}
                    className="admin-btn admin-btn-outline"
                    style={{ fontSize: "12px", padding: "10px 18px" }}
                  >
                    Reset to 0 Offset
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="admin-btn admin-btn-primary"
                    style={{ fontSize: "12px", padding: "10px 24px", fontWeight: 700 }}
                  >
                    {isSaving ? "Saving..." : "Save Pricing Rules"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB: HISTORICAL LOGS --- */}
      {activeTab === "history" && (
        <div className="admin-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
              Recent Database Spot Snapshots
            </h3>
            <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
              Showing latest {history.length} records in database
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Effective Date</th>
                  <th>Metal Type</th>
                  <th>Rate / 10g (₹)</th>
                  <th>Rate / gram (₹)</th>
                  <th>Feed Source</th>
                  <th>Logged At</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "var(--admin-text-secondary)" }}>
                      No database snapshots found.
                    </td>
                  </tr>
                ) : (
                  history.map((row) => (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 700, color: "var(--admin-text-primary)" }}>{row.effective_date}</td>
                      <td style={{ textTransform: "capitalize", fontWeight: 700, color: row.metal_type === "gold" ? "var(--admin-primary)" : "var(--admin-text-secondary)" }}>
                        {row.metal_type}
                      </td>
                      <td style={{ fontWeight: 800, color: "var(--admin-text-primary)" }}>
                        ₹{Number(row.rate_per_10g).toLocaleString("en-IN")}
                      </td>
                      <td style={{ color: "var(--admin-text-secondary)" }}>
                        ₹{(Number(row.rate_per_10g) / 10).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-success" style={{ fontSize: "11px", textTransform: "uppercase" }}>
                          aarav-bullion
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                        {row.created_at ? new Date(row.created_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
