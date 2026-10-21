"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import adminApi from "@/lib/api";

const resolveImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("data:") || img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }
  if (img.startsWith("/storage/")) {
    const apiHost = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') 
      : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://api.pintaara.com' : 'http://127.0.0.1:8000');
    return `${apiHost}${img}`;
  }
  return img;
};


export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [rates, setRates] = useState({ gold_24k_per_g: 7280, gold_22k_per_g: 6670, silver_per_g: 95 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'

  // Dialog State
  const [toastMessage, setToastMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Initial Data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const colRes = await adminApi.getCollections();
        if (colRes && colRes.status === "success" && Array.isArray(colRes.data)) {
          setCollections(colRes.data);
          try {
            const sanitized = colRes.data.map(c => (c?.image && typeof c.image === "string" && c.image.startsWith("data:") ? { ...c, image: "/images/concept-hero1.png" } : c));
            localStorage.setItem("pintaara_collections_cache", JSON.stringify(sanitized));
          } catch (_) {}
        }

        try {
          let rateData = null;
          const rateRes = await adminApi.getGoldRates();
          if (rateRes && (rateRes.status === "success" || rateRes.base_22kt_rate_per_10g || rateRes.data)) {
            rateData = rateRes.data || rateRes;
          }
          if (rateData) {
            const gold22Per10g = parseFloat(rateData.base_22kt_rate_per_10g || rateData.gold_22kt_per_10g || 148000);
            const gold22PerG = gold22Per10g / 10;
            const gold24PerG = parseFloat(rateData.pure_24kt_rate_per_gram || (gold22PerG / 0.916));
            const silverPer10g = parseFloat(
              rateData.silver_base_per_10g && rateData.silver_base_per_10g < 50000
                ? rateData.silver_base_per_10g
                : (rateData.silver_per_kg ? rateData.silver_per_kg / 100 : 2114.5)
            );
            const silverPerG = silverPer10g / 10;

            setRates({
              gold_24k_per_g: Math.round(gold24PerG),
              gold_22k_per_g: Math.round(gold22PerG),
              silver_per_g: Math.round(silverPerG * 100) / 100,
            });
          }
        } catch (_) {}

        const prodRes = await adminApi.getProducts();
        if (prodRes && prodRes.status === "success" && Array.isArray(prodRes.data)) {
          setProducts(prodRes.data);
          localStorage.setItem("pintaara_products_cache", JSON.stringify(prodRes.data));
        } else {
          setProducts([]);
          localStorage.setItem("pintaara_products_cache", JSON.stringify([]));
        }
      } catch (err) {
        console.warn("API offline:", err);
        setProducts([]);
        localStorage.setItem("pintaara_products_cache", JSON.stringify([]));
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Price Calculator
  const computePrice = (item) => {
    const weight = parseFloat(item.base_weight_grams || item.weight) || 0;
    const fraction = parseFloat(item.purity_fraction) || 0.750;
    const metalType = item.metal_type || "gold";
    const wastagePct = parseFloat(item.wastage_percent) || 0;
    const making = parseFloat(item.making_charge) || 0;
    const stones = parseFloat(item.stone_charge) || 0;

    const isSilver = (metalType || "").toLowerCase() === "silver" ||
                     String(item.karat || "").toLowerCase().includes("silver") ||
                     String(item.metal || "").toLowerCase().includes("silver");

    let ratePerGram;
    if (isSilver) {
      ratePerGram = (rates.silver_per_g || 211.45) * (fraction / 0.925);
    } else if (metalType === "platinum") {
      ratePerGram = 3450;
    } else {
      ratePerGram = (rates.gold_24k_per_g || 16157) * fraction;
    }

    const metalValue = Math.round(weight * ratePerGram);
    const wastageValue = Math.round(metalValue * (wastagePct / 100));
    const subtotal = metalValue + wastageValue + making + stones;
    const gst = Math.round(subtotal * 0.03);
    const total = subtotal + gst;

    return {
      metalValue,
      wastageValue,
      making,
      stones,
      subtotal,
      gst,
      total,
    };
  };

  // Filtered and Sorted Products
  const processedProducts = useMemo(() => {
    return products
      .filter((p) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          !query ||
          p.name?.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query) ||
          p.design_code?.toLowerCase().includes(query) ||
          p.collection_name?.toLowerCase().includes(query);

        const matchesCollection =
          selectedCollection === "all" ||
          String(p.collection_master_id) === String(selectedCollection);

        const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;

        return matchesQuery && matchesCollection && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "price_desc") return computePrice(b).total - computePrice(a).total;
        if (sortBy === "price_asc") return computePrice(a).total - computePrice(b).total;
        if (sortBy === "weight_desc") return (b.base_weight_grams || 0) - (a.base_weight_grams || 0);
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        return b.id - a.id;
      });
  }, [products, searchQuery, selectedCollection, selectedStatus, sortBy, rates]);

  // Aggregate Metrics
  const activeCount = useMemo(() => products.filter((p) => p.status === "active").length, [products]);
  const totalWeightGrams = useMemo(
    () => products.reduce((acc, p) => acc + (parseFloat(p.base_weight_grams) || 0), 0).toFixed(1),
    [products]
  );
  const toggleProductStatus = async (prod, e) => {
    if (e) e.stopPropagation();
    const newStatus = prod.status === "active" ? "draft" : "active";
    const updated = products.map((p) => (p.id === prod.id ? { ...p, status: newStatus } : p));
    setProducts(updated);
    localStorage.setItem("pintaara_products_cache", JSON.stringify(updated));

    try {
      await adminApi.updateProduct(prod.id, { ...prod, status: newStatus });
    } catch (err) {
      console.warn(err);
    }
    showToast(`Status changed to ${newStatus}.`);
  };

  const copySkuToClipboard = (sku, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard?.writeText(sku);
    showToast(`Copied SKU: ${sku}`);
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteProduct(deleteTarget.id);
    } catch (err) {
      console.warn(err);
    }
    const nextProds = products.filter((p) => p.id !== deleteTarget.id);
    setProducts(nextProds);
    localStorage.setItem("pintaara_products_cache", JSON.stringify(nextProds));
    showToast(`Product "${deleteTarget.name}" deleted.`);
    setDeleteTarget(null);
  };

  return (
    <div style={{ maxWidth: "1600px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            boxShadow: "var(--admin-shadow-md)",
            borderRadius: "8px",
            padding: "12px 20px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--admin-text-primary)",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--admin-text-primary)",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Products
          </h1>
          <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", marginTop: "4px", margin: 0 }}>
            Manage catalog specifications, live benchmark valuation, and customization options.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/collections"
            className="admin-btn-outline"
            style={{ fontSize: "13px", padding: "8px 16px" }}
          >
            Collections
          </Link>
          <Link
            href="/products/create"
            className="admin-btn-primary"
            style={{ fontSize: "13px", padding: "8px 18px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
          >
            + New Product
          </Link>
        </div>
      </div>

      {/* Metrics Summary Ribbon */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="admin-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-secondary)", textTransform: "uppercase" }}>
            Total Products
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--admin-text-primary)", marginTop: "6px" }}>
            {products.length}
          </div>
        </div>

        <div className="admin-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-secondary)", textTransform: "uppercase" }}>
            Active on Storefront
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--admin-success)", marginTop: "6px" }}>
            {activeCount}
          </div>
        </div>

        <div className="admin-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-secondary)", textTransform: "uppercase" }}>
            Catalog Weight
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--admin-text-primary)", marginTop: "6px" }}>
            {totalWeightGrams} g
          </div>
        </div>

        <div className="admin-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-secondary)", textTransform: "uppercase" }}>
            24K Gold Benchmark
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--admin-text-primary)", marginTop: "6px" }}>
            ₹{rates.gold_24k_per_g?.toLocaleString()}/g
          </div>
        </div>
      </div>

      {/* Filter & Control Bar - Single Line Compact Layout */}
      <div
        className="admin-card"
        style={{
          padding: "10px 14px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          flexWrap: "nowrap",
          overflowX: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
          {/* Search Box */}
          <input
            type="text"
            className="admin-input"
            placeholder="Search by name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "220px",
              minWidth: "150px",
              flex: "1 1 220px",
              fontSize: "12px",
              padding: "7px 10px",
            }}
          />

          {/* Short Collection Filter */}
          <select
            className="admin-input"
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            style={{
              width: "135px",
              flex: "0 0 135px",
              fontSize: "12px",
              padding: "7px 8px",
            }}
          >
            <option value="all">All Collections</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>


          {/* Short Status Filter */}
          <select
            className="admin-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              width: "100px",
              flex: "0 0 100px",
              fontSize: "12px",
              padding: "7px 8px",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Short Sort Dropdown */}
          <select
            className="admin-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: "130px",
              flex: "0 0 130px",
              fontSize: "12px",
              padding: "7px 8px",
            }}
          >
            <option value="newest">Sort: Newest</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="weight_desc">Weight: High</option>
            <option value="name_asc">Name: A to Z</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: "flex", border: "1px solid var(--admin-border)", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
            <button
              onClick={() => setViewMode("table")}
              style={{
                border: "none",
                background: viewMode === "table" ? "var(--admin-primary-light)" : "var(--admin-surface)",
                color: viewMode === "table" ? "var(--admin-primary)" : "var(--admin-text-secondary)",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                border: "none",
                borderLeft: "1px solid var(--admin-border)",
                background: viewMode === "grid" ? "var(--admin-primary-light)" : "var(--admin-surface)",
                color: viewMode === "grid" ? "var(--admin-primary)" : "var(--admin-text-secondary)",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="admin-card" style={{ padding: "60px 20px", textAlign: "center", color: "var(--admin-text-muted)" }}>
          Loading products catalog...
        </div>
      ) : processedProducts.length === 0 ? (
        <div className="admin-card" style={{ padding: "60px 20px", textAlign: "center", color: "var(--admin-text-muted)" }}>
          No products found matching the criteria.
        </div>
      ) : viewMode === "table" ? (
        /* ==================== 1. PROFESSIONAL TABLE VIEW ==================== */
        <div className="admin-card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-surface-elevated)" }}>
                <th style={{ padding: "12px 16px", color: "var(--admin-text-secondary)", fontWeight: 600, minWidth: "240px" }}>
                  Product
                </th>
                <th style={{ padding: "12px 16px", color: "var(--admin-text-secondary)", fontWeight: 600, width: "140px" }}>
                  SKU
                </th>
                <th style={{ padding: "12px 16px", color: "var(--admin-text-secondary)", fontWeight: 600, width: "160px" }}>
                  Collection
                </th>
                <th style={{ padding: "12px 16px", color: "var(--admin-text-secondary)", fontWeight: 600, width: "140px" }}>
                  Metal & Weight
                </th>
                <th style={{ padding: "12px 16px", color: "var(--admin-text-secondary)", fontWeight: 600, width: "130px" }}>
                  Live Price
                </th>
                <th style={{ padding: "12px 16px", color: "var(--admin-text-secondary)", fontWeight: 600, width: "100px" }}>
                  Status
                </th>
                <th style={{ padding: "12px 16px", color: "var(--admin-text-secondary)", fontWeight: 600, textAlign: "right", width: "150px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {processedProducts.map((prod) => {
                const pricing = computePrice(prod);
                const sku = prod.sku || prod.design_code;
                const primaryImg = prod.image || prod.primary_image || "/images/concept-hero1.png";

                return (
                  <tr
                    key={prod.id}
                    style={{
                      borderBottom: "1px solid var(--admin-border-light)",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Thumbnail & Title */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            background: "var(--admin-surface-elevated)",
                            border: "1px solid var(--admin-border)",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={resolveImageUrl(primaryImg)}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              if (primaryImg && primaryImg.startsWith("/") && !e.currentTarget.dataset.retried) {
                                e.currentTarget.dataset.retried = "true";
                                e.currentTarget.src = `https://pintaara.com${primaryImg}`;
                              }
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--admin-text-primary)" }}>{prod.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "2px" }}>
                            {prod.metal || `${prod.karat || "18K"} Gold`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        onClick={(e) => copySkuToClipboard(sku, e)}
                        style={{
                          fontSize: "11px",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          background: "var(--admin-surface-elevated)",
                          border: "1px solid var(--admin-border)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          color: "var(--admin-text-primary)",
                          cursor: "pointer",
                        }}
                        title="Click to copy SKU"
                      >
                        {sku}
                      </span>
                    </td>

                    {/* Collection */}
                    <td style={{ padding: "12px 16px", color: "var(--admin-text-secondary)" }}>
                      {prod.collection_name || "Unassigned"}
                    </td>

                    {/* Metal & Weight */}
                    <td style={{ padding: "12px 16px", color: "var(--admin-text-secondary)" }}>
                      {prod.karat || "18K"} • {prod.base_weight_grams || 5.0}g
                    </td>

                    {/* Live Calculated Price */}
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                      ₹{pricing.total?.toLocaleString("en-IN")}
                    </td>

                    {/* Status Toggle */}
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={(e) => toggleProductStatus(prod, e)}
                        style={{
                          border: "none",
                          background: prod.status === "active" ? "var(--admin-success-bg)" : "var(--admin-warning-bg)",
                          color: prod.status === "active" ? "var(--admin-success)" : "var(--admin-warning)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        title="Toggle active status"
                      >
                        {prod.status === "active" ? "Active" : "Draft"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                        <Link
                          href={`/products/${prod.id}/edit`}
                          className="admin-btn-outline"
                          style={{ padding: "4px 10px", fontSize: "11px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                        >
                          Edit
                        </Link>
                        <Link
                          href={`https://pintaara.com/collection/${sku}`}
                          target="_blank"
                          className="admin-btn-ghost"
                          style={{ padding: "4px 8px", fontSize: "11px", border: "1px solid var(--admin-border)", borderRadius: "4px" }}
                          title="View on Storefront"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(prod)}
                          style={{
                            background: "transparent",
                            border: "1px solid var(--admin-border)",
                            color: "var(--admin-danger)",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ==================== 2. CLEAN GRID CARDS VIEW ==================== */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {processedProducts.map((prod) => {
            const pricing = computePrice(prod);
            const sku = prod.sku || prod.design_code;
            const primaryImg = prod.image || prod.primary_image || "/images/concept-hero1.png";

            return (
              <div
                key={prod.id}
                className="admin-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Image */}
                <div style={{ width: "100%", height: "180px", background: "var(--admin-surface-elevated)", position: "relative" }}>
                  <img
                    src={resolveImageUrl(primaryImg)}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      if (primaryImg && primaryImg.startsWith("/") && !e.currentTarget.dataset.retried) {
                        e.currentTarget.dataset.retried = "true";
                        e.currentTarget.src = `https://pintaara.com${primaryImg}`;
                      }
                    }}
                  />
                  <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: prod.status === "active" ? "var(--admin-success-bg)" : "var(--admin-warning-bg)",
                        color: prod.status === "active" ? "var(--admin-success)" : "var(--admin-warning)",
                      }}
                    >
                      {prod.status === "active" ? "Active" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                      {prod.collection_name || "Unassigned"}
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-primary)", marginTop: "2px" }}>
                      {prod.name}
                    </div>
                    <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--admin-text-muted)", marginTop: "2px" }}>
                      {sku}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                    <span>{prod.karat || "18K"} Gold</span>
                    <span>{prod.base_weight_grams || 5.0}g Net</span>
                  </div>

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--admin-border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "10px", color: "var(--admin-text-muted)" }}>Live Price</div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                        ₹{pricing.total?.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <Link
                        href={`/products/${prod.id}/edit`}
                        className="admin-btn-outline"
                        style={{ padding: "5px 10px", fontSize: "11px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(prod)}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--admin-border)",
                          color: "var(--admin-danger)",
                          borderRadius: "4px",
                          padding: "5px 8px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION MODAL                                    */}
      {/* ============================================================ */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="admin-card"
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
              boxShadow: "var(--admin-shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 8px", color: "var(--admin-text-primary)" }}>
              Delete Product
            </h3>
            <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: "0 0 20px" }}>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                className="admin-btn-ghost"
                onClick={() => setDeleteTarget(null)}
                style={{ padding: "6px 14px", fontSize: "12px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                style={{
                  background: "var(--admin-danger)",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 16px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
