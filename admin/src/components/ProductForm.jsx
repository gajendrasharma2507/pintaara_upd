"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import adminApi, { API_BASE_URL } from "@/lib/api";

const resolveImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("data:") || img.startsWith("blob:") || img.startsWith("http://") || img.startsWith("https://")) {
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

const getMediaType = (item) => {
  if (!item) return "image";
  if (typeof item === "object") {
    if (item.type) return item.type;
    item = item.url || "";
  }
  const clean = String(item).toLowerCase().split("?")[0];
  if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || clean.endsWith(".m4v") || clean.startsWith("data:video/")) {
    return "video";
  }
  if (clean.endsWith(".glb") || clean.endsWith(".gltf") || clean.endsWith(".usdz") || clean.endsWith(".obj") || clean.startsWith("data:model/")) {
    return "model";
  }
  return "image";
};

const defaultOptionMasters = [
  {
    id: "metal_purity",
    name: "Metal Purity (KT)",
    description: "Gold hallmark and karat purity standards",
    default_enabled: true,
    values: [
      { value: "24KT (99.9% Pure Gold)", image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=200&auto=format&fit=crop", enabled: true },
      { value: "22KT (91.6% Royal Gold)", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=200&auto=format&fit=crop", enabled: true },
      { value: "18KT (75.0% Fine Gold)", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200&auto=format&fit=crop", enabled: true },
      { value: "14KT (58.5% Modern Gold)", image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=200&auto=format&fit=crop", enabled: false },
      { value: "PT950 (Platinum)", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&auto=format&fit=crop", enabled: false },
    ],
  },
  {
    id: "finish_options",
    name: "Finish Options",
    description: "Surface finish texture and gold tone",
    default_enabled: true,
    values: [
      { value: "Yellow Gold", image: "/images/products/pendant.png", enabled: true },
      { value: "Rose Gold", image: "/images/concept-hero1.png", enabled: true },
      { value: "White Gold", image: "/images/concept-designlog.png", enabled: true },
      { value: "Matte Satin Gold", image: "/images/concept-philosophy.png", enabled: false },
    ],
  },
  {
    id: "size",
    name: "Size",
    description: "Dimensional sizing for rings, bangles, or chain lengths",
    default_enabled: false,
    values: [
      { value: "Ring Size 10", image: "", enabled: true },
      { value: "Ring Size 12", image: "", enabled: true },
      { value: "Ring Size 14", image: "", enabled: true },
      { value: "Ring Size 16", image: "", enabled: true },
      { value: "Ring Size 18", image: "", enabled: false },
    ],
  },
  {
    id: "gem_stone_options",
    name: "Gem & Stone Options",
    description: "Natural diamonds and precious gemstone accents",
    default_enabled: true,
    values: [
      { value: "Natural Diamond (VVS-VS)", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200&auto=format&fit=crop", price_delta: 25000, enabled: true },
      { value: "Zambian Emerald", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=200&auto=format&fit=crop", price_delta: 2000, enabled: true },
      { value: "Ceylon Blue Sapphire", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&auto=format&fit=crop", price_delta: 3500, enabled: true },
      { value: "Burmese Ruby", image: "https://images.unsplash.com/photo-1611591475155-42a92b23a9b1?q=80&w=200&auto=format&fit=crop", price_delta: 4000, enabled: true },
      { value: "No Stone / Solid Gold", image: "", price_delta: 0, enabled: true },
    ],
  },
  {
    id: "chain_type",
    name: "Chain Type",
    description: "Chain link style accompanying pendants and necklaces",
    default_enabled: false,
    values: [
      { value: 'Box Chain (18")', image: "/images/products/chain.png", price_delta: 8000, enabled: true },
      { value: 'Cable Chain (18")', image: "/images/concept-hero1.png", price_delta: 7500, enabled: true },
      { value: 'Rope Chain (20")', image: "/images/products/necklace.png", price_delta: 12000, enabled: false },
      { value: "Pendant Only (No Chain)", image: "", price_delta: 0, enabled: true },
    ],
  },
];

export default function ProductForm({ isEdit = false, productId = null, existingProduct = null }) {
  const router = useRouter();

  const [collections, setCollections] = useState([]);
  const [masterTemplates, setMasterTemplates] = useState(defaultOptionMasters);
  const [rates, setRates] = useState({
    gold_24k_per_g: 16157,
    gold_22k_per_g: 14800,
    gold_18k_per_g: 12118,
    gold_14k_per_g: 9452,
    silver_per_g: 211.45,
    source: "live",
    refreshed_at: null,
  });
  const [ratesLoading, setRatesLoading] = useState(true);
  const [lastRateSync, setLastRateSync] = useState(null);

  const fetchLiveRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      let data = null;
      try {
        const res = await adminApi.getGoldRates();
        if (res && (res.status === "success" || res.base_22kt_rate_per_10g || res.data)) {
          data = res.data || res;
        }
      } catch (_) {}

      if (!data) {
        const raw = await fetch(`${API_BASE_URL}/gold-rate/today`, { headers: { Accept: "application/json" } });
        if (raw.ok) {
          const json = await raw.json();
          if (json && (json.status === "success" || json.base_22kt_rate_per_10g)) {
            data = json.data || json;
          }
        }
      }

      if (data) {
        const gold22Per10g = parseFloat(data.base_22kt_rate_per_10g || data.gold_22kt_per_10g || 148000);
        const gold22PerG = gold22Per10g / 10;
        const gold24PerG = parseFloat(data.pure_24kt_rate_per_gram || (gold22PerG / 0.916));
        const silverPer10g = parseFloat(
          data.silver_base_per_10g && data.silver_base_per_10g < 50000
            ? data.silver_base_per_10g
            : (data.silver_per_kg ? data.silver_per_kg / 100 : 2114.5)
        );
        const silverPerG = silverPer10g / 10;

        setRates({
          gold_24k_per_g: Math.round(gold24PerG),
          gold_22k_per_g: Math.round(gold22PerG),
          gold_18k_per_g: Math.round(gold24PerG * 0.750),
          gold_14k_per_g: Math.round(gold24PerG * 0.585),
          silver_per_g: Math.round(silverPerG * 100) / 100,
          source: data.source || "live",
          feed: data.feed || "aarav-bullion",
          refreshed_at: data.refreshed_at || new Date().toISOString(),
          purities: data.purities || [],
        });
        setLastRateSync(new Date());
      }
    } catch (err) {
      console.warn("Failed to fetch live bullion rates:", err);
    } finally {
      setRatesLoading(false);
    }
  }, []);
  const [isLoading, setIsLoading] = useState(isEdit && !existingProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("essentials"); // 'essentials' | 'pricing' | 'matrix' | 'design_log'
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [showBlueprintLibrary, setShowBlueprintLibrary] = useState(false);
  const [isDraggingBlueprint, setIsDraggingBlueprint] = useState(false);
  const [selectedLibraryItems, setSelectedLibraryItems] = useState([]);
  const [libraryFilter, setLibraryFilter] = useState("all");

  // Dynamic Jewelry Configuration Matrix & Variants State
  const [finishesList, setFinishesList] = useState([]);
  const [puritiesList, setPuritiesList] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [stonesList, setStonesList] = useState([]);
  const [globalMatrix, setGlobalMatrix] = useState([]);
  const [productFinishMatrix, setProductFinishMatrix] = useState({}); // { [finish_id]: [purity_id, ...] }
  const [productVariants, setProductVariants] = useState([]);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [savingVariantId, setSavingVariantId] = useState(null);
  const [benchmarkPurities, setBenchmarkPurities] = useState(["18KT", "22KT", "14KT"]);
  const [newCustomSize, setNewCustomSize] = useState("");
  const [newCustomStone, setNewCustomStone] = useState("");
  const [newCustomStoneDelta, setNewCustomStoneDelta] = useState("");
  const [newCustomChain, setNewCustomChain] = useState("");
  const [newCustomChainDelta, setNewCustomChainDelta] = useState("");

  const initialForm = {
    name: "",
    design_code: "",
    collection_master_id: "",
    tier: "Signature",
    metal: "18K Yellow Gold",
    metal_type: "gold",
    karat: "18K",
    purity_fraction: 0.750,
    base_weight_grams: 5.0,
    making_charge_type: "flat",
    making_charge: 12000,
    making_charge_percent: "",
    wastage_percent: 2.5,
    stone_charge: 0,
    status: "active",
    huid: "",
    certificate_number: "",
    certificate_url: "",
    designed_by: "Darshit Soni",
    release_date: new Date().toISOString().split("T")[0],
    description: "",
    model_3d_url: "",
    image: "",
    images: [],
    options: defaultOptionMasters.map((m) => ({
      name: m.name,
      description: m.description,
      enabled: m.default_enabled,
      values: m.values.map((v) => ({ ...v })),
    })),
    design_log: {
      blueprint_image: "",
      design_type: "BESPOKE DESIGN",
      material_options: "18KT Solid Gold",
      finish_options: "Yellow Gold, White Gold, Rose Gold",
      size_options: "Standard",
      gem_options: "Natural Diamond",
      inspired_by: "Dewdrop physics and morning horizon light",
      brand_origin: "A PINTAARA™ ORIGINAL",
      designed_by: "DESIGNED X Darshit Soni",
      status: "UNDER DEVELOPMENT",
      release_date: "",
    },
  };

  const [formState, setFormState] = useState(initialForm);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBlueprintFileUpload = async (file) => {
    if (!file) return;
    showToast(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("media", file);
      const res = await adminApi.uploadMedia(formData);
      if (res && res.status === "success" && res.data?.url) {
        setFormState((prev) => ({
          ...prev,
          design_log: {
            ...prev.design_log,
            blueprint_image: res.data.url,
          },
        }));
        showToast("Blueprint drawing uploaded successfully.");
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormState((prev) => ({
            ...prev,
            design_log: {
              ...prev.design_log,
              blueprint_image: e.target?.result,
            },
          }));
          showToast("Blueprint drawing loaded.");
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormState((prev) => ({
          ...prev,
          design_log: {
            ...prev.design_log,
            blueprint_image: e.target?.result,
          },
        }));
        showToast("Blueprint drawing loaded.");
      };
      reader.readAsDataURL(file);
    }
  };


  // Load Form Metadata and Existing Product if Editing
  useEffect(() => {
    async function loadMetadata() {
      try {
        try {
          const colRes = await adminApi.getCollections();
          if (colRes && colRes.status === "success" && Array.isArray(colRes.data) && colRes.data.length > 0) {
            setCollections(colRes.data);
          }
        } catch (_) {}

        try {
          const mastersRes = await adminApi.getMasters();
          if (mastersRes && mastersRes.status === "success" && Array.isArray(mastersRes.data) && mastersRes.data.length > 0) {
            const formatted = mastersRes.data.map((m) => ({
              id: m.id,
              name: m.name,
              code: m.code,
              description: m.description,
              input_type: m.input_type || "swatch_image",
              default_enabled: m.is_required || m.is_active,
              values: (m.values || []).map((v) => ({
                id: v.id,
                value: v.value,
                code: v.code,
                image: v.image || "",
                price_delta: v.price_delta || 0,
                hex_color: v.hex_color || null,
                enabled: v.is_active !== false,
              })),
            }));
            setMasterTemplates(formatted);
          }
        } catch (e) {
          console.warn(e);
        }

        await fetchLiveRates();
      } catch (err) {
        console.warn(err);
      }

      // Load Dynamic Relational Jewelry Master Data
      try {
        const [fRes, pRes, mRes, sRes, stRes] = await Promise.all([
          adminApi.getFinishes(),
          adminApi.getPurities(),
          adminApi.getFinishPuritiesMatrix(),
          adminApi.getSizes(),
          adminApi.getStones(),
        ]);
        if (fRes?.status === "success" && Array.isArray(fRes.data)) setFinishesList(fRes.data);
        if (pRes?.status === "success" && Array.isArray(pRes.data)) setPuritiesList(pRes.data);
        if (sRes?.status === "success" && Array.isArray(sRes.data)) setSizesList(sRes.data);
        if (stRes?.status === "success" && Array.isArray(stRes.data)) setStonesList(stRes.data);
        if (mRes?.status === "success" && Array.isArray(mRes.data)) {
          setGlobalMatrix(mRes.data);
          // Pre-seed default product finish matrix if creating new
          if (!isEdit) {
            const defaults = {};
            mRes.data.forEach((item) => {
              defaults[item.finish_id] = (item.allowed_purities || []).map((p) => p.id);
            });
            setProductFinishMatrix(defaults);
          }
        }
      } catch (err) {
        console.warn("Error loading dynamic jewelry configurations:", err);
      }
    }

    loadMetadata();
  }, [isEdit]);

  // Populate data when editing
  useEffect(() => {
    async function fetchProductData() {
      if (!isEdit || !productId) return;

      if (existingProduct) {
        populateForm(existingProduct);
        return;
      }

      setIsLoading(true);
      try {
        const res = await adminApi.getProduct(productId);
        if (res && res.status === "success" && res.data) {
          populateForm(res.data);
        } else {
          // Local storage fallback
          const cached = localStorage.getItem("pintaara_products_cache");
          if (cached) {
            const list = JSON.parse(cached);
            const found = list.find((p) => String(p.id) === String(productId));
            if (found) populateForm(found);
          }
        }
      } catch (err) {
        console.warn("Error loading product:", err);
        const cached = localStorage.getItem("pintaara_products_cache");
        if (cached) {
          const list = JSON.parse(cached);
          const found = list.find((p) => String(p.id) === String(productId));
          if (found) populateForm(found);
        }
      } finally {
        setIsLoading(false);
      }

      // Fetch product-specific finish-purity rules and variants
      try {
        const [fpRes, vRes] = await Promise.all([
          adminApi.getProductFinishPurities(productId),
          adminApi.getProductVariants(productId),
        ]);
        if (fpRes?.status === "success" && Array.isArray(fpRes.data) && fpRes.data.length > 0) {
          const mapped = {};
          fpRes.data.forEach((item) => {
            if (!mapped[item.finish_id]) mapped[item.finish_id] = [];
            if (!mapped[item.finish_id].includes(item.purity_id)) {
              mapped[item.finish_id].push(item.purity_id);
            }
          });
          setProductFinishMatrix(mapped);
        }
        if (vRes?.status === "success" && Array.isArray(vRes.data)) {
          setProductVariants(vRes.data);
        }
      } catch (err) {
        console.warn("Error loading product finish purities/variants:", err);
      }
    }

    fetchProductData();
  }, [isEdit, productId, existingProduct]);

  const populateForm = (prod) => {
    const existingOptions = prod.options && Array.isArray(prod.options) ? prod.options : [];

    const mergedOptions = masterTemplates.map((m) => {
      const existing = existingOptions.find((o) => o.name === m.name);
      if (existing) {
        const templateValues = m.values.map((val) => {
          const ev = (existing.values || []).find((v) => (typeof v === "object" ? v.value : v) === val.value);
          return {
            ...val,
            enabled: ev ? (typeof ev === "object" ? ev.enabled !== false : true) : false,
          };
        });
        const extraValues = (existing.values || [])
          .filter((ev) => {
            const evVal = typeof ev === "object" ? ev.value : ev;
            return !m.values.some((val) => val.value === evVal);
          })
          .map((ev) => ({
            value: typeof ev === "object" ? ev.value : ev,
            image: typeof ev === "object" ? ev.image || "" : "",
            enabled: typeof ev === "object" ? ev.enabled !== false : true,
            price_delta: typeof ev === "object" ? ev.price_delta || 0 : 0,
          }));

        return {
          name: m.name,
          description: m.description,
          enabled: existing.enabled !== false,
          values: [...templateValues, ...extraValues],
        };
      }
      return {
        name: m.name,
        description: m.description,
        enabled: m.default_enabled,
        values: m.values.map((v) => ({ ...v })),
      };
    });

    const customMasters = existingOptions
      .filter((eo) => !masterTemplates.some((m) => m.name === eo.name))
      .map((eo) => ({
        name: eo.name,
        description: "Custom Product Attribute",
        enabled: eo.enabled !== false,
        values: (eo.values || []).map((v) => ({
          value: typeof v === "object" ? v.value : v,
          image: typeof v === "object" ? v.image || "" : "",
          enabled: typeof v === "object" ? v.enabled !== false : true,
          price_delta: typeof v === "object" ? v.price_delta || 0 : 0,
        })),
      }));

    const finalOptions = [...mergedOptions, ...customMasters];

    setFormState({
      name: prod.name || "",
      design_code: prod.sku || prod.design_code || "",
      collection_master_id: prod.collection_master_id || "",
      tier: prod.tier || "Signature",
      metal: prod.metal || "18K Yellow Gold",
      metal_type: prod.metal_type || "gold",
      karat: prod.karat || "18K",
      purity_fraction: prod.purity_fraction || 0.750,
      base_weight_grams: prod.base_weight_grams || 5.0,
      making_charge_type: prod.making_charge_percent ? "percent" : "flat",
      making_charge: prod.making_charge || 12000,
      making_charge_percent: prod.making_charge_percent || "",
      wastage_percent: prod.wastage_percent || 2.5,
      stone_charge: prod.stone_charge || 0,
      status: prod.status || "active",
      huid: prod.huid || "",
      certificate_number: prod.certificate_number || "",
      certificate_url: prod.certificate_url || "",
      designed_by: prod.designed_by || "Darshit Soni",
      release_date: prod.release_date || new Date().toISOString().split("T")[0],
      description: prod.description || "",
      model_3d_url: prod.model_3d_url || "",
      image: prod.image || prod.primary_image || "",
      images: prod.images || (prod.image ? [prod.image] : []),
      options: finalOptions,
      design_log: {
        blueprint_image: (prod.design_log?.blueprint_image && prod.design_log?.blueprint_image !== "/images/design-log/PD-SG-OR-001.JPG") ? prod.design_log.blueprint_image : "",
        design_type: prod.design_log?.design_type || prod.design_log?.specs?.type || "BESPOKE DESIGN",
        material_options: prod.design_log?.specs?.material_options || prod.design_log?.material_options || "",
        finish_options: prod.design_log?.specs?.finish_options || prod.design_log?.finish_options || "",
        size_options: prod.design_log?.specs?.size_options || prod.design_log?.size_options || "",
        gem_options: prod.design_log?.specs?.gem_options || prod.design_log?.gem_options || "",
        inspired_by: prod.design_log?.inspired_by || prod.design_log?.specs?.inspired_by || "",
        brand_origin: prod.design_log?.specs?.brand_origin || prod.design_log?.brand_origin || "A PINTAARA™ ORIGINAL",
        designed_by: prod.design_log?.specs?.designed_by || prod.design_log?.designed_by || (prod.designed_by ? `DESIGNED X ${prod.designed_by}` : "DESIGNED X Darshit Soni"),
        status: prod.design_log?.status || "UNDER DEVELOPMENT",
        release_date: prod.design_log?.release_date || "",
      },
    });
  };

  // Price Calculation using live bullion spot rates
  const computePrice = (item) => {
    const weight = parseFloat(item.base_weight_grams || item.weight) || 0;
    const fraction = parseFloat(item.purity_fraction) || 0.750;
    const metalType = (item.metal_type || "gold").toLowerCase();
    const wastagePct = parseFloat(item.wastage_percent) || 0;
    const making = parseFloat(item.making_charge) || 0;
    let stones = parseFloat(item.stone_charge) || 0;
    if (stones === 0 && Array.isArray(item.options)) {
      const gemOpt = item.options.find((o) => o.name?.toLowerCase().includes("gem") || o.name?.toLowerCase().includes("stone"));
      const activeGem = (gemOpt?.values || []).find((v) => v.enabled !== false && parseFloat(v.price_delta) > 0);
      if (activeGem) {
        stones = parseFloat(activeGem.price_delta) || 0;
      }
    }

    const isSilver = metalType === "silver" || 
                     String(item.karat || "").toLowerCase().includes("silver") || 
                     String(item.karat || "").toLowerCase().includes("925") ||
                     String(item.metal || "").toLowerCase().includes("silver");

    let ratePerGram;
    if (isSilver) {
      ratePerGram = (rates.silver_per_g || 211.45) * (fraction / 0.925);
    } else if (metalType === "platinum" || String(item.karat || "").toLowerCase().includes("pt950")) {
      ratePerGram = 3450;
    } else {
      ratePerGram = (rates.gold_24k_per_g || 16157) * fraction;
    }

    const metalValue = Math.round(weight * ratePerGram);
    const wastageValue = Math.round(metalValue * (wastagePct / 100));
    const subtotal = metalValue + wastageValue + making + stones;
    const gst = Math.round(subtotal * 0.03);
    const total = subtotal + gst;

    return { metalValue, wastageValue, making, stones, subtotal, gst, total, ratePerGram };
  };

  const calculatedPrice = computePrice(formState);

  const allAvailablePurities = puritiesList.length > 0
    ? puritiesList
    : [
        { id: 1, code: "22KT", name: "22KT Gold", purity_fraction: 0.916, metal: "Gold" },
        { id: 2, code: "18KT", name: "18KT Gold", purity_fraction: 0.750, metal: "Gold" },
        { id: 3, code: "14KT", name: "14KT Gold", purity_fraction: 0.585, metal: "Gold" },
        { id: 4, code: "925", name: "925 Silver", purity_fraction: 0.925, metal: "Silver" },
        { id: 5, code: "24KT", name: "24KT Gold", purity_fraction: 0.999, metal: "Gold" },
      ];

  const handleToggleBenchmarkPurity = (pCode, purity) => {
    setBenchmarkPurities((prev) => {
      const exists = prev.some((p) => p === pCode || p === purity.id || p === purity.name);
      if (exists) {
        if (prev.length <= 1) return prev;
        const next = prev.filter((p) => p !== pCode && p !== purity.id && p !== purity.name);
        if (formState.karat === pCode || formState.karat === purity.name) {
          const firstRem = allAvailablePurities.find((ap) => next.includes(ap.code) || next.includes(ap.name) || next.includes(ap.id));
          if (firstRem) {
            setFormState((fs) => ({
              ...fs,
              karat: firstRem.code || firstRem.name,
              purity_fraction: firstRem.purity_fraction || 0.750,
            }));
          }
        }
        return next;
      } else {
        return [...prev, pCode];
      }
    });
  };

  const handleSetPrimaryBenchmark = (pCode, purity) => {
    setFormState((prev) => ({
      ...prev,
      karat: pCode || purity.name,
      purity_fraction: purity.purity_fraction || (pCode === "24K" ? 0.999 : pCode === "22K" ? 0.916 : pCode === "18K" ? 0.750 : 0.585),
    }));
    setBenchmarkPurities((prev) => {
      if (!prev.some((p) => p === pCode || p === purity.id || p === purity.name)) {
        return [...prev, pCode];
      }
      return prev;
    });
  };

  const selectedPurityCalculations = allAvailablePurities
    .filter((p) => benchmarkPurities.some((bp) => bp === p.code || bp === p.id || bp === p.name))
    .map((purity) => {
      const pCode = purity.code || purity.name;
      const isPrimary = (formState.karat === pCode) || (formState.karat === purity.name) || (formState.purity_fraction === purity.purity_fraction);
      const weight = parseFloat(formState.base_weight_grams) || 0;
      const wastage = parseFloat(formState.wastage_percent) || 0;
      const making = parseFloat(formState.making_charge) || 0;
      let stones = parseFloat(formState.stone_charge) || 0;
      if (stones === 0 && Array.isArray(formState.options)) {
        const gemOpt = formState.options.find((o) => o.name?.toLowerCase().includes("gem") || o.name?.toLowerCase().includes("stone"));
        const activeGem = (gemOpt?.values || []).find((v) => v.enabled !== false && parseFloat(v.price_delta) > 0);
        if (activeGem) {
          stones = parseFloat(activeGem.price_delta) || 0;
        }
      }

      const fraction = purity.purity_fraction || 0.750;
      const isSilver = purity.code?.toLowerCase().includes("925") || 
                       purity.name?.toLowerCase().includes("silver") ||
                       purity.metal?.toLowerCase() === "silver" ||
                       purity.type?.toLowerCase() === "silver";

      let ratePerGram;
      if (isSilver) {
        ratePerGram = Math.round((rates.silver_per_g || 211.45) * (fraction / 0.925));
      } else {
        ratePerGram = Math.round((rates.gold_24k_per_g || 16157) * fraction);
      }

      const metalValue = Math.round(weight * ratePerGram);
      const wastageValue = Math.round(metalValue * (wastage / 100));
      const subtotal = metalValue + wastageValue + making + stones;
      const gst = Math.round(subtotal * 0.03);
      const total = subtotal + gst;

      return {
        purity,
        code: pCode,
        name: purity.name,
        hallmarkPct: Math.round(fraction * 1000) / 10,
        ratePerGram,
        metalValue,
        wastageValue,
        making,
        stones,
        gst,
        total,
        isPrimary,
      };
    });

  const libraryAssets = [
    { name: "Sovereign Diamond Band", url: "/images/products/ring.png", type: "image", category: "Images" },
    { name: "Heritage Kundan Necklace", url: "/images/products/necklace.png", type: "image", category: "Images" },
    { name: "Royal Bangle Set", url: "/images/products/bangles.png", type: "image", category: "Images" },
    { name: "Solitaire Drop Earrings", url: "/images/products/earrings.png", type: "image", category: "Images" },
    { name: "Artisanal Link Bracelet", url: "/images/products/bracelet.png", type: "image", category: "Images" },
    { name: "Sovereign Solitaire Pendant", url: "/images/products/pendant.png", type: "image", category: "Images" },
    { name: "18KT Box Link Chain", url: "/images/products/chain.png", type: "image", category: "Images" },
    { name: "Sacred Knot Mangalsutra", url: "/images/products/mangalsutra.png", type: "image", category: "Images" },
    { name: "Editorial Visual 1", url: "/images/concept-hero1.png", type: "image", category: "Images" },
    { name: "Gold Filigree Craft Log", url: "/images/concept-designlog.png", type: "image", category: "Images" },
    { name: "High Jewellery 360 Spin", url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-wearing-rings-42618-large.mp4", type: "video", category: "Videos" },
    { name: "Interactive 3D Solitaire Model (.glb)", url: "/models/ring_solitaire.glb", type: "model", category: "3D Models" },
  ];

  const processUploadedFiles = async (files) => {
    if (!files || files.length === 0) return;

    for (const file of files) {
      const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
      const isModel = /\.(glb|gltf|usdz|obj)$/i.test(file.name);
      const mediaType = isVideo ? "video" : isModel ? "model" : "image";

      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target?.result;
        if (previewUrl) {
          const newMediaItem = {
            url: previewUrl,
            type: mediaType,
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(1) + " MB",
          };

          setFormState((prev) => {
            const currentList = Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : []);
            const updated = [...currentList, newMediaItem];
            const primaryUrl = typeof updated[0] === "object" ? updated[0].url : updated[0];
            return {
              ...prev,
              image: primaryUrl || previewUrl,
              images: updated,
            };
          });
        }
      };
      reader.readAsDataURL(file);

      // Upload media file to backend storage & database
      try {
        const uploadRes = await adminApi.uploadProductMedia(file);
        if (uploadRes && uploadRes.status === "success" && uploadRes.url) {
          setFormState((prev) => {
            const currentList = Array.isArray(prev.images) ? prev.images : [];
            const updated = currentList.map((item) => {
              if (typeof item === "object" && item.name === file.name) {
                return { ...item, url: uploadRes.url, type: uploadRes.type || item.type };
              }
              return item;
            });
            const primaryUrl = typeof updated[0] === "object" ? updated[0].url : updated[0];
            const is3D = uploadRes.type === "model" || /\.(glb|gltf|usdz|obj)$/i.test(file.name);
            return {
              ...prev,
              ...(is3D ? { model_3d_url: uploadRes.url } : {}),
              image: primaryUrl || uploadRes.url,
              images: updated,
            };
          });
        }
      } catch (err) {
        console.warn("Upload background error:", err);
      }
    }

    showToast(`Added ${files.length} media item(s).`);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processUploadedFiles(files);
    }
  };

  const handleRemoveMedia = (idxToRemove) => {
    setFormState((prev) => {
      const currentList = Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : []);
      const updated = currentList.filter((_, idx) => idx !== idxToRemove);
      const primaryUrl = updated.length > 0 ? (typeof updated[0] === "object" ? updated[0].url : updated[0]) : "";
      return {
        ...prev,
        image: primaryUrl,
        images: updated,
      };
    });
    showToast("Media item removed.");
  };

  const handleSetPrimaryMedia = (idxToPrimary) => {
    setFormState((prev) => {
      const currentList = Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : []);
      const item = currentList[idxToPrimary];
      const without = currentList.filter((_, idx) => idx !== idxToPrimary);
      const updated = [item, ...without];
      const primaryUrl = typeof item === "object" ? item.url : item;
      return {
        ...prev,
        image: primaryUrl,
        images: updated,
      };
    });
    showToast("Set as primary media.");
  };

  const handleAddLibraryMedia = () => {
    if (selectedLibraryItems.length === 0) return;
    setFormState((prev) => {
      const currentList = Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : []);
      const updated = [...currentList, ...selectedLibraryItems];
      const primaryUrl = typeof updated[0] === "object" ? updated[0].url : updated[0];
      return {
        ...prev,
        image: primaryUrl,
        images: updated,
      };
    });
    showToast(`Added ${selectedLibraryItems.length} media item(s) from library.`);
    setSelectedLibraryItems([]);
    setShowMediaLibrary(false);
  };

  // Active Masters Fallback Lists
  const activeFinishes = finishesList.length > 0 ? finishesList : [
    { id: 1, name: "Yellow Gold", code: "YG", hex_color: "#D4AF37", metal_type_id: 1 },
    { id: 2, name: "Rose Gold", code: "RG", hex_color: "#B76E79", metal_type_id: 1 },
    { id: 3, name: "White Gold", code: "WG", hex_color: "#E5E4E2", metal_type_id: 1 },
    { id: 4, name: "Matte Satin Gold", code: "MG", hex_color: "#E6C687", metal_type_id: 1 },
  ];

  const activePurities = puritiesList.length > 0 ? puritiesList : [
    { id: 1, name: "24KT Gold", code: "24KT", purity_fraction: 0.999, metal: "Gold" },
    { id: 2, name: "22KT Gold", code: "22KT", purity_fraction: 0.916, metal: "Gold" },
    { id: 3, name: "18KT Gold", code: "18KT", purity_fraction: 0.750, metal: "Gold" },
    { id: 4, name: "14KT Gold", code: "14KT", purity_fraction: 0.585, metal: "Gold" },
    { id: 5, name: "925 Silver", code: "925", purity_fraction: 0.925, metal: "Silver" },
    { id: 6, name: "PT950 Platinum", code: "PT950", purity_fraction: 0.950, metal: "Platinum" },
  ];

  // Option Masters Availability Helpers
  const getOptionValues = (nameKey) => {
    const opt = (formState.options || []).find((o) =>
      o.name.toLowerCase().includes(nameKey.toLowerCase())
    );
    return opt?.values || [];
  };

  const handleToggleOptionValue = (nameKey, valIdx) => {
    setFormState((prev) => {
      const nextOptions = (prev.options || []).map((opt) => {
        if (opt.name.toLowerCase().includes(nameKey.toLowerCase())) {
          const currentVals = [...(opt.values || [])];
          if (currentVals[valIdx]) {
            currentVals[valIdx] = {
              ...currentVals[valIdx],
              enabled: currentVals[valIdx].enabled === false ? true : false,
            };
          }
          const hasAny = currentVals.some((v) => v.enabled !== false);
          return { ...opt, enabled: hasAny, values: currentVals };
        }
        return opt;
      });
      return { ...prev, options: nextOptions };
    });
  };

  const handleToggleAllOptionValues = (nameKey, enableAll = true) => {
    setFormState((prev) => {
      const nextOptions = (prev.options || []).map((opt) => {
        if (opt.name.toLowerCase().includes(nameKey.toLowerCase())) {
          const currentVals = (opt.values || []).map((v) => ({ ...v, enabled: enableAll }));
          return { ...opt, enabled: enableAll, values: currentVals };
        }
        return opt;
      });
      return { ...prev, options: nextOptions };
    });
  };

  const handleUpdateOptionPriceDelta = (nameKey, valIdx, newPriceDelta) => {
    const parsed = parseFloat(newPriceDelta);
    const deltaVal = isNaN(parsed) ? 0 : parsed;
    setFormState((prev) => {
      const nextOptions = (prev.options || []).map((opt) => {
        if (opt.name.toLowerCase().includes(nameKey.toLowerCase())) {
          const currentVals = [...(opt.values || [])];
          if (currentVals[valIdx]) {
            currentVals[valIdx] = {
              ...currentVals[valIdx],
              price_delta: deltaVal,
            };
          }
          return { ...opt, values: currentVals };
        }
        return opt;
      });
      return { ...prev, options: nextOptions };
    });
  };

  const handleAddCustomOptionValue = (nameKey, valName, priceDelta = 0) => {
    if (!valName || !valName.trim()) return;
    setFormState((prev) => {
      let found = false;
      const nextOptions = (prev.options || []).map((opt) => {
        if (opt.name.toLowerCase().includes(nameKey.toLowerCase())) {
          found = true;
          const exists = (opt.values || []).some((v) => v.value.toLowerCase() === valName.trim().toLowerCase());
          if (exists) return opt;
          return {
            ...opt,
            enabled: true,
            values: [
              ...(opt.values || []),
              {
                value: valName.trim(),
                enabled: true,
                price_delta: parseFloat(priceDelta) || 0,
                image: "",
              },
            ],
          };
        }
        return opt;
      });

      if (!found) {
        nextOptions.push({
          name: nameKey === "size" ? "Size" : nameKey === "gem" ? "Gem & Stone Options" : "Chain Type",
          description: "Custom Option",
          enabled: true,
          values: [
            {
              value: valName.trim(),
              enabled: true,
              price_delta: parseFloat(priceDelta) || 0,
              image: "",
            },
          ],
        });
      }

      return { ...prev, options: nextOptions };
    });
    showToast(`Added "${valName.trim()}"`);
  };

  // Matrix and Variants Management Helpers
  const handleToggleMatrixPurity = (finishId, purityId) => {
    setProductFinishMatrix((prev) => {
      const current = prev[finishId] || [];
      const updated = current.includes(purityId)
        ? current.filter((id) => id !== purityId)
        : [...current, purityId];
      return { ...prev, [finishId]: updated };
    });
  };

  const handleToggleAllPuritiesForFinish = (finishId, enableAll = true) => {
    setProductFinishMatrix((prev) => {
      return {
        ...prev,
        [finishId]: enableAll ? activePurities.map((p) => p.id) : [],
      };
    });
  };

  const handleToggleAllMatrix = (enableAll = true) => {
    const nextMatrix = {};
    activeFinishes.forEach((finish) => {
      nextMatrix[finish.id] = enableAll ? activePurities.map((p) => p.id) : [];
    });
    setProductFinishMatrix(nextMatrix);
    handleToggleAllOptionValues("size", enableAll);
    handleToggleAllOptionValues("gem", enableAll);
    handleToggleAllOptionValues("chain", enableAll);
    showToast(enableAll ? "All options & combinations enabled." : "All availability cleared.");
  };

  const handleResetToGlobalDefaults = () => {
    if (!globalMatrix || globalMatrix.length === 0) {
      const defaults = {};
      activeFinishes.forEach((f) => {
        defaults[f.id] = [1, 2, 3]; // Default: 24KT, 22KT, 18KT
      });
      setProductFinishMatrix(defaults);
      showToast("Reset to brand default matrix rules.");
      return;
    }
    const defaults = {};
    globalMatrix.forEach((item) => {
      defaults[item.finish_id] = (item.allowed_purities || []).map((p) => p.id);
    });
    setProductFinishMatrix(defaults);
    showToast("Reset to brand global finish-purity rules.");
  };

  const handleAutoGenerateVariants = async () => {
    setIsGeneratingVariants(true);
    const newVariants = [];
    const baseCode = formState.design_code || "PRD";
    const baseWeight = parseFloat(formState.base_weight_grams) || 5.0;

    // 1. Gather active finishes & purities from productFinishMatrix
    const matrixEntries = Object.entries(productFinishMatrix).filter(
      ([, pIds]) => Array.isArray(pIds) && pIds.length > 0
    );

    // 2. Gather active sizes from formState.options ("Size")
    const sizeOpt = formState.options?.find((o) => o.name.toLowerCase().includes("size"));
    const activeSizes = (sizeOpt?.values || []).filter((v) => v.enabled !== false);
    const sizeListToUse = activeSizes.length > 0
      ? activeSizes
      : (sizesList.length > 0 ? sizesList.filter((s) => s.is_active) : [{ value: "Standard", name: "Standard" }]);

    // 3. Gather active stones from formState.options ("Gem" / "Stone")
    const stoneOpt = formState.options?.find(
      (o) => o.name.toLowerCase().includes("gem") || o.name.toLowerCase().includes("stone")
    );
    const activeStones = (stoneOpt?.values || []).filter((v) => v.enabled !== false);
    const stoneListToUse = activeStones.length > 0
      ? activeStones
      : [{ value: "Solid Gold / No Stone", price_delta: 0 }];

    // 4. Gather active chains if enabled
    const chainOpt = formState.options?.find((o) => o.name.toLowerCase().includes("chain"));
    const activeChains = chainOpt?.enabled
      ? (chainOpt.values || []).filter((v) => v.enabled !== false)
      : [];
    const chainListToUse = activeChains.length > 0 ? activeChains : [null];

    matrixEntries.forEach(([fIdStr, purityIds]) => {
      const finishId = parseInt(fIdStr);
      const finish = activeFinishes.find((f) => f.id === finishId);
      if (!finish) return;

      purityIds.forEach((purityId) => {
        const purity = activePurities.find((p) => p.id === purityId);
        if (!purity) return;

        sizeListToUse.forEach((sizeItem) => {
          const sizeName = typeof sizeItem === "object" ? (sizeItem.value || sizeItem.name) : sizeItem;
          const cleanSizeCode = sizeName ? sizeName.replace(/Ring Size |Bangle |Chain /gi, "").trim() : "STD";

          stoneListToUse.forEach((stoneItem) => {
            const stoneName = typeof stoneItem === "object" ? (stoneItem.value || stoneItem.name) : stoneItem;
            const stonePriceDelta = typeof stoneItem === "object" ? (parseFloat(stoneItem.price_delta) || 0) : 0;
            const cleanStoneCode = stoneName.includes("Diamond")
              ? "DIA"
              : stoneName.includes("Emerald")
              ? "EMR"
              : stoneName.includes("Sapphire")
              ? "SAP"
              : stoneName.includes("Ruby")
              ? "RUB"
              : "SOL";

            chainListToUse.forEach((chainItem) => {
              const chainName = chainItem ? (typeof chainItem === "object" ? chainItem.value : chainItem) : null;
              const chainPriceDelta = chainItem && typeof chainItem === "object" ? (parseFloat(chainItem.price_delta) || 0) : 0;

              // Check if combination already exists
              const existing = productVariants.find(
                (v) =>
                  v.finish_id === finishId &&
                  v.purity_id === purityId &&
                  (v.size_name === sizeName || v.size?.name === sizeName || (!v.size_id && cleanSizeCode === "STD")) &&
                  (v.stone_name === stoneName || v.stone?.name === stoneName) &&
                  (chainName ? v.chain_name === chainName : true)
              );

              if (!existing) {
                const skuParts = [
                  baseCode,
                  finish.code || "F",
                  purity.code || "P",
                  cleanSizeCode !== "STD" ? `S${cleanSizeCode}` : null,
                  cleanStoneCode !== "SOL" ? cleanStoneCode : null,
                  chainName && !chainName.includes("No Chain") ? "CHN" : null,
                ].filter(Boolean);
                const sku = skuParts.join("-");

                const fraction = purity.purity_fraction || 0.75;
                const weightCalc = Math.round((baseWeight * (fraction / 0.75)) * 1000) / 1000;

                const isSilver =
                  purity.code?.toLowerCase().includes("925") ||
                  purity.name?.toLowerCase().includes("silver") ||
                  purity.metal?.toLowerCase() === "silver";

                const ratePerGram = isSilver
                  ? (rates.silver_per_g || 211.45) * (fraction / 0.925)
                  : (rates.gold_24k_per_g || 16157) * fraction;

                const variantMetalValue = weightCalc * ratePerGram;
                const variantWastage = variantMetalValue * (parseFloat(formState.wastage_percent || 0) / 100);
                const variantMaking = parseFloat(formState.making_charge || 0);
                const variantSubtotal = variantMetalValue + variantWastage + variantMaking + stonePriceDelta + chainPriceDelta;
                const priceCalc = Math.round(variantSubtotal * 1.03);

                newVariants.push({
                  product_id: productId,
                  metal_type_id: finish.metal_type_id || 1,
                  finish_id: finishId,
                  purity_id: purityId,
                  size_id: sizeItem.id || null,
                  size_name: sizeName,
                  stone_id: stoneItem.id || null,
                  stone_name: stoneName,
                  chain_name: chainName,
                  sku: sku,
                  weight: weightCalc,
                  price: priceCalc,
                  stock: 10,
                  status: "active",
                  finish: finish,
                  purity: purity,
                  size: { name: sizeName },
                  stone: { name: stoneName, price_delta: stonePriceDelta },
                  chain: chainName ? { name: chainName, price_delta: chainPriceDelta } : null,
                  isNew: true,
                });
              }
            });
          });
        });
      });
    });

    if (newVariants.length === 0) {
      showToast("All permitted combinations already exist.");
    } else {
      setProductVariants((prev) => [...prev, ...newVariants]);
      showToast(`Generated ${newVariants.length} new variant(s) from availability rules.`);
    }
    setIsGeneratingVariants(false);
  };

  const handleAddSingleVariant = () => {
    const baseCode = formState.design_code || "PRD";
    const finish = activeFinishes[0] || { id: 1, name: "Yellow Gold", code: "YG" };
    const purity = activePurities[2] || activePurities[0] || { id: 3, name: "18KT Gold", code: "18KT", purity_fraction: 0.75 };
    const defaultSku = `${baseCode}-${finish.code}-${purity.code}-NEW`;

    const newVar = {
      product_id: productId,
      metal_type_id: finish.metal_type_id || 1,
      finish_id: finish.id,
      purity_id: purity.id,
      size_id: null,
      size_name: "Standard",
      stone_id: null,
      stone_name: "Solid Gold / No Stone",
      chain_name: null,
      sku: defaultSku,
      weight: parseFloat(formState.base_weight_grams) || 5.0,
      price: Math.round(calculatedPrice?.total || 65000),
      stock: 10,
      status: "active",
      finish: finish,
      purity: purity,
      size: { name: "Standard" },
      stone: { name: "Solid Gold / No Stone" },
      isNew: true,
    };

    setProductVariants((prev) => [newVar, ...prev]);
    showToast("Added new blank variant. Edit details below.");
  };

  const handleClearAllVariants = () => {
    if (confirm("Are you sure you want to clear all variants?")) {
      setProductVariants([]);
      showToast("Variants table cleared.");
    }
  };

  const handleSaveAllVariants = async () => {
    if (!productId) {
      showToast("Please save the product first before persisting individual variants.");
      return;
    }
    showToast(`Saving ${productVariants.length} variant(s)...`);
    for (let i = 0; i < productVariants.length; i++) {
      await handleSaveVariant(productVariants[i], i);
    }
    showToast("All variants synchronized with database.");
  };

  const handleSaveVariant = async (variant, idx) => {
    if (!productId && !variant.product_id) {
      showToast("Please save the product first before persisting individual variants.");
      return;
    }
    const currentProdId = productId || variant.product_id;
    setSavingVariantId(variant.id || `idx-${idx}`);

    try {
      if (variant.id && !variant.isNew) {
        const res = await adminApi.updateProductVariant(currentProdId, variant.id, {
          sku: variant.sku,
          weight: parseFloat(variant.weight) || 0,
          price: parseFloat(variant.price) || 0,
          stock: parseInt(variant.stock) || 0,
          status: variant.status || "active",
        });
        if (res?.status === "success") {
          showToast(`Variant ${variant.sku} updated.`);
        }
      } else {
        const res = await adminApi.createProductVariant(currentProdId, {
          metal_type_id: variant.metal_type_id || 1,
          finish_id: variant.finish_id,
          purity_id: variant.purity_id,
          size_id: variant.size_id || null,
          stone_id: variant.stone_id || null,
          sku: variant.sku,
          weight: parseFloat(variant.weight) || 0,
          price: parseFloat(variant.price) || 0,
          stock: parseInt(variant.stock) || 0,
          status: variant.status || "active",
        });
        if (res?.status === "success" && res.data) {
          setProductVariants((prev) =>
            prev.map((v, i) => (i === idx ? { ...res.data, isNew: false } : v))
          );
          showToast(`Variant ${res.data.sku} created.`);
        }
      }
    } catch (err) {
      console.warn("Error saving variant:", err);
      showToast("Error saving variant.");
    } finally {
      setSavingVariantId(null);
    }
  };

  const handleDeleteVariant = async (variant, idx) => {
    if (variant.id && !variant.isNew && productId) {
      try {
        await adminApi.deleteProductVariant(productId, variant.id);
        showToast("Variant removed.");
      } catch (err) {
        console.warn("Delete variant error:", err);
      }
    }
    setProductVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // Real-time auto-sync derived values from product configuration (Tab 1 General & Tab 3 Customization)
  const derivedType = (() => {
    const col = collections.find((c) => String(c.id) === String(formState.collection_master_id));
    if (col?.name) {
      const cn = col.name.toLowerCase();
      if (cn.includes("ring")) return "Ring";
      if (cn.includes("pendant")) return "Pendant";
      if (cn.includes("necklace")) return "Necklace";
      if (cn.includes("bracelet") || cn.includes("cuff")) return "Bracelet / Cuff";
      if (cn.includes("earring")) return "Earrings";
      if (cn.includes("bangle")) return "Bangle";
      if (cn.includes("chain")) return "Chain";
      if (cn.includes("mangalsutra")) return "Mangalsutra";
      return col.name;
    }
    const nm = (formState.name || "").toLowerCase();
    if (nm.includes("ring")) return "Ring";
    if (nm.includes("pendant")) return "Pendant";
    if (nm.includes("necklace")) return "Necklace";
    if (nm.includes("bracelet") || nm.includes("cuff")) return "Bracelet / Cuff";
    if (nm.includes("earring")) return "Earrings";
    if (nm.includes("bangle")) return "Bangle";
    return formState.design_log?.design_type || "Pendant";
  })();

  const derivedMaterialOptions = (() => {
    const purityOpt = formState.options?.find(
      (o) => o.name.toLowerCase().includes("purity") || o.name.toLowerCase().includes("metal") || o.name.toLowerCase().includes("karat")
    );
    const enabledVals = purityOpt?.values?.filter((v) => v.enabled)?.map((v) => v.value.split(" ")[0]);
    if (enabledVals && enabledVals.length > 0) {
      return enabledVals.join(" · ");
    }
    return "24KT · 22KT · 18KT";
  })();

  const derivedFinishOptions = (() => {
    const finishOpt = formState.options?.find(
      (o) => o.name.toLowerCase().includes("finish") || o.name.toLowerCase().includes("color")
    );
    const enabledVals = finishOpt?.values?.filter((v) => v.enabled)?.map((v) => v.value);
    if (enabledVals && enabledVals.length > 0) {
      return enabledVals.join(" · ");
    }
    return "Yellow Gold · Rose Gold · White Gold";
  })();

  const derivedSizeOptions = (() => {
    const sizeOpt = formState.options?.find((o) => o.name.toLowerCase().includes("size"));
    const enabledVals = sizeOpt?.values?.filter((v) => v.enabled)?.map((v) => v.value.replace(/Ring Size |Bangle |Chain /g, ""));
    if (enabledVals && enabledVals.length > 0) {
      return enabledVals.join(" · ");
    }
    return "10 · 12 · 14 · 16";
  })();

  const derivedGemOptions = (() => {
    const gemOpt = formState.options?.find(
      (o) => o.name.toLowerCase().includes("gem") || o.name.toLowerCase().includes("stone") || o.name.toLowerCase().includes("diamond")
    );
    const enabledVals = gemOpt?.values?.filter((v) => v.enabled)?.map((v) => v.value);
    if (enabledVals && enabledVals.length > 0) {
      return enabledVals.join(" · ");
    }
    return formState.design_log?.gem_details?.stone_size || formState.design_log?.stone_size || "Natural Diamond (VVS-VS) · No Stone / Solid Gold";
  })();

  const derivedDesignedBy = formState.designed_by
    ? `DESIGNED X ${formState.designed_by.toUpperCase()}`
    : "DESIGNED X DARSHIT SONI";

  const derivedBrandOrigin = "A PINTAARA™ ORIGINAL";

  const handleAutoFillDesignLogSpecs = () => {
    // 1. Material Options from enabled purities
    const purityOpt = formState.options?.find(
      (o) => o.name.toLowerCase().includes("purity") || o.name.toLowerCase().includes("metal")
    );
    const activePurities = purityOpt?.values?.filter((v) => v.enabled)?.map((v) => v.value.split(" ")[0]) || [];
    const matStr = activePurities.length > 0 
      ? activePurities.map((p) => `${p} Solid Gold`).join(", ") 
      : "18KT Solid Gold";

    // 2. Finish Options from enabled finishes
    const finishOpt = formState.options?.find(
      (o) => o.name.toLowerCase().includes("finish") || o.name.toLowerCase().includes("color")
    );
    const activeFinishes = finishOpt?.values?.filter((v) => v.enabled)?.map((v) => v.value) || [];
    const finStr = activeFinishes.length > 0 ? activeFinishes.join(", ") : "Yellow Gold, White Gold, Rose Gold";

    // 3. Size Options from enabled sizes
    const sizeOpt = formState.options?.find((o) => o.name.toLowerCase().includes("size"));
    const activeSizes = sizeOpt?.values?.filter((v) => v.enabled)?.map((v) => v.value.replace(/Ring Size |Bangle |Chain /g, "")) || [];
    const sizeStr = activeSizes.length > 0 ? activeSizes.join(", ") : "Standard";

    // 4. Gem Options from enabled stones
    const gemOpt = formState.options?.find(
      (o) => o.name.toLowerCase().includes("gem") || o.name.toLowerCase().includes("stone")
    );
    const activeGems = gemOpt?.values?.filter((v) => v.enabled)?.map((v) => v.value) || [];
    const gemStr = activeGems.length > 0 ? activeGems.join(", ") : "Natural Diamond";

    setFormState((prev) => ({
      ...prev,
      design_log: {
        ...prev.design_log,
        design_type: prev.design_log?.design_type || "BESPOKE DESIGN",
        material_options: matStr,
        finish_options: finStr,
        size_options: sizeStr,
        gem_options: gemStr,
        inspired_by: prev.design_log?.inspired_by || "Dewdrop physics and morning horizon light",
        brand_origin: prev.design_log?.brand_origin || "A PINTAARA™ ORIGINAL",
        designed_by: prev.design_log?.designed_by || (formState.designed_by ? `DESIGNED X ${formState.designed_by}` : "DESIGNED X Darshit Soni"),
      },
    }));
    showToast("Specifications auto-populated from Bespoke Matrix!");
  };

  // Save / Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    const selectedCol = collections.find((c) => String(c.id) === String(formState.collection_master_id));

    const sanitizedOptions = formState.options
      .filter((opt) => opt.enabled)
      .map((opt) => ({
        name: opt.name,
        enabled: true,
        values: opt.values.filter((v) => v.enabled && v.value?.trim()),
      }));

    const payload = {
      name: formState.name?.trim() || (formState.design_code?.trim() ? `Piece ${formState.design_code.trim()}` : "Bespoke Jewelry Piece"),
      design_code: formState.design_code ? formState.design_code.trim() : "",
      collection_master_id: formState.collection_master_id || null,
      tier: formState.tier || "Signature",
      base_weight_grams: parseFloat(formState.base_weight_grams) || 1.0,
      making_charge: formState.making_charge_type === "flat" ? parseFloat(formState.making_charge) || 0 : null,
      making_charge_percent: formState.making_charge_type === "percent" ? parseFloat(formState.making_charge_percent) || 0 : null,
      wastage_percent: parseFloat(formState.wastage_percent) || 0,
      stone_charge: parseFloat(formState.stone_charge) || 0,
      status: formState.status,
      huid: formState.huid ? formState.huid.trim() : null,
      certificate_number: formState.certificate_number ? formState.certificate_number.trim() : null,
      certificate_url: formState.certificate_url ? formState.certificate_url.trim() : null,
      designed_by: formState.designed_by || "Darshit Soni",
      release_date: formState.release_date,
      description: formState.description,
      model_3d_url: formState.model_3d_url || null,
      image: typeof formState.image === "object" ? formState.image.url : formState.image,
      images: (formState.images || []).map((img) => (typeof img === "object" ? img.url : img)),
      options: sanitizedOptions,
      design_log: {
        blueprint_image: formState.design_log?.blueprint_image || null,
        design_type: formState.design_log?.design_type || formState.design_log?.type || null,
        status: formState.design_log?.status || "UNDER DEVELOPMENT",
        inspired_by: formState.design_log?.inspired_by || null,
        release_date: formState.design_log?.release_date || formState.release_date || null,
        specs: {
          type: formState.design_log?.design_type || formState.design_log?.type || null,
          material_options: formState.design_log?.material_options || null,
          finish_options: formState.design_log?.finish_options || null,
          size_options: formState.design_log?.size_options || null,
          gem_options: formState.design_log?.gem_options || null,
          inspired_by: formState.design_log?.inspired_by || null,
          brand_origin: formState.design_log?.brand_origin || null,
          designed_by: formState.design_log?.designed_by || null,
        },
      },
    };

    try {
      let savedId = productId;
      let apiRes = null;

      if (isEdit && productId) {
        apiRes = await adminApi.updateProduct(productId, payload);
        savedId = productId;
      } else {
        apiRes = await adminApi.createProduct(payload);
        if (apiRes?.data?.id) {
          savedId = apiRes.data.id;
        }
      }

      const updatedItem = apiRes?.data || {
        id: savedId || Date.now(),
        ...payload,
        sku: payload.design_code,
        collection_name: selectedCol?.name || "Unassigned",
        karat: formState.karat,
        purity_fraction: formState.purity_fraction,
      };

      const cached = localStorage.getItem("pintaara_products_cache");
      if (cached) {
        const list = JSON.parse(cached);
        const exists = list.some((p) => String(p.id) === String(savedId));
        const updated = exists
          ? list.map((p) => (String(p.id) === String(savedId) ? { ...p, ...updatedItem } : p))
          : [updatedItem, ...list];
        localStorage.setItem("pintaara_products_cache", JSON.stringify(updated));
      }

      if (savedId && productFinishMatrix && Object.keys(productFinishMatrix).length > 0) {
        try {
          const configPayload = Object.entries(productFinishMatrix)
            .map(([finishId, purityIds]) => ({
              finish_id: parseInt(finishId),
              purity_ids: (purityIds || []).map((p) => parseInt(p)),
            }))
            .filter((c) => c.purity_ids.length > 0);

          if (configPayload.length > 0) {
            await adminApi.syncProductFinishPurities(savedId, configPayload);
          }
        } catch (mErr) {
          console.warn("Matrix sync warning:", mErr);
        }
      }

      // Persist any generated variants if product ID is confirmed
      if (savedId && productVariants.length > 0) {
        try {
          const newVars = productVariants.filter((v) => v.isNew);
          for (const variant of newVars) {
            await adminApi.createProductVariant(savedId, {
              metal_type_id: variant.metal_type_id || 1,
              finish_id: variant.finish_id,
              purity_id: variant.purity_id,
              size_id: variant.size_id || null,
              stone_id: variant.stone_id || null,
              sku: variant.sku,
              weight: parseFloat(variant.weight) || 0,
              price: parseFloat(variant.price) || 0,
              stock: parseInt(variant.stock) || 0,
              status: variant.status || "active",
            });
          }
        } catch (vErr) {
          console.warn("Variants sync warning:", vErr);
        }
      }

      showToast(isEdit ? "Product updated successfully." : "Product created successfully.");

      setTimeout(() => {
        router.push("/products");
      }, 600);
    } catch (err) {
      console.warn("Save offline error:", err);
      showToast("Saved locally.");
      setTimeout(() => {
        router.push("/products");
      }, 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeOptions = (formState.options || []).filter((opt) => opt.enabled);
  const availableOptions = (formState.options || []).filter((opt) => !opt.enabled);

  if (isLoading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 0" }}>
        <div className="admin-card" style={{ padding: "60px", textAlign: "center", color: "var(--admin-text-muted)" }}>
          Loading product details...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "80px" }}>
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

      {/* Top Header / Breadcrumb */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--admin-text-secondary)", marginBottom: "8px" }}>
          <Link href="/products" style={{ color: "var(--admin-text-secondary)", textDecoration: "none" }}>
            Products
          </Link>
          <span>/</span>
          <span style={{ color: "var(--admin-text-primary)", fontWeight: 600 }}>
            {isEdit ? (formState.name || "Edit Product") : "New Product"}
          </span>
        </div>

        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--admin-text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
            {isEdit ? "Edit Product" : "New Product"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", marginTop: "4px", margin: 0 }}>
            {isEdit ? `Update specifications for SKU: ${formState.design_code || "—"}` : "Configure specifications, valuation, and customization options."}
          </p>
        </div>
      </div>

      {/* Main Form Layout */}
      <form onSubmit={handleSubmit}>
        {/* Navigation Tabs */}
        <div
          className="admin-card"
          style={{
            padding: "0 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderBottom: "1px solid var(--admin-border)",
            background: "var(--admin-surface)",
          }}
        >
          {[
            { id: "essentials", label: "1. Basic Details & Photos" },
            { id: "pricing", label: "2. Gold Weight & Live Pricing" },
            { id: "matrix", label: "3. Customization Options" },
            { id: "design_log", label: "4. Website Design Story & Blueprint" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--admin-primary)" : "2px solid transparent",
                color: activeTab === tab.id ? "var(--admin-primary)" : "var(--admin-text-secondary)",
                padding: "14px 12px",
                fontSize: "13px",
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: BASIC DETAILS (GENERAL INFORMATION) */}
        {activeTab === "essentials" && (
          <div className="admin-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                  Product Title / Name
                </label>
                <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                  Customer-facing display title (e.g. &ldquo;Piece BR-SG-OR-001&rdquo; or &ldquo;Royal Diamond Bracelet&rdquo;)
                </span>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Royal Butterfly Diamond Pendant"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  style={{ width: "100%", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                  Design Code / SKU *
                </label>
                <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                  Unique identifier code (e.g. BR-SG-OR-001)
                </span>
                <input
                  type="text"
                  required
                  className="admin-input"
                  placeholder="e.g. BR-SG-OR-001"
                  value={formState.design_code}
                  onChange={(e) => setFormState({ ...formState, design_code: e.target.value.toUpperCase() })}
                  style={{ width: "100%", fontFamily: "monospace", fontSize: "13px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                  Jewellery Collection / Category
                </label>
                <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                  Category on storefront (e.g. Bracelet, Ring, Necklace)
                </span>
                <select
                  className="admin-input"
                  value={formState.collection_master_id}
                  onChange={(e) => setFormState({ ...formState, collection_master_id: e.target.value })}
                  style={{ width: "100%", fontSize: "13px" }}
                >
                  <option value="">None / Unassigned Category</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name ? c.name.charAt(0).toUpperCase() + c.name.slice(1) : `Collection #${c.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                  Storefront Visibility Status
                </label>
                <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                  Whether buyers can view and purchase this piece online
                </span>
                <select
                  className="admin-input"
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  style={{ width: "100%", fontSize: "13px" }}
                >
                  <option value="active">Active (Visible & Buyable on Storefront)</option>
                  <option value="draft">Draft (Hidden in Atelier Admin Only)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                Product Description & Story
              </label>
              <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                Craftsmanship highlights, sacred geometry, diamond details, and styling notes shown to customers
              </span>
              <textarea
                rows="4"
                className="admin-input"
                placeholder="Describe the craftsmanship, metal finish, comfort-fit ergonomics, and diamond cut..."
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                style={{ width: "100%", fontSize: "13px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                  Lead Designer / Artisan
                </label>
                <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                  Creator credited on certificates and product page
                </span>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Darshit Soni"
                  value={formState.designed_by}
                  onChange={(e) => setFormState({ ...formState, designed_by: e.target.value })}
                  style={{ width: "100%", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                  Collection Release Date
                </label>
                <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                  Launch or crafting debut date
                </span>
                <input
                  type="date"
                  className="admin-input"
                  value={formState.release_date}
                  onChange={(e) => setFormState({ ...formState, release_date: e.target.value })}
                  style={{ width: "100%", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* BIS Hallmark & Authenticity Certificate */}
            <div style={{ marginTop: "12px", paddingTop: "18px", borderTop: "1px solid var(--admin-border-light)" }}>
              <div style={{ marginBottom: "14px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                  Government Hallmark & Authenticity Certification (BIS / HUID)
                </h4>
                <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "3px 0 0" }}>
                  Official Bureau of Indian Standards (BIS) hallmark and diamond grading laboratory verification.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    BIS HUID Number
                  </label>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                    6-character alphanumeric code laser-etched on gold (e.g. 7X3M9P)
                  </span>
                  <input
                    type="text"
                    maxLength={10}
                    className="admin-input"
                    placeholder="e.g. 7X3M9P"
                    value={formState.huid || ""}
                    onChange={(e) => setFormState({ ...formState, huid: e.target.value.toUpperCase() })}
                    style={{ width: "100%", fontFamily: "monospace", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    Laboratory Certificate Number
                  </label>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                    Official SGL / IGI / GIA report number (e.g. SGL-J948271)
                  </span>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. SGL-J948271"
                    value={formState.certificate_number || ""}
                    onChange={(e) => setFormState({ ...formState, certificate_number: e.target.value })}
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    Certificate Verification Link / PDF
                  </label>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                    Customer-facing web link to verify grading report online
                  </span>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="e.g. https://sgl-labs.com/verify/..."
                    value={formState.certificate_url || ""}
                    onChange={(e) => setFormState({ ...formState, certificate_url: e.target.value })}
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRICING & CRAFTING BENCHMARK */}
        {activeTab === "pricing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* 1. Multi-Select Karat & Purity Standards */}
            <div className="admin-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                    Applicable Purity Standards (Multi-Select)
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "4px 0 0" }}>
                    Select all karat and purity standards in which this design can be handcrafted and benchmarked.
                  </p>
                </div>
                <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", fontWeight: 600 }}>
                  {benchmarkPurities.length} Standards Selected
                </div>
              </div>

              {/* Multi-select Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "12px" }}>
                {allAvailablePurities.map((purity) => {
                  const pCode = purity.code || purity.name;
                  const isSelected = benchmarkPurities.some((bp) => bp === pCode || bp === purity.id || bp === purity.name);
                  const isPrimary = (formState.karat === pCode) || (formState.karat === purity.name) || (formState.purity_fraction === purity.purity_fraction);

                  return (
                    <div
                      key={purity.id || pCode}
                      onClick={() => handleToggleBenchmarkPurity(pCode, purity)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "8px",
                        border: isSelected ? "1.5px solid var(--admin-primary, #2563EB)" : "1px solid var(--admin-border)",
                        background: isSelected ? "var(--admin-primary-light, #EFF6FF)" : "var(--admin-surface)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{
                              width: "16px",
                              height: "16px",
                              accentColor: "var(--admin-primary, #2563EB)",
                              cursor: "pointer",
                            }}
                          />
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                            {purity.name}
                          </span>
                        </div>
                        {isPrimary && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "var(--admin-primary)",
                              color: "#FFF",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Primary
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                        <span>{Math.round((purity.purity_fraction || 1) * 1000) / 10}% Hallmark</span>
                        {isSelected && !isPrimary && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimaryBenchmark(pCode, purity);
                            }}
                            className="admin-btn-outline"
                            style={{
                              padding: "2px 8px",
                              fontSize: "11px",
                            }}
                          >
                            Set Primary
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Crafting Benchmarks (Weight & Costs) */}
            <div className="admin-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                  Gold Weight & Crafting Cost Benchmarks
                </h3>
                <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "4px 0 0" }}>
                  Define base gold weight and crafting charges. These calculate live storefront prices proportionally across all chosen purities.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    Default Showcase Purity
                  </label>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                    Initial purity selected on product page
                  </span>
                  <select
                    className="admin-input"
                    value={formState.karat}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matched = allAvailablePurities.find((p) => (p.code === val || p.name === val));
                      setFormState({
                        ...formState,
                        karat: val,
                        purity_fraction: matched?.purity_fraction || (val === "24K" ? 0.999 : val === "22K" ? 0.916 : val === "18K" ? 0.750 : 0.585),
                      });
                    }}
                    style={{ width: "100%", fontSize: "13px" }}
                  >
                    {allAvailablePurities
                      .filter((p) => benchmarkPurities.some((bp) => bp === p.code || bp === p.id || bp === p.name))
                      .map((p) => (
                        <option key={p.id || p.code} value={p.code || p.name}>
                          {p.name} ({Math.round((p.purity_fraction || 1) * 1000) / 10}% pure)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    Net Gold Weight (Grams) *
                  </label>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                    Metal weight in grams (without gems)
                  </span>
                  <input
                    type="number"
                    step="0.001"
                    required
                    className="admin-input"
                    placeholder="e.g. 10.5"
                    value={formState.base_weight_grams}
                    onChange={(e) => setFormState({ ...formState, base_weight_grams: e.target.value })}
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    Wastage / Value Addition (VA %)
                  </label>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                    Casting & polishing wastage % (e.g. 2.5%, 20%)
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    className="admin-input"
                    placeholder="e.g. 2.5"
                    value={formState.wastage_percent}
                    onChange={(e) => setFormState({ ...formState, wastage_percent: e.target.value })}
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    Making Charges (₹ Flat)
                  </label>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                    Artisan crafting and labor fee in ₹
                  </span>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="e.g. 3500"
                    value={formState.making_charge}
                    onChange={(e) => setFormState({ ...formState, making_charge: e.target.value })}
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    Default Stone Charge (₹)
                  </label>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                    Cost for default mounted stones/diamonds
                  </span>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="e.g. 0"
                    value={formState.stone_charge}
                    onChange={(e) => setFormState({ ...formState, stone_charge: e.target.value })}
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                  {getOptionValues("gem").filter((v) => v.enabled !== false).length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "6px" }}>
                      {getOptionValues("gem")
                        .filter((v) => v.enabled !== false)
                        .map((v, i) => {
                          const delta = parseFloat(v.price_delta) || 0;
                          const isSelected = parseFloat(formState.stone_charge) === delta;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setFormState({ ...formState, stone_charge: delta })}
                              className="admin-btn-ghost"
                              style={{
                                fontSize: "10.5px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                border: isSelected ? "1.5px solid var(--admin-primary, #3C50E0)" : "1px solid var(--admin-border)",
                                background: isSelected ? "var(--admin-primary-light, #EFF2FE)" : "transparent",
                                color: isSelected ? "var(--admin-primary, #3C50E0)" : "var(--admin-text-secondary)",
                                cursor: "pointer",
                                fontWeight: isSelected ? 700 : 500,
                              }}
                            >
                              {v.value} ({delta > 0 ? `+₹${delta.toLocaleString("en-IN")}` : "₹0"})
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Live Benchmark Retail Price Table (Comparative Pricing for All Selected Purities) */}
            <div className="admin-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Real-time Bullion Feed Connection Status Bar */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, rgba(201, 169, 97, 0.12) 0%, rgba(201, 169, 97, 0.03) 100%)",
                  border: "1px solid rgba(201, 169, 97, 0.3)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", display: "inline-block", boxShadow: "0 0 6px #10B981" }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--admin-gold)" }}>
                      Live Aarav Bullion Spot Feed Connected
                    </span>
                    {lastRateSync && (
                      <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                        · Synced {lastRateSync.toLocaleTimeString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "baseline", marginTop: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                      24KT Pure: <span style={{ color: "var(--admin-gold)", fontFamily: "monospace" }}>₹{rates.gold_24k_per_g?.toLocaleString("en-IN")}/g</span>
                    </span>
                    <span style={{ color: "var(--admin-border)" }}>|</span>
                    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                      22KT: <span style={{ color: "var(--admin-text-primary)", fontFamily: "monospace" }}>₹{rates.gold_22k_per_g?.toLocaleString("en-IN")}/g</span>
                    </span>
                    <span style={{ color: "var(--admin-border)" }}>|</span>
                    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                      18KT: <span style={{ color: "var(--admin-text-primary)", fontFamily: "monospace" }}>₹{Math.round(rates.gold_24k_per_g * 0.75)?.toLocaleString("en-IN")}/g</span>
                    </span>
                    <span style={{ color: "var(--admin-border)" }}>|</span>
                    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                      14KT: <span style={{ color: "var(--admin-text-primary)", fontFamily: "monospace" }}>₹{Math.round(rates.gold_24k_per_g * 0.585)?.toLocaleString("en-IN")}/g</span>
                    </span>
                    <span style={{ color: "var(--admin-border)" }}>|</span>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#475569" }}>
                      925 Silver: <span style={{ color: "#0284C7", fontFamily: "monospace" }}>₹{rates.silver_per_g?.toLocaleString("en-IN")}/g</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchLiveRates}
                  disabled={ratesLoading}
                  className="admin-btn-outline"
                  style={{ fontSize: "12px", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span>{ratesLoading ? "…" : "↻"}</span>
                  <span>{ratesLoading ? "Syncing Feed…" : "Sync Live Rates"}</span>
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                    Live Benchmark Retail Price Table
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "4px 0 0" }}>
                    Calculated in real-time according to live bullion rates, purity hallmarks, wastage (VA %), making charges (₹), and 3% GST.
                  </p>
                </div>
              </div>

              {/* Comparative Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-surface-elevated)", textAlign: "left" }}>
                      <th style={{ padding: "10px 14px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>Purity Grade</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>Live Rate / g</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>Metal Value</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>Wastage ({formState.wastage_percent}%)</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>Making Charge (₹)</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>Stones (₹)</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, color: "var(--admin-text-secondary)" }}>GST (3%)</th>
                      <th style={{ padding: "10px 14px", fontWeight: 700, color: "var(--admin-text-primary)", textAlign: "right" }}>Total Retail MRP (₹)</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, color: "var(--admin-text-secondary)", textAlign: "center" }}>Storefront Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurityCalculations.map((calc) => (
                      <tr
                        key={calc.code}
                        style={{
                          borderBottom: "1px solid var(--admin-border-light, #f1f5f9)",
                          background: calc.isPrimary ? "var(--admin-primary-light, #EFF6FF)" : "transparent",
                          fontWeight: calc.isPrimary ? 600 : 400,
                        }}
                      >
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontWeight: 700, color: "var(--admin-text-primary)" }}>{calc.name}</span>
                          <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)", marginLeft: "6px" }}>
                            ({calc.hallmarkPct}% pure)
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>₹{Math.round(calc.ratePerGram).toLocaleString("en-IN")}</td>
                        <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>₹{calc.metalValue.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>₹{calc.wastageValue.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>₹{calc.making.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>₹{calc.stones.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>₹{calc.gst.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                          ₹{calc.total.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          {calc.isPrimary ? (
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "4px",
                                background: "var(--admin-primary)",
                                color: "#FFF",
                              }}
                            >
                              Primary Display
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryBenchmark(calc.code, calc.purity)}
                              style={{
                                background: "none",
                                border: "1px solid var(--admin-border)",
                                borderRadius: "4px",
                                padding: "2px 8px",
                                fontSize: "11px",
                                cursor: "pointer",
                                color: "var(--admin-text-secondary)",
                              }}
                            >
                              Set Primary
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BESPOKE MATRIX & PRODUCT AVAILABILITY */}
        {activeTab === "matrix" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* CARD 1: PRODUCT AVAILABILITY CONFIGURATION (ALL 5 MASTERS) */}
            <div className="admin-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "22px" }}>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  borderBottom: "1px solid var(--admin-border-light)",
                  paddingBottom: "18px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                      Customer Customization Options & Availability Matrix
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: "20px",
                        background: "var(--admin-primary-light)",
                        color: "var(--admin-primary)",
                        border: "1px solid rgba(60,80,224,0.2)",
                      }}
                    >
                      Storefront Bespoke Selector
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "4px", margin: "4px 0 0" }}>
                    Configure the choices customers see on the product page: <strong>Gold Color & Purity</strong>, <strong>Sizes</strong>, <strong>Gemstones & Diamonds</strong>, and <strong>Chain Options</strong>.
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleResetToGlobalDefaults}
                    className="admin-btn-outline"
                    style={{ fontSize: "12px", padding: "6px 14px" }}
                  >
                    Reset to Brand Defaults
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAllMatrix(true)}
                    className="admin-btn-outline"
                    style={{ fontSize: "12px", padding: "6px 14px" }}
                  >
                    Select All Options
                  </button>
                </div>
              </div>

              {/* 1. METAL PURITY & FINISH OPTIONS MATRIX */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>1. Metal Colors & Purities (Gold & Platinum Matrix)</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-muted)" }}>
                        ({activeFinishes.filter((f) => (productFinishMatrix[f.id] || []).length > 0).length} of {activeFinishes.length} Metal Colors Active)
                      </span>
                    </h4>
                    <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "2px 0 0" }}>
                      Choose which karat standards (24KT, 22KT, 18KT, 14KT, PT950) can be cast for each metal color on this piece.
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "14px" }}>
                  {activeFinishes.map((finish) => {
                    const allowedPurities = productFinishMatrix[finish.id] || [];
                    const isFinishActive = allowedPurities.length > 0;

                    return (
                      <div
                        key={finish.id}
                        style={{
                          border: isFinishActive ? "1.5px solid var(--admin-primary, #3C50E0)" : "1px solid var(--admin-border)",
                          borderRadius: "10px",
                          background: isFinishActive ? "var(--admin-surface)" : "var(--admin-surface-elevated)",
                          overflow: "hidden",
                          transition: "all 0.15s ease",
                          boxShadow: isFinishActive ? "0 2px 8px rgba(60,80,224,0.08)" : "none",
                        }}
                      >
                        {/* Finish Card Header */}
                        <div
                          style={{
                            padding: "12px 14px",
                            background: isFinishActive ? "var(--admin-primary-light, #EFF2FE)" : "var(--admin-surface)",
                            borderBottom: "1px solid var(--admin-border-light)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                background: finish.hex_color || "#D4AF37",
                                border: "1px solid rgba(0,0,0,0.15)",
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                              {finish.name}
                            </span>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                padding: "1px 5px",
                                borderRadius: "4px",
                                background: "var(--admin-surface)",
                                border: "1px solid var(--admin-border)",
                                color: "var(--admin-text-muted)",
                                fontFamily: "monospace",
                              }}
                            >
                              {finish.code}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleAllPuritiesForFinish(finish.id, !isFinishActive)}
                              style={{
                                background: "none",
                                border: "none",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "var(--admin-primary)",
                                cursor: "pointer",
                                padding: "2px 4px",
                              }}
                            >
                              {isFinishActive ? "Clear" : "Allow All"}
                            </button>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: "10px",
                                background: isFinishActive ? "var(--admin-primary)" : "var(--admin-border)",
                                color: isFinishActive ? "#FFFFFF" : "var(--admin-text-muted)",
                              }}
                            >
                              {allowedPurities.length}
                            </span>
                          </div>
                        </div>

                        {/* Allowed Purities Checkbox List */}
                        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {activePurities.map((purity) => {
                            const isChecked = allowedPurities.includes(purity.id);

                            return (
                              <label
                                key={purity.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "6px 8px",
                                  borderRadius: "6px",
                                  background: isChecked ? "var(--admin-surface-elevated)" : "transparent",
                                  border: isChecked ? "1px solid var(--admin-border)" : "1px solid transparent",
                                  cursor: "pointer",
                                  userSelect: "none",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleMatrixPurity(finish.id, purity.id)}
                                    style={{
                                      width: "15px",
                                      height: "15px",
                                      accentColor: "var(--admin-primary, #3C50E0)",
                                      cursor: "pointer",
                                    }}
                                  />
                                  <span style={{ fontSize: "12px", fontWeight: isChecked ? 600 : 500, color: "var(--admin-text-primary)" }}>
                                    {purity.name}
                                  </span>
                                </div>

                                <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", fontFamily: "monospace" }}>
                                  {Math.round((purity.purity_fraction || 1) * 1000) / 10}%
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. SIZE AVAILABILITY */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "12px", borderTop: "1px solid var(--admin-border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>2. Available Sizes & Dimensions (Rings, Bangles & Chains)</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-muted)" }}>
                        ({getOptionValues("size").filter((v) => v.enabled !== false).length} Sizes Active)
                      </span>
                    </h4>
                    <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "2px 0 0" }}>
                      Select the ring sizes, bangle diameters, or chain lengths offered for this piece. You can add extra price (+₹) for larger sizes.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleAllOptionValues("size", true)}
                      className="admin-btn-outline"
                      style={{ fontSize: "11px", padding: "4px 10px" }}
                    >
                      Select All Sizes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAllOptionValues("size", false)}
                      className="admin-btn-ghost"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Size Pills Grid */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {getOptionValues("size").map((val, idx) => {
                    const isValActive = val.enabled !== false;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          transition: "all 0.15s ease",
                          border: isValActive ? "1.5px solid var(--admin-primary, #3C50E0)" : "1px solid var(--admin-border)",
                          background: isValActive ? "var(--admin-primary-light, #EFF2FE)" : "var(--admin-surface)",
                          boxShadow: isValActive ? "0 2px 6px rgba(60,80,224,0.06)" : "none",
                        }}
                      >
                        <div
                          onClick={() => handleToggleOptionValue("size", idx)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <span style={{ fontSize: "13px", color: isValActive ? "var(--admin-primary)" : "var(--admin-text-muted)" }}>
                            {isValActive ? "✓" : "○"}
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: isValActive ? 600 : 500, color: "var(--admin-text-primary)" }}>
                            {val.value}
                          </span>
                        </div>

                        {val.price_delta ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "3px" }} onClick={(e) => e.stopPropagation()}>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: isValActive ? "var(--admin-primary)" : "var(--admin-text-muted)" }}>
                              +₹
                            </span>
                            <input
                              type="number"
                              value={val.price_delta !== undefined ? val.price_delta : 0}
                              onChange={(e) => handleUpdateOptionPriceDelta("size", idx, e.target.value)}
                              title="Extra price added for this size"
                              placeholder="0"
                              style={{
                                width: "65px",
                                padding: "2px 6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                fontFamily: "monospace",
                                borderRadius: "4px",
                                border: isValActive ? "1px solid rgba(60,80,224,0.3)" : "1px solid var(--admin-border)",
                                background: "var(--admin-surface)",
                                color: isValActive ? "var(--admin-primary)" : "var(--admin-text-primary)",
                                outline: "none",
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Inline Add Custom Size */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Ring Size 20 or 2.4 Bangle"
                    value={newCustomSize}
                    onChange={(e) => setNewCustomSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomOptionValue("size", newCustomSize, 0);
                        setNewCustomSize("");
                      }
                    }}
                    style={{ width: "240px", fontSize: "12px", padding: "6px 10px" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddCustomOptionValue("size", newCustomSize, 0);
                      setNewCustomSize("");
                    }}
                    className="admin-btn-outline"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    + Add Size
                  </button>
                </div>
              </div>

              {/* 3. GEM / STONE OPTIONS (GEM) AVAILABILITY */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "12px", borderTop: "1px solid var(--admin-border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>3. Gemstones & Natural Diamond Choices</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-muted)" }}>
                        ({getOptionValues("gem").filter((v) => v.enabled !== false).length} Gems Active)
                      </span>
                    </h4>
                    <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "2px 0 0" }}>
                      Select precious stones, certified natural diamonds (VVS-VS), and solid gold options permitted on this piece. Set price delta (+₹) added when customer selects that stone.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleAllOptionValues("gem", true)}
                      className="admin-btn-outline"
                      style={{ fontSize: "11px", padding: "4px 10px" }}
                    >
                      Select All Stones
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAllOptionValues("gem", false)}
                      className="admin-btn-ghost"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Gem Pills Grid */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {getOptionValues("gem").map((val, idx) => {
                    const isValActive = val.enabled !== false;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "7px 12px",
                          borderRadius: "8px",
                          transition: "all 0.15s ease",
                          border: isValActive ? "1.5px solid var(--admin-primary, #3C50E0)" : "1px solid var(--admin-border)",
                          background: isValActive ? "var(--admin-primary-light, #EFF2FE)" : "var(--admin-surface)",
                          boxShadow: isValActive ? "0 2px 6px rgba(60,80,224,0.06)" : "none",
                        }}
                      >
                        <div
                          onClick={() => handleToggleOptionValue("gem", idx)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <span style={{ fontSize: "13px", color: isValActive ? "var(--admin-primary)" : "var(--admin-text-muted)" }}>
                            {isValActive ? "✓" : "○"}
                          </span>
                          {val.image && (
                            <img
                              src={val.image}
                              alt={val.value}
                              style={{ width: "18px", height: "18px", borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(0,0,0,0.1)" }}
                            />
                          )}
                          <span style={{ fontSize: "12px", fontWeight: isValActive ? 600 : 500, color: "var(--admin-text-primary)" }}>
                            {val.value}
                          </span>
                        </div>

                        {/* Direct Editable Price Delta Input */}
                        <div style={{ display: "flex", alignItems: "center", gap: "3px" }} onClick={(e) => e.stopPropagation()}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: isValActive ? "var(--admin-primary)" : "var(--admin-text-muted)" }}>
                            +₹
                          </span>
                          <input
                            type="number"
                            value={val.price_delta !== undefined ? val.price_delta : 0}
                            onChange={(e) => handleUpdateOptionPriceDelta("gem", idx, e.target.value)}
                            title="Extra price added to total price"
                            placeholder="0"
                            style={{
                              width: "75px",
                              padding: "2px 6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              fontFamily: "monospace",
                              borderRadius: "4px",
                              border: isValActive ? "1px solid rgba(60,80,224,0.3)" : "1px solid var(--admin-border)",
                              background: "var(--admin-surface)",
                              color: isValActive ? "var(--admin-primary)" : "var(--admin-text-primary)",
                              outline: "none",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inline Add Custom Stone */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Colombian Emerald (1.2ct)"
                    value={newCustomStone}
                    onChange={(e) => setNewCustomStone(e.target.value)}
                    style={{ width: "240px", fontSize: "12px", padding: "6px 10px" }}
                  />
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="Price Delta ₹ (e.g. 35000)"
                    value={newCustomStoneDelta}
                    onChange={(e) => setNewCustomStoneDelta(e.target.value)}
                    style={{ width: "160px", fontSize: "12px", padding: "6px 10px" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddCustomOptionValue("gem", newCustomStone, newCustomStoneDelta);
                      setNewCustomStone("");
                      setNewCustomStoneDelta("");
                    }}
                    className="admin-btn-outline"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    + Add Gem/Stone
                  </button>
                </div>
              </div>

              {/* 4. CHAIN TYPE AVAILABILITY */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "12px", borderTop: "1px solid var(--admin-border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>4. Accompanying Chain Options (Pendants & Necklaces)</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-text-muted)" }}>
                        ({getOptionValues("chain").filter((v) => v.enabled !== false).length} Chains Active)
                      </span>
                    </h4>
                    <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "2px 0 0" }}>
                      Configure chain link styles and lengths (e.g. Box Chain 18&quot;, Cable Chain) or &quot;Pendant Only (No Chain)&quot;. Enter extra price (+₹) for each chain.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleAllOptionValues("chain", true)}
                      className="admin-btn-outline"
                      style={{ fontSize: "11px", padding: "4px 10px" }}
                    >
                      Select All Chains
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAllOptionValues("chain", false)}
                      className="admin-btn-ghost"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Chain Pills Grid */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {getOptionValues("chain").map((val, idx) => {
                    const isValActive = val.enabled !== false;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "7px 12px",
                          borderRadius: "8px",
                          transition: "all 0.15s ease",
                          border: isValActive ? "1.5px solid var(--admin-primary, #3C50E0)" : "1px solid var(--admin-border)",
                          background: isValActive ? "var(--admin-primary-light, #EFF2FE)" : "var(--admin-surface)",
                          boxShadow: isValActive ? "0 2px 6px rgba(60,80,224,0.06)" : "none",
                        }}
                      >
                        <div
                          onClick={() => handleToggleOptionValue("chain", idx)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <span style={{ fontSize: "13px", color: isValActive ? "var(--admin-primary)" : "var(--admin-text-muted)" }}>
                            {isValActive ? "✓" : "○"}
                          </span>
                          {val.image && (
                            <img
                              src={val.image}
                              alt={val.value}
                              style={{ width: "18px", height: "18px", borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(0,0,0,0.1)" }}
                            />
                          )}
                          <span style={{ fontSize: "12px", fontWeight: isValActive ? 600 : 500, color: "var(--admin-text-primary)" }}>
                            {val.value}
                          </span>
                        </div>

                        {/* Direct Editable Price Delta Input */}
                        <div style={{ display: "flex", alignItems: "center", gap: "3px" }} onClick={(e) => e.stopPropagation()}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: isValActive ? "var(--admin-primary)" : "var(--admin-text-muted)" }}>
                            +₹
                          </span>
                          <input
                            type="number"
                            value={val.price_delta !== undefined ? val.price_delta : 0}
                            onChange={(e) => handleUpdateOptionPriceDelta("chain", idx, e.target.value)}
                            title="Extra price added for this chain"
                            placeholder="0"
                            style={{
                              width: "75px",
                              padding: "2px 6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              fontFamily: "monospace",
                              borderRadius: "4px",
                              border: isValActive ? "1px solid rgba(60,80,224,0.3)" : "1px solid var(--admin-border)",
                              background: "var(--admin-surface)",
                              color: isValActive ? "var(--admin-primary)" : "var(--admin-text-primary)",
                              outline: "none",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inline Add Custom Chain */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder='e.g. Wheat Link Chain (22")'
                    value={newCustomChain}
                    onChange={(e) => setNewCustomChain(e.target.value)}
                    style={{ width: "240px", fontSize: "12px", padding: "6px 10px" }}
                  />
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="Price Delta ₹ (e.g. 18000)"
                    value={newCustomChainDelta}
                    onChange={(e) => setNewCustomChainDelta(e.target.value)}
                    style={{ width: "160px", fontSize: "12px", padding: "6px 10px" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddCustomOptionValue("chain", newCustomChain, newCustomChainDelta);
                      setNewCustomChain("");
                      setNewCustomChainDelta("");
                    }}
                    className="admin-btn-outline"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    + Add Chain
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: PRODUCT VARIANTS & BESPOKE CRAFTING TABLE (ON SAME PAGE!) */}
            <div className="admin-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                      5. Handcrafted Variants & Live Pricing Matrix
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        background: productVariants.length > 0 ? "var(--admin-success-bg)" : "var(--admin-surface-elevated)",
                        color: productVariants.length > 0 ? "var(--admin-success)" : "var(--admin-text-muted)",
                        border: "1px solid var(--admin-border)",
                      }}
                    >
                      {productVariants.length} Combinations Generated
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "4px", margin: "4px 0 0" }}>
                    Fine jewellery pieces are handcrafted to order. Set exact gold weight (g) and final retail price (₹) for each permitted customer configuration.
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled={isGeneratingVariants}
                    onClick={handleAutoGenerateVariants}
                    className="admin-btn-primary"
                    style={{ fontSize: "12px", padding: "8px 16px" }}
                  >
                    {isGeneratingVariants ? "Generating..." : "Auto-Generate from Availability"}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSingleVariant}
                    className="admin-btn-outline"
                    style={{ fontSize: "12px", padding: "8px 14px" }}
                  >
                    + Add Single Variant
                  </button>
                  {productVariants.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveAllVariants}
                        className="admin-btn-outline"
                        style={{ fontSize: "12px", padding: "8px 14px" }}
                      >
                        Save All Variants
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllVariants}
                        className="admin-btn-ghost"
                        style={{ fontSize: "12px", padding: "8px 10px", color: "var(--admin-danger, #DC2626)" }}
                      >
                        Clear All
                      </button>
                    </>
                  )}
                </div>
              </div>

              {productVariants.length === 0 ? (
                <div
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    border: "1.5px dashed var(--admin-border)",
                    borderRadius: "8px",
                    color: "var(--admin-text-muted)",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "4px" }}>
                    No Variant Combinations Generated Yet
                  </div>
                  <div style={{ fontSize: "12px", maxWidth: "440px", margin: "0 auto 16px" }}>
                    Configure your allowed Finish, Metal Purity, Size, Gem / Stone, and Chain rules above, then click &ldquo;Auto-Generate from Availability&rdquo; to populate combination SKUs and pricing.
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoGenerateVariants}
                    className="admin-btn-primary"
                    style={{ fontSize: "12px", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
                  >
                    Auto-Generate Variants
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: "auto", border: "1px solid var(--admin-border)", borderRadius: "8px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "var(--admin-surface-elevated, #F8FAFC)", borderBottom: "1px solid var(--admin-border)" }}>
                        <th style={{ padding: "12px 14px", fontWeight: 600 }}>Metal Color & Purity</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600 }}>Size / Dimension</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600 }}>Gemstone / Natural Diamond</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600 }}>Net Gold Weight (g)</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600 }}>Retail Selling Price (₹)</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productVariants.map((variant, idx) => {
                        const finishName =
                          variant.finish?.name || activeFinishes.find((f) => f.id === variant.finish_id)?.name || "Finish";
                        const finishHex =
                          variant.finish?.hex_color || activeFinishes.find((f) => f.id === variant.finish_id)?.hex_color || "#D4AF37";
                        const purityName =
                          variant.purity?.name || activePurities.find((p) => p.id === variant.purity_id)?.name || "Purity";
                        const sizeName = variant.size_name || variant.size?.name || "Standard";
                        const stoneName = variant.stone_name || variant.stone?.name || "Solid Gold / No Stone";
                        const isSaving = savingVariantId === (variant.id || `idx-${idx}`);

                        return (
                          <tr
                            key={variant.id || `v-${idx}`}
                            style={{
                              borderBottom: "1px solid var(--admin-border-light)",
                              background: variant.isNew ? "var(--admin-primary-light, #EFF2FE)" : "transparent",
                            }}
                          >
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span
                                  style={{
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "50%",
                                    background: finishHex,
                                    border: "1px solid rgba(0,0,0,0.15)",
                                    flexShrink: 0,
                                  }}
                                />
                                <div>
                                  <span style={{ fontWeight: 600, color: "var(--admin-text-primary)" }}>{finishName}</span>
                                  <span style={{ color: "var(--admin-text-secondary)", marginLeft: "4px" }}>• {purityName}</span>
                                </div>
                              </div>
                            </td>

                            <td style={{ padding: "10px 14px", color: "var(--admin-text-secondary)" }}>
                              {sizeName}
                            </td>

                            <td style={{ padding: "10px 14px", color: "var(--admin-text-secondary)" }}>
                              <div style={{ fontWeight: 600, color: "var(--admin-text-primary)" }}>{stoneName}</div>
                              {(variant.stone?.price_delta > 0 || variant.stone_price_delta > 0) && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    marginTop: "2px",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    background: "var(--admin-primary-light, #EFF2FE)",
                                    color: "var(--admin-primary, #3C50E0)",
                                    border: "1px solid rgba(60,80,224,0.2)",
                                  }}
                                >
                                  +₹{Number(variant.stone?.price_delta || variant.stone_price_delta).toLocaleString("en-IN")}
                                </span>
                              )}
                              {variant.chain_name && variant.chain_name !== "—" && !variant.chain_name.includes("No Chain") && (
                                <div style={{ fontSize: "10px", color: "var(--admin-text-muted)", marginTop: "2px" }}>
                                  ⛓️ {variant.chain_name}
                                </div>
                              )}
                            </td>

                            <td style={{ padding: "10px 14px" }}>
                              <input
                                type="number"
                                step="0.001"
                                className="admin-input"
                                value={variant.weight ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setProductVariants((prev) =>
                                    prev.map((v, i) => (i === idx ? { ...v, weight: val } : v))
                                  );
                                }}
                                style={{ width: "80px", fontSize: "11px", padding: "4px 8px" }}
                              />
                            </td>

                            <td style={{ padding: "10px 14px" }}>
                              <input
                                type="number"
                                className="admin-input"
                                value={variant.price ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setProductVariants((prev) =>
                                    prev.map((v, i) => (i === idx ? { ...v, price: val } : v))
                                  );
                                }}
                                style={{ width: "105px", fontSize: "11px", fontWeight: 700, padding: "4px 8px" }}
                              />
                              {(variant.stone?.price_delta > 0 || variant.chain?.price_delta > 0) && (
                                <div style={{ fontSize: "9.5px", color: "var(--admin-text-muted)", marginTop: "2px", whiteSpace: "nowrap" }}>
                                  Includes {variant.stone?.price_delta > 0 ? `+₹${Number(variant.stone.price_delta).toLocaleString("en-IN")} stone` : ""}
                                  {variant.stone?.price_delta > 0 && variant.chain?.price_delta > 0 ? ", " : ""}
                                  {variant.chain?.price_delta > 0 ? `+₹${Number(variant.chain.price_delta).toLocaleString("en-IN")} chain` : ""}
                                </div>
                              )}
                            </td>

                            <td style={{ padding: "10px 14px", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "6px" }}>
                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => handleSaveVariant(variant, idx)}
                                  className="admin-btn-ghost"
                                  style={{
                                    fontSize: "11px",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    color: "var(--admin-primary)",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  {isSaving ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVariant(variant, idx)}
                                  className="admin-btn-ghost"
                                  style={{
                                    fontSize: "11px",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    color: "var(--admin-danger, #EF4444)",
                                    cursor: "pointer",
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1 (PART 2): MEDIA (IMAGES, VIDEOS, 3D MODELS) */}
        {activeTab === "essentials" && (
          <div className="admin-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "22px", marginTop: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                Product Photography, 360° Video & 3D Interactive Assets
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "4px", margin: "4px 0 0" }}>
                Upload high-resolution jewelry photos, editorial clips, or interactive 3D models (.glb, .gltf). The first item is automatically displayed as the primary showcase image on product cards.
              </p>
            </div>

            {/* Shopify-like Media Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingMedia(true);
              }}
              onDragLeave={() => setIsDraggingMedia(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingMedia(false);
                if (e.dataTransfer.files?.length) {
                  processUploadedFiles(Array.from(e.dataTransfer.files));
                }
              }}
              style={{
                border: isDraggingMedia
                  ? "2px dashed var(--admin-primary, #2563EB)"
                  : "1.5px dashed var(--admin-border, #CBD5E1)",
                borderRadius: "12px",
                background: isDraggingMedia ? "var(--admin-primary-light, #EFF6FF)" : "transparent",
                padding: "44px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label
                  className="admin-btn-primary"
                  style={{ cursor: "pointer" }}
                >
                  Upload new
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.glb,.gltf,.usdz,.obj"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="admin-btn-outline"
                >
                  Select existing
                </button>
              </div>

              <p
                style={{
                  fontSize: "13px",
                  color: "var(--admin-text-secondary, #6B7280)",
                  margin: "12px 0 0",
                  fontWeight: 400,
                }}
              >
                Accepts images, videos, or 3D models (.glb, .gltf)
              </p>
            </div>



            {/* Media Gallery Grid */}
            {(() => {
              const mediaItems = Array.isArray(formState.images) && formState.images.length > 0
                ? formState.images
                : formState.image
                ? [formState.image]
                : [];

              if (mediaItems.length === 0) return null;

              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-primary)" }}>
                      Attached Media Assets ({mediaItems.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, image: "", images: [] })}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--admin-danger, #EF4444)",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Clear All Media
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    {mediaItems.map((item, idx) => {
                      const url = typeof item === "object" ? item.url : item;
                      const name = typeof item === "object" ? item.name : `Media Asset ${idx + 1}`;
                      const type = getMediaType(item);
                      const isPrimary = idx === 0;

                      return (
                        <div
                          key={idx}
                          style={{
                            border: isPrimary ? "2px solid var(--admin-primary, #3B82F6)" : "1px solid var(--admin-border)",
                            borderRadius: "8px",
                            overflow: "hidden",
                            background: "var(--admin-surface-elevated)",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            transition: "box-shadow 0.15s ease",
                          }}
                        >
                          {/* Preview Screen */}
                          <div
                            style={{
                              width: "100%",
                              height: "150px",
                              background: "#0F172A",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            {type === "image" && (
                              <img
                                src={resolveImageUrl(url)}
                                alt=""
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                  if (url.startsWith("/") && !e.currentTarget.dataset.retried) {
                                    e.currentTarget.dataset.retried = "true";
                                    e.currentTarget.src = `https://pintaara.com${url}`;
                                  }
                                }}
                              />
                            )}

                            {type === "video" && (
                              <div style={{ width: "100%", height: "100%", position: "relative" }}>
                                <video
                                  src={resolveImageUrl(url)}
                                  controls={false}
                                  muted
                                  playsInline
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(0,0,0,0.3)",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "50%",
                                      background: "rgba(255,255,255,0.9)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#111827",
                                      fontSize: "14px",
                                      fontWeight: 700,
                                    }}
                                  >
                                    ▶
                                  </div>
                                </div>
                              </div>
                            )}

                            {type === "model" && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: "20px",
                                  textAlign: "center",
                                  color: "#FFF",
                                }}
                              >
                                <div
                                  style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "8px",
                                    background: "rgba(59, 130, 246, 0.2)",
                                    border: "1px solid rgba(59, 130, 246, 0.5)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "20px",
                                    marginBottom: "8px",
                                  }}
                                >
                                  3D
                                </div>
                                <span style={{ fontSize: "11px", color: "#94A3B8" }}>GLB / USDZ Asset</span>
                              </div>
                            )}

                            {/* Top Badges */}
                            <div style={{ position: "absolute", top: "8px", left: "8px", display: "flex", gap: "6px" }}>
                              {isPrimary && (
                                <span
                                  style={{
                                    background: "var(--admin-primary, #3B82F6)",
                                    color: "#FFF",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    padding: "2px 7px",
                                    borderRadius: "4px",
                                    letterSpacing: "0.03em",
                                  }}
                                >
                                  PRIMARY
                                </span>
                              )}
                            </div>

                            <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                              <span
                                style={{
                                  background: "rgba(15, 23, 42, 0.75)",
                                  color: "#E2E8F0",
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {type === "video" ? "VIDEO" : type === "model" ? "3D MODEL" : "IMAGE"}
                              </span>
                            </div>
                          </div>

                          {/* Card Details & Actions */}
                          <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "var(--admin-text-primary)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={name}
                              >
                                {name}
                              </div>
                              <div style={{ fontSize: "10px", color: "var(--admin-text-muted)", marginTop: "1px" }}>
                                {type.toUpperCase()} • Ready
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryMedia(idx)}
                                  className="admin-btn-ghost"
                                  style={{ fontSize: "11px", padding: "3px 6px", border: "1px solid var(--admin-border)", borderRadius: "4px" }}
                                  title="Make Primary Media"
                                >
                                  Primary
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveMedia(idx)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--admin-danger, #EF4444)",
                                  fontSize: "14px",
                                  cursor: "pointer",
                                  padding: "3px 6px",
                                }}
                                title="Remove Media"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Modal: Select Existing Library Assets */}
            {showMediaLibrary && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 2000,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                }}
                onClick={() => setShowMediaLibrary(false)}
              >
                <div
                  className="admin-card"
                  style={{
                    width: "100%",
                    maxWidth: "760px",
                    maxHeight: "85vh",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "var(--admin-shadow-lg)",
                    padding: 0,
                    overflow: "hidden",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Library Header */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--admin-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                        Select Media from Library
                      </h3>
                      <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "3px 0 0" }}>
                        Choose existing high-res jewelry imagery, videos, or 3D models.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn-ghost"
                      onClick={() => setShowMediaLibrary(false)}
                      style={{ fontSize: "16px", padding: "4px 8px" }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div
                    style={{
                      padding: "10px 20px",
                      background: "var(--admin-surface-elevated)",
                      borderBottom: "1px solid var(--admin-border)",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    {["all", "Images", "Videos", "3D Models"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setLibraryFilter(cat)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "9999px",
                          border: libraryFilter === cat ? "1px solid var(--admin-primary)" : "1px solid var(--admin-border)",
                          background: libraryFilter === cat ? "var(--admin-primary)" : "var(--admin-surface)",
                          color: libraryFilter === cat ? "#FFF" : "var(--admin-text-secondary)",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        {cat === "all" ? "All Media" : cat}
                      </button>
                    ))}
                  </div>

                  {/* Asset Selection Grid */}
                  <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {libraryAssets
                        .filter((item) => libraryFilter === "all" || item.category === libraryFilter)
                        .map((asset, aIdx) => {
                          const isSelected = selectedLibraryItems.some((s) => s.url === asset.url);

                          return (
                            <div
                              key={aIdx}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedLibraryItems(selectedLibraryItems.filter((s) => s.url !== asset.url));
                                } else {
                                  setSelectedLibraryItems([...selectedLibraryItems, asset]);
                                }
                              }}
                              style={{
                                border: isSelected ? "2px solid var(--admin-primary)" : "1px solid var(--admin-border)",
                                borderRadius: "8px",
                                overflow: "hidden",
                                background: isSelected ? "var(--admin-surface-elevated)" : "var(--admin-surface)",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  height: "110px",
                                  background: "#0F172A",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                }}
                              >
                                {asset.type === "image" && (
                                  <img
                                    src={resolveImageUrl(asset.url)}
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => {
                                      if (asset.url.startsWith("/") && !e.currentTarget.dataset.retried) {
                                        e.currentTarget.dataset.retried = "true";
                                        e.currentTarget.src = `https://pintaara.com${asset.url}`;
                                      }
                                    }}
                                  />
                                )}
                                {asset.type === "video" && (
                                  <div style={{ color: "#FFF", fontSize: "12px", textAlign: "center" }}>
                                    <div style={{ fontSize: "20px", marginBottom: "4px" }}>▶</div>
                                    <span>Video Clip</span>
                                  </div>
                                )}
                                {asset.type === "model" && (
                                  <div style={{ color: "#60A5FA", fontSize: "12px", textAlign: "center", fontWeight: 700 }}>
                                    <div style={{ fontSize: "20px", marginBottom: "4px" }}>3D</div>
                                    <span>GLB Model</span>
                                  </div>
                                )}
                              </div>

                              <div style={{ padding: "8px 10px" }}>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: "var(--admin-text-primary)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {asset.name}
                                </div>
                                <div style={{ fontSize: "10px", color: "var(--admin-text-muted)", marginTop: "2px" }}>
                                  {asset.category}
                                </div>
                              </div>

                              {isSelected && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "6px",
                                    right: "6px",
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    background: "var(--admin-primary)",
                                    color: "#FFF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                  }}
                                >
                                  ✓
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Library Footer */}
                  <div
                    style={{
                      padding: "14px 20px",
                      borderTop: "1px solid var(--admin-border)",
                      background: "var(--admin-surface-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                      {selectedLibraryItems.length} item(s) selected
                    </span>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        className="admin-btn-ghost"
                        onClick={() => {
                          setSelectedLibraryItems([]);
                          setShowMediaLibrary(false);
                        }}
                        style={{ padding: "6px 14px", fontSize: "12px" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="admin-btn-primary"
                        onClick={handleAddLibraryMedia}
                        disabled={selectedLibraryItems.length === 0}
                        style={{ padding: "6px 18px", fontSize: "12px" }}
                      >
                        Add to Product ({selectedLibraryItems.length})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DESIGN LOG (BLUEPRINT & SPECIFICATIONS) */}
        {activeTab === "design_log" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Media Image Uploader Card (Matches screenshot dashed dropzone) */}
            <div className="admin-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                    1. Technical Blueprint & CAD Drawing Sheet
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "2px 0 0" }}>
                    Archival orthographic drawing sheet, technical CAD sketch, or 3D render displayed on the public Design Log page.
                  </p>
                </div>
                {formState.design_log?.blueprint_image && formState.design_log?.blueprint_image !== "/images/design-log/PD-SG-OR-001.JPG" && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormState({
                        ...formState,
                        design_log: { ...formState.design_log, blueprint_image: "" },
                      })
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--admin-danger, #EF4444)",
                      fontSize: "12px",
                      cursor: "pointer",
                      padding: "4px 8px",
                    }}
                  >
                    Clear Drawing
                  </button>
                )}
              </div>

              {/* Exact Dashed Uploader from Screenshot */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingBlueprint(true);
                }}
                onDragLeave={() => setIsDraggingBlueprint(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingBlueprint(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleBlueprintFileUpload(file);
                }}
                style={{
                  border: `1px dashed ${isDraggingBlueprint ? "var(--admin-primary, #3B82F6)" : "var(--admin-border, #E5E7EB)"}`,
                  borderRadius: "8px",
                  padding: "36px 20px",
                  textAlign: "center",
                  background: isDraggingBlueprint ? "rgba(59, 130, 246, 0.04)" : "var(--admin-surface, #FFFFFF)",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                  <label
                    className="admin-btn-primary"
                    style={{ cursor: "pointer" }}
                  >
                    Upload new
                    <input
                      type="file"
                      accept="image/*,.glb,.gltf,.pdf"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleBlueprintFileUpload(file);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowBlueprintLibrary(true)}
                    className="admin-btn-outline"
                  >
                    Select existing
                  </button>
                </div>

                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--admin-text-secondary, #6B7280)",
                    margin: "12px 0 0",
                    fontWeight: 400,
                  }}
                >
                  Accepts images, videos, or 3D models
                </p>
              </div>

              {/* Clean Blueprint Preview Card (Only Preview & Remove Button) */}
              {formState.design_log?.blueprint_image && formState.design_log?.blueprint_image !== "/images/design-log/PD-SG-OR-001.JPG" && (
                <div style={{ marginTop: "14px", display: "flex", alignItems: "flex-start" }}>
                  <div
                    style={{
                      position: "relative",
                      width: "140px",
                      height: "140px",
                      borderRadius: "12px",
                      border: "1px solid var(--admin-border, #E5E7EB)",
                      background: "#FAFAF9",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <img
                      src={resolveImageUrl(formState.design_log.blueprint_image)}
                      alt="Blueprint Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        borderRadius: "8px",
                        display: "block",
                      }}
                      onError={(e) => {
                        if (formState.design_log.blueprint_image.startsWith("/") && !e.currentTarget.dataset.retried) {
                          e.currentTarget.dataset.retried = "true";
                          e.currentTarget.src = `https://pintaara.com${formState.design_log.blueprint_image}`;
                        }
                      }}
                    />

                    {/* Floating Circular Remove Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormState({
                          ...formState,
                          design_log: { ...formState.design_log, blueprint_image: "" },
                        })
                      }
                      title="Remove Blueprint"
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: "#EF4444",
                        color: "#FFFFFF",
                        border: "2px solid #FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                        transition: "transform 0.15s ease, background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                        e.currentTarget.style.background = "#DC2626";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.background = "#EF4444";
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Design Log Specifications */}
            <div className="admin-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                    2. Design Log Editorial Story & Public Specifications
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "4px 0 0" }}>
                    Public specifications displayed on the website Design Log (<code style={{ background: "rgba(60, 80, 224, 0.08)", padding: "2px 6px", borderRadius: "4px", color: "var(--admin-primary)" }}>pintaara.com/design-log</code>). If any field is left empty, it will be hidden automatically on the storefront.
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleAutoFillDesignLogSpecs}
                    className="admin-btn-outline"
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 14px",
                      borderColor: "var(--admin-primary)",
                      color: "var(--admin-primary)",
                    }}
                  >
                    ⚡ Auto-fill from Availability Matrix
                  </button>

                  {(formState.design_code || productId) && (
                    <a
                      href={`https://pintaara.com/design-log/${formState.design_code || productId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn-outline"
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        textDecoration: "none",
                      }}
                    >
                      🌐 View on Website ↗
                    </a>
                  )}
                </div>
              </div>

              {/* 8 Clean Fields Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
                {/* 1. TYPE */}
                <div>
                  <div style={{ marginBottom: "6px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "3px" }}>
                      Jewelry Piece Type
                    </label>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                      Classification on design log (e.g. BESPOKE BRACELET, SIGNATURE PENDANT)
                    </span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. BESPOKE BRACELET"
                    value={formState.design_log?.design_type || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        design_log: { ...formState.design_log, design_type: e.target.value },
                      })
                    }
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>

                {/* 2. MATERIAL OPTIONS */}
                <div>
                  <div style={{ marginBottom: "6px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "3px" }}>
                      Gold & Precious Metal Standards
                    </label>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                      Purity hallmarks offered (e.g. 22KT Royal Gold · 18KT Fine Gold)
                    </span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. 18KT Solid Gold · 22KT Royal Gold"
                    value={formState.design_log?.material_options || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        design_log: { ...formState.design_log, material_options: e.target.value },
                      })
                    }
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>

                {/* 3. FINISH OPTIONS */}
                <div>
                  <div style={{ marginBottom: "6px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "3px" }}>
                      Gold Color & Surface Finishes
                    </label>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                      Metal color treatments (e.g. Yellow Gold · White Gold · Rose Gold)
                    </span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Yellow Gold, White Gold, Rose Gold"
                    value={formState.design_log?.finish_options || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        design_log: { ...formState.design_log, finish_options: e.target.value },
                      })
                    }
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>

                {/* 4. SIZE OPTIONS */}
                <div>
                  <div style={{ marginBottom: "6px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "3px" }}>
                      Available Sizing & Dimension Options
                    </label>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                      Wearable dimensions (e.g. Standard Size · Ring Sizes 10–18 · 2.4 Bangle)
                    </span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Standard Size or Ring Sizes 10–18"
                    value={formState.design_log?.size_options || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        design_log: { ...formState.design_log, size_options: e.target.value },
                      })
                    }
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>

                {/* 5. GEM / STONE OPTIONS */}
                <div>
                  <div style={{ marginBottom: "6px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "3px" }}>
                      Gemstones & Diamond Accents
                    </label>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                      Natural diamonds & precious stones (e.g. Natural Diamond (VVS-VS) · Solid Gold)
                    </span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Natural Diamond (VVS-VS) · Solid Gold"
                    value={formState.design_log?.gem_options || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        design_log: { ...formState.design_log, gem_options: e.target.value },
                      })
                    }
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>

                {/* 6. INSPIRED BY */}
                <div>
                  <div style={{ marginBottom: "6px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "3px" }}>
                      Design Story & Architectural Inspiration
                    </label>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                      Poetic story, sacred geometry, or aesthetic philosophy behind the piece
                    </span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Dewdrop physics and morning horizon light"
                    value={formState.design_log?.inspired_by || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        design_log: { ...formState.design_log, inspired_by: e.target.value },
                      })
                    }
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>

                {/* 7. A PINTAARA™ ORIGINAL */}
                <div>
                  <div style={{ marginBottom: "6px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "3px" }}>
                      Atelier Brand Origin & Lineage
                    </label>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                      Atelier authenticity trademark and brand provenance
                    </span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. A PINTAARA™ ORIGINAL"
                    value={formState.design_log?.brand_origin || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        design_log: { ...formState.design_log, brand_origin: e.target.value },
                      })
                    }
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>

                {/* 8. DESIGNED X Darshit Soni */}
                <div>
                  <div style={{ marginBottom: "6px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "3px" }}>
                      Lead Designer / Master Artisan
                    </label>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                      Master creator credited in the Design Log and authenticity report
                    </span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. DESIGNED X Darshit Soni"
                    value={formState.design_log?.designed_by || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        design_log: { ...formState.design_log, designed_by: e.target.value },
                      })
                    }
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                </div>
              </div>
            </div>


            {/* Modal: Select Existing Blueprint Drawing */}
            {showBlueprintLibrary && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 2000,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                }}
                onClick={() => setShowBlueprintLibrary(false)}
              >
                <div
                  className="admin-card"
                  style={{
                    width: "100%",
                    maxWidth: "760px",
                    maxHeight: "85vh",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "var(--admin-shadow-lg)",
                    padding: 0,
                    overflow: "hidden",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--admin-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
                        Select Technical Blueprint Drawing
                      </h3>
                      <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "3px 0 0" }}>
                        Choose an archival orthographic drawing sheet from Pintaara Atelier.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn-ghost"
                      onClick={() => setShowBlueprintLibrary(false)}
                      style={{ fontSize: "16px", padding: "4px 8px" }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px" }}>
                      {[
                        { code: "PD-SG-OR-001", label: "Pendant Butterfly", url: "/images/design-log/PD-SG-OR-001.JPG", type: "Pendant" },
                        { code: "BR-SG-OR-001", label: "Bracelet / Cuff", url: "/images/design-log/BR-SG-OR-001.JPG", type: "Bracelet / Cuff" },
                        { code: "RG-SG-OR-001", label: "Solitaire Ring 1", url: "/images/design-log/RG-SG-OR-001.JPG", type: "Solitaire Ring" },
                        { code: "RG-SG-OR-002", label: "Statement Band 2", url: "/images/design-log/RG-SG-OR-002.JPG", type: "Statement Band" },
                        { code: "ER-SG-OR-001A", label: "Drop Earrings A", url: "/images/design-log/ER-SG-OR-001A.JPG", type: "Drop Earrings" },
                        { code: "ER-SG-OR-001B", label: "Chandelier Earrings B", url: "/images/design-log/ER-SG-OR-001B.JPG", type: "Chandelier Earrings" },
                        { code: "ER-SG-OR-002A", label: "Stud Earrings C", url: "/images/design-log/ER-SG-OR-002A.JPG", type: "Stud Earrings" },
                      ].map((preset) => {
                        const isSelected = formState.design_log?.blueprint_image === preset.url;
                        return (
                          <div
                            key={preset.code}
                            onClick={() => {
                              setFormState({
                                ...formState,
                                design_log: {
                                  ...formState.design_log,
                                  blueprint_image: preset.url,
                                  design_type: preset.type,
                                },
                              });
                              setShowBlueprintLibrary(false);
                              showToast(`Selected ${preset.code}`);
                            }}
                            style={{
                              border: isSelected ? "2px solid var(--admin-primary)" : "1px solid var(--admin-border)",
                              borderRadius: "8px",
                              padding: "10px",
                              background: "#FAFAF9",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "8px",
                              transition: "transform 0.15s ease, box-shadow 0.15s ease",
                            }}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              style={{ width: "100%", height: "130px", objectFit: "contain", borderRadius: "4px" }}
                            />
                            <div style={{ textAlign: "center", width: "100%" }}>
                              <div style={{ fontSize: "11px", fontWeight: 700, color: "#0F172A" }}>
                                {preset.code}
                              </div>
                              <div style={{ fontSize: "10px", color: "#64748B" }}>
                                {preset.label}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Save Bar */}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <Link
            href="/products"
            className="admin-btn-outline"
            style={{ fontSize: "13px", padding: "8px 18px" }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="admin-btn-primary"
            style={{ fontSize: "13px", padding: "8px 24px" }}
          >
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
