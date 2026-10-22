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

const resolveImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://')) {
        return img;
    }
    if (img.startsWith('/storage/')) {
        const apiHost = process.env.NEXT_PUBLIC_API_URL 
            ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') 
            : 'https://api.pintaara.com';
        return `${apiHost}${img}`;
    }
    return img;
};

// 57-Facet Brilliant Cut Gemstone Component (supports custom uploaded image or SVG facet fallback)
function FacetedGemstone({ type = 'diamond', imageUrl, isSelected, onClick, title }) {
    const [imgFailed, setImgFailed] = useState(false);

    if (type === 'none') {
        return (
            <button
                type="button"
                onClick={onClick}
                title={title || 'No Stone / Solid Gold'}
                aria-label={title || 'No Stone / Solid Gold'}
                className={`atelier-gem-btn ${isSelected ? 'active' : ''}`}
            >
                <svg width="25" height="25" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="url(#solid-gold-grad)" stroke="#B8860B" strokeWidth="1.2" />
                    <circle cx="16" cy="16" r="7" fill="#FFFFFF" stroke="#B8860B" strokeWidth="0.8" />
                    <defs>
                        <linearGradient id="solid-gold-grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#FFF3B0" />
                            <stop offset="50%" stopColor="#D4AF37" />
                            <stop offset="100%" stopColor="#AA7C11" />
                        </linearGradient>
                    </defs>
                </svg>
            </button>
        );
    }

    if (imageUrl && !imgFailed) {
        return (
            <button
                type="button"
                onClick={onClick}
                title={title}
                aria-label={title}
                className={`atelier-gem-btn ${isSelected ? 'active' : ''}`}
            >
                <img
                    src={resolveImageUrl(imageUrl)}
                    alt={title || type}
                    onError={() => setImgFailed(true)}
                    style={{ width: '25px', height: '25px', objectFit: 'cover', borderRadius: '50%' }}
                />
            </button>
        );
    }

    const isDiamond = type === 'diamond';
    const isEmerald = type === 'emerald';
    const isSapphire = type === 'sapphire';
    const isRuby = type === 'ruby';

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
                    {isRuby && (
                        <>
                            <radialGradient id={`rub-glow-${type}`} cx="35%" cy="35%" r="65%">
                                <stop offset="0%" stopColor="#FDA4AF" />
                                <stop offset="35%" stopColor="#F43F5E" />
                                <stop offset="70%" stopColor="#BE123C" />
                                <stop offset="100%" stopColor="#4C0519" />
                            </radialGradient>
                            <linearGradient id={`rub-hi-${type}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#FFE4E6" />
                                <stop offset="60%" stopColor="#E11D48" />
                                <stop offset="100%" stopColor="#881337" />
                            </linearGradient>
                        </>
                    )}
                </defs>

                {/* Base Girdle Circle */}
                <circle
                    cx="16"
                    cy="16"
                    r="15"
                    fill={isDiamond ? `url(#dia-glow-${type})` : isEmerald ? `url(#emr-glow-${type})` : isSapphire ? `url(#sap-glow-${type})` : `url(#rub-glow-${type})`}
                    stroke={isDiamond ? "#64748B" : isEmerald ? "#065F46" : isSapphire ? "#1E3A8A" : "#881337"}
                    strokeWidth="0.8"
                />

                {/* Facet Geometry */}
                <polygon points="16,1 11,6 21,6" fill={isDiamond ? "#F8FAFC" : isEmerald ? "#4ADE80" : isSapphire ? "#60A5FA" : "#FB7185"} opacity="0.9" />
                <polygon points="31,16 26,11 26,21" fill={isDiamond ? "#E2E8F0" : isEmerald ? "#22C55E" : isSapphire ? "#3B82F6" : "#F43F5E"} opacity="0.85" />
                <polygon points="16,31 21,26 11,26" fill={isDiamond ? "#94A3B8" : isEmerald ? "#15803D" : isSapphire ? "#1D4ED8" : "#9F1239"} opacity="0.9" />
                <polygon points="1,16 6,21 6,11" fill={isDiamond ? "#CBD5E1" : isEmerald ? "#16A34A" : isSapphire ? "#2563EB" : "#E11D48"} opacity="0.85" />

                <polygon points="26.6,5.4 21,6 26,11" fill={isDiamond ? "#F1F5F9" : isEmerald ? "#34D399" : isSapphire ? "#3B82F6" : "#FDA4AF"} opacity="0.8" />
                <polygon points="26.6,26.6 26,21 21,26" fill={isDiamond ? "#64748B" : isEmerald ? "#065F46" : isSapphire ? "#1E3A8A" : "#881337"} opacity="0.95" />
                <polygon points="5.4,26.6 11,26 6,21" fill={isDiamond ? "#94A3B8" : isEmerald ? "#047857" : isSapphire ? "#1E40AF" : "#9F1239"} opacity="0.85" />
                <polygon points="5.4,5.4 6,11 11,6" fill={isDiamond ? "#FFFFFF" : isEmerald ? "#86EFAC" : isSapphire ? "#93C5FD" : "#FFE4E6"} opacity="0.9" />

                <polygon points="16,6 19.5,10.5 16,12.5 12.5,10.5" fill={isDiamond ? "#FFFFFF" : isEmerald ? "#86EFAC" : isSapphire ? "#93C5FD" : "#FFF1F2"} opacity="0.95" />
                <polygon points="26,16 21.5,19.5 19.5,16 21.5,12.5" fill={isDiamond ? "#CBD5E1" : isEmerald ? "#10B981" : isSapphire ? "#2563EB" : "#E11D48"} opacity="0.85" />
                <polygon points="16,26 12.5,21.5 16,19.5 19.5,21.5" fill={isDiamond ? "#64748B" : isEmerald ? "#064E3B" : isSapphire ? "#172554" : "#881337"} opacity="0.95" />
                <polygon points="6,16 10.5,12.5 12.5,16 10.5,19.5" fill={isDiamond ? "#E2E8F0" : isEmerald ? "#34D399" : isSapphire ? "#3B82F6" : "#FB7185"} opacity="0.85" />

                {/* Center Octagonal Table */}
                <polygon
                    points="12.5,10.5 19.5,10.5 22.5,13.5 22.5,18.5 19.5,21.5 12.5,21.5 9.5,18.5 9.5,13.5"
                    fill={isDiamond ? `url(#dia-hi-${type})` : isEmerald ? `url(#emr-hi-${type})` : isSapphire ? `url(#sap-hi-${type})` : `url(#rub-hi-${type})`}
                    stroke={isDiamond ? "#475569" : isEmerald ? "#064E3B" : isSapphire ? "#172554" : "#881337"}
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
        label: 'YELLOW',
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
        label: 'ROSE',
        style: {
            background: 'linear-gradient(180deg, #874112 0%, #BA6222 15%, #DB7F3E 35%, #F5B37B 50%, #BA6222 80%, #75360B 100%)',
        }
    },
    {
        name: 'Black Ruthenium',
        code: 'BLK',
        label: 'BLACK',
        labelLight: true,
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
            const seen = new Set();
            const groups = [];

            productDetail.options.forEach((opt, oIdx) => {
                const optName = (opt.name || `Option ${oIdx + 1}`).trim();
                const lower = optName.toLowerCase();

                // Skip certificate standards or empty names
                if (lower.includes('certificate') || !optName) return;

                // Normalize key to deduplicate e.g. "Metal Purity (KT)" vs "METAL PURITY (KT)"
                const normKey = lower.includes('purity') ? 'purity'
                    : lower.includes('finish') ? 'finish'
                    : lower.includes('size') ? 'size'
                    : lower.includes('gem') || lower.includes('stone') ? 'gem'
                    : lower.includes('chain') ? 'chain'
                    : lower;

                if (seen.has(normKey)) return;
                seen.add(normKey);

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

                const allMasterVals = Array.isArray(productDetail?.customization_masters)
                    ? productDetail.customization_masters.flatMap((m) => m.values || [])
                    : [];

                const rawValues = Array.isArray(opt.values) ? opt.values : [];
                const parsedValues = rawValues
                    .map((v, vIdx) => {
                        if (typeof v === 'object' && v !== null) {
                            let valImg = v.image || '';
                            const matchedMaster = allMasterVals.find((mv) => {
                                if (v.code && mv.code && String(v.code).toUpperCase() === String(mv.code).toUpperCase()) return true;
                                const vVal = String(v.value || '').toLowerCase().trim();
                                const mvVal = String(mv.value || '').toLowerCase().trim();
                                if (vVal === mvVal) return true;
                                if (vVal.includes('diamond') && mvVal.includes('diamond')) return true;
                                if (vVal.includes('emerald') && mvVal.includes('emerald')) return true;
                                if (vVal.includes('sapphire') && mvVal.includes('sapphire')) return true;
                                if (vVal.includes('ruby') && mvVal.includes('ruby')) return true;
                                return false;
                            });

                            if (matchedMaster && matchedMaster.image) {
                                if (!valImg || valImg.includes('unsplash.com') || matchedMaster.image.includes('/storage/')) {
                                    valImg = matchedMaster.image;
                                }
                            }

                            return {
                                id: v.id || `${optName}_${vIdx}`,
                                value: v.value || '',
                                code: v.code || (matchedMaster?.code ?? ''),
                                image: resolveImageUrl(valImg),
                                hex_color: v.hex_color || (matchedMaster?.hex_color ?? null),
                                price_delta: parseFloat(v.price_delta) || (parseFloat(matchedMaster?.price_delta) || 0),
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
                    })
                    .filter((v) => v.value && v.value.trim().length > 0);

                if (parsedValues.length > 0) {
                    groups.push({
                        id: opt.id || optName,
                        name: optName,
                        code: opt.code || optName.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
                        input_type: inputType,
                        values: parsedValues,
                    });
                }
            });

            return groups;
        }

        // When productDetail is loaded and has an empty options array, return empty
        if (productDetail) {
            return [];
        }

        // Initial placeholder state while loading
        return [];
    }, [productDetail]);

    // Active Customization Category Helpers
    const purityGroup = useMemo(() => {
        return activeOptionGroups?.find((g) => {
            const l = (g.name || '').toLowerCase();
            return l.includes('purity') || l.includes('karat') || g.code === 'PURITY';
        });
    }, [activeOptionGroups]);

    const finishGroup = useMemo(() => {
        return activeOptionGroups?.find((g) => {
            const l = (g.name || '').toLowerCase();
            return l.includes('finish') || l.includes('tone') || g.code === 'FINISH';
        });
    }, [activeOptionGroups]);

    const sizeGroup = useMemo(() => {
        return activeOptionGroups?.find((g) => {
            const l = (g.name || '').toLowerCase();
            return (l.includes('size') || g.code === 'SIZE') && !l.includes('gem') && !l.includes('stone') && !l.includes('diamond');
        });
    }, [activeOptionGroups]);

    const gemGroup = useMemo(() => {
        return activeOptionGroups?.find((g) => {
            const l = (g.name || '').toLowerCase();
            return l.includes('gem') || l.includes('stone') || l.includes('diamond') || g.code === 'GEM';
        });
    }, [activeOptionGroups]);

    const chainGroup = useMemo(() => {
        return activeOptionGroups?.find((g) => {
            const l = (g.name || '').toLowerCase();
            return l.includes('chain') || g.code === 'CHAIN';
        });
    }, [activeOptionGroups]);

    const hasSize = Boolean(sizeGroup && sizeGroup.values?.length > 0);
    const hasGem = Boolean(gemGroup && gemGroup.values?.length > 0);
    const hasChain = Boolean(chainGroup && chainGroup.values?.length > 0);

    // Dynamic available finishes filtered by selected purity & product finish matrix
    const availableFinishes = useMemo(() => {
        if (!finishGroup || !finishGroup.values || finishGroup.values.length === 0) return [];
        const matrix = productDetail?.finish_purities;
        if (Array.isArray(matrix) && matrix.length > 0 && selectedPurity) {
            const cleanSelectedPurity = selectedPurity.replace(/\s+/g, '').toUpperCase();
            const allowedForPurity = matrix.filter((item) => {
                const itemPurity = (item.purity_code || item.purity_name || '').replace(/\s+/g, '').toUpperCase();
                return itemPurity === cleanSelectedPurity || cleanSelectedPurity.includes(itemPurity) || itemPurity.includes(cleanSelectedPurity);
            });

            if (allowedForPurity.length > 0) {
                const filtered = finishGroup.values.filter((fVal) => {
                    const valStr = (typeof fVal === 'string' ? fVal : fVal.value || '').toLowerCase();
                    const fCode = (fVal.code || '').toUpperCase();
                    return allowedForPurity.some((item) => {
                        const mName = (item.finish_name || '').toLowerCase();
                        const mCode = (item.finish_code || '').toUpperCase();
                        return (
                            (fCode && mCode && fCode === mCode) ||
                            valStr.includes(mName) ||
                            mName.includes(valStr) ||
                            (valStr.includes('yellow') && (mName.includes('yellow') || mCode === 'YG')) ||
                            (valStr.includes('rose') && (mName.includes('rose') || mCode === 'RG')) ||
                            (valStr.includes('white') && (mName.includes('white') || mCode === 'WG')) ||
                            (valStr.includes('black') && (mName.includes('black') || mCode === 'BLK' || mCode === 'BG')) ||
                            (valStr.includes('silver') && (mName.includes('silver') || mCode === 'SILVER'))
                        );
                    });
                });
                if (filtered.length > 0) return filtered;
            }
        }
        return finishGroup.values;
    }, [finishGroup, productDetail?.finish_purities, selectedPurity]);

    // Dynamic available purities filtered by selected finish & product finish matrix
    const availablePurities = useMemo(() => {
        if (!purityGroup || !purityGroup.values || purityGroup.values.length === 0) return [];
        const matrix = productDetail?.finish_purities;
        if (Array.isArray(matrix) && matrix.length > 0) {
            // Find allowed purities for currently selected finish (or across all configured finishes)
            let allowedMatrix = matrix;
            if (selectedFinishCode) {
                const sCode = selectedFinishCode.toUpperCase();
                const matchedByFinish = matrix.filter((item) => {
                    const mCode = (item.finish_code || '').toUpperCase();
                    const mName = (item.finish_name || '').toLowerCase();
                    return (
                        mCode === sCode ||
                        (sCode === 'YG' && (mName.includes('yellow') || mCode === 'YG')) ||
                        (sCode === 'RG' && (mName.includes('rose') || mCode === 'RG')) ||
                        (sCode === 'WG' && (mName.includes('white') || mCode === 'WG')) ||
                        (sCode === 'BLK' && (mName.includes('black') || mCode === 'BLK' || mCode === 'BG')) ||
                        (sCode === 'SILVER' && (mName.includes('silver') || mCode === 'SILVER'))
                    );
                });
                if (matchedByFinish.length > 0) {
                    allowedMatrix = matchedByFinish;
                }
            }

            const allowedPurityCodes = allowedMatrix.map((item) =>
                (item.purity_code || item.purity_name || '').replace(/\s+/g, '').toUpperCase()
            );

            const filtered = purityGroup.values.filter((pVal) => {
                const rawVal = pVal.value || pVal.code || pVal;
                const match = typeof rawVal === 'string' ? rawVal.match(/(\d+KT|\d+\s*SILVER|PT\d+)/i) : null;
                const clean = (match ? match[0] : rawVal).replace(/\s+/g, '').toUpperCase();
                return allowedPurityCodes.some((code) => clean.includes(code) || code.includes(clean));
            });

            if (filtered.length > 0) return filtered;
        }
        return purityGroup.values;
    }, [purityGroup, productDetail?.finish_purities, selectedFinishCode]);

    // Ensure selected purity is always valid when availablePurities changes
    useEffect(() => {
        if (availablePurities && availablePurities.length > 0) {
            const isCurrentAvailable = availablePurities.some((pVal) => {
                const rawVal = pVal.value || pVal.code || pVal;
                const match = typeof rawVal === 'string' ? rawVal.match(/(\d+KT|\d+\s*SILVER|PT\d+)/i) : null;
                const clean = match ? match[0].toUpperCase() : rawVal;
                return selectedPurity === clean || selectedPurity === rawVal;
            });
            if (!isCurrentAvailable) {
                const first = availablePurities[0];
                const rawVal = first.value || first.code || first;
                const match = typeof rawVal === 'string' ? rawVal.match(/(\d+KT|\d+\s*SILVER|PT\d+)/i) : null;
                const clean = match ? match[0].toUpperCase() : rawVal;
                setSelectedPurity(clean);
                const grpName = purityGroup?.name || 'Metal Colors & Purities';
                handleSelectOption(grpName, { value: rawVal, price_delta: Number(first.price_delta) || 0 });
            }
        }
    }, [availablePurities, selectedPurity]);

    // Ensure selected finish is always valid when availableFinishes changes
    useEffect(() => {
        if (availableFinishes && availableFinishes.length > 0) {
            const isCurrentAvailable = availableFinishes.some((fVal) => {
                const valStr = typeof fVal === 'string' ? fVal : fVal.value;
                const valLower = valStr.toLowerCase();
                const code = fVal.code || (valLower.includes('yellow') ? 'YG' : valLower.includes('white') ? 'WG' : valLower.includes('rose') ? 'RG' : valLower.includes('black') ? 'BLK' : '');
                return selectedFinishCode === code || selectedFinishCode === valStr;
            });
            if (!isCurrentAvailable) {
                const first = availableFinishes[0];
                const valStr = typeof first === 'string' ? first : first.value;
                const valLower = valStr.toLowerCase();
                const code = first.code || (valLower.includes('yellow') ? 'YG' : valLower.includes('white') ? 'WG' : valLower.includes('rose') ? 'RG' : valLower.includes('black') ? 'BLK' : 'YG');
                setSelectedFinishCode(code);
                handleSelectOption('FINISH OPTION', { value: valStr, price_delta: 0, image: first.image });
            }
        }
    }, [availableFinishes, selectedFinishCode]);

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
                        const l = gName.toLowerCase();
                        if (l.includes('purity') || l.includes('metal') || l.includes('karat')) {
                            const val = group.values.find((v) => v.value.includes('18K')) || group.values.find((v) => v.value.includes('22K')) || group.values[0];
                            next[gName] = val;
                            const match = val.value.match(/(\d+KT|\d+\s*SILVER|PT\d+)/i);
                            setSelectedPurity(match ? match[0].toUpperCase() : val.value);
                        } else if (l.includes('finish')) {
                            const val = group.values.find((v) => v.value.toLowerCase().includes('yellow')) || group.values[0];
                            next[gName] = val;
                            setSelectedFinishCode(val.code || 'YG');
                        } else if (l.includes('size')) {
                            const val = group.values[0];
                            next[gName] = val;
                            setSelectedSize(val.value.replace(/^(Ring\s*Size|Size)\s*/i, ''));
                        } else if (l.includes('chain')) {
                            const val = group.values.find((v) => v.value.toLowerCase().includes('box')) || group.values[0];
                            next[gName] = val;
                            setSelectedChain(val.value.replace(/\s*Chain\s*/i, ' ').trim());
                        } else if (l.includes('gem') || l.includes('stone')) {
                            const val = group.values.find((v) => {
                                const value = v.value.toLowerCase();
                                return value.includes('no stone') || value.includes('solid gold') || value.includes('none');
                            }) || group.values[0];
                            next[gName] = val;
                            const valLower = val.value.toLowerCase();
                            setSelectedGem(valLower.includes('emerald') ? 'emerald' : valLower.includes('sapphire') ? 'sapphire' : valLower.includes('ruby') ? 'ruby' : valLower.includes('diamond') ? 'diamond' : 'none');
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
            (purityGroup && k === purityGroup.name) ||
            k.toLowerCase().includes('purity') || k.toLowerCase().includes('metal') || k.toLowerCase().includes('karat')
        );
        const purityStr = selectedPurity || purityEntry?.[1]?.value || '22KT';
        const gemEntry = Object.entries(selectedOptions).find(([k]) =>
            k.toLowerCase().includes('gem') || k.toLowerCase().includes('stone')
        );
        const gemName = gemEntry?.[1]?.value || '';
        const optionBreakdowns = [];
        let optionDelta = 0;
        let extraGrams = 0;
        let flatGemPrice = 0;

        Object.entries(selectedOptions).forEach(([optName, valObj]) => {
            const lowerName = optName.toLowerCase();
            const valStr = typeof valObj === 'object' ? (valObj?.value || '') : String(valObj || '');
            const delta = Number(valObj?.price_delta) || 0;

            // 1. Gram-based Size: check if value has grams e.g. "Size 12 (2.0g)" or "2g"
            if (lowerName.includes('size')) {
                const match = valStr.match(/(\d+(?:\.\d+)?)\s*g(?:ram)?/i);
                if (match) {
                    extraGrams += parseFloat(match[1]);
                    optionBreakdowns.push({ name: optName, value: valStr, charge: `+${match[1]}g (metal)` });
                }
            }

            // 2. Gram-based Chain: check if chain has grams e.g. "Box Chain (5.0g)" or "5g"
            if (lowerName.includes('chain')) {
                const match = valStr.match(/(\d+(?:\.\d+)?)\s*g(?:ram)?/i);
                if (match) {
                    extraGrams += parseFloat(match[1]);
                    optionBreakdowns.push({ name: optName, value: valStr, charge: `+${match[1]}g (metal)` });
                }
            }

            // 3. Flat Gemstone Price: flat charge for gemstone (e.g. ₹2,500 or ₹5,000)
            if (lowerName.includes('gem') || lowerName.includes('stone') || lowerName.includes('diamond')) {
                if (delta > 0) {
                    flatGemPrice += delta;
                    optionBreakdowns.push({ name: optName, value: valStr, charge: delta });
                }
            }

            // Other flat option additions
            if (delta && !lowerName.includes('purity') && !lowerName.includes('metal') &&
                !lowerName.includes('finish') && !lowerName.includes('size') &&
                !lowerName.includes('gem') && !lowerName.includes('stone') && !lowerName.includes('chain')) {
                optionDelta += delta;
                optionBreakdowns.push({ name: optName, value: valObj.value, charge: delta });
            }
        });

        const baseWeight = Number(productDetail.base_weight_grams) || 8.5;
        const totalWeight = Math.round((baseWeight + extraGrams) * 100) / 100;

        let cancelled = false;
        const calculate = async () => {
            try {
                const purityFraction = purityStr.includes('24') ? 1.0 : purityStr.includes('18') ? 0.75 : purityStr.includes('14') ? 0.585 : purityStr.includes('925') ? 0.925 : 0.916;
                const response = await apiFetch('/price/calculate', {
                    method: 'POST',
                    body: JSON.stringify({
                        weight_grams: totalWeight,
                        purity: purityStr,
                        purity_fraction: purityFraction,
                        making_charge_flat: Number(productDetail.making_charge) || 0,
                        making_charge_percent: productDetail.making_charge_percent,
                        wastage_percent: Number(productDetail.wastage_percent) || 0,
                        gem: gemName,
                        stone_charge: flatGemPrice > 0 ? flatGemPrice : null,
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
                                const total = Number(item.livePrice || calculatedTotal || 0);
                                const formattedPrice = Math.round(total).toLocaleString('en-IN');

                                // Website Design.pdf p.11: design line tag (e.g. ORIGIN), code, then price
                                const codeUpper = (item.code || '').toUpperCase();
                                let collectionTag = 'ORIGIN';
                                if (codeUpper.includes('-OR-') || codeUpper.includes('ORIGIN')) {
                                    collectionTag = 'ORIGIN';
                                } else if (item.collection && !['BRACELETS', 'BRACELET', 'PENDANTS', 'PENDANT', 'NECKLACES', 'NECKLACE', 'RINGS', 'RING', 'EARRINGS', 'EARRING', 'CHAINS', 'CHAIN', 'BANGLES', 'BANGLE'].includes(item.collection.toUpperCase())) {
                                    collectionTag = item.collection.toUpperCase();
                                } else if (item.name && !item.name.toLowerCase().startsWith('piece') && item.name.toUpperCase() !== codeUpper) {
                                    collectionTag = item.name.toUpperCase();
                                }

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
                                            <span className="cat-prod-collection">{collectionTag}</span>
                                            <h3 className="cat-prod-code">{item.code}</h3>
                                            <span className="cat-prod-price">₹ {formattedPrice}</span>
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
        ? Number(Math.round(priceBreakdown.total)).toLocaleString('en-IN')
        : (productDetail?.base_pricing?.total_price
            ? Number(Math.round(productDetail.base_pricing.total_price)).toLocaleString('en-IN')
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
                    {/* Website Design.pdf p.13: design code as the title, design name below */}
                    <h1 className="atelier-product-title">
                        {String(productDetail?.design_code || resolvedParams?.id || '').toUpperCase()}
                    </h1>
                    <div className="atelier-product-subtitle">
                        {(productDetail?.name || productDetail?.collection?.name || 'ATELIER PIECE').toUpperCase()}
                    </div>
                    <div className="atelier-specs-divider" />

                    {/* METAL PURITY — only render if configured for this product */}
                    {availablePurities && availablePurities.length > 0 && (
                        <div className="atelier-control-group">
                            <div className="atelier-spec-label">METAL PURITY (KT)</div>
                            <div className="atelier-purity-row">
                                {availablePurities.map((pVal) => {
                                    const rawVal = pVal.value || pVal.code || pVal;
                                    const match = typeof rawVal === 'string' ? rawVal.match(/(\d+KT|\d+\s*SILVER|PT\d+)/i) : null;
                                    const cleanPurity = match ? match[0].toUpperCase() : rawVal;
                                    const isSelected = selectedPurity === cleanPurity || selectedPurity === rawVal;
                                    const delta = Number(pVal.price_delta) || (cleanPurity === '22KT' ? 12000 : cleanPurity === '14KT' ? -10000 : cleanPurity === '925 SILVER' ? -45000 : 0);
                                    return (
                                        <button
                                            key={pVal.id || rawVal}
                                            type="button"
                                            className={`atelier-purity-btn ${isSelected ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedPurity(cleanPurity);
                                                const grpName = purityGroup?.name || 'Metal Colors & Purities';
                                                handleSelectOption(grpName, { value: rawVal, price_delta: delta });
                                            }}
                                        >
                                            {cleanPurity}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* FINISH OPTION — only render if configured for this product */}
                    {availableFinishes && availableFinishes.length > 0 && (() => {
                        const activeFinishObj = availableFinishes.find((fVal, idx) => {
                            const valStr = typeof fVal === 'string' ? fVal : fVal.value;
                            const valLower = String(valStr || '').toLowerCase();
                            const code = fVal.code || (valLower.includes('yellow') ? 'YG' : valLower.includes('white') ? 'WG' : valLower.includes('rose') ? 'RG' : valLower.includes('black') ? 'BLK' : `F${idx}`);
                            return selectedFinishCode === code || selectedFinishCode === valStr;
                        });
                        const activeValStr = activeFinishObj ? (typeof activeFinishObj === 'string' ? activeFinishObj : activeFinishObj.value) : '';
                        const matchedActiveBar = finishBarsData.find(b => b.code === selectedFinishCode || (activeValStr && b.name.toLowerCase() === activeValStr.toLowerCase()));
                        const selectedFinishDisplayName = matchedActiveBar?.name || activeValStr || (selectedFinishCode === 'YG' ? 'Yellow Gold' : selectedFinishCode === 'WG' ? 'White Gold' : selectedFinishCode === 'RG' ? 'Rose Gold' : selectedFinishCode === 'BLK' ? 'Black Ruthenium' : '');

                        return (
                            <div className="atelier-control-group">
                                <div className="atelier-spec-label">
                                    FINISH OPTIONS
                                </div>
                                <div className="atelier-finish-row">
                                    {availableFinishes.map((fVal, idx) => {
                                        const valStr = typeof fVal === 'string' ? fVal : fVal.value;
                                        const valLower = String(valStr || '').toLowerCase();
                                        const code = fVal.code || (valLower.includes('yellow') ? 'YG' : valLower.includes('white') ? 'WG' : valLower.includes('rose') ? 'RG' : valLower.includes('black') ? 'BLK' : `F${idx}`);
                                        const matchedBar = finishBarsData.find((b) => b.code === code || b.name.toLowerCase() === valLower) || {
                                            name: valStr,
                                            code: code,
                                            label: String(valStr || '').split(' ')[0].toUpperCase(),
                                            style: fVal.hex_color ? { background: fVal.hex_color } : { background: '#D4AF37' }
                                        };
                                        const isSelected = selectedFinishCode === code || selectedFinishCode === valStr;
                                        return (
                                            <button
                                                key={fVal.id || code}
                                                type="button"
                                                title={matchedBar.name || valStr}
                                                aria-label={matchedBar.name || valStr}
                                                className={`atelier-finish-bar ${isSelected ? 'active' : ''}`}
                                                style={matchedBar.style}
                                                onClick={() => {
                                                    setSelectedFinishCode(code);
                                                    const grpName = finishGroup?.name || 'Finish Options';
                                                    handleSelectOption(grpName, { value: valStr, price_delta: 0, image: fVal.image });
                                                    if (fVal.image) {
                                                        const imgIdx = thumbnails.findIndex(t => t.src === fVal.image);
                                                        if (imgIdx !== -1) {
                                                            setActiveImgIndex(imgIdx);
                                                            return;
                                                        }
                                                    }
                                                    if (code === 'YG' || valLower.includes('yellow')) setActiveImgIndex(0);
                                                    else if (code === 'WG' || valLower.includes('white')) setActiveImgIndex(1);
                                                    else if (code === 'RG' || valLower.includes('rose')) setActiveImgIndex(2);
                                                }}
                                            >
                                                <span
                                                    className="atelier-finish-bar-label"
                                                    style={{ display: isSelected ? 'block' : 'none', color: matchedBar.labelLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)' }}
                                                >{matchedBar.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}

                    {/* SIZE and/or GEM: Only render if at least one is enabled */}
                    {(hasSize || hasGem) && (
                        <div className={hasSize && hasGem ? "atelier-size-gem-row" : "atelier-single-option-row"}>
                            {hasSize && (
                                <div className="atelier-control-group" style={{ marginBottom: 0, maxWidth: hasGem ? '100%' : '50%' }}>
                                    <div className="atelier-spec-label">SIZE</div>
                                    <div className="atelier-box-select-wrapper">
                                        <select
                                            className="atelier-box-select"
                                            value={selectedSize}
                                            onChange={(e) => {
                                                const chosenVal = e.target.value;
                                                const foundObj = sizeGroup.values.find((s) => (s.value || s) === chosenVal || (s.value || s).replace(/^(Ring\s*Size|Size)\s*/i, '') === chosenVal);
                                                setSelectedSize(chosenVal);
                                                const grpName = sizeGroup?.name || 'Size';
                                                handleSelectOption(grpName, { value: foundObj ? foundObj.value : chosenVal, price_delta: 0 });
                                            }}
                                        >
                                            {sizeGroup.values.map((szObj) => {
                                                const szVal = typeof szObj === 'string' ? szObj : szObj.value;
                                                const cleanSz = szVal.replace(/^(Ring\s*Size|Size)\s*/i, '');
                                                return (
                                                    <option key={szObj.id || szVal} value={cleanSz}>
                                                        {cleanSz}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {hasGem && (
                                <div className="atelier-control-group" style={{ marginBottom: 0 }}>
                                    <div className="atelier-spec-label">GEM / STONE OPTIONS</div>
                                    <div className="atelier-gems-row">
                                        {gemGroup.values.map((gem, idx) => {
                                            const valLower = (gem.value || '').toLowerCase();
                                            const codeLower = (gem.code || '').toLowerCase();
                                            const isNoStone = valLower.includes('no stone') || valLower.includes('solid gold') || valLower.includes('none');

                                            const typeStr = isNoStone ? 'none'
                                                : codeLower.includes('dia') || valLower.includes('dia') ? 'diamond'
                                                    : codeLower.includes('emr') || valLower.includes('eme') ? 'emerald'
                                                        : codeLower.includes('sap') || valLower.includes('sap') ? 'sapphire'
                                                            : codeLower.includes('rub') || valLower.includes('rub') ? 'ruby'
                                                                : 'diamond';

                                            const grpName = gemGroup?.name || 'Gem & Stone Options';
                                            const currentVal = selectedOptions[grpName]?.value || selectedOptions['GEM / STONE OPTIONS']?.value || selectedOptions['GEM']?.value;
                                            const isSelected = currentVal ? currentVal === gem.value : (idx === 0);

                                            const rawDelta = parseFloat(gem.price_delta) || 0;
                                            const delta = Math.abs(rawDelta);
                                            const gemTitle = delta > 0 ? `${gem.value} (+₹${delta.toLocaleString('en-IN')})` : gem.value;

                                            return (
                                                <FacetedGemstone
                                                    key={gem.id || gem.code || gem.value || idx}
                                                    type={typeStr}
                                                    imageUrl={isNoStone ? null : (gem.image || `/images/gems/${typeStr}.png`)}
                                                    title={gemTitle}
                                                    isSelected={isSelected}
                                                    onClick={() => {
                                                        setSelectedGem(typeStr);
                                                        handleSelectOption(grpName, { value: gem.value, price_delta: delta, image: gem.image });
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CHAIN — only render if chain option is enabled for this piece */}
                    {hasChain && (
                        <div className="atelier-control-group" style={{ marginTop: '0.9rem' }}>
                            <div className="atelier-spec-label">CHAIN</div>
                            <div className="atelier-box-select-wrapper" style={{ maxWidth: '50%' }}>
                                <select
                                    className="atelier-box-select"
                                    value={selectedChain}
                                    onChange={(e) => {
                                        const chosenVal = e.target.value;
                                        const foundObj = chainGroup.values.find((c) => (c.value || c) === chosenVal || (c.code || '') === chosenVal);
                                        setSelectedChain(chosenVal);
                                        handleSelectOption('CHAIN', {
                                            value: chosenVal,
                                            price_delta: Number(foundObj?.price_delta || (chosenVal === 'None' ? -8000 : chosenVal === 'Rope' ? 3000 : 0))
                                        });
                                    }}
                                >
                                    {chainGroup.values.map((chObj) => {
                                        const chVal = typeof chObj === 'string' ? chObj : chObj.value;
                                        const cleanCh = chVal.replace(/\s*Chain\s*/i, ' ').trim();
                                        return (
                                            <option key={chObj.id || chVal} value={cleanCh}>
                                                {cleanCh}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                    )}

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
                                <strong style={{ color: '#1A1A1A' }}>{priceBreakdown.weight_grams}g ({selectedPurity || '18KT'})</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                <span>Metal Value (@ ₹{Number(Math.round(priceBreakdown.rate_used?.rate_per_gram || priceBreakdown.rate_per_gram || 0)).toLocaleString('en-IN')}/g):</span>
                                <strong style={{ color: '#1A1A1A' }}>₹{Number(Math.round(priceBreakdown.metal_value)).toLocaleString('en-IN')}</strong>
                            </div>

                            {(priceBreakdown.wastage_value > 0 || priceBreakdown.making_percent_value > 0) && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                    <span>Making ({priceBreakdown.wastage_percent || 2.5}% of Metal):</span>
                                    <strong style={{ color: '#1A1A1A' }}>₹{Number(Math.round(priceBreakdown.wastage_value || priceBreakdown.making_percent_value)).toLocaleString('en-IN')}</strong>
                                </div>
                            )}

                            {(priceBreakdown.author_charge > 0 || priceBreakdown.making_charge > 0) && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                    <span>Author / Crafting Fee:</span>
                                    <strong style={{ color: '#1A1A1A' }}>₹{Number(Math.round(priceBreakdown.author_charge || priceBreakdown.making_charge)).toLocaleString('en-IN')}</strong>
                                </div>
                            )}

                            {hasGem && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                    <span>Gem ({selectedOptions[gemGroup?.name]?.value || selectedOptions['GEM / STONE OPTIONS']?.value || selectedOptions['GEM']?.value || 'No Stone'}):</span>
                                    <strong style={{ color: '#1A1A1A' }}>
                                        {Number(priceBreakdown.stone_charge || 0) > 0
                                            ? `+₹${Number(Math.round(priceBreakdown.stone_charge)).toLocaleString('en-IN')}`
                                            : '₹0'}
                                    </strong>
                                </div>
                            )}

                            {hasChain && selectedChain && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                    <span>Chain Selection ({selectedChain}):</span>
                                    <strong style={{ color: '#1A1A1A' }}>₹0</strong>
                                </div>
                            )}

                            <div style={{ borderTop: '1px solid #EEE', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                <span>Taxable Subtotal:</span>
                                <strong style={{ color: '#1A1A1A' }}>₹{Number(Math.round(priceBreakdown.subtotal)).toLocaleString('en-IN')}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                <span>GST (3%):</span>
                                <strong style={{ color: '#1A1A1A' }}>₹{Number(Math.round(priceBreakdown.gst || priceBreakdown.gst_amount)).toLocaleString('en-IN')}</strong>
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
                                <span style={{ fontWeight: '700', color: '#1A1A1A' }}>Final Transparent MRP:</span>
                                <span style={{ fontWeight: '800', color: '#1A1A1A', fontSize: '1.25rem' }}>
                                    ₹{Number(Math.round(priceBreakdown.total || priceBreakdown.total_price)).toLocaleString('en-IN')}
                                </span>
                            </div>

                            <div style={{ fontSize: '0.72rem', color: '#777', marginTop: '0.5rem', textAlign: 'center' }}>
                                Live Spot Rate certified Gujarat Jeweler Association daily bulletin ({priceBreakdown.rate_used?.rate_date || 'Today'}).
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
                    font-size: 8px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-shadow: 0 1px 1px rgba(255,255,255,0.4);
                    pointer-events: none;
                    user-select: none;
                    line-height: 1;
                    text-align: center;
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
                    transform: scale(1.18);
                    box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 3.5px #1A1A1A;
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
