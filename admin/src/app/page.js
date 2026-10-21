"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import adminApi from "@/lib/api";

export default function AdminEcommerceDashboard() {
  const [timeRange, setTimeRange] = useState("Monthly");
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live Dynamic State connected to real backend
  const [stats, setStats] = useState({
    totalViews: "—",
    viewsChange: "",
    viewsPositive: true,
    totalProfit: "—",
    profitChange: "",
    profitPositive: true,
    totalOrder: "—",
    orderChange: "",
    orderPositive: true,
    totalUser: "—",
    userChange: "",
    userPositive: true,
  });

  const [salesAmount, setSalesAmount] = useState("₹0.00");
  const [revenueAmount, setRevenueAmount] = useState("₹0.00");
  const [gold24k, setGold24k] = useState(7280);
  const [gold22k, setGold22k] = useState(6675);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlySales, setMonthlySales] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  // Connect to Real Backend API on Mount
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setIsLoading(true);
        const res = await adminApi.getDashboardStats();
        if (res && res.status === "success" && res.data) {
          const d = res.data;
          if (d.stats) {
            setStats({
              totalViews: d.stats.total_views?.value || "—",
              viewsChange: d.stats.total_views?.change || "",
              viewsPositive: d.stats.total_views?.is_positive ?? true,
              totalProfit: d.stats.total_profit?.value || "—",
              profitChange: d.stats.total_profit?.change || "",
              profitPositive: d.stats.total_profit?.is_positive ?? true,
              totalOrder: d.stats.total_orders?.value || "—",
              orderChange: d.stats.total_orders?.change || "",
              orderPositive: d.stats.total_orders?.is_positive ?? true,
              totalUser: d.stats.total_users?.value || "—",
              userChange: d.stats.total_users?.change || "",
              userPositive: d.stats.total_users?.is_positive ?? true,
            });
          }
          if (d.sales_amount) setSalesAmount(d.sales_amount);
          if (d.revenue_amount) setRevenueAmount(d.revenue_amount);
          if (d.gold_rates) {
            setGold24k(d.gold_rates.gold_24k_per_g || 7280);
            setGold22k(d.gold_rates.gold_22k_per_g || 6675);
          }
          if (Array.isArray(d.recent_orders)) {
            setRecentOrders(d.recent_orders);
          }
          if (d.chart) {
            if (Array.isArray(d.chart.sales)) setMonthlySales(d.chart.sales);
            if (Array.isArray(d.chart.revenue)) setMonthlyRevenue(d.chart.revenue);
          }
        }
      } catch (err) {
        console.warn("Error fetching live dashboard metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealData();
  }, []);

  // Top 4 Metric Cards matching the exact screenshot
  const statCards = [
    {
      id: "views",
      title: "Total Views",
      value: stats.totalViews,
      change: stats.viewsChange,
      isPositive: stats.viewsPositive,
      iconBg: "#EFF2FE",
      iconColor: "#3C50E0",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      id: "profit",
      title: "Total profit",
      value: stats.totalProfit,
      change: stats.profitChange,
      isPositive: stats.profitPositive,
      iconBg: "#E6FBF2",
      iconColor: "#10B981",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      id: "orders",
      title: "Total Order",
      value: stats.totalOrder,
      change: stats.orderChange,
      isPositive: stats.orderPositive,
      iconBg: "#FFF7ED",
      iconColor: "#F97316",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m7.5 4.27 9 5.15" />
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      ),
    },
    {
      id: "users",
      title: "Total User",
      value: stats.totalUser,
      change: stats.userChange,
      isPositive: stats.userPositive,
      iconBg: "#F3E8FF",
      iconColor: "#8B5CF6",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  // Monthly Chart Data (Points for dual curves from real DB orders)
  const chartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const salesData = monthlySales;
  const revenueData = monthlyRevenue;

  // SVG Chart Dimensions
  const chartWidth = 920;
  const chartHeight = 240;
  const maxVal = Math.max(10, ...salesData, ...revenueData) * 1.15;

  // Generate SVG path for a smooth curve
  const getCoordinates = (val, index, total) => {
    const x = 50 + (index / (total - 1)) * (chartWidth - 80);
    const y = chartHeight - 30 - (val / maxVal) * (chartHeight - 60);
    return { x, y };
  };

  const createSplinePath = (data) => {
    const points = data.map((v, i) => getCoordinates(v, i, data.length));
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      path += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const salesPath = createSplinePath(salesData);
  const revenuePath = createSplinePath(revenueData);

  const salesAreaPath = `${salesPath} L ${chartWidth - 30} ${chartHeight - 30} L 50 ${chartHeight - 30} Z`;
  const revenueAreaPath = `${revenuePath} L ${chartWidth - 30} ${chartHeight - 30} L 50 ${chartHeight - 30} Z`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "1400px", margin: "0 auto" }}>
      
      {/* Page Title & Subtitle matching the screenshot */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "var(--admin-text-primary)",
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Atelier Overview
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--admin-text-secondary)",
              margin: 0,
            }}
          >
            Pintaara luxury atelier metrics, live gold rates, client orders, and catalog status.
          </p>
        </div>

        {/* Sync Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--admin-text-muted)" }}>
          <span className="admin-pulse-dot" />
          <span>Real-time Store Sync</span>
        </div>
      </div>

      {/* 4 Top KPI Stat Cards matching screenshot exactly */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.id}
            className="admin-card admin-card-hover"
            style={{
              padding: "24px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Top Icon Circle */}
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: card.iconBg,
                color: card.iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {card.icon}
            </div>

            {/* Main Value and Bottom Row */}
            <div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "var(--admin-text-primary)",
                  letterSpacing: "-0.02em",
                  marginBottom: "8px",
                  lineHeight: 1.1,
                }}
              >
                {card.value}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "var(--admin-text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {card.title}
                </span>

                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: card.isPositive ? "#10B981" : "#EF4444",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  {card.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Section matching screenshot */}
      <div
        className="admin-card"
        style={{
          padding: "26px 28px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Chart Header with Metrics and Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {/* Left Metrics */}
          <div style={{ display: "flex", alignItems: "center", gap: "36px", flexWrap: "wrap" }}>
            
            {/* Sales Amount Metric */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#3C50E0",
                    display: "inline-block",
                  }}
                />
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--admin-text-secondary)" }}>
                  Sales Amount
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                  {salesAmount}
                </span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#10B981" }}>
                  4.35% ↑ <span style={{ color: "var(--admin-text-muted)", fontWeight: 400 }}>last month</span>
                </span>
              </div>
            </div>

            {/* Revenue Amount Metric */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#8B5CF6",
                    display: "inline-block",
                  }}
                />
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--admin-text-secondary)" }}>
                  Revenue Amount
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                  {revenueAmount}
                </span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#10B981" }}>
                  4.35% ↑ <span style={{ color: "var(--admin-text-muted)", fontWeight: 400 }}>last month</span>
                </span>
              </div>
            </div>

          </div>

          {/* Right Dropdown Filter */}
          <div style={{ position: "relative" }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                background: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
                borderRadius: "8px",
                padding: "8px 32px 8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--admin-text-primary)",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Yearly">Yearly</option>
            </select>
            <svg
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--admin-text-muted)",
              }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Beautiful SVG Interactive Dual Curve Chart */}
        <div style={{ width: "100%", overflowX: "auto", position: "relative" }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: "100%", height: "auto", minWidth: "600px", display: "block" }}
          >
            <defs>
              <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3C50E0" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3C50E0" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[1000, 750, 500, 250, 0].map((val) => {
              const y = chartHeight - 30 - (val / maxVal) * (chartHeight - 60);
              return (
                <g key={val}>
                  <line
                    x1="45"
                    y1={y}
                    x2={chartWidth - 20}
                    y2={y}
                    stroke="var(--admin-border)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x="35"
                    y={y + 4}
                    textAnchor="end"
                    fill="var(--admin-text-muted)"
                    fontSize="11"
                    fontFamily="Inter, sans-serif"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area Fills */}
            <path d={revenueAreaPath} fill="url(#revenueGrad)" />
            <path d={salesAreaPath} fill="url(#salesGrad)" />

            {/* Stroke Lines */}
            <path
              d={revenuePath}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d={salesPath}
              fill="none"
              stroke="#3C50E0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* X-axis Month Labels & Interactive hover triggers */}
            {chartMonths.map((m, i) => {
              const coord = getCoordinates(salesData[i], i, chartMonths.length);
              const revCoord = getCoordinates(revenueData[i], i, chartMonths.length);
              const isHovered = hoveredMonth === i;

              return (
                <g
                  key={m}
                  onMouseEnter={() => setHoveredMonth(i)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  style={{ cursor: "pointer" }}
                >
                  <text
                    x={coord.x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    fill={isHovered ? "var(--admin-primary)" : "var(--admin-text-muted)"}
                    fontSize="12"
                    fontWeight={isHovered ? "700" : "500"}
                  >
                    {m}
                  </text>

                  {isHovered && (
                    <line
                      x1={coord.x}
                      y1="20"
                      x2={coord.x}
                      y2={chartHeight - 30}
                      stroke="var(--admin-primary)"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  <circle
                    cx={revCoord.x}
                    cy={revCoord.y}
                    r={isHovered ? "6" : "3.5"}
                    fill="#FFFFFF"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                  />

                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={isHovered ? "6" : "3.5"}
                    fill="#FFFFFF"
                    stroke="#3C50E0"
                    strokeWidth="2.5"
                  />
                </g>
              );
            })}
          </svg>

          {/* Tooltip Card */}
          {hoveredMonth !== null && (
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: `${(hoveredMonth / (chartMonths.length - 1)) * 80 + 10}%`,
                background: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "var(--admin-shadow-md)",
                fontSize: "12px",
                pointerEvents: "none",
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                {chartMonths[hoveredMonth]} Performance
              </div>
              <div style={{ color: "#3C50E0", fontWeight: 600 }}>
                Sales: ${salesData[hoveredMonth]},000
              </div>
              <div style={{ color: "#8B5CF6", fontWeight: 600 }}>
                Revenue: ${revenueData[hoveredMonth]},000
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Quick Management */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Left: Recent Orders Table */}
        <div className="admin-card" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--admin-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                Recent Store Orders
              </h2>
              <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "3px 0 0 0" }}>
                Client orders placed from the storefront website
              </p>
            </div>
            <Link href="/orders" className="admin-btn-ghost" style={{ fontSize: "12px" }}>
              <span>View All</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "36px", color: "var(--admin-text-secondary)", fontSize: "13px" }}>
                      No orders placed yet in Atelier ledger.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, idx) => {
                    let badgeStyle = { background: "var(--admin-success-bg)", color: "var(--admin-success)" };
                    if (order.statusVariant === "warning") {
                      badgeStyle = { background: "var(--admin-warning-bg)", color: "var(--admin-warning)" };
                    }
                    if (order.statusVariant === "info") {
                      badgeStyle = { background: "var(--admin-info-bg)", color: "var(--admin-info)" };
                    }

                    const avatarUrl = order.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.client || "Patron")}&background=3C50E0&color=fff`;

                    return (
                      <tr key={order.id || idx}>
                        <td style={{ fontWeight: 600, color: "var(--admin-primary)", fontFamily: "monospace" }}>
                          {order.id}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img
                              src={avatarUrl}
                              alt={order.client}
                              style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
                            />
                            <span style={{ fontWeight: 600 }}>{order.client}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--admin-text-secondary)", fontSize: "12px" }}>
                          {order.product}
                        </td>
                        <td style={{ fontWeight: 700, color: "var(--admin-text-primary)" }}>
                          {order.amount}
                        </td>
                        <td>
                          <span
                            className="admin-badge"
                            style={{
                              ...badgeStyle,
                              padding: "4px 10px",
                              fontWeight: 600,
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Atelier Actions & Live Spot Rates */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Quick Actions Panel */}
          <div className="admin-card" style={{ padding: "22px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 14px 0", color: "var(--admin-text-primary)" }}>
              Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/products?new=1" className="admin-btn-primary" style={{ justifyContent: "center", width: "100%" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add New Product</span>
              </Link>
              <Link href="/masters" className="admin-btn-outline" style={{ justifyContent: "center", width: "100%" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span>Manage Storefront Masters</span>
              </Link>
            </div>
          </div>

          {/* Live Metal Benchmark */}
          <div className="admin-card" style={{ padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                Live Metal Benchmark
              </h3>
              <span className="admin-pulse-dot" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "var(--admin-surface-elevated)",
                  borderRadius: "8px",
                  border: "1px solid var(--admin-border)",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                    24K GOLD (99.9%)
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                    ₹{gold24k.toLocaleString("en-IN")} / g
                  </div>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#10B981" }}>+0.4% ↑</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "var(--admin-surface-elevated)",
                  borderRadius: "8px",
                  border: "1px solid var(--admin-border)",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                    22K GOLD (91.6%)
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                    ₹{gold22k.toLocaleString("en-IN")} / g
                  </div>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#10B981" }}>+0.3% ↑</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
