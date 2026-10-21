"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("30d");

  // Key KPI metrics
  const metrics = [
    {
      title: "Gross Sales (MTD)",
      value: "₹48,25,400",
      change: "+18.4%",
      isPositive: true,
      subtext: "vs. ₹40,75,000 last month",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    {
      title: "Active Orders",
      value: "28",
      change: "+6 new today",
      isPositive: true,
      subtext: "4 in handcrafting, 9 in transit",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )
    },
    {
      title: "Pieces In Vault",
      value: "142",
      change: "6 Collections",
      isPositive: null,
      subtext: "12 marked as Limited Edition",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
          <path d="M2 9h20" />
          <path d="m10 3 2 6" />
        </svg>
      )
    },
    {
      title: "Avg. Order Value",
      value: "₹1,72,335",
      change: "+7.8%",
      isPositive: true,
      subtext: "Driven by 18K Solitaire sets",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      )
    }
  ];

  // Recent client orders
  const recentOrders = [
    {
      id: "PIN-9042",
      client: "Aanya Singhania",
      city: "Mumbai, MH",
      items: "Sovereign Diamond Band (18K Rose Gold)",
      amount: "₹1,84,500",
      status: "Crafting Atelier",
      statusType: "warning",
      date: "Today, 11:20 AM"
    },
    {
      id: "PIN-9041",
      client: "Devrat Kapoor",
      city: "New Delhi, DL",
      items: "The 1976 Heritage Pendant (22K Yellow Gold)",
      amount: "₹2,45,000",
      status: "Awaiting Assay",
      statusType: "gold",
      date: "Today, 09:45 AM"
    },
    {
      id: "PIN-9040",
      client: "Meera Oberoi",
      city: "Bangalore, KA",
      items: "Serpentine Pavé Ear Cuffs (18K White Gold)",
      amount: "₹92,800",
      status: "Dispatched",
      statusType: "info",
      date: "Yesterday"
    },
    {
      id: "PIN-9039",
      client: "Raghav Merchant",
      city: "Ahmedabad, GJ",
      items: "Bespoke Emerald Cut Solitaire (Platinum 950)",
      amount: "₹4,10,000",
      status: "Delivered",
      statusType: "success",
      date: "12 Sep 2026"
    }
  ];

  // Atelier activity notifications
  const recentActivity = [
    {
      title: "Spot Rate Benchmark Updated",
      desc: "24K spot gold adjusted to ₹7,280/g (+0.4%)",
      time: "25 min ago",
      icon: "⚖️"
    },
    {
      title: "New High-Value Order",
      desc: "PIN-9042 placed by Aanya Singhania for ₹1,84,500",
      time: "1 hour ago",
      icon: "💎"
    },
    {
      title: "Assay Certification Uploaded",
      desc: "BIS Hallmark certificate linked to 1976 Heritage Line",
      time: "3 hours ago",
      icon: "📜"
    },
    {
      title: "Inventory Stock Alert",
      desc: "Low stock (1 remaining): Celestial Opal Studs",
      time: "5 hours ago",
      icon: "⚠️"
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--admin-gold)", fontWeight: 600 }}>
              Atelier Command Centre
            </span>
          </div>
          <h2 className="admin-serif" style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
            Atelier Executive Overview
          </h2>
          <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: "4px 0 0 0" }}>
            Real-time performance, client orders, and precious metal spot benchmarking.
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            display: "inline-flex",
            background: "var(--admin-surface-elevated)",
            padding: "3px",
            borderRadius: "8px",
            border: "1px solid var(--admin-border)"
          }}>
            {["7d", "30d", "90d", "1y"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  background: timeRange === range ? "var(--admin-gold)" : "transparent",
                  color: timeRange === range ? "#000" : "var(--admin-text-secondary)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="admin-btn-outline" onClick={() => window.location.reload()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px"
      }}>
        {metrics.map((metric, i) => (
          <div key={i} className="admin-card admin-card-hover" style={{ padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)", fontWeight: 500, letterSpacing: "0.04em" }}>
                {metric.title}
              </span>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(201, 169, 97, 0.1)",
                color: "var(--admin-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {metric.icon}
              </div>
            </div>

            <div style={{ fontSize: "26px", fontWeight: 700, color: "#FFF", letterSpacing: "-0.02em", marginBottom: "6px" }}>
              {metric.value}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
              {metric.change && (
                <span style={{
                  color: metric.isPositive ? "var(--admin-success)" : "var(--admin-danger)",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2px"
                }}>
                  {metric.change}
                </span>
              )}
              <span style={{ color: "var(--admin-text-muted)" }}>
                {metric.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Two-Column Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "24px",
        alignItems: "start"
      }}>
        {/* Left Column: Recent Orders */}
        <div className="admin-card" style={{ overflow: "hidden" }}>
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--admin-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <h3 className="admin-serif" style={{ fontSize: "17px", fontWeight: 600, margin: 0 }}>
                Recent Atelier Orders
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "3px 0 0 0" }}>
                Latest orders awaiting artisan crafting or delivery dispatch
              </p>
            </div>
            <Link href="http://localhost:3001/orders" className="admin-btn-ghost" style={{ fontSize: "12px" }}>
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
                  <th>Order Ref</th>
                  <th>Client</th>
                  <th>Jewelry Selection</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  let badgeClass = "admin-badge-gold";
                  if (order.statusType === "warning") badgeClass = "admin-badge-warning";
                  if (order.statusType === "info") badgeClass = "admin-badge-info";
                  if (order.statusType === "success") badgeClass = "admin-badge-success";

                  return (
                    <tr key={order.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--admin-gold-light)" }}>
                        {order.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.client}</div>
                        <div style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>{order.city}</div>
                      </td>
                      <td style={{ color: "var(--admin-text-secondary)" }}>
                        {order.items}
                      </td>
                      <td style={{ fontWeight: 600, color: "#FFF" }}>
                        {order.amount}
                      </td>
                      <td>
                        <span className={`admin-badge ${badgeClass}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Feed & Spot Rate Adjuster Teaser */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Quick Actions Panel */}
          <div className="admin-card" style={{ padding: "22px" }}>
            <h3 className="admin-serif" style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 14px 0" }}>
              Quick Atelier Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="http://localhost:3001/products" className="admin-btn-gold" style={{ justifyContent: "center", width: "100%" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Jewelry Piece</span>
              </Link>
              <Link href="http://localhost:3001/gold-rates" className="admin-btn-outline" style={{ justifyContent: "center", width: "100%" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Adjust Precious Metal Rates</span>
              </Link>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="admin-card" style={{ padding: "22px" }}>
            <h3 className="admin-serif" style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 16px 0" }}>
              Atelier Pulse
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {recentActivity.map((act, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: "rgba(201, 169, 97, 0.08)",
                    border: "1px solid rgba(201, 169, 97, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    flexShrink: 0
                  }}>
                    {act.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-primary)" }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "2px" }}>
                      {act.desc}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--admin-gold-light)", marginTop: "4px" }}>
                      {act.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
