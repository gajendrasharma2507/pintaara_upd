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

const DEFAULT_FACTORY_MASTERS = [
  {
    id: 1,
    name: "Metal Purity (KT)",
    code: "PURITY",
    description: "Gold hallmark and karat purity standards for spot pricing.",
    input_type: "swatch_image",
    is_required: true,
    sort_order: 1,
    is_active: true,
    values: [
      { id: 101, value: "24KT (99.9% Pure Gold)", code: "24K", image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=200&auto=format&fit=crop", price_delta: 0, sort_order: 1, is_active: true },
      { id: 102, value: "22KT (91.6% Royal Gold)", code: "22K", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=200&auto=format&fit=crop", price_delta: 0, sort_order: 2, is_active: true },
      { id: 103, value: "18KT (75.0% Fine Gold)", code: "18K", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200&auto=format&fit=crop", price_delta: 0, sort_order: 3, is_active: true },
      { id: 104, value: "14KT (58.5% Modern Gold)", code: "14K", image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=200&auto=format&fit=crop", price_delta: 0, sort_order: 4, is_active: true },
      { id: 105, value: "PT950 (Platinum)", code: "PT950", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&auto=format&fit=crop", price_delta: 0, sort_order: 5, is_active: true },
    ],
  },
  {
    id: 2,
    name: "Finish Options",
    code: "FINISH",
    description: "Gold tone surface finish and luster texture.",
    input_type: "swatch_image",
    is_required: true,
    sort_order: 2,
    is_active: true,
    values: [
      { id: 201, value: "Yellow Gold", code: "YG", hex_color: "#D4AF37", price_delta: 0, sort_order: 1, is_active: true },
      { id: 202, value: "Rose Gold", code: "RG", hex_color: "#B76E79", price_delta: 0, sort_order: 2, is_active: true },
      { id: 203, value: "White Gold", code: "WG", hex_color: "#E8E8E8", price_delta: 0, sort_order: 3, is_active: true },
      { id: 204, value: "Matte Satin Gold", code: "MSG", hex_color: "#C5A059", price_delta: 0, sort_order: 4, is_active: true },
    ],
  },
  {
    id: 3,
    name: "Size",
    code: "SIZE",
    description: "Dimensional standards for rings, bangles, and chain lengths.",
    input_type: "text_button",
    is_required: false,
    sort_order: 3,
    is_active: true,
    values: [
      { id: 301, value: "Ring Size 10", code: "R-10", price_delta: 0, sort_order: 1, is_active: true },
      { id: 302, value: "Ring Size 12", code: "R-12", price_delta: 0, sort_order: 2, is_active: true },
      { id: 303, value: "Ring Size 14", code: "R-14", price_delta: 0, sort_order: 3, is_active: true },
      { id: 304, value: "Ring Size 16", code: "R-16", price_delta: 0, sort_order: 4, is_active: true },
      { id: 305, value: "Ring Size 18", code: "R-18", price_delta: 0, sort_order: 5, is_active: true },
    ],
  },
  {
    id: 4,
    name: "Gem & Stone Options",
    code: "GEM",
    description: "Certified natural diamonds and gemstone accents.",
    input_type: "swatch_image",
    is_required: false,
    sort_order: 4,
    is_active: true,
    values: [
      { id: 401, value: "Natural Diamond (VVS-VS)", code: "DIA", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200&auto=format&fit=crop", price_delta: 25000, sort_order: 1, is_active: true },
      { id: 402, value: "Zambian Emerald", code: "EMR", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=200&auto=format&fit=crop", price_delta: 15000, sort_order: 2, is_active: true },
      { id: 403, value: "Ceylon Blue Sapphire", code: "SAP", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&auto=format&fit=crop", price_delta: 18000, sort_order: 3, is_active: true },
      { id: 404, value: "Burmese Ruby", code: "RUB", image: "https://images.unsplash.com/photo-1611591475155-42a92b23a9b1?q=80&w=200&auto=format&fit=crop", price_delta: 20000, sort_order: 4, is_active: true },
      { id: 405, value: "No Stone / Solid Gold", code: "NONE", price_delta: 0, sort_order: 5, is_active: true },
    ],
  },
  {
    id: 5,
    name: "Chain Type",
    code: "CHAIN",
    description: "Chain weaving styles accompanying pendants and necklaces.",
    input_type: "text_button",
    is_required: false,
    sort_order: 5,
    is_active: true,
    values: [
      { id: 501, value: "Classic Box Link", code: "BOX", price_delta: 0, sort_order: 1, is_active: true },
      { id: 502, value: "Cable Link", code: "CAB", price_delta: -2000, sort_order: 2, is_active: true },
      { id: 503, value: "Diamond Cut Rope", code: "ROP", price_delta: 3500, sort_order: 3, is_active: true },
      { id: 504, value: "Spiga Wheat", code: "WHT", price_delta: 2800, sort_order: 4, is_active: true },
    ],
  },
  {
    id: 6,
    name: "Certificate Master / Types",
    code: "CERTIFICATE",
    description: "Official authenticity certificates, gemstone grading reports, and hallmarking standards.",
    input_type: "text_button",
    is_required: false,
    sort_order: 6,
    is_active: true,
    values: [
      { id: 601, value: "Authenticity Certificate", code: "AUTH_CERT", price_delta: 0, sort_order: 1, is_active: true },
      { id: 602, value: "Gem/Stone Certificate", code: "GEM_CERT", price_delta: 0, sort_order: 2, is_active: true },
      { id: 603, value: "Diamond Grading Report (IGI/GIA)", code: "DIA_REPORT", price_delta: 0, sort_order: 3, is_active: true },
      { id: 604, value: "BIS Hallmark Purity Card", code: "BIS_HALLMARK", price_delta: 0, sort_order: 4, is_active: true },
      { id: 605, value: "Assay Lab Purity Guarantee", code: "ASSAY_LAB", price_delta: 0, sort_order: 5, is_active: true },
    ],
  },
];

export default function AdminMastersPage() {
  const [masters, setMasters] = useState([]);
  const [selectedMasterId, setSelectedMasterId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState("create");
  const [categoryFormData, setCategoryFormData] = useState({
    id: null,
    name: "",
    code: "",
    description: "",
    input_type: "swatch_image",
    is_required: false,
    is_active: true,
  });

  const [showValueModal, setShowValueModal] = useState(false);
  const [valueModalMode, setValueModalMode] = useState("create");
  const [valueFormData, setValueFormData] = useState({
    id: null,
    value: "",
    code: "",
    image: "",
    hex_color: "",
    price_delta: 0,
    is_active: true,
    sort_order: 1,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load masters
  const loadMasters = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getMasters();
      if (res && res.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
        setMasters(res.data);
        localStorage.setItem("pintaara_masters_cache", JSON.stringify(res.data));
        if (!selectedMasterId) setSelectedMasterId(res.data[0].id);
      } else {
        const cached = localStorage.getItem("pintaara_masters_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            setMasters(parsed);
            if (!selectedMasterId) setSelectedMasterId(parsed[0].id);
            return;
          }
        }
        setMasters(DEFAULT_FACTORY_MASTERS);
        setSelectedMasterId(DEFAULT_FACTORY_MASTERS[0].id);
        localStorage.setItem("pintaara_masters_cache", JSON.stringify(DEFAULT_FACTORY_MASTERS));
      }
    } catch (err) {
      console.warn("API fallback to defaults:", err);
      setMasters(DEFAULT_FACTORY_MASTERS);
      setSelectedMasterId(DEFAULT_FACTORY_MASTERS[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  const currentMaster = masters.find((m) => m.id === selectedMasterId) || masters[0] || null;

  const filteredMasters = useMemo(() => {
    return masters.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [masters, searchQuery]);

  // Category Actions
  const openCreateCategoryModal = () => {
    setCategoryModalMode("create");
    setCategoryFormData({
      id: null,
      name: "",
      code: "",
      description: "",
      input_type: "swatch_image",
      is_required: false,
      is_active: true,
    });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat, e) => {
    if (e) e.stopPropagation();
    setCategoryModalMode("edit");
    setCategoryFormData({
      id: cat.id,
      name: cat.name,
      code: cat.code,
      description: cat.description || "",
      input_type: cat.input_type || "swatch_image",
      is_required: !!cat.is_required,
      is_active: cat.is_active !== false,
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    setIsSaving(true);
    try {
      if (categoryModalMode === "create") {
        const res = await adminApi.createMaster(categoryFormData);
        if (res && res.status === "success" && res.data) {
          const updated = [...masters, res.data];
          setMasters(updated);
          setSelectedMasterId(res.data.id);
          localStorage.setItem("pintaara_masters_cache", JSON.stringify(updated));
          showToast(`Category '${res.data.name}' created.`);
        } else {
          const newCat = {
            ...categoryFormData,
            id: Date.now(),
            code: categoryFormData.code || categoryFormData.name.toUpperCase().replace(/\s+/g, "_"),
            values: [],
          };
          const updated = [...masters, newCat];
          setMasters(updated);
          setSelectedMasterId(newCat.id);
          localStorage.setItem("pintaara_masters_cache", JSON.stringify(updated));
          showToast(`Category '${newCat.name}' created.`);
        }
      } else {
        await adminApi.updateMaster(categoryFormData.id, categoryFormData);
        const updated = masters.map((m) =>
          m.id === categoryFormData.id ? { ...m, ...categoryFormData, values: m.values } : m
        );
        setMasters(updated);
        localStorage.setItem("pintaara_masters_cache", JSON.stringify(updated));
        showToast(`Category '${categoryFormData.name}' updated.`);
      }
      setShowCategoryModal(false);
    } catch (err) {
      console.error(err);
      showToast("Error saving category.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Delete category '${catName}'?`)) return;
    setIsSaving(true);
    try {
      await adminApi.deleteMaster(catId);
      const updated = masters.filter((m) => m.id !== catId);
      setMasters(updated);
      localStorage.setItem("pintaara_masters_cache", JSON.stringify(updated));
      if (selectedMasterId === catId && updated.length > 0) {
        setSelectedMasterId(updated[0].id);
      }
      showToast(`Category '${catName}' removed.`);
    } catch (err) {
      console.error(err);
      showToast("Error deleting category.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategoryActive = async (catId, e) => {
    if (e) e.stopPropagation();
    const cat = masters.find((m) => m.id === catId);
    if (!cat) return;

    const nextActive = !cat.is_active;
    const updated = masters.map((m) => (m.id === catId ? { ...m, is_active: nextActive } : m));
    setMasters(updated);

    try {
      await adminApi.updateMaster(catId, { ...cat, is_active: nextActive });
      localStorage.setItem("pintaara_masters_cache", JSON.stringify(updated));
      showToast(`'${cat.name}' is now ${nextActive ? "Active" : "Inactive"}.`);
    } catch (err) {
      console.warn(err);
    }
  };

  // Option Value Actions
  const openCreateValueModal = () => {
    setValueModalMode("create");
    setValueFormData({
      id: null,
      value: "",
      code: "",
      image: "",
      hex_color: "",
      price_delta: 0,
      is_active: true,
      sort_order: (currentMaster?.values?.length || 0) + 1,
    });
    setShowValueModal(true);
  };

  const openEditValueModal = (val) => {
    setValueModalMode("edit");
    setValueFormData({
      id: val.id,
      value: val.value,
      code: val.code || "",
      image: val.image || "",
      hex_color: val.hex_color || "",
      price_delta: val.price_delta || 0,
      is_active: val.is_active !== false,
      sort_order: val.sort_order || 1,
    });
    setShowValueModal(true);
  };

  const handleSaveValue = async (e) => {
    e.preventDefault();
    if (!valueFormData.value.trim() || !currentMaster) return;

    setIsSaving(true);
    try {
      if (valueModalMode === "create") {
        const res = await adminApi.addMasterValue(currentMaster.id, valueFormData);
        if (res && res.status === "success" && res.data) {
          const updated = masters.map((m) =>
            m.id === currentMaster.id ? { ...m, values: [...(m.values || []), res.data] } : m
          );
          setMasters(updated);
          localStorage.setItem("pintaara_masters_cache", JSON.stringify(updated));
          showToast(`Option added.`);
        } else {
          const newVal = {
            ...valueFormData,
            id: Date.now(),
            master_id: currentMaster.id,
          };
          const updated = masters.map((m) =>
            m.id === currentMaster.id ? { ...m, values: [...(m.values || []), newVal] } : m
          );
          setMasters(updated);
          localStorage.setItem("pintaara_masters_cache", JSON.stringify(updated));
          showToast(`Option added.`);
        }
      } else {
        await adminApi.updateMasterValue(valueFormData.id, valueFormData);
        const updated = masters.map((m) =>
          m.id === currentMaster.id
            ? {
                ...m,
                values: m.values.map((v) => (v.id === valueFormData.id ? { ...v, ...valueFormData } : v)),
              }
            : m
        );
        setMasters(updated);
        localStorage.setItem("pintaara_masters_cache", JSON.stringify(updated));
        showToast(`Option updated.`);
      }
      setShowValueModal(false);
    } catch (err) {
      console.error(err);
      showToast("Error saving option value.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteValue = async (valId, valName) => {
    if (!window.confirm(`Delete option '${valName}'?`)) return;
    setIsSaving(true);
    try {
      await adminApi.deleteMasterValue(valId);
      const updated = masters.map((m) =>
        m.id === currentMaster.id ? { ...m, values: m.values.filter((v) => v.id !== valId) } : m
      );
      setMasters(updated);
      localStorage.setItem("pintaara_masters_cache", JSON.stringify(updated));
      showToast(`Option removed.`);
    } catch (err) {
      console.error(err);
      showToast("Error deleting option.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInlineValueChange = (valId, field, value) => {
    const updated = masters.map((m) =>
      m.id === currentMaster.id
        ? {
            ...m,
            values: m.values.map((v) => (v.id === valId ? { ...v, [field]: value } : v)),
          }
        : m
    );
    setMasters(updated);
  };

  const handleMoveValue = async (valId, direction) => {
    if (!currentMaster || !currentMaster.values) return;
    const values = [...currentMaster.values];
    const index = values.findIndex((v) => v.id === valId);
    if (index < 0) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= values.length) return;

    const temp = values[index];
    values[index] = values[newIndex];
    values[newIndex] = temp;

    const reordered = values.map((v, i) => ({ ...v, sort_order: i + 1 }));
    const updated = masters.map((m) => (m.id === currentMaster.id ? { ...m, values: reordered } : m));
    setMasters(updated);

    try {
      await adminApi.updateMaster(currentMaster.id, {
        ...currentMaster,
        values: reordered,
      });
      localStorage.setItem("pintaara_masters_cache", JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSaveInlineValues = async () => {
    if (!currentMaster) return;
    setIsSaving(true);
    try {
      await adminApi.updateMaster(currentMaster.id, {
        name: currentMaster.name,
        code: currentMaster.code,
        description: currentMaster.description,
        input_type: currentMaster.input_type,
        is_required: currentMaster.is_required,
        is_active: currentMaster.is_active,
        values: currentMaster.values,
      });
      localStorage.setItem("pintaara_masters_cache", JSON.stringify(masters));
      showToast(`Changes saved for '${currentMaster.name}'.`);
    } catch (err) {
      console.error(err);
      showToast("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPresets = async () => {
    if (!window.confirm("Reset all Customization Masters to factory presets? Any custom entries will be reset.")) return;
    setIsSaving(true);
    try {
      const res = await adminApi.resetMasters();
      if (res && res.data) {
        setMasters(res.data);
        if (res.data.length > 0) setSelectedMasterId(res.data[0].id);
        localStorage.setItem("pintaara_masters_cache", JSON.stringify(res.data));
        showToast("Presets restored.");
      }
    } catch (err) {
      console.error(err);
      showToast("Error resetting presets.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e, setter) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setter(event.target.result);
      };
      reader.readAsDataURL(file);

      try {
        const uploadRes = await adminApi.uploadMasterImage(file);
        if (uploadRes && uploadRes.status === "success" && uploadRes.url) {
          setter(uploadRes.url);
          showToast("Image uploaded.");
          return;
        }
      } catch (err) {
        console.warn(err);
      }
      showToast("Image loaded.");
    }
  };

  return (
    <div style={{ maxWidth: "1500px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Toast */}
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
            Customization Masters
          </h1>
          <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", marginTop: "4px", margin: 0 }}>
            Manage product customization options, attribute codes, and price adjustments.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleResetPresets}
            disabled={isSaving}
            className="admin-btn-outline"
            style={{ fontSize: "13px", padding: "8px 14px" }}
          >
            Reset Presets
          </button>
          <button
            onClick={openCreateCategoryModal}
            disabled={isSaving}
            className="admin-btn-primary"
            style={{ fontSize: "13px", padding: "8px 16px" }}
          >
            + Add Category
          </button>
        </div>
      </div>

      {/* Side-by-Side Clean Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* ============================================================ */}
        {/* LEFT COLUMN: CATEGORIES LIST                                 */}
        {/* ============================================================ */}
        <div
          className="admin-card"
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Search Box */}
          <input
            type="text"
            className="admin-input"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", fontSize: "12px", padding: "8px 12px" }}
          />

          {/* Categories List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {isLoading ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "13px" }}>
                Loading categories...
              </div>
            ) : filteredMasters.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "13px" }}>
                No categories found.
              </div>
            ) : (
              filteredMasters.map((cat) => {
                const isSelected = cat.id === selectedMasterId;
                const count = (cat.values || []).length;

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedMasterId(cat.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: isSelected ? "var(--admin-primary-light)" : "transparent",
                      border: isSelected ? "1px solid var(--admin-primary)" : "1px solid transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "var(--admin-surface-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? "var(--admin-primary)" : "var(--admin-text-primary)",
                        }}
                      >
                        {cat.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontFamily: "monospace",
                            color: "var(--admin-text-secondary)",
                            background: "var(--admin-surface-elevated)",
                            border: "1px solid var(--admin-border)",
                            padding: "1px 5px",
                            borderRadius: "3px",
                          }}
                        >
                          {cat.code}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                          {count} {count === 1 ? "option" : "options"}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => toggleCategoryActive(cat.id, e)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: cat.is_active ? "var(--admin-success)" : "var(--admin-text-muted)",
                          cursor: "pointer",
                          padding: "2px 4px",
                        }}
                      >
                        {cat.is_active ? "Active" : "Off"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: DIRECT TABLE EDITOR                            */}
        {/* ============================================================ */}
        {currentMaster ? (
          <div
            className="admin-card"
            style={{
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* Category Banner Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--admin-border)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--admin-text-primary)",
                      margin: 0,
                    }}
                  >
                    {currentMaster.name}
                  </h2>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      background: "var(--admin-surface-elevated)",
                      border: "1px solid var(--admin-border)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      color: "var(--admin-text-secondary)",
                    }}
                  >
                    {currentMaster.code}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontWeight: 600,
                      background: currentMaster.is_active ? "var(--admin-success-bg)" : "var(--admin-warning-bg)",
                      color: currentMaster.is_active ? "var(--admin-success)" : "var(--admin-warning)",
                    }}
                  >
                    {currentMaster.is_active ? "Active" : "Disabled"}
                  </span>
                  {currentMaster.is_required && (
                    <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                      (Required)
                    </span>
                  )}
                </div>
                {currentMaster.description && (
                  <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "4px", margin: 0 }}>
                    {currentMaster.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={(e) => openEditCategoryModal(currentMaster, e)}
                  className="admin-btn-outline"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  Edit Category
                </button>
                <button
                  onClick={() => handleDeleteCategory(currentMaster.id, currentMaster.name)}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--admin-border)",
                    color: "var(--admin-danger)",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                  title="Delete Category"
                >
                  Delete
                </button>
                <button
                  onClick={openCreateValueModal}
                  className="admin-btn-primary"
                  style={{ fontSize: "12px", padding: "6px 14px" }}
                >
                  + Add Option
                </button>
              </div>
            </div>

            {/* Direct Values Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-surface-elevated)" }}>
                    <th style={{ padding: "10px 12px", color: "var(--admin-text-secondary)", fontWeight: 600, width: "70px" }}>
                      Order
                    </th>
                    <th style={{ padding: "10px 12px", color: "var(--admin-text-secondary)", fontWeight: 600, width: "60px" }}>
                      Active
                    </th>
                    <th style={{ padding: "10px 12px", color: "var(--admin-text-secondary)", fontWeight: 600, width: "70px" }}>
                      Swatch
                    </th>
                    <th style={{ padding: "10px 12px", color: "var(--admin-text-secondary)", fontWeight: 600, minWidth: "220px" }}>
                      Option Label
                    </th>
                    <th style={{ padding: "10px 12px", color: "var(--admin-text-secondary)", fontWeight: 600, width: "120px" }}>
                      Code
                    </th>
                    <th style={{ padding: "10px 12px", color: "var(--admin-text-secondary)", fontWeight: 600, width: "140px" }}>
                      Price Delta (₹)
                    </th>
                    <th style={{ padding: "10px 12px", color: "var(--admin-text-secondary)", fontWeight: 600, textAlign: "right", width: "100px" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!currentMaster.values || currentMaster.values.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: "36px", textAlign: "center", color: "var(--admin-text-muted)" }}>
                        No options added yet. Click <strong>+ Add Option</strong> to create one.
                      </td>
                    </tr>
                  ) : (
                    currentMaster.values.map((val, idx) => {
                      const isActive = val.is_active !== false;

                      return (
                        <tr
                          key={val.id}
                          style={{
                            borderBottom: "1px solid var(--admin-border-light)",
                            opacity: isActive ? 1 : 0.5,
                          }}
                        >
                          {/* Order / Reorder */}
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", width: "16px" }}>
                                {idx + 1}
                              </span>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <button
                                  onClick={() => handleMoveValue(val.id, "up")}
                                  disabled={idx === 0}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: idx === 0 ? "var(--admin-border)" : "var(--admin-text-secondary)",
                                    cursor: idx === 0 ? "default" : "pointer",
                                    fontSize: "9px",
                                    lineHeight: 1,
                                    padding: "1px",
                                  }}
                                >
                                  ▲
                                </button>
                                <button
                                  onClick={() => handleMoveValue(val.id, "down")}
                                  disabled={idx === currentMaster.values.length - 1}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: idx === currentMaster.values.length - 1 ? "var(--admin-border)" : "var(--admin-text-secondary)",
                                    cursor: idx === currentMaster.values.length - 1 ? "default" : "pointer",
                                    fontSize: "9px",
                                    lineHeight: 1,
                                    padding: "1px",
                                  }}
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Active Toggle */}
                          <td style={{ padding: "10px 12px" }}>
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={(e) => handleInlineValueChange(val.id, "is_active", e.target.checked)}
                              style={{ width: "15px", height: "15px", cursor: "pointer", accentColor: "var(--admin-primary)" }}
                            />
                          </td>

                          {/* Swatch Thumbnail (Click to edit) */}
                          <td style={{ padding: "10px 12px" }}>
                            <div
                              onClick={() => openEditValueModal(val)}
                              title="Click to edit image or color"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                overflow: "hidden",
                                background: val.hex_color || "var(--admin-surface-elevated)",
                                border: "1px solid var(--admin-border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              {val.image ? (
                                <img
                                  src={resolveImageUrl(val.image)}
                                  alt=""
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  onError={(e) => {
                                    if (val.image && val.image.startsWith("/") && !e.currentTarget.dataset.retried) {
                                      e.currentTarget.dataset.retried = "true";
                                      e.currentTarget.src = `https://pintaara.com${val.image}`;
                                    } else {
                                      e.currentTarget.style.display = "none";
                                    }
                                  }}
                                />
                              ) : val.hex_color ? (
                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FFF", opacity: 0.6 }} />
                              ) : (
                                <span style={{ fontSize: "10px", color: "var(--admin-text-muted)" }}>—</span>
                              )}
                            </div>
                          </td>

                          {/* Value Name */}
                          <td style={{ padding: "10px 12px" }}>
                            <input
                              type="text"
                              className="admin-input"
                              value={val.value}
                              onChange={(e) => handleInlineValueChange(val.id, "value", e.target.value)}
                              placeholder="Option name"
                              style={{ width: "100%", fontSize: "13px", padding: "6px 10px" }}
                            />
                          </td>

                          {/* Code */}
                          <td style={{ padding: "10px 12px" }}>
                            <input
                              type="text"
                              className="admin-input"
                              value={val.code || ""}
                              onChange={(e) => handleInlineValueChange(val.id, "code", e.target.value)}
                              placeholder="Code"
                              style={{ width: "100%", fontSize: "12px", fontFamily: "monospace", padding: "6px 8px" }}
                            />
                          </td>

                          {/* Price Delta */}
                          <td style={{ padding: "10px 12px" }}>
                            <input
                              type="number"
                              className="admin-input"
                              value={val.price_delta || 0}
                              onChange={(e) => handleInlineValueChange(val.id, "price_delta", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              style={{ width: "100%", fontSize: "12px", padding: "6px 8px" }}
                            />
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "10px 12px", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                              <button
                                onClick={() => openEditValueModal(val)}
                                className="admin-btn-outline"
                                style={{ fontSize: "11px", padding: "4px 8px" }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteValue(val.id, val.value)}
                                style={{
                                  background: "transparent",
                                  border: "1px solid var(--admin-border)",
                                  color: "var(--admin-danger)",
                                  borderRadius: "6px",
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
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "14px",
                borderTop: "1px solid var(--admin-border)",
              }}
            >
              <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                {currentMaster.values?.length || 0} total options in this category.
              </div>
              <button
                className="admin-btn-primary"
                onClick={handleSaveInlineValues}
                disabled={isSaving}
                style={{ fontSize: "13px", padding: "8px 20px" }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: ADD / EDIT CATEGORY                                 */}
      {/* ============================================================ */}
      {showCategoryModal && (
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
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="admin-card"
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              boxShadow: "var(--admin-shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                {categoryModalMode === "create" ? "Add Category" : "Edit Category"}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                style={{ background: "none", border: "none", color: "var(--admin-text-muted)", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "5px" }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  placeholder="e.g. Metal Purity or Clasp Type"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "5px" }}>
                    Code
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. PURITY"
                    value={categoryFormData.code}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value.toUpperCase() })}
                    style={{ width: "100%", fontFamily: "monospace" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "5px" }}>
                    Display Type
                  </label>
                  <select
                    className="admin-input"
                    value={categoryFormData.input_type}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, input_type: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="swatch_image">Image Swatch</option>
                    <option value="text_button">Text Button</option>
                    <option value="dropdown">Dropdown</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "5px" }}>
                  Description
                </label>
                <textarea
                  rows="2"
                  className="admin-input"
                  placeholder="Optional notes or instructions..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", color: "var(--admin-text-primary)" }}>
                  <input
                    type="checkbox"
                    checked={categoryFormData.is_active}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, is_active: e.target.checked })}
                    style={{ accentColor: "var(--admin-primary)" }}
                  />
                  Active
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", color: "var(--admin-text-primary)" }}>
                  <input
                    type="checkbox"
                    checked={categoryFormData.is_required}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, is_required: e.target.checked })}
                    style={{ accentColor: "var(--admin-primary)" }}
                  />
                  Required for Products
                </label>
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button
                  type="button"
                  className="admin-btn-ghost"
                  onClick={() => setShowCategoryModal(false)}
                  style={{ padding: "6px 14px", fontSize: "12px" }}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={isSaving} style={{ padding: "6px 18px", fontSize: "12px" }}>
                  {isSaving ? "Saving..." : categoryModalMode === "create" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: ADD / EDIT OPTION VALUE                             */}
      {/* ============================================================ */}
      {showValueModal && currentMaster && (
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
          onClick={() => setShowValueModal(false)}
        >
          <div
            className="admin-card"
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "24px",
              boxShadow: "var(--admin-shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                {valueModalMode === "create" ? `Add Option to ${currentMaster.name}` : `Edit Option`}
              </h3>
              <button
                onClick={() => setShowValueModal(false)}
                style={{ background: "none", border: "none", color: "var(--admin-text-muted)", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveValue} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "5px" }}>
                  Option Label *
                </label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  placeholder="e.g. 18KT (75.0% Fine Gold) or Rose Gold"
                  value={valueFormData.value}
                  onChange={(e) => setValueFormData({ ...valueFormData, value: e.target.value })}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "5px" }}>
                    Code / Suffix
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. 18K"
                    value={valueFormData.code}
                    onChange={(e) => setValueFormData({ ...valueFormData, code: e.target.value })}
                    style={{ width: "100%", fontFamily: "monospace" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "5px" }}>
                    Price Delta (₹)
                  </label>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="0"
                    value={valueFormData.price_delta}
                    onChange={(e) => setValueFormData({ ...valueFormData, price_delta: parseFloat(e.target.value) || 0 })}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Image Upload & Hex Color */}
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "6px" }}>
                    Image Upload
                  </label>
                  {valueFormData.image ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 10px",
                        border: "1px solid var(--admin-border)",
                        borderRadius: "6px",
                        background: "var(--admin-surface-elevated)",
                      }}
                    >
                      <img
                        src={resolveImageUrl(valueFormData.image)}
                        alt="Preview"
                        style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--admin-border)" }}
                        onError={(e) => {
                          if (valueFormData.image && valueFormData.image.startsWith("/") && !e.currentTarget.dataset.retried) {
                            e.currentTarget.dataset.retried = "true";
                            e.currentTarget.src = `https://pintaara.com${valueFormData.image}`;
                          }
                        }}
                      />
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                        <label
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "var(--admin-primary)",
                            cursor: "pointer",
                          }}
                        >
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, (url) => setValueFormData((prev) => ({ ...prev, image: url })))}
                            style={{ display: "none" }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setValueFormData((prev) => ({ ...prev, image: "" }))}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--admin-danger)",
                            fontSize: "11px",
                            cursor: "pointer",
                            textAlign: "left",
                            padding: 0,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (url) => setValueFormData((prev) => ({ ...prev, image: url })))}
                      style={{
                        fontSize: "12px",
                        color: "var(--admin-text-secondary)",
                        border: "1px dashed var(--admin-border)",
                        padding: "8px",
                        borderRadius: "6px",
                        width: "100%",
                        background: "var(--admin-surface-elevated)",
                        cursor: "pointer",
                      }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "6px" }}>
                    Hex Color
                  </label>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      type="color"
                      value={valueFormData.hex_color || "#D4AF37"}
                      onChange={(e) => setValueFormData({ ...valueFormData, hex_color: e.target.value })}
                      style={{ width: "36px", height: "36px", border: "none", cursor: "pointer", background: "none" }}
                    />
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="#D4AF37"
                      value={valueFormData.hex_color}
                      onChange={(e) => setValueFormData({ ...valueFormData, hex_color: e.target.value })}
                      style={{ width: "100%", fontFamily: "monospace", fontSize: "12px", padding: "7px 8px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", color: "var(--admin-text-primary)" }}>
                  <input
                    type="checkbox"
                    checked={valueFormData.is_active}
                    onChange={(e) => setValueFormData({ ...valueFormData, is_active: e.target.checked })}
                    style={{ accentColor: "var(--admin-primary)" }}
                  />
                  Option Active
                </label>
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button
                  type="button"
                  className="admin-btn-ghost"
                  onClick={() => setShowValueModal(false)}
                  style={{ padding: "6px 14px", fontSize: "12px" }}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={isSaving} style={{ padding: "6px 18px", fontSize: "12px" }}>
                  {isSaving ? "Saving..." : valueModalMode === "create" ? "Add Option" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
