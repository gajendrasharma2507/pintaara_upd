"use client";

import React, { useState, useEffect, use, useMemo } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import api, { apiFetch } from '@/lib/api';
import ThreeDModelViewer from '@/components/ThreeDModelViewer';
import { useAuth } from '@/context/AuthContext';


// Category Presets (only for title and watermark, strictly 0 dummy products)
const categoryDataMap = {
    pendants: { name: 'PENDANTS', watermark: 'PINTAARA SIGNATURE', products: [] },
    pendant: { name: 'PENDANTS', watermark: 'PINTAARA SIGNATURE', products: [] },
    rings: { name: 'RINGS', watermark: 'PINTAARA CURATED', products: [] },
    ring: { name: 'RINGS', watermark: 'PINTAARA CURATED', products: [] },
    bracelets: { name: 'BRACELETS', watermark: 'PINTAARA CURATED', products: [] },
    bracelet: { name: 'BRACELETS', watermark: 'PINTAARA CURATED', products: [] },
    earrings: { name: 'EARRINGS', watermark: 'PINTAARA CURATED', products: [] },
    earring: { name: 'EARRINGS', watermark: 'PINTAARA CURATED', products: [] },
    chains: { name: 'CHAINS', watermark: 'PINTAARA CURATED', products: [] },
    chain: { name: 'CHAINS', watermark: 'PINTAARA CURATED', products: [] },
    necklaces: { name: 'NECKLACES', watermark: 'PINTAARA HERITAGE', products: [] },
    necklace: { name: 'NECKLACES', watermark: 'PINTAARA HERITAGE', products: [] },
    mangalsutras: { name: 'MANGALSUTRAS', watermark: 'PINTAARA HERITAGE', products: [] },
    mangalsutra: { name: 'MANGALSUTRAS', watermark: 'PINTAARA HERITAGE', products: [] },
    bangles: { name: 'BANGLES', watermark: 'PINTAARA HERITAGE', products: [] },
    bangle: { name: 'BANGLES', watermark: 'PINTAARA HERITAGE', products: [] },
};

const legacyProductImageFallbacks = {
    'BR-SG-OR-001': '/images/design-log/BR-SG-OR-001.JPG',
    'BR-SG-OR-002': '/images/products/piece-01-exact.jpg',
    'BR-SG-FS-003': '/images/products/piece-02-exact.jpg',
    'BR-SG-MT-004': '/images/products/bracelet.png',
};

const resolveProductImage = (product, imageUrl) => {
    const code = String(product?.design_code || product?.code || '').toUpperCase();
    const normalizedUrl = typeof imageUrl === 'string' ? imageUrl : '';

    if (normalizedUrl.endsWith('/images/products/bracelet.png') && legacyProductImageFallbacks[code]) {
        return legacyProductImageFallbacks[code];
    }

    return normalizedUrl || '/images/products/ring.png';
};

// 57-Facet Brilliant Cut Gemstone Component (supports custom uploaded image or SVG facet fallback)
function FacetedGemstone({ type = 'diamond', imageUrl, isSelected, onClick, title }) {
    if (imageUrl) {
        return (
            <button
                type="button"
                onClick={onClick}
                title={title}
                aria-label={title}
                className={`atelier-gem-btn ${isSelected ? 'active' : ''}`}
            >
                <img
                    src={imageUrl}
                    alt={title || type}
                    style={{ width: '25px', height: '25px', objectFit: 'contain', borderRadius: '50%' }}
                />
            </button>
        );
    }

    const isDiamond = type === 'diamond';
    const isEmerald = type === 'emerald';
    const isSapphire = type === 'sapphire';

    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            className={`atelier-gem-btn ${isSelected ? 'active' : ''}`}
        >
            <svg width="25" height="25" viewBox="0 0 32 32" fill="none">
                <defs>
                    {isDiamond && (
                        <>
                            <radialGradient id={`dia-glow-${type}`} cx="35%" cy="35%" r="65%">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="45%" stopColor="#E2E8F0" />
                                <stop offset="80%" stopColor="#94A3B8" />
                                <stop offset="100%" stopColor="#475569" />
                            </radialGradient>
                            <linearGradient id={`dia-hi-${type}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="60%" stopColor="#CBD5E1" />
                                <stop offset="100%" stopColor="#64748B" />
                            </linearGradient>
                        </>
                    )}
                    {isEmerald && (
                        <>
                            <radialGradient id={`emr-glow-${type}`} cx="35%" cy="35%" r="65%">
                                <stop offset="0%" stopColor="#86EFAC" />
                                <stop offset="35%" stopColor="#22C55E" />
                                <stop offset="70%" stopColor="#15803D" />
                                <stop offset="100%" stopColor="#052E16" />
                            </radialGradient>
                            <linearGradient id={`emr-hi-${type}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#BBF7D0" />
                                <stop offset="60%" stopColor="#16A34A" />
                                <stop offset="100%" stopColor="#14532D" />
                            </linearGradient>
                        </>
                    )}
                    {isSapphire && (
                        <>
                            <radialGradient id={`sap-glow-${type}`} cx="35%" cy="35%" r="65%">
                                <stop offset="0%" stopColor="#93C5FD" />
                                <stop offset="35%" stopColor="#2563EB" />
                                <stop offset="70%" stopColor="#1D4ED8" />
                                <stop offset="100%" stopColor="#172554" />
                            </radialGradient>
                            <linearGradient id={`sap-hi-${type}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#DBEAFE" />
                                <stop offset="60%" stopColor="#1D4ED8" />
                                <stop offset="100%" stopColor="#1E3A8A" />
                            </linearGradient>
                        </>
                    )}
                </defs>

                {/* Base Girdle Circle */}
                <circle
                    cx="16"
                    cy="16"
                    r="15"
                    fill={isDiamond ? `url(#dia-glow-${type})` : isEmerald ? `url(#emr-glow-${type})` : `url(#sap-glow-${type})`}
                    stroke={isDiamond ? "#64748B" : isEmerald ? "#065F46" : "#1E3A8A"}
                    strokeWidth="0.8"
                />

                {/* Facet Geometry */}
                <polygon points="16,1 11,6 21,6" fill={isDiamond ? "#F8FAFC" : isEmerald ? "#4ADE80" : "#60A5FA"} opacity="0.9" />
                <polygon points="31,16 26,11 26,21" fill={isDiamond ? "#E2E8F0" : isEmerald ? "#22C55E" : "#3B82F6"} opacity="0.85" />
                <polygon points="16,31 21,26 11,26" fill={isDiamond ? "#94A3B8" : isEmerald ? "#15803D" : "#1D4ED8"} opacity="0.9" />
                <polygon points="1,16 6,21 6,11" fill={isDiamond ? "#CBD5E1" : isEmerald ? "#16A34A" : "#2563EB"} opacity="0.85" />

                <polygon points="26.6,5.4 21,6 26,11" fill={isDiamond ? "#F1F5F9" : isEmerald ? "#34D399" : "#3B82F6"} opacity="0.8" />
                <polygon points="26.6,26.6 26,21 21,26" fill={isDiamond ? "#64748B" : isEmerald ? "#065F46" : "#1E3A8A"} opacity="0.95" />
                <polygon points="5.4,26.6 11,26 6,21" fill={isDiamond ? "#94A3B8" : isEmerald ? "#047857" : "#1E40AF"} opacity="0.85" />
                <polygon points="5.4,5.4 6,11 11,6" fill={isDiamond ? "#FFFFFF" : isEmerald ? "#86EFAC" : "#93C5FD"} opacity="0.9" />

                <polygon points="16,6 19.5,10.5 16,12.5 12.5,10.5" fill={isDiamond ? "#FFFFFF" : isEmerald ? "#86EFAC" : "#93C5FD"} opacity="0.95" />
                <polygon points="26,16 21.5,19.5 19.5,16 21.5,12.5" fill={isDiamond ? "#CBD5E1" : isEmerald ? "#10B981" : "#2563EB"} opacity="0.85" />
                <polygon points="16,26 12.5,21.5 16,19.5 19.5,21.5" fill={isDiamond ? "#64748B" : isEmerald ? "#064E3B" : "#172554"} opacity="0.95" />
                <polygon points="6,16 10.5,12.5 12.5,16 10.5,19.5" fill={isDiamond ? "#E2E8F0" : isEmerald ? "#34D399" : "#3B82F6"} opacity="0.85" />

                {/* Center Octagonal Table */}
                <polygon
                    points="12.5,10.5 19.5,10.5 22.5,13.5 22.5,18.5 19.5,21.5 12.5,21.5 9.5,18.5 9.5,13.5"
                    fill={isDiamond ? `url(#dia-hi-${type})` : isEmerald ? `url(#emr-hi-${type})` : `url(#sap-hi-${type})`}
                    stroke={isDiamond ? "#475569" : isEmerald ? "#064E3B" : "#172554"}
                    strokeWidth="0.5"
                />

                {/* Highlight Flare */}
                <circle cx="13" cy="12" r="1.3" fill="#FFFFFF" opacity={isDiamond ? "1" : "0.85"} />
            </svg>
        </button>
    );
}

const finishBarsData = [
    {
        name: 'Yellow Gold',
        code: 'YG',
        style: {
            background: 'linear-gradient(180deg, #8B6508 0%, #C99700 15%, #E5B824 35%, #FBE580 50%, #C99700 80%, #7D5A02 100%)',
        }
    },
    {
        name: 'White Gold',
        code: 'WG',
        label: 'WHITE',
        style: {
            background: 'linear-gradient(180deg, #55585B 0%, #8A8E93 15%, #C2C6CC 35%, #F0F2F5 50%, #8A8E93 80%, #484A4D 100%)',
        }
    },
    {
        name: 'Rose Gold',
        code: 'RG',
        style: {
            background: 'linear-gradient(180deg, #874112 0%, #BA6222 15%, #DB7F3E 35%, #F5B37B 50%, #BA6222 80%, #75360B 100%)',
        }
    },
    {
        name: 'Black Ruthenium',
        code: 'BLK',
        style: {
            background: 'linear-gradient(180deg, #111315 0%, #2A2E33 15%, #4C525A 35%, #828A94 50%, #2A2E33 80%, #111315 100%)',
        }
    }
];

export default function DynamicCollectionPage({ params }) {
    const router = useRouter();
    const { addToCart, cartCount } = useCart();
    const { user, loading: authLoading } = useAuth();

    const resolvedParams = use(params);
    const rawParam = resolvedParams?.id || '';
    const paramId = rawParam.toLowerCase().trim();
    const paramNorm = paramId.replace(/s$/, '');


    // Dynamic collection state matched from live database
    const [liveCollection, setLiveCollection] = useState(null);
    const staticCategory = categoryDataMap[paramId] || categoryDataMap[paramId + 's'] || categoryDataMap[paramNorm] || null;
    const categoryInfo = liveCollection || staticCategory;

    // Atelier specific interactive states matching exact visual specifications
    const [selectedFinishCode, setSelectedFinishCode] = useState('WG');
    const [selectedSize, setSelectedSize] = useState('12');
    const [selectedChain, setSelectedChain] = useState('Box');
    const [selectedGem, setSelectedGem] = useState('diamond');
    const [selectedPurity, setSelectedPurity] = useState('22KT');

    // Dynamic Customization States (Linked to Backend Masters & Product Options)
    const [customizationMasters, setCustomizationMasters] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});

    // Live Pricing & Rates States
    const [rates, setRates] = useState(null);
    const [productDetail, setProductDetail] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isCatLoaded, setIsCatLoaded] = useState(false);
    const [priceBreakdown, setPriceBreakdown] = useState(null);
    const [showBreakdownModal, setShowBreakdownModal] = useState(false);
    const [hasCustomized, setHasCustomized] = useState(false);

    // Main preview image & thumbnails
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [mediaViewMode, setMediaViewMode] = useState('photo'); // 'photo' | '3d'

    // Dynamic masters loader with localStorage cache fallback
    useEffect(() => {
        try {
            const cached = typeof window !== 'undefined' ? localStorage.getItem('pintaara_masters_cache') : null;
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setCustomizationMasters(parsed);
                }
            }
        } catch (e) { }

        const fetchMastersAndLiveProduct = async () => {
            setHasCustomized(false);
            setPriceBreakdown(null);
            try {
                const res = await apiFetch('/masters');
                if (res && res.status === 'success' && Array.isArray(res.data)) {
                    setCustomizationMasters(res.data);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('pintaara_masters_cache', JSON.stringify(res.data));
                    }
                }
            } catch (err) { }

            try {
                const resRates = await api.getTodayGoldRate();
                if (resRates && (resRates.status === 'success' || resRates.base_22kt_rate_per_10g)) {
                    const rate22 = parseFloat(resRates.base_22kt_rate_per_10g || 100000);
                    setRates({
                        gold_22kt_per_10g: rate22,
                        gold_24kt_per_g: parseFloat(resRates.pure_24kt_rate_per_gram || (rate22 / 10 / 0.916)),
                        silver_per_10g: parseFloat(resRates.silver_base_per_10g || 950),
                    });
                }
            } catch (err) { }

            // Check if paramId matches a live collection in the database
            let matchedCol = null;
            try {
                const resCols = await api.getCollections();
                if (resCols && resCols.status === 'success' && Array.isArray(resCols.data)) {
                    const found = resCols.data.find(c => {
                        const s = (c.slug || c.name || '').toLowerCase().trim();
                        const sNorm = s.replace(/s$/, '');
                        return s === paramId || sNorm === paramNorm || s === paramId + 's';
                    });
                    if (found) {
                        matchedCol = {
                            id: found.id,
                            slug: found.slug,
                            name: (found.name || paramId).toUpperCase(),
                            watermark: 'PINTAARA ATELIER',
                            products: []
                        };
                        setLiveCollection(matchedCol);
                    }
                }
            } catch (e) { }

            const activeCategory = matchedCol || staticCategory;

            if (activeCategory) {
                try {
                    // Query products specifically for this collection slug
                    const resCat = await api.getProducts(`?collection=${encodeURIComponent(activeCategory.slug || paramId)}`);
                    if (resCat && resCat.status === 'success' && Array.isArray(resCat.data)) {
                        const matching = resCat.data.filter(p => {
                            const cSlug = (p.collection?.slug || p.collection?.name || '').toLowerCase().trim().replace(/s$/, '');
                            const targetSlug = (activeCategory.slug || paramId).toLowerCase().trim().replace(/s$/, '');
                            return cSlug === targetSlug || (activeCategory.id && p.collection_master_id == activeCategory.id);
                        });

                        const mappedMatching = matching.map(p => {
                            let imgUrl = typeof p.primary_image === 'object' && p.primary_image ? p.primary_image.url : p.primary_image;
                            if (!imgUrl && Array.isArray(p.images) && p.images.length > 0) {
                                imgUrl = typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url;
                            }
                            imgUrl = resolveProductImage(p, imgUrl);

                            return {
                                id: p.design_code || p.id,
                                code: p.design_code || String(p.id),
                                name: p.name,
                                collection: p.collection?.name || activeCategory.name,
                                defaultWeight: p.base_weight_grams || 8.5,
                                makingCharge: p.making_charge || 0,
                                image: imgUrl,
                                livePrice: p.live_price?.total_price || null,
                                filterStyle: 'none'
                            };
                        });

                        setCategoryProducts(mappedMatching);
                    } else {
                        setCategoryProducts([]);
                    }
                } catch (e) {
                    setCategoryProducts([]);
                } finally {
                    setIsCatLoaded(true);
                }
            } else {
                // Not a category - lookup individual product by design code/slug
                try {
                    const resProduct = await api.getProductBySlug(paramId);
                    if (resProduct && (resProduct.status === 'success' || resProduct.data)) {
                        const prod = resProduct.data || resProduct;
                        if (prod && (prod.id || prod.design_code)) {
                            setProductDetail(prod);

                            const collectionSlug = prod.collection?.slug || prod.collection?.name;
                            if (collectionSlug) {
                                try {
                                    const resRelated = await api.getProducts(`?collection=${encodeURIComponent(collectionSlug)}`);
                                    if (resRelated?.status === 'success' && Array.isArray(resRelated.data)) {
                                        const currentCode = String(prod.design_code || prod.code || prod.id).toUpperCase();
                                        const mapRelatedProduct = (item) => {
                                                let imageUrl = typeof item.primary_image === 'object' && item.primary_image
                                                    ? item.primary_image.url
                                                    : item.primary_image;
                                                if (!imageUrl && Array.isArray(item.images) && item.images.length > 0) {
                                                    imageUrl = typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url;
                                                }

                                                return {
                                                    id: item.design_code || item.id,
                                                    code: item.design_code || String(item.id),
                                                    name: item.name,
                                                    collection: item.collection?.name || prod.collection?.name || 'ATELIER PIECE',
                                                    image: resolveProductImage(item, imageUrl),
                                                    livePrice: item.live_price?.total_price || item.base_pricing?.total_price || null,
                                                };
                                        };

                                        const sameCollection = resRelated.data
                                            .filter((item) => String(item.design_code || item.code || item.id).toUpperCase() !== currentCode)
                                            .map(mapRelatedProduct);
                                        let related = sameCollection.slice(0, 4);

                                        if (related.length < 4) {
                                            const resAllProducts = await api.getProducts();
                                            const sameCodes = new Set(related.map((item) => item.code.toUpperCase()));
                                            const fallbackProducts = resAllProducts?.status === 'success' && Array.isArray(resAllProducts.data)
                                                ? resAllProducts.data
                                                    .filter((item) => {
                                                        const code = String(item.design_code || item.code || item.id).toUpperCase();
                                                        return code !== currentCode && !sameCodes.has(code);
                                                    })
                                                    .map(mapRelatedProduct)
                                                : [];
                                            related = [...related, ...fallbackProducts].slice(0, 4);
                                        }

                                        setRelatedProducts(related);
                                    }
                                } catch (err) {
                                    console.error('Failed to load related products:', err);
                                    setRelatedProducts([]);
                                }
                            }
                        } else {
                            setProductDetail(null);
                        }
                    } else {
                        setProductDetail(null);
                    }
                } catch (err) {
                    setProductDetail(null);
                } finally {
                    setIsCatLoaded(true);
                }
            }
        };
        fetchMastersAndLiveProduct();
    }, [paramId, paramNorm]);


    // Compute Active Dynamic Option Groups from Product or Global Masters
    const activeOptionGroups = useMemo(() => {
        // If product has specific options configured in Admin, use them!
        if (productDetail?.options && Array.isArray(productDetail.options) && productDetail.options.length > 0) {
            return productDetail.options.map((opt, oIdx) => {
                const optName = opt.name || `Option ${oIdx + 1}`;
                const lower = optName.toLowerCase();
                let inputType = opt.input_type;
                if (!inputType) {
                    if (lower.includes('finish') || lower.includes('gem') || lower.includes('stone') || lower.includes('color')) {
                        inputType = 'swatch_image';
                    } else if (lower.includes('chain') || lower.includes('size')) {
                        inputType = 'dropdown';
                    } else {
                        inputType = 'text_button';
                    }
                }

                const rawValues = Array.isArray(opt.values) ? opt.values : [];
                const parsedValues = rawValues.map((v, vIdx) => {
                    if (typeof v === 'object' && v !== null) {
                        return {
                            id: v.id || `${optName}_${vIdx}`,
                            value: v.value || '',
                            code: v.code || '',
                            image: v.image || '',
                            hex_color: v.hex_color || null,
                            price_delta: parseFloat(v.price_delta) || 0,
                        };
                    }
                    return {
                        id: `${optName}_${vIdx}`,
                        value: String(v),
                        code: String(v),
                        image: '',
                        hex_color: null,
                        price_delta: 0,
                    };
                });

                return {
                    id: opt.id || optName,
                    name: optName,
                    code: opt.code || optName.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
                    input_type: inputType,
                    values: parsedValues,
                };
            });
        }

        // If no product-level overrides, use the global customization masters!
        if (customizationMasters && customizationMasters.length > 0) {
            return customizationMasters
                .filter((m) => m.is_active !== false)
                .map((m) => ({
                    id: m.id,
                    name: m.name,
                    code: m.code,
                    input_type: m.input_type || 'text_button',
                    values: (m.values || []).filter((v) => v.is_active !== false).map((v) => ({
                        id: v.id,
                        value: v.value,
                        code: v.code || '',
                        image: v.image || '',
                        hex_color: v.hex_color || null,
                        price_delta: parseFloat(v.price_delta) || 0,
                    })),
                }));
        }

        // Fallback default presets if offline matching exact atelier specifications
        return [
            {
                name: 'METAL PURITY (KT)',
                code: 'PURITY',
                input_type: 'text_button',
                values: [
                    { value: '22KT', code: '22K', price_delta: 12000 },
                    { value: '18KT', code: '18K', price_delta: 0 },
                    { value: '14KT', code: '14K', price_delta: -10000 },
                    { value: '925 SILVER', code: '925', price_delta: -45000 },
                ],
            },
            {
                name: 'FINISH OPTION',
                code: 'FINISH',
                input_type: 'swatch_image',
                values: [
                    { value: 'Yellow Gold', code: 'YG', hex_color: '#E6C875', price_delta: 0 },
                    { value: 'White Gold', code: 'WG', hex_color: '#E0E0E0', price_delta: 0 },
                    { value: 'Rose Gold', code: 'RG', hex_color: '#E8A88A', price_delta: 0 },
                    { value: 'Black Ruthenium', code: 'BLK', hex_color: '#2A2A2A', price_delta: 0 },
                ],
            },
            {
                name: 'SIZE',
                code: 'SIZE',
                input_type: 'dropdown',
                values: ['10', '11', '12', '13', '14', '15', '16'].map((s) => ({ value: s, code: s, price_delta: 0 })),
            },
            {
                name: 'CHAIN',
                code: 'CHAIN',
                input_type: 'dropdown',
                values: [
                    { value: 'Box', code: 'BOX', price_delta: 0 },
                    { value: 'Cable', code: 'CAB', price_delta: -2000 },
                    { value: 'Rope', code: 'ROP', price_delta: 3000 },
                    { value: 'Wheat', code: 'WHT', price_delta: 2500 },
                    { value: 'None', code: 'NONE', price_delta: -8000 },
                ],
            },
            {
                name: 'GEM / STONE OPTIONS',
                code: 'GEM',
                input_type: 'swatch_image',
                values: [
                    { value: 'Natural Diamond', code: 'DIA', image: '/images/gems/diamond.png', price_delta: 0 },
                    { value: 'Zambian Emerald', code: 'EMR', image: '/images/gems/emerald.png', price_delta: 2000 },
                    { value: 'Ceylon Blue Sapphire', code: 'SAP', image: '/images/gems/sapphire.png', price_delta: 3500 },
                    { value: 'Burmese Ruby', code: 'RUB', image: '/images/gems/ruby.png', price_delta: 4000 },
                    { value: 'No Stone / Solid Gold', code: 'NONE', image: '', price_delta: 0 },
                ],
            },
        ];
    }, [productDetail, customizationMasters]);

    // Synchronize default selections when option groups change
    useEffect(() => {
        if (activeOptionGroups && activeOptionGroups.length > 0) {
            setSelectedOptions((prev) => {
                const next = { ...prev };
                activeOptionGroups.forEach((group) => {
                    const gName = group.name;
                    const currentSelected = next[gName];
                    const exists = currentSelected && group.values.some((v) => v.value === currentSelected.value);
                    if (!exists && group.values.length > 0) {
                        if (gName.includes('PURITY')) {
                            const val = group.values.find((v) => v.value.includes('22K')) || group.values[0];
                            next[gName] = val;
                            setSelectedPurity(val.value.includes('22K') ? '22KT' : val.value);
                        } else if (gName.includes('FINISH')) {
                            const val = group.values.find((v) => v.value.toLowerCase().includes('white')) || group.values[1] || group.values[0];
                            next[gName] = val;
                            setSelectedFinishCode('WG');
                        } else if (gName.includes('SIZE')) {
                            const val = group.values.find((v) => v.value === '12') || group.values[0];
                            next[gName] = val;
                            setSelectedSize(val.value);
                        } else if (gName.includes('CHAIN')) {
                            const val = group.values.find((v) => v.value.toLowerCase().includes('box')) || group.values[0];
                            next[gName] = val;
                            setSelectedChain(val.value.includes('Box') ? 'Box' : val.value);
                        } else if (gName.includes('GEM') || gName.includes('STONE')) {
                            const val = group.values.find((v) => {
                                const value = v.value.toLowerCase();
                                return value.includes('no stone') || value.includes('solid gold') || value === 'none';
                            }) || group.values[0];
                            next[gName] = val;
                            setSelectedGem(val.value.toLowerCase().includes('emerald') ? 'emerald' : val.value.toLowerCase().includes('sapphire') ? 'sapphire' : val.value.toLowerCase().includes('ruby') ? 'ruby' : 'none');
                        } else {
                            next[gName] = group.values[0];
                        }
                    }
                });
                return next;
            });
        }
    }, [activeOptionGroups]);

    const handleSelectOption = (groupName, valueObj) => {
        setHasCustomized(true);
        setSelectedOptions((prev) => ({
            ...prev,
            [groupName]: valueObj,
        }));
    };

    // 2. Use the backend pricing contract so listing and detail MRP stay identical.
    useEffect(() => {
        if (categoryInfo || !productDetail) return;

        if (!hasCustomized && productDetail.base_pricing) {
            const base = productDetail.base_pricing;
            setPriceBreakdown({
                ...base,
                gst: Number(base.gst_amount || 0),
                total: Number(base.total_price || 0),
                option_breakdowns: [],
                rate_used: {
                    purity: '22KT',
                    rate_per_gram: base.rate_per_gram,
                    rate_per_10g: Number(base.rate_per_gram || 0) * 10,
                    rate_date: rates?.effective_date || new Date().toISOString().split('T')[0],
                },
            });
            return;
        }

        const purityEntry = Object.entries(selectedOptions).find(([k]) =>
            k.toLowerCase().includes('purity') || k.toLowerCase().includes('metal') || k.toLowerCase().includes('karat')
        );
        const purityStr = purityEntry?.[1]?.value || '22KT';
        const gemEntry = Object.entries(selectedOptions).find(([k]) =>
            k.toLowerCase().includes('gem') || k.toLowerCase().includes('stone')
        );
        const gemName = gemEntry?.[1]?.value || '';
        const optionBreakdowns = [];
        let optionDelta = 0;
        Object.entries(selectedOptions).forEach(([optName, valObj]) => {
            const lowerName = optName.toLowerCase();
            const delta = Number(valObj?.price_delta) || 0;
            if (delta && !lowerName.includes('purity') && !lowerName.includes('metal') &&
                !lowerName.includes('finish') && !lowerName.includes('size') &&
                !lowerName.includes('gem') && !lowerName.includes('stone')) {
                optionDelta += delta;
                optionBreakdowns.push({ name: optName, value: valObj.value, charge: delta });
            }
        });

        let cancelled = false;
        const calculate = async () => {
            try {
                const response = await apiFetch('/price/calculate', {
                    method: 'POST',
                    body: JSON.stringify({
                        weight_grams: Number(productDetail.base_weight_grams) || 8.5,
                        purity: purityStr,
                        making_charge_flat: Number(productDetail.making_charge) || 0,
                        making_charge_percent: productDetail.making_charge_percent,
                        wastage_percent: Number(productDetail.wastage_percent) || 0,
                        gem: gemName,
                    }),
                });
                const data = response?.data;
                if (!data || cancelled) return;
                setPriceBreakdown({
                    ...data,
                    subtotal: Number(data.subtotal || 0) + optionDelta,
                    gst: Number(data.gst_amount || 0),
                    total: Number(data.total_price || 0) + optionDelta,
                    option_breakdowns: optionBreakdowns,
                    rate_used: {
                        purity: purityStr,
                        rate_per_gram: data.rate_per_gram,
                        rate_per_10g: Number(data.rate_per_gram || 0) * 10,
                        rate_date: rates?.effective_date || new Date().toISOString().split('T')[0],
                    },
                });
            } catch (error) {
                if (!cancelled) console.error('Unable to calculate product price:', error);
            }
        };
        calculate();
        return () => { cancelled = true; };
    }, [selectedOptions, rates, productDetail, categoryInfo, hasCustomized]);

    // Product Images & Thumbnails matching real product media
    const thumbnails = useMemo(() => {
        if (!productDetail) return [];

        const rawList = Array.isArray(productDetail.images) && productDetail.images.length > 0
            ? productDetail.images
            : (productDetail.primary_image ? [productDetail.primary_image] : []);

        const validImages = rawList
            .map((img) => (typeof img === 'string' ? img : img?.url))
            .filter((url) => typeof url === 'string' && url.trim().length > 0);

        if (validImages.length > 0) {
            return validImages.map((imgSrc, idx) => ({
                id: `real-thumb-${idx}`,
                src: resolveProductImage(productDetail, imgSrc),
                alt: `${productDetail.name || 'Jewelry Piece'} view ${idx + 1}`,
                filter: 'none',
                bgColor: '#F5F5F3'
            }));
        }

        const fallbackImg = (typeof productDetail.primary_image === 'string' && productDetail.primary_image)
            ? resolveProductImage(productDetail, productDetail.primary_image)
            : '/images/products/ring.png';
        return [
            { id: 't1', src: fallbackImg, alt: productDetail?.name || 'Jewelry Piece', filter: 'none', bgColor: '#CFD9E0' },
            { id: 't2', src: fallbackImg, alt: 'White Gold Finish', filter: 'hue-rotate(280deg) saturate(0.2)', bgColor: '#E6E6E6' },
            { id: 't3', src: fallbackImg, alt: 'Rose Gold Finish', filter: 'hue-rotate(330deg) saturate(1.2)', bgColor: '#D4BEDF' },
        ];
    }, [productDetail]);

    const handleNavigate = (index) => {
        const slideIds = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7'];
        if (slideIds[index]) {
            router.push(`/#${slideIds[index]}`);
        }
    };

    const handleAddToBag = () => {
        const purityEntry = Object.entries(selectedOptions).find(([k]) =>
            k.toLowerCase().includes('purity') || k.toLowerCase().includes('metal') || k.toLowerCase().includes('karat')
        );
        const finishEntry = Object.entries(selectedOptions).find(([k]) =>
            k.toLowerCase().includes('finish')
        );
        const gemEntry = Object.entries(selectedOptions).find(([k]) =>
            k.toLowerCase().includes('gem') || k.toLowerCase().includes('stone')
        );
        const sizeEntry = Object.entries(selectedOptions).find(([k]) =>
            k.toLowerCase().includes('size')
        );
        const chainEntry = Object.entries(selectedOptions).find(([k]) =>
            k.toLowerCase().includes('chain')
        );

        const item = {
            id: productDetail?.design_code || productDetail?.id || resolvedParams?.id,
            code: productDetail?.design_code || String(productDetail?.id || resolvedParams?.id),
            name: productDetail?.name || 'Pintaara Bespoke Piece',
            metal: purityEntry ? purityEntry[1]?.value : '22KT',
            finish: finishEntry ? finishEntry[1]?.value : 'Yellow Gold',
            gem: gemEntry ? gemEntry[1]?.value : 'Natural Diamond',
            size: sizeEntry ? sizeEntry[1]?.value : 'Standard',
            chain: chainEntry ? chainEntry[1]?.value : 'None',
            customizations: Object.entries(selectedOptions).map(([k, v]) => ({
                option: k,
                value: v.value,
                price_delta: v.price_delta || 0,
            })),
            price: priceBreakdown?.total || 90640,
            weight_used: priceBreakdown?.weight_grams || 8.5,
            price_breakdown: priceBreakdown,
            qty: 1,
            image: thumbnails[activeImgIndex]?.src || thumbnails[0]?.src || '/images/products/pendant.png',
        };
        addToCart(item);
        router.push('/bag');
    };


    // ============================================================
    // 1. RENDER CATEGORY SUBPAGE VIEW (e.g. /collection/pendants)
    // ============================================================
    if (categoryInfo) {
        return (
            <div className="collection-page-root">
                <Header headerStyle="dark" onNavigate={handleNavigate} />

                <div className="collection-main-container">


                    <div className="category-subpage-header">
                        <div className="subtitle-underline-wrapper">
                            <span className="collection-subtitle">{categoryInfo.name}</span>

                        </div>

                    </div>

                    {/* 4-Column Product Grid for this Category */}
                    <div className="collection-grid-4col">
                        {!isCatLoaded ? (
                            // Elegant Luxury Shimmer Skeleton Effect while loading
                            Array.from({ length: 4 }).map((_, sIdx) => (
                                <div key={`shimmer-${sIdx}`} className="category-product-card" style={{ pointerEvents: 'none' }}>
                                    <div className="card-media-frame pintaara-shimmer shimmer-card-media" />
                                    <div className="category-product-info" style={{ marginTop: '0.35rem' }}>
                                        <div className="pintaara-shimmer shimmer-line collection-tag" />
                                        <div className="pintaara-shimmer shimmer-line title" />
                                        <div className="pintaara-shimmer shimmer-line price" />
                                    </div>
                                </div>
                            ))
                        ) : categoryProducts.length > 0 ? (
                            categoryProducts.map((item) => {
                                // Calculate live price for each item in grid
                                const rate22kt_g = (rates?.gold_22kt_per_10g || 100000) / 10;
                                const metalVal = rate22kt_g * item.defaultWeight;
                                const sub = metalVal + Number(item.makingCharge || 0);
                                const calculatedTotal = Math.round(sub * 1.03);
                                const total = item.livePrice || calculatedTotal;

                                return (
                                    <Link
                                        href={`/collection/${item.code}`}
                                        key={item.id}
                                        className="category-product-card"
                                    >
                                        <div className="card-media-frame">
                                            <img
                                                src={item.image}
                                                alt={item.code}
                                                className="card-media-img"
                                                style={{ filter: item.filterStyle }}
                                            />
                                        </div>
                                        <div className="category-product-info">
                                            <span className="cat-prod-collection">{item.collection} ({item.defaultWeight}g)</span>
                                            <h3 className="cat-prod-code">{item.name ? `${item.name} (${item.code})` : item.code}</h3>
                                            <span className="cat-prod-price">₹ {total.toLocaleString('en-IN')}</span>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div style={{ gridColumn: '1 / -1', padding: '4rem 1rem', textAlign: 'center', color: '#888' }}>
                                <p style={{ fontSize: '0.95rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    No products currently cataloged in this collection.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Subfooter */}
                    <div className="collection-subfooter-block">
                        <span className="subfooter-tag">PINTAARA {categoryInfo.name}</span>
                        <h3 className="subfooter-text">
                            Made to Order &nbsp;&middot;&nbsp; Hallmarked &amp; Certified &nbsp;&middot;&nbsp; Secure Delivery
                        </h3>
                    </div>
                </div>

                <footer className="collection-bottom-bar">
                    <span className="bottom-brand">PINTAARA™</span>
                    <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
                </footer>
            </div>
        );
    }

    // ============================================================
    // 2. RENDER INDIVIDUAL PRODUCT DETAIL VIEW (PDP) - EXACT ATELIER SPEC
    // ============================================================
    if (!isCatLoaded) {
        return (
            <div className="collection-page-root">
                <Header headerStyle="dark" onNavigate={handleNavigate} />
                <div style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div className="card-media-frame pintaara-shimmer shimmer-card-media" style={{ height: '440px', borderRadius: '4px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', justifyContent: 'center' }}>
                        <div className="pintaara-shimmer shimmer-line" style={{ width: '45%', height: '28px' }} />
                        <div className="pintaara-shimmer shimmer-line" style={{ width: '30%', height: '16px' }} />
                        <div className="pintaara-shimmer shimmer-line" style={{ width: '85%', height: '48px', marginTop: '1rem' }} />
                        <div className="pintaara-shimmer shimmer-line" style={{ width: '40%', height: '32px', marginTop: '1rem' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!productDetail) {
        return (
            <div className="collection-page-root">
                <Header headerStyle="dark" onNavigate={handleNavigate} />
                <div style={{ minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A7228', fontWeight: 600, marginBottom: '8px' }}>
                        Atelier Registry
                    </span>
                    <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '28px', fontWeight: 600, color: '#111', margin: '0 0 12px 0' }}>
                        Piece Not Found
                    </h1>
                    <p style={{ fontSize: '14px', color: '#666', maxWidth: '440px', lineHeight: 1.6, marginBottom: '24px' }}>
                        The requested jewelry piece or collection is not currently cataloged in the Pintaara Atelier archives.
                    </p>
                    <Link href="/collection" style={{ display: 'inline-block', padding: '12px 28px', background: '#111', color: '#FFF', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
                        Return to Collections
                    </Link>
                </div>
                <footer className="collection-bottom-bar">
                    <span className="bottom-brand">PINTAARA™</span>
                    <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
                </footer>
            </div>
        );
    }

    const displayPrice = priceBreakdown?.total
        ? Number(priceBreakdown.total).toLocaleString('en-IN')
        : (productDetail?.base_pricing?.total_price
            ? Number(productDetail.base_pricing.total_price).toLocaleString('en-IN')
            : '0');

    return (
        <div className="atelier-page-root">
            {/* Google Model Viewer for Realtime 3D Jewelry Inspection */}
            <Script
                type="module"
                src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
                strategy="afterInteractive"
            />
            {/* Top Navigation Header matching all pages */}
            <Header headerStyle="dark" onNavigate={handleNavigate} />

            {/* Main Product Stage (Two Columns) */}
            <main className="atelier-main-container">
                {/* Left Column: Product Media & Gallery */}
                <div className="atelier-media-column">
                    <div className="atelier-main-preview-box">
                        {mediaViewMode === '3d' && productDetail.model_3d_url ? (
                            <ThreeDModelViewer
                                modelUrl={productDetail.model_3d_url}
                                productName={productDetail.name || 'Jewelry Piece'}
                                finishCode={selectedFinishCode}
                            />
                        ) : (
                            <img
                                src={thumbnails[activeImgIndex]?.src || productDetail.primary_image || '/images/products/ring.png'}
                                alt={thumbnails[activeImgIndex]?.alt || productDetail.name || 'Pintaara Jewelry Piece'}
                                className="atelier-main-img"
                                style={{
                                    filter: thumbnails[activeImgIndex]?.filter || 'none',
                                    objectFit: 'cover'
                                }}
                            />
                        )}
                    </div>

                    {(thumbnails.length > 1 || productDetail.model_3d_url) && (
                        <div className="atelier-thumbnails-row">
                            {productDetail.model_3d_url && (
                                <button
                                    type="button"
                                    aria-label="Interactive 3D View"
                                    className={`atelier-thumb-card ${mediaViewMode === '3d' ? 'selected' : ''}`}
                                    style={{
                                        background: 'linear-gradient(135deg, #1C2434 0%, #0F172A 100%)',
                                        color: '#D4AF37',
                                        fontWeight: 700,
                                        fontSize: '11px',
                                        flex: '0 0 54px'
                                    }}
                                    onClick={() => setMediaViewMode('3d')}
                                >
                                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                        <span style={{ fontSize: '15px' }}>🪐</span>
                                        <span style={{ fontSize: '9px', letterSpacing: '0.05em' }}>3D</span>
                                    </span>
                                </button>
                            )}

                            {thumbnails.map((thumb, idx) => (
                                <button
                                    key={thumb.id}
                                    type="button"
                                    aria-label={`View ${thumb.alt}`}
                                    className={`atelier-thumb-card ${mediaViewMode === 'photo' && idx === activeImgIndex ? 'selected' : ''}`}
                                    style={{ backgroundColor: thumb.bgColor || '#F5F5F3' }}
                                    onClick={() => {
                                        setMediaViewMode('photo');
                                        setActiveImgIndex(idx);
                                        if (idx === 0) setSelectedFinishCode('YG');
                                        else if (idx === 1) setSelectedFinishCode('WG');
                                        else if (idx === 2) setSelectedFinishCode('RG');
                                    }}
                                >
                                    <img
                                        src={thumb.src}
                                        alt={thumb.alt}
                                        style={{
                                            filter: thumb.filter,
                                            objectFit: 'cover'
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Customizer Controls & Specifications */}
                <div className="atelier-specs-column">
                    <h1 className="atelier-product-title">
                        {productDetail?.name || productDetail?.design_code || resolvedParams?.id}
                    </h1>
                    <div className="atelier-product-subtitle">
                        {(productDetail?.collection?.name || 'ATELIER PIECE').toUpperCase()}
                    </div>
                    <div className="atelier-specs-divider" />

                    {/* METAL PURITY — full-width 4-button row */}
                    <div className="atelier-control-group">
                        <div className="atelier-spec-label">METAL PURITY (KT)</div>
                        <div className="atelier-purity-row">
                            {['22KT', '18KT', '14KT', '925 SILVER'].map((purity) => {
                                const isSelected = selectedPurity === purity;
                                const delta = purity === '22KT' ? 12000 : purity === '14KT' ? -10000 : purity === '925 SILVER' ? -45000 : 0;
                                return (
                                    <button
                                        key={purity}
                                        type="button"
                                        className={`atelier-purity-btn ${isSelected ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedPurity(purity);
                                            handleSelectOption('METAL PURITY (KT)', { value: purity, price_delta: delta });
                                        }}
                                    >
                                        {purity}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* FINISH OPTION — full-width 4-bar row */}
                    <div className="atelier-control-group">
                        <div className="atelier-spec-label">
                            FINISH OPTION
                        </div>
                        <div className="atelier-finish-row">
                            {finishBarsData.map((bar, idx) => {
                                const isSelected = selectedFinishCode === bar.code;
                                return (
                                    <button
                                        key={bar.code}
                                        type="button"
                                        aria-label={bar.name}
                                        className={`atelier-finish-bar ${isSelected ? 'active' : ''}`}
                                        style={bar.style}
                                        onClick={() => {
                                            setSelectedFinishCode(bar.code);
                                            handleSelectOption('FINISH OPTION', { value: bar.name, price_delta: 0 });
                                            if (idx === 0) setActiveImgIndex(0);
                                            else if (idx === 1) setActiveImgIndex(1);
                                            else if (idx === 2) setActiveImgIndex(2);
                                        }}
                                    >
                                        {bar.label && <span className="atelier-finish-bar-label">{bar.label}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SIZE + GEM on the same row */}
                    <div className="atelier-size-gem-row">
                        <div className="atelier-control-group" style={{ marginBottom: 0 }}>
                            <div className="atelier-spec-label">SIZE</div>
                            <div className="atelier-box-select-wrapper">
                                <select
                                    className="atelier-box-select"
                                    value={selectedSize}
                                    onChange={(e) => {
                                        setSelectedSize(e.target.value);
                                        handleSelectOption('SIZE', { value: e.target.value, price_delta: 0 });
                                    }}
                                >
                                    {['10', '11', '12', '13', '14', '15', '16'].map((sz) => (
                                        <option key={sz} value={sz}>{sz}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="atelier-control-group" style={{ marginBottom: 0 }}>
                            <div className="atelier-spec-label">GEM / STONE OPTIONS</div>
                            <div className="atelier-gems-row">
                                {(() => {
                                    const gemGroup = activeOptionGroups?.find((g) => g.name.includes('GEM') || g.code === 'GEM');
                                    const gemValues = gemGroup?.values?.length ? gemGroup.values : [
                                        { value: 'Natural Diamond', code: 'DIA', image: '/images/gems/diamond.png', price_delta: 0 },
                                        { value: 'Zambian Emerald', code: 'EMR', image: '/images/gems/emerald.png', price_delta: 2000 },
                                        { value: 'Ceylon Blue Sapphire', code: 'SAP', image: '/images/gems/sapphire.png', price_delta: 3500 },
                                    ];

                                    return gemValues.map((gem, idx) => {
                                        const valLower = (gem.value || '').toLowerCase();
                                        const codeLower = (gem.code || '').toLowerCase();
                                        const typeStr = codeLower.includes('dia') || valLower.includes('dia') ? 'diamond'
                                            : codeLower.includes('emr') || valLower.includes('eme') ? 'emerald'
                                                : codeLower.includes('sap') || valLower.includes('sap') ? 'sapphire'
                                                    : 'diamond';

                                        const currentVal = selectedOptions['GEM / STONE OPTIONS']?.value;
                                        const isSelected = currentVal ? currentVal === gem.value : selectedGem === typeStr || (idx === 0 && !selectedGem);

                                        const rawDelta = parseFloat(gem.price_delta) || 0;
                                        const delta = Math.abs(rawDelta);
                                        const gemTitle = delta > 0 ? `${gem.value} (+₹${delta.toLocaleString('en-IN')})` : gem.value;

                                        return (
                                            <FacetedGemstone
                                                key={gem.id || gem.code || gem.value || idx}
                                                type={typeStr}
                                                imageUrl={gem.image || `/images/gems/${typeStr}.png`}
                                                title={gemTitle}
                                                isSelected={isSelected}
                                                onClick={() => {
                                                    setSelectedGem(typeStr);
                                                    handleSelectOption('GEM / STONE OPTIONS', { value: gem.value, price_delta: delta, image: gem.image });
                                                }}
                                            />
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* CHAIN — below the size+gem row */}
                    <div className="atelier-control-group" style={{ marginTop: '0.9rem' }}>
                        <div className="atelier-spec-label">CHAIN</div>
                        <div className="atelier-box-select-wrapper" style={{ maxWidth: '50%' }}>
                            <select
                                className="atelier-box-select"
                                value={selectedChain}
                                onChange={(e) => {
                                    setSelectedChain(e.target.value);
                                    handleSelectOption('CHAIN', {
                                        value: e.target.value,
                                        price_delta: e.target.value === 'None' ? -8000 : e.target.value === 'Rope' ? 3000 : 0
                                    });
                                }}
                            >
                                {['Box', 'Cable', 'Rope', 'Wheat', 'None'].map((ch) => (
                                    <option key={ch} value={ch}>{ch}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* BOTTOM ACTION ROW: full-width line, then price left / buttons right */}
                    <div className="atelier-bottom-action-row">
                        <div className="atelier-btn-accent-line" />
                        <div className="atelier-bottom-inner">
                            <div className="atelier-price-block">
                                <span className="atelier-price-label">MRP · Inclusive of GST</span>
                                <div className="atelier-price-value">₹ {displayPrice}</div>
                                <button
                                    type="button"
                                    className="atelier-taxes-link"
                                    onClick={() => setShowBreakdownModal(true)}
                                >
                                    Incl. taxes &amp; charges
                                </button>
                            </div>

                            <div className="atelier-buttons-block">
                                <button
                                    type="button"
                                    className="atelier-btn-add-to-bag"
                                    onClick={handleAddToBag}
                                >
                                    ADD TO BAG
                                </button>
                                <Link
                                    href={productDetail?.design_code ? `/design-log/${productDetail.design_code}` : (productDetail?.id ? `/design-log/${productDetail.id}` : "/design-log")}
                                    className="atelier-btn-view-spec"
                                >
                                    VIEW PIECE SPECIFICATION &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {relatedProducts.length > 0 && (
                <section className="atelier-related-section" aria-labelledby="related-pieces-title">
                    <div className="atelier-related-heading">
                        <span className="atelier-related-kicker">CONTINUE EXPLORING</span>
                        <h2 id="related-pieces-title">Related Pieces</h2>
                        <p>Discover more designs from the {productDetail?.collection?.name || 'Pintaara'} collection.</p>
                    </div>

                    <div className="atelier-related-grid">
                        {relatedProducts.map((product) => (
                            <Link
                                href={`/collection/${product.code}`}
                                className="atelier-related-card"
                                key={product.id}
                            >
                                <div className="atelier-related-image-frame">
                                    <img src={product.image} alt={product.name || 'Related Pintaara jewelry'} />
                                </div>
                                <div className="atelier-related-card-info">
                                    <div>
                                        <span className="atelier-related-collection">{product.collection}</span>
                                        <h3>{product.name || product.code}</h3>
                                    </div>
                                    {product.livePrice && (
                                        <span className="atelier-related-price">
                                            MRP ₹ {Number(product.livePrice).toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Bottom Footer Bar */}
            <footer className="collection-bottom-bar light-theme">
                <Link href="/" className="bottom-brand">PINTAARA™</Link>
                <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
            </footer>

            {/* Price Transparency Breakdown Modal */}
            {showBreakdownModal && priceBreakdown && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1.5rem'
                    }}
                    onClick={() => setShowBreakdownModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #D5D0C6',
                            borderRadius: '4px',
                            width: '450px',
                            maxWidth: '100%',
                            padding: '1.75rem',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                            color: '#1A1A1A'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #EEE', paddingBottom: '0.75rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                                Price Breakdown &amp; Transparency
                            </h3>
                            <button
                                onClick={() => setShowBreakdownModal(false)}
                                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                <span>Metal Weight &amp; Purity:</span>
                                <strong style={{ color: '#1A1A1A' }}>{priceBreakdown.weight_grams}g ({selectedPurity})</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                <span>Live Metal Value (@ ₹{priceBreakdown.rate_used?.rate_per_gram}/g):</span>
                                <strong style={{ color: '#1A1A1A' }}>₹{Number(priceBreakdown.metal_value).toLocaleString('en-IN')}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                <span>Making Charges:</span>
                                <strong style={{ color: '#1A1A1A' }}>₹{Number(priceBreakdown.making_charge).toLocaleString('en-IN')}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                <span>Gemstone Option ({selectedOptions['GEM / STONE OPTIONS']?.value || selectedOptions['GEM']?.value || (selectedGem === 'diamond' ? 'Natural Diamond' : selectedGem === 'emerald' ? 'Zambian Emerald' : 'Ceylon Blue Sapphire')}):</span>
                                <strong style={{ color: '#1A1A1A' }}>
                                    {(() => {
                                        const gemDelta = selectedOptions['GEM / STONE OPTIONS']?.price_delta ?? selectedOptions['GEM']?.price_delta ?? (selectedGem === 'emerald' ? 2000 : selectedGem === 'sapphire' ? 3500 : 0);
                                        const numDelta = Math.abs(parseFloat(gemDelta) || 0);
                                        if (numDelta > 0) return `+₹${numDelta.toLocaleString('en-IN')}`;
                                        return 'Included';
                                    })()}
                                </strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                <span>Chain Selection ({selectedOptions['CHAIN']?.value || selectedOptions['CHAIN TYPE']?.value || selectedChain}):</span>
                                <strong style={{ color: '#1A1A1A' }}>
                                    {(() => {
                                        const chainDelta = selectedOptions['CHAIN']?.price_delta ?? selectedOptions['CHAIN TYPE']?.price_delta ?? (selectedChain === 'None' ? -8000 : selectedChain === 'Rope' ? 3000 : 0);
                                        const numDelta = parseFloat(chainDelta) || 0;
                                        if (numDelta > 0) return `+₹${numDelta.toLocaleString('en-IN')}`;
                                        if (numDelta < 0) return `-₹${Math.abs(numDelta).toLocaleString('en-IN')}`;
                                        return 'Included';
                                    })()}
                                </strong>
                            </div>

                            <div style={{ borderTop: '1px solid #EEE', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                <span>Subtotal:</span>
                                <strong style={{ color: '#1A1A1A' }}>₹{Number(priceBreakdown.subtotal).toLocaleString('en-IN')}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                <span>GST (3%):</span>
                                <strong style={{ color: '#1A1A1A' }}>₹{Number(priceBreakdown.gst).toLocaleString('en-IN')}</strong>
                            </div>

                            <div style={{
                                marginTop: '0.75rem',
                                padding: '0.85rem',
                                borderRadius: '3px',
                                backgroundColor: '#F8F6F0',
                                border: '1px solid #D5D0C6',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontWeight: '700', color: '#1A1A1A' }}>Final Transparent Total:</span>
                                <span style={{ fontWeight: '800', color: '#1A1A1A', fontSize: '1.25rem' }}>
                                    ₹{Number(priceBreakdown.total).toLocaleString('en-IN')}
                                </span>
                            </div>

                            <div style={{ fontSize: '0.72rem', color: '#777', marginTop: '0.5rem', textAlign: 'center' }}>
                                Live Spot Rate certified Gujarat Jeweler Association daily bulletin ({priceBreakdown.rate_used?.rate_date}).
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Embedded Luxury Atelier Styles — pixel-matched to reference image */}
            <style jsx global>{`
                .atelier-page-root {
                    width: 100%;
                    min-height: 100vh;
                    background-color: #F6F4EE !important;
                    color: #1A1A1A;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                }

                /* ── HEADER ── */
                .atelier-header {
                    width: 100%;
                    padding: 1.25rem 40px 1rem;
                    background-color: #F6F4EE;
                }
                .atelier-header-inner {
                    max-width: 1360px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .atelier-brand-logo {
                    font-family: var(--font-brand), "Cinzel", "Playfair Display", Georgia, serif;
                    font-size: 1.05rem;
                    letter-spacing: 0.32em;
                    color: #1A1A1A;
                    text-decoration: none;
                    font-weight: 500;
                    white-space: nowrap;
                }
                .atelier-nav-links {
                    display: flex;
                    align-items: center;
                    gap: 2.5rem;
                }
                .atelier-nav-item {
                    font-size: 0.73rem;
                    font-weight: 500;
                    letter-spacing: 0.14em;
                    color: #444444;
                    text-decoration: none;
                    position: relative;
                    padding-bottom: 3px;
                    transition: color 0.2s ease;
                    white-space: nowrap;
                }
                .atelier-nav-item.active {
                    border-bottom: 1.5px solid #1A1A1A;
                    color: #1A1A1A;
                    font-weight: 600;
                }
                .atelier-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.1rem;
                }
                .atelier-icon-btn {
                    color: #1A1A1A;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    position: relative;
                }
                .atelier-cart-badge {
                    position: absolute;
                    top: -4px;
                    right: -6px;
                    background: #1A1A1A;
                    color: #FFF;
                    font-size: 0.62rem;
                    font-weight: 700;
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* ── DIVIDER ── */
                .atelier-divider-line {
                    max-width: 1360px;
                    width: calc(100% - 80px);
                    margin: 0 auto;
                    height: 1px;
                    background-color: #D5D0C6;
                }

                /* ── MAIN TWO-COLUMN LAYOUT ── */
                .atelier-main-container {
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                    padding: calc(var(--header-height) + clamp(2.5rem, 5vw, 4.5rem)) 40px 4rem;
                    display: grid;
                    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1fr);
                    gap: clamp(3rem, 6vw, 5.5rem);
                    align-items: start;
                    flex: 1;
                }

                /* ── MEDIA COLUMN ── */
                .atelier-media-column {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                    width: 100%;
                }
                .atelier-media-mode-switcher {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 2px;
                }
                .atelier-mode-pill {
                    padding: 5px 14px;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    border: 1px solid #D5D0C6;
                    background: #FFFFFF;
                    color: #4A4A4A;
                    cursor: pointer;
                    border-radius: 9999px;
                    transition: all 0.15s ease;
                }
                .atelier-mode-pill:hover {
                    border-color: #111;
                    color: #111;
                }
                .atelier-mode-pill.active {
                    background: #111111;
                    color: #FFFFFF;
                    border-color: #111111;
                }
                .atelier-main-preview-box {
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    background: linear-gradient(135deg, #CFD9E0 0%, #DCE5EA 40%, #EAEEF0 75%, #F0F2F0 100%);
                    border: 1px solid rgba(44, 40, 37, 0.1);
                    box-shadow: 0 18px 45px rgba(44, 40, 37, 0.11);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    position: relative;
                    border-radius: 3px;
                }
                .atelier-main-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.2s ease;
                }
                .atelier-thumbnails-row {
                    display: flex;
                    gap: 0.5rem;
                    width: 100%;
                    overflow-x: auto;
                    padding-bottom: 4px;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .atelier-thumbnails-row::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                }
                .atelier-thumb-card {
                    flex: 0 0 54px;
                    width: 54px;
                    height: 54px;
                    border: 1px solid #D5D0C6;
                    border-radius: 2px;
                    cursor: pointer;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    background: #FFFFFF;
                    transition: all 0.15s ease;
                }
                .atelier-thumb-card.selected {
                    border: 1.5px solid #1A1A1A;
                }
                .atelier-thumb-card img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* ── SPECS / CUSTOMIZER COLUMN ── */
                .atelier-specs-column {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    padding-top: 0.1rem;
                }

                /* Product Title — matches reference: large serif-weight heading */
                .atelier-product-title {
                    font-size: clamp(2rem, 3vw, 2.8rem);
                    font-weight: 400;
                    letter-spacing: -0.015em;
                    color: #1A1A1A;
                    margin: 0 0 0.1rem 0;
                    line-height: 1.2;
                    font-family: var(--font-serif), Georgia, serif;
                }

                /* ORIGIN subtitle */
                .atelier-product-subtitle {
                    font-size: 0.68rem;
                    font-weight: 500;
                    letter-spacing: 0.18em;
                    color: #888888;
                    text-transform: uppercase;
                    margin-bottom: 0.6rem;
                }

                /* Full-width divider under subtitle */
                .atelier-specs-divider {
                    width: 100%;
                    height: 1px;
                    background-color: rgba(26, 26, 26, 0.25);
                    margin-bottom: 1.35rem;
                }

                /* Each control section */
                .atelier-control-group {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 1.15rem;
                }

                /* Section label — METAL PURITY (KT), FINISH OPTION, etc. */
                .atelier-spec-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    color: #1A1A1A;
                    text-transform: uppercase;
                    margin-bottom: 0.4rem;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                /* Finish colour swatches next to label */
                .atelier-finish-indicator {
                    display: inline-flex;
                    gap: 2px;
                    margin-left: 4px;
                }
                .atelier-finish-indicator span {
                    width: 4px;
                    height: 9px;
                    border-radius: 1px;
                }

                /* PURITY: 4 buttons in one row */
                .atelier-purity-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.5rem;
                }
                .atelier-purity-btn {
                    height: 32px;
                    background: #F6F4EE;
                    border: 1px solid #B0ADA6;
                    border-radius: 1px;
                    font-size: 0.72rem;
                    font-weight: 500;
                    letter-spacing: 0.03em;
                    color: #444444;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    white-space: nowrap;
                }
                .atelier-purity-btn.active {
                    border: 1.5px solid #1A1A1A;
                    color: #1A1A1A;
                    font-weight: 700;
                }

                /* FINISH: 4 bars in one row */
                .atelier-finish-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.5rem;
                }
                .atelier-finish-bar {
                    height: 30px;
                    border-radius: 1px;
                    border: 1px solid rgba(0,0,0,0.12);
                    cursor: pointer;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.12);
                    transition: all 0.15s ease;
                }
                .atelier-finish-bar.active {
                    border: 1.5px solid #1A1A1A;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
                }
                .atelier-finish-bar-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    color: #4A4A4A;
                }

                /* SIZE + GEM: two equal columns side by side */
                .atelier-size-gem-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 0;
                }

                /* Select (Size / Chain) */
                .atelier-box-select-wrapper {
                    width: 100%;
                }
                .atelier-box-select {
                    width: 100%;
                    height: 32px;
                    background-color: #F6F4EE;
                    border: 1px solid #B0ADA6;
                    border-radius: 1px;
                    font-size: 0.78rem;
                    color: #1A1A1A;
                    padding: 0 0.5rem;
                    text-align: center;
                    text-align-last: center;
                    font-weight: 500;
                    cursor: pointer;
                    outline: none;
                    -webkit-appearance: none;
                    appearance: none;
                }

                /* Gems row */
                .atelier-gems-row {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    height: 32px;
                }
                .atelier-gem-btn {
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    padding: 0;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.15s ease;
                }
                .atelier-gem-btn:hover { transform: scale(1.1); }
                .atelier-gem-btn.active {
                    transform: scale(1.15);
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                }
                .atelier-gem-btn img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    border-radius: 50%;
                    display: block;
                }

                /* ── BOTTOM ACTION ROW ── */
                .atelier-bottom-action-row {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    margin-top: 1.5rem;
                    padding-top: 0.1rem;
                }
                .atelier-btn-accent-line {
                    width: 100%;
                    height: 1px;
                    background-color: #1A1A1A;
                    margin-bottom: 0.85rem;
                }
                .atelier-bottom-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                }
                .atelier-price-block {
                    display: flex;
                    flex-direction: column;
                }
                .atelier-price-value {
                    font-size: 1.9rem;
                    font-weight: 400;
                    color: #1A1A1A;
                    letter-spacing: 0.01em;
                    line-height: 1.1;
                }
                .atelier-taxes-link {
                    background: none;
                    border: none;
                    padding: 0;
                    font-size: 0.7rem;
                    color: #888888;
                    margin-top: 0.25rem;
                    text-align: left;
                    cursor: pointer;
                    text-decoration: none;
                }
                .atelier-buttons-block {
                    display: flex;
                    flex-direction: column;
                    width: 210px;
                }
                .atelier-btn-add-to-bag {
                    width: 100%;
                    height: 38px;
                    background-color: #1C1C1C;
                    color: #FFFFFF;
                    border: none;
                    border-radius: 1px;
                    font-size: 0.74rem;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }
                .atelier-btn-add-to-bag:hover { background-color: #333333; }
                .atelier-btn-view-spec {
                    width: 100%;
                    height: 36px;
                    background-color: #F6F4EE;
                    color: #1A1A1A;
                    border: 1px solid #888888;
                    border-radius: 1px;
                    font-size: 0.68rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    margin-top: 0.4rem;
                    transition: border-color 0.15s ease;
                }
                .atelier-btn-view-spec:hover {
                    border-color: #1A1A1A;
                    background-color: #ECEAE4;
                }

                /* ── FOOTER ── */
                .atelier-footer {
                    max-width: 1360px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 1.25rem 40px 1.75rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.72rem;
                    color: #333333;
                    letter-spacing: 0.1em;
                }

                /* ── RESPONSIVE: only collapse below 680px ── */
                @media (max-width: 680px) {
                    .atelier-main-container {
                        grid-template-columns: 1fr;
                        padding: calc(var(--header-height) + 1.25rem) 16px 1.5rem;
                        gap: 1.5rem;
                    }
                    .atelier-main-preview-box {
                        border-radius: 2px;
                        box-shadow: 0 12px 28px rgba(44, 40, 37, 0.1);
                    }
                    .atelier-product-title {
                        font-size: 1.8rem;
                    }
                    .atelier-bottom-inner {
                        align-items: stretch;
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .atelier-buttons-block {
                        width: 100%;
                    }
                    .atelier-price-value {
                        font-size: 1.7rem;
                    }
                    .atelier-header {
                        padding: 1rem 16px;
                    }
                    .atelier-divider-line {
                        width: calc(100% - 32px);
                    }
                    .atelier-nav-links {
                        display: none;
                    }
                    .atelier-purity-row {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .atelier-finish-row {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .atelier-size-gem-row {
                        grid-template-columns: 1fr;
                    }
                    .atelier-footer {
                        padding: 1rem 16px;
                        flex-direction: column;
                        gap: 0.4rem;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}
