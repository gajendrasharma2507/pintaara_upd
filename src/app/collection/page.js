"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import api from '@/lib/api';

const resolveImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('data:') || img.startsWith('blob:') || img.startsWith('http://') || img.startsWith('https://')) {
        return img;
    }
    if (img.startsWith('/storage/')) {
        const apiHost = process.env.NEXT_PUBLIC_API_URL 
            ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') 
            : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://admin.pintaara.com' : 'http://127.0.0.1:8000');
        return `${apiHost}${img}`;
    }
    return img;
};

export default function CollectionPage() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchCollections = async () => {
            try {
                const res = await api.getCollections();
                if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
                    if (!isMounted) return;
                    const mapped = res.data.map((col, idx) => {
                        return {
                            id: col.slug || col.id,
                            name: (col.name || '').toUpperCase(),
                            image: resolveImageUrl(col.image),
                            tag: col.tag || 'PINTAARA',
                            subtag: col.subtag || (idx % 2 === 0 ? 'SIGNATURE' : 'CURATED'),
                            extraTag: col.extraTag || null,
                            position: idx % 2 === 0 ? 'top-center' : 'bottom-center'
                        };
                    });
                    setCategories(mapped);
                } else {
                    setCategories([]);
                }
            } catch (err) {
                console.warn('Live collections fetch failed:', err);
                setCategories([]);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchCollections();
        return () => { isMounted = false; };
    }, []);

    const handleNavigate = (index) => {
        const slideIds = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7'];
        if (slideIds[index]) {
            router.push(`/#${slideIds[index]}`);
        }
    };

    const steps = [
        {
            num: '01',
            title: 'SELECT',
            desc: 'Choose the design, metal, and finish that best reflect your preference.'
        },
        {
            num: '02',
            title: 'PAYMENT',
            desc: 'Make the full payment based on the current gold rate to confirm your order.'
        },
        {
            num: '03',
            title: 'CRAFT',
            desc: 'The piece is crafted with precision and care by skilled artisans.'
        },
        {
            num: '04',
            title: 'INSPECTION',
            desc: 'Every piece is hallmarked and inspected to ensure the highest quality.'
        },
        {
            num: '05',
            title: 'DELIVERED',
            desc: 'The completed piece is carefully packaged and delivered securely to its destination.'
        }
    ];


    return (
        <div className="collection-page-root">
            {/* Header with bottom border line */}
            <Header headerStyle="dark" onNavigate={handleNavigate} />

            {/* Collection Main Container */}
            <div className="collection-main-container">

                {/* Header intro */}
                <div className="collection-intro">
                    <div className="collection-intro-left">
                        <div className="subtitle-underline-wrapper">
                            <span className="collection-subtitle">COLLECTION</span>
                            <div className="subtitle-line"></div>
                        </div>
                        <h1 className="collection-title">Original Forms. Made to Order.</h1>
                    </div>
                    <div className="collection-intro-right">
                        <p>Each piece begins as a design, not a product. Crafted to order and created to endure.</p>
                    </div>
                </div>

                {/* 4-Column Collection Grid */}
                <div className="collection-grid-4col">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, idx) => (
                            <div key={`col-shimmer-${idx}`} className="collection-card-item" style={{ pointerEvents: 'none' }}>
                                <div className="card-media-frame pintaara-shimmer shimmer-card-media" />
                                <div className="pintaara-shimmer shimmer-line title" style={{ marginTop: '0.85rem', width: '55%', height: '18px' }} />
                            </div>
                        ))
                    ) : categories.length > 0 ? (
                        categories.map((cat, idx) => (
                            <Link
                                href={`/collection/${cat.id}`}
                                key={`${cat.id || 'cat'}-${idx}`}
                                className="collection-card-item"
                            >
                                <div className="card-media-frame">
                                    <img src={resolveImageUrl(cat.image)} alt={cat.name} className="card-media-img" />
                                </div>
                                <h2 className="card-item-title">{cat.name}</h2>
                            </Link>
                        ))
                    ) : (
                        <div className="collection-empty-state" style={{ gridColumn: '1 / -1', padding: '6rem 1rem', textAlign: 'center', width: '100%' }}>
                            <p style={{
                                fontFamily: "var(--font-body), 'Avenir Next', sans-serif",
                                fontSize: '1rem',
                                fontWeight: 400,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: '#666666',
                                margin: 0
                            }}>
                                No collection currently published.
                            </p>
                        </div>
                    )}
                </div>

                {/* How It Works Section */}
                <div className="how-it-works-section">
                    <div className="how-it-works-header">
                        <div className="how-intro-left">
                            <div className="subtitle-underline-wrapper">
                                <span className="collection-subtitle">HOW IT WORKS</span>
                                <div className="subtitle-line"></div>
                            </div>
                            <h2 className="how-title">From selection to delivery</h2>
                        </div>
                        <div className="how-intro-right">
                            <p>PINTAARA follows a made-to-order approach, allowing each piece to be crafted only when it has found its place.</p>
                        </div>
                    </div>

                    {/* 5 Steps horizontal row */}
                    <div className="steps-row">
                        {steps.map((step) => (
                            <div key={step.num} className="step-col">
                                <div className="step-top-header">
                                    <span className="step-number">{step.num}</span>
                                    <h3 className="step-name">{step.title}</h3>
                                </div>
                                <div className="step-line"></div>
                                <p className="step-text">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subfooter */}
                <div className="collection-subfooter-block">
                    <span className="subfooter-tag">PINTAARA COLLECTION</span>
                    <h3 className="subfooter-text">
                        Made to Order <span className="subfooter-dot" aria-hidden="true" /> Hallmarked &amp; Certified <span className="subfooter-dot" aria-hidden="true" /> Secure Delivery
                    </h3>
                </div>

            </div>

            {/* Bottom Footer bar */}
            <footer className="collection-bottom-bar">
                <span className="bottom-brand">PINTAARA™</span>
                <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
            </footer>
        </div>
    );
}
