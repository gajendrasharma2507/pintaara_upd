"use client";

import React, { useState, useEffect, useMemo } from "react";
import adminApi, { API_BASE_URL } from "@/lib/api";

const presetImages = [
  { label: "Diamond Rings", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop" },
  { label: "Gold Pendant", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop" },
  { label: "Diamond Earrings", url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop" },
  { label: "Gold Chain", url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop" },
  { label: "Diamond Necklace", url: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop" },
  { label: "Gold Bangles", url: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop" },
  { label: "Heritage Atelier", url: "/images/concept-hero1.png" },
  { label: "Solitaire Collection", url: "/images/concept-designlog.png" },
];

export const resolveImageUrl = (img) => {
  if (!img) return presetImages[0].url;
  if (img.startsWith("data:") || img.startsWith("blob:") || img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }
  if (img.startsWith("/storage/")) {
    const apiHost = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "") 
      : (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" ? "https://api.pintaara.com" : "http://127.0.0.1:8000");
    return `${apiHost}${img}`;
  }
  return img;
};

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'active' | 'hidden'
  const [sortBy, setSortBy] = useState("default"); // 'default' | 'name' | 'pieces'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState(presetImages[0].url);
  const [status, setStatus] = useState("active");
  const [copiedSlug, setCopiedSlug] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const safeSetCollectionsCache = (cols) => {
    if (typeof window === "undefined" || !cols) return;
    try {
      const sanitized = cols.map((col) => {
        if (col?.image && typeof col.image === "string" && col.image.startsWith("data:")) {
          return { ...col, image: "/images/concept-hero1.png" };
        }
        return col;
      });
      localStorage.setItem("pintaara_collections_cache", JSON.stringify(sanitized));
    } catch (quotaErr) {
      console.warn("Storage quota exceeded for pintaara_collections_cache:", quotaErr);
      try {
        localStorage.removeItem("pintaara_collections_cache");
      } catch (_) {}
    }
  };

  // Load collections from live API
  const loadCollections = async () => {
    setIsLoading(true);
    try {
      let data = null;
      const res = await adminApi.getCollections();
      if (res && res.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
        data = res.data;
      } else {
        // Fallback to live public endpoint so admin always sees DB collections
        const pub = await fetch(`${API_BASE_URL}/collections`, {
          headers: { Accept: "application/json" }
        }).then(r => r.json()).catch(() => null);
        if (pub && pub.status === "success" && Array.isArray(pub.data) && pub.data.length > 0) {
          data = pub.data.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            image: resolveImageUrl(c.image) || "/images/concept-hero1.png",
            description: c.description || "",
            sort_order: c.sort_order || 1,
            status: c.status || "active",
            piecesCount: c.products_count ?? 4,
            created_at: c.created_at,
          }));
        }
      }

      if (data && data.length > 0) {
        setCollections(data);
        safeSetCollectionsCache(data);
      } else {
        const cached = localStorage.getItem("pintaara_collections_cache");
        setCollections(cached ? JSON.parse(cached) : []);
      }
    } catch (err) {
      console.warn("API offline:", err);
      const cached = localStorage.getItem("pintaara_collections_cache");
      setCollections(cached ? JSON.parse(cached) : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // Filter & Sort collections
  const processedCollections = useMemo(() => {
    let result = [...collections];

    // Status Filter
    if (activeFilter === "active") {
      result = result.filter((c) => c.status === "active");
    } else if (activeFilter === "hidden") {
      result = result.filter((c) => c.status === "hidden");
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.slug && c.slug.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "pieces") {
      result.sort((a, b) => (b.piecesCount || 0) - (a.piecesCount || 0));
    }

    return result;
  }, [collections, activeFilter, searchQuery, sortBy]);

  // Aggregate Metrics
  const activeCount = useMemo(() => collections.filter((c) => c.status === "active").length, [collections]);
  const draftCount = useMemo(() => collections.filter((c) => c.status === "hidden").length, [collections]);
  const totalPieces = useMemo(() => collections.reduce((sum, c) => sum + (c.piecesCount || 0), 0), [collections]);

  // Open Modal Helpers
  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setImage(presetImages[0].url);
    setStatus("active");
    setShowModal(true);
  };

  const openEditModal = (col) => {
    setEditingId(col.id);
    setName(col.name);
    setSlug(col.slug || "");
    setImage(resolveImageUrl(col.image) || presetImages[0].url);
    setStatus(col.status || "active");
    setShowModal(true);
  };

  // Auto-generate slug
  const handleNameChange = (val) => {
    setName(val);
    if (!editingId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generated);
    }
  };

  // File Upload with Server Storage and local fallback
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        showToast("Uploading image...");
        const res = await adminApi.uploadCollectionImage(file);
        if (res && res.status === "success" && res.url) {
          const resolved = resolveImageUrl(res.url);
          setImage(resolved);
          showToast("Image uploaded successfully");
          return;
        }
      } catch (uploadErr) {
        console.warn("Server upload failed, falling back to compressed local image:", uploadErr);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const rawData = event.target.result;
          const imgObj = new Image();
          imgObj.onload = () => {
            const canvas = document.createElement("canvas");
            const maxDimension = 1200;
            let width = imgObj.width;
            let height = imgObj.height;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(imgObj, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.85);
            setImage(compressed);
            showToast("Image selected successfully");
          };
          imgObj.onerror = () => {
            setImage(rawData);
            showToast("Image selected successfully");
          };
          imgObj.src = rawData;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Toggle Status
  const toggleCollectionStatus = async (col, e) => {
    e.stopPropagation();
    const newStatus = col.status === "active" ? "hidden" : "active";
    const updated = { ...col, status: newStatus };

    const nextCols = collections.map((c) => (c.id === col.id ? updated : c));
    setCollections(nextCols);
    safeSetCollectionsCache(nextCols);

    try {
      await adminApi.updateCollection(col.id, { ...col, status: newStatus });
    } catch (err) {
      console.warn("Status toggle API sync error:", err);
    }

    showToast(`"${col.name}" is now ${newStatus === "active" ? "Active" : "Draft"}`);
  };

  // Copy Collection URL Handle
  const copySlugToClipboard = (s, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(`/collection/${s}`);
    setCopiedSlug(s);
    showToast(`Copied /collection/${s}`);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Save Collection
  const handleSaveCollection = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const finalImage = image || "/images/concept-hero1.png";

    const payload = {
      name: name.trim(),
      slug: finalSlug,
      image: finalImage,
      description: "",
      status: status,
    };

    try {
      if (editingId) {
        const apiRes = await adminApi.updateCollection(editingId, payload);
        const updatedItem = apiRes?.data || {
          id: editingId,
          ...payload,
          piecesCount: collections.find((c) => c.id === editingId)?.piecesCount || 0,
        };

        const nextCols = collections.map((c) => (c.id === editingId ? { ...c, ...updatedItem } : c));
        setCollections(nextCols);
        safeSetCollectionsCache(nextCols);
        showToast(`Collection "${name}" updated`);
      } else {
        const apiRes = await adminApi.createCollection(payload);
        const newItem = apiRes?.data || {
          id: Date.now(),
          ...payload,
          piecesCount: 0,
        };

        const nextCols = [newItem, ...collections];
        setCollections(nextCols);
        safeSetCollectionsCache(nextCols);
        showToast(`Collection "${name}" created`);
      }

      setShowModal(false);
    } catch (err) {
      console.error("Save collection error:", err);
      if (editingId) {
        const nextCols = collections.map((c) => (c.id === editingId ? { ...c, ...payload } : c));
        setCollections(nextCols);
        safeSetCollectionsCache(nextCols);
        showToast(`Collection "${name}" updated`);
      } else {
        const newItem = { id: Date.now(), ...payload, piecesCount: 0 };
        const nextCols = [newItem, ...collections];
        setCollections(nextCols);
        safeSetCollectionsCache(nextCols);
        showToast(`Collection "${name}" created`);
      }
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action Handlers
  const requestDelete = (id, colName) => {
    setDeleteTarget({ id, name: colName });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, name: colName } = deleteTarget;

    try {
      await adminApi.deleteCollection(id);
    } catch (err) {
      console.warn("Delete API error, proceeding locally:", err);
    }

    const nextCols = collections.filter((c) => c.id !== id);
    setCollections(nextCols);
    safeSetCollectionsCache(nextCols);
    showToast(`Collection "${colName}" removed`);

    setDeleteTarget(null);
    if (showModal && editingId === id) {
      setShowModal(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "var(--admin-text-primary)",
            color: "var(--admin-surface)",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "var(--admin-shadow-lg)",
            fontSize: "13px",
            fontWeight: 600,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--admin-gold)", fontWeight: 600 }}>
            CATALOG MANAGEMENT
          </span>
          <h1 className="admin-serif" style={{ fontSize: "28px", fontWeight: 700, margin: "4px 0 0 0", color: "var(--admin-text-primary)" }}>
            Collections
          </h1>
          <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: "4px 0 0 0" }}>
            Curate collection lines, hero visuals, and storefront publication states.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          className="admin-btn-primary"
          onClick={openAddModal}
          id="btn-make-collection"
          style={{ padding: "10px 20px", fontSize: "13px" }}
        >
          + Create Collection
        </button>
      </div>

      {/* KPI Metrics Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div className="admin-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Collections
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--admin-text-primary)", marginTop: "6px" }}>
            {collections.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginTop: "4px" }}>
            Across all categories
          </div>
        </div>

        <div className="admin-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Live on Storefront
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--admin-success, #10B981)", marginTop: "6px" }}>
            {activeCount}
          </div>
          <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginTop: "4px" }}>
            Visible to shoppers
          </div>
        </div>

        <div className="admin-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Draft Editions
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--admin-warning, #F59E0B)", marginTop: "6px" }}>
            {draftCount}
          </div>
          <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginTop: "4px" }}>
            Unpublished in catalog
          </div>
        </div>

        <div className="admin-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Pieces
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--admin-text-primary)", marginTop: "6px" }}>
            {totalPieces}
          </div>
          <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginTop: "4px" }}>
            Assigned jewelry products
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div
        className="admin-card"
        style={{
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        {/* Left: Filter Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All (${collections.length})` },
            { id: "active", label: `Active (${activeCount})` },
            { id: "hidden", label: `Drafts (${draftCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                background: activeFilter === tab.id ? "var(--admin-primary)" : "var(--admin-surface-elevated)",
                color: activeFilter === tab.id ? "#FFF" : "var(--admin-text-secondary)",
                border: "1px solid var(--admin-border)",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Search, Sort & View Mode */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Search Input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--admin-surface-elevated)",
              border: "1px solid var(--admin-border)",
              borderRadius: "6px",
              padding: "6px 12px",
              minWidth: "220px",
            }}
          >
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--admin-text-primary)",
                fontSize: "12px",
                outline: "none",
                width: "100%",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: "transparent", border: "none", color: "var(--admin-text-muted)", cursor: "pointer", fontSize: "11px", padding: 0 }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: "var(--admin-surface-elevated)",
              border: "1px solid var(--admin-border)",
              color: "var(--admin-text-secondary)",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 500,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="default">Default Order</option>
            <option value="name">Name (A-Z)</option>
            <option value="pieces">Most Pieces</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: "flex", border: "1px solid var(--admin-border)", borderRadius: "6px", overflow: "hidden" }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                background: viewMode === "grid" ? "var(--admin-primary)" : "var(--admin-surface-elevated)",
                color: viewMode === "grid" ? "#FFF" : "var(--admin-text-secondary)",
                border: "none",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              style={{
                background: viewMode === "table" ? "var(--admin-primary)" : "var(--admin-surface-elevated)",
                color: viewMode === "table" ? "#FFF" : "var(--admin-text-secondary)",
                border: "none",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--admin-text-secondary)" }}>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>Loading collections...</div>
        </div>
      ) : processedCollections.length === 0 ? (
        <div
          className="admin-card"
          style={{
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <h3 className="admin-serif" style={{ fontSize: "20px", margin: "0 0 6px 0", color: "var(--admin-text-primary)" }}>
            {searchQuery ? "No matching collections" : "No Collections Found"}
          </h3>
          <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: "0 0 20px 0" }}>
            {searchQuery ? `No collections match "${searchQuery}".` : "Create a collection to organize your products."}
          </p>
          <button className="admin-btn-primary" onClick={openAddModal}>
            + Create Collection
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {processedCollections.map((col) => {
            const isActive = col.status === "active";

            return (
              <div
                key={col.id}
                className="admin-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderRadius: "12px",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {/* Visual Banner */}
                <div
                  style={{
                    height: "190px",
                    position: "relative",
                    overflow: "hidden",
                    backgroundColor: "var(--admin-surface-elevated)",
                  }}
                >
                  <img
                    src={resolveImageUrl(col.image)}
                    alt={col.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = presetImages[0].url;
                    }}
                  />

                  {/* Status Pill Badge (Top-Left) */}
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: isActive ? "var(--admin-success-bg, #E6FBF2)" : "var(--admin-surface-elevated, #F1F5F9)",
                      color: isActive ? "var(--admin-success, #10B981)" : "var(--admin-text-secondary, #64748B)",
                      border: `1px solid ${isActive ? "rgba(16,185,129,0.3)" : "var(--admin-border)"}`,
                      padding: "3px 10px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: isActive ? "var(--admin-success, #10B981)" : "#94A3B8",
                      }}
                    />
                    <span>{isActive ? "Active" : "Draft"}</span>
                  </div>

                  {/* Quick Toggle Status Button (Top-Right) */}
                  <button
                    type="button"
                    onClick={(e) => toggleCollectionStatus(col, e)}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "#FFF",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      backdropFilter: "blur(4px)",
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    {isActive ? "Set Draft" : "Make Active"}
                  </button>
                </div>

                {/* Card Body */}
                <div style={{ padding: "18px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", gap: "14px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          margin: 0,
                          color: "var(--admin-text-primary)",
                        }}
                      >
                        {col.name}
                      </h3>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--admin-text-secondary)",
                          background: "var(--admin-surface-elevated)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--admin-border)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col.piecesCount ?? 0} {col.piecesCount === 1 ? "piece" : "pieces"}
                      </span>
                    </div>

                    {/* Routing Handle */}
                    <div
                      onClick={(e) => copySlugToClipboard(col.slug, e)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "8px",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: "var(--admin-surface-elevated)",
                        border: "1px solid var(--admin-border)",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: "var(--admin-text-secondary)",
                        cursor: "pointer",
                      }}
                      title="Click to copy path"
                    >
                      <span>/collection/{col.slug}</span>
                      <span style={{ fontSize: "10px", color: "var(--admin-primary)", fontWeight: 600 }}>
                        {copiedSlug === col.slug ? "Copied" : "Copy"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--admin-border)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => openEditModal(col)}
                      className="admin-btn-outline"
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        padding: "7px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => requestDelete(col.id, col.name)}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--admin-border)",
                        color: "var(--admin-danger, #EF4444)",
                        borderRadius: "6px",
                        padding: "7px 12px",
                        fontSize: "12px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--admin-danger-bg, #FEF3F2)";
                        e.currentTarget.style.borderColor = "var(--admin-danger, #EF4444)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "var(--admin-border)";
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="admin-card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Storefront URL</th>
                  <th>Pieces</th>
                  <th>Status</th>
                  <th>Publish Toggle</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedCollections.map((col) => {
                  const isActive = col.status === "active";

                  return (
                    <tr key={col.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={resolveImageUrl(col.image)}
                            alt={col.name}
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "6px",
                              objectFit: "cover",
                              border: "1px solid var(--admin-border)",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = presetImages[0].url;
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--admin-text-primary)" }}>
                              {col.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          onClick={(e) => copySlugToClipboard(col.slug, e)}
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "var(--admin-primary)",
                            cursor: "pointer",
                            background: "var(--admin-surface-elevated)",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            border: "1px solid var(--admin-border)",
                          }}
                        >
                          /collection/{col.slug}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--admin-text-primary)" }}>
                          {col.piecesCount ?? 0}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "3px 10px",
                            borderRadius: "9999px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: isActive ? "var(--admin-success-bg, #E6FBF2)" : "var(--admin-surface-elevated, #F1F5F9)",
                            color: isActive ? "var(--admin-success, #10B981)" : "var(--admin-text-secondary, #64748B)",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: isActive ? "var(--admin-success, #10B981)" : "#94A3B8",
                            }}
                          />
                          {isActive ? "Active" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={(e) => toggleCollectionStatus(col, e)}
                          className="admin-btn-outline"
                          style={{ padding: "4px 10px", fontSize: "11px" }}
                        >
                          {isActive ? "Set Draft" : "Make Active"}
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            onClick={() => openEditModal(col)}
                            className="admin-btn-outline"
                            style={{ padding: "4px 10px", fontSize: "11px" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => requestDelete(col.id, col.name)}
                            style={{
                              background: "transparent",
                              border: "1px solid var(--admin-border)",
                              color: "var(--admin-danger, #EF4444)",
                              borderRadius: "6px",
                              padding: "4px 10px",
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
        </div>
      )}

      {/* Modal: Create / Edit Collection */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: "28px",
              maxWidth: "620px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--admin-gold)", fontWeight: 600 }}>
                  COLLECTION SETUP
                </span>
                <h2 className="admin-serif" style={{ fontSize: "22px", fontWeight: 700, margin: "4px 0 0 0", color: "var(--admin-text-primary)" }}>
                  {editingId ? `Edit: ${name}` : "Create Collection"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="admin-btn-ghost"
                style={{ fontSize: "16px", padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCollection} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Collection Name */}
              <div>
                <label className="admin-label">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rings, Heritage Pendant, Diamond Chokers..."
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="admin-input"
                  style={{ fontSize: "14px", fontWeight: 500 }}
                  autoFocus
                />
              </div>

              {/* URL Handle */}
              <div>
                <label className="admin-label">Storefront Handle</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      background: "var(--admin-surface-elevated)",
                      border: "1px solid var(--admin-border)",
                      borderRight: "none",
                      borderRadius: "6px 0 0 6px",
                      padding: "8px 12px",
                      fontSize: "12px",
                      color: "var(--admin-text-secondary)",
                      fontFamily: "monospace",
                    }}
                  >
                    /collection/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="rings"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="admin-input"
                    style={{ borderRadius: "0 6px 6px 0", fontFamily: "monospace", fontSize: "12px" }}
                  />
                </div>
              </div>

              {/* Visual Banner Preview & Upload */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className="admin-label" style={{ margin: 0 }}>Banner Image</label>
                  <label
                    style={{
                      color: "var(--admin-primary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                {/* Selected Image Box */}
                <div
                  style={{
                    height: "150px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid var(--admin-border)",
                    marginBottom: "12px",
                    position: "relative",
                    background: "var(--admin-surface-elevated)",
                  }}
                >
                  <img
                    src={resolveImageUrl(image)}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = presetImages[0].url;
                    }}
                  />
                </div>

                {/* Presets List */}
                <div>
                  <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)", display: "block", marginBottom: "8px" }}>
                    Or select from library:
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "8px" }}>
                    {presetImages.map((preset, idx) => {
                      const isSelected = image === preset.url;
                      return (
                        <div
                          key={idx}
                          onClick={() => setImage(preset.url)}
                          style={{
                            border: isSelected ? "2px solid var(--admin-primary)" : "1px solid var(--admin-border)",
                            borderRadius: "6px",
                            overflow: "hidden",
                            cursor: "pointer",
                            background: "var(--admin-surface)",
                          }}
                        >
                          <div style={{ height: "55px" }}>
                            <img
                              src={preset.url}
                              alt={preset.label}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          <div
                            style={{
                              padding: "4px 6px",
                              fontSize: "10px",
                              fontWeight: isSelected ? 600 : 400,
                              color: isSelected ? "var(--admin-primary)" : "var(--admin-text-secondary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {preset.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Publishing Status */}
              <div>
                <label className="admin-label">Publication Status</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: status === "active" ? "var(--admin-success-bg, #E6FBF2)" : "var(--admin-surface-elevated)",
                      border: status === "active" ? "1px solid var(--admin-success, #10B981)" : "1px solid var(--admin-border)",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={status === "active"}
                      onChange={() => setStatus("active")}
                      style={{ accentColor: "var(--admin-success, #10B981)" }}
                    />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--admin-text-primary)" }}>Active</div>
                      <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>Published to storefront</div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: status === "hidden" ? "var(--admin-warning-bg, #FEF6E8)" : "var(--admin-surface-elevated)",
                      border: status === "hidden" ? "1px solid var(--admin-warning, #F59E0B)" : "1px solid var(--admin-border)",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="hidden"
                      checked={status === "hidden"}
                      onChange={() => setStatus("hidden")}
                      style={{ accentColor: "var(--admin-warning, #F59E0B)" }}
                    />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--admin-text-primary)" }}>Draft</div>
                      <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>Hidden from customers</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: editingId ? "space-between" : "flex-end",
                  alignItems: "center",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--admin-border)",
                  marginTop: "6px",
                }}
              >
                {editingId && (
                  <button
                    type="button"
                    onClick={() => requestDelete(editingId, name)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--admin-danger, #EF4444)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "6px 0",
                    }}
                  >
                    Delete Collection
                  </button>
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="admin-btn-outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn-primary"
                    disabled={isSubmitting}
                    id="btn-submit-collection"
                  >
                    {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Create Collection"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-backdrop" style={{ zIndex: 100000 }} onClick={() => setDeleteTarget(null)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: "26px", maxWidth: "420px", textAlign: "center" }}
          >
            <h3 className="admin-serif" style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0", color: "var(--admin-text-primary)" }}>
              Delete Collection?
            </h3>
            <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: "0 0 20px 0", lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? Products in this collection will not be deleted.
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="admin-btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                id="btn-confirm-delete"
                style={{
                  flex: 1,
                  background: "var(--admin-danger, #EF4444)",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
