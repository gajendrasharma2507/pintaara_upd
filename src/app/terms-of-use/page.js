"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import RegionModal from '@/components/RegionModal';
import { termsData, privacyData } from '@/data/legalData';

function LegalContent({ pageType = "terms" }) {
    const searchParams = useSearchParams();
    const queryType = searchParams ? searchParams.get('type') : null;
    
    // Choose dataset based on pageType or query parameter
    const effectiveType = queryType === 'privacy' ? 'privacy' : (queryType === 'terms' ? 'terms' : pageType);
    const currentData = effectiveType === 'privacy' ? privacyData : termsData;
    const sections = currentData.sections;

    const { cartCount } = useCart();
    const [isRegionOpen, setIsRegionOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(sections[0]?.id || "");
    const articleRef = useRef(null);

    // Deep linking hash support
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                setTimeout(() => {
                    const el = document.getElementById(hash);
                    if (el && articleRef.current) {
                        articleRef.current.scrollTo({
                            top: el.offsetTop,
                            behavior: 'smooth'
                        });
                        setActiveSection(hash);
                    }
                }, 120);
            } else {
                setActiveSection(sections[0]?.id || "");
                if (articleRef.current) {
                    articleRef.current.scrollTop = 0;
                }
            }
        }
    }, [effectiveType]);

    // Track scroll inside the article container
    useEffect(() => {
        const article = articleRef.current;
        if (!article) return;

        const handleScroll = () => {
            if (article.scrollHeight - article.scrollTop - article.clientHeight <= 40) {
                setActiveSection(sections[sections.length - 1]?.id);
                return;
            }

            const triggerPoint = 50;
            let currentId = sections[0]?.id;

            for (let i = 0; i < sections.length; i++) {
                const el = document.getElementById(sections[i].id);
                if (el) {
                    const topRel = el.offsetTop - article.scrollTop;
                    if (topRel <= triggerPoint) {
                        currentId = sections[i].id;
                    }
                }
            }

            setActiveSection(currentId);
        };

        article.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => article.removeEventListener('scroll', handleScroll);
    }, [sections]);

    // Smooth scroll inside article container
    const scrollToSection = (e, id) => {
        e.preventDefault();
        const article = articleRef.current;
        const el = document.getElementById(id);
        if (article && el) {
            article.scrollTo({
                top: el.offsetTop,
                behavior: 'smooth'
            });
            setActiveSection(id);
            if (typeof window !== 'undefined') {
                window.history.replaceState(null, '', `#${id}`);
            }
        }
    };

    // Forward wheel scrolling over sidebar to the article
    const handleWheelOnSidebar = (e) => {
        if (articleRef.current) {
            articleRef.current.scrollTop += e.deltaY;
        }
    };

    return (
        <div className="terms-page-root">
            {/* Header: Fixed at top */}
            <header className="terms-header">
                <div className="terms-header-inner">
                    <Link href="/" className="terms-brand-logo">
                        <span className="header-logo-text">PINTAARA</span>
                    </Link>

                    <nav className="terms-nav-links">
                        <Link href="/collection" className="terms-nav-item">COLLECTION</Link>
                        <Link href="/design-log" className="terms-nav-item">DESIGN LOG</Link>
                        <Link href="/about" className="terms-nav-item">ABOUT</Link>
                        <Link href="/1976" className="terms-nav-item">1976</Link>
                    </nav>

                    <div className="terms-header-actions">
                        <button
                            type="button"
                            className="terms-icon-btn"
                            aria-label="Select Region and Language"
                            onClick={() => setIsRegionOpen(true)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                        </button>
                        <Link href="/account" className="terms-icon-btn" aria-label="Profile">
                            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </Link>
                        <Link href="/bag" className="terms-icon-btn terms-cart-btn" aria-label="Shopping Bag">
                            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            {cartCount > 0 && <span className="terms-cart-badge">{cartCount}</span>}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Region Modal */}
            <RegionModal isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} />

            {/* Main Center Area: Fixed Height between Header and Fixed Footer */}
            <main className="terms-main-container">
                <div className="terms-content-grid">
                    {/* Left Sidebar: 100% matching image */}
                    <aside className="terms-sidebar" onWheel={handleWheelOnSidebar}>
                        <div className="terms-title-block">
                            <h1 className="terms-page-title">{currentData.pageTitle}</h1>
                            <div className="terms-title-line" />
                        </div>

                        <div className="terms-toc-block">
                            <h2 className="terms-sidebar-heading">ON THIS PAGE</h2>
                            <ul className="terms-sidebar-list">
                                {sections.map((sec) => (
                                    <li key={sec.id} className="terms-sidebar-item">
                                        <a
                                            href={`#${sec.id}`}
                                            className={`terms-sidebar-link ${activeSection === sec.id ? 'active' : ''}`}
                                            onClick={(e) => scrollToSection(e, sec.id)}
                                        >
                                            {sec.navLabel}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Middle / Right Policy Text: ONLY THIS PART SCROLLS */}
                    <article className="terms-article" ref={articleRef}>
                        {sections.map((sec) => (
                            <section key={sec.id} id={sec.id} className="terms-policy-section">
                                <h2 className="terms-section-title">{sec.title}</h2>
                                <div className="terms-section-divider" />
                                
                                {sec.paragraphs && sec.paragraphs.map((p, idx) => (
                                    <p key={idx} className="terms-section-text">{p}</p>
                                ))}

                                {sec.list && (
                                    <ul className="terms-clause-list">
                                        {sec.list.map((item, itemIdx) => (
                                            <li key={itemIdx} className="terms-clause-list-item">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        ))}
                    </article>
                </div>
            </main>

            {/* Footer: Fixed at the bottom, does NOT move */}
            <div className="terms-footer-wrapper">
                <footer className="collection-bottom-bar">
                    <span className="bottom-brand">PINTAARA™</span>
                    <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
                </footer>
            </div>

            <style jsx global>{`
                /* ── FIXED SCREEN ROOT LAYOUT ── */
                html, body {
                    height: 100%;
                    overflow: hidden;
                    background-color: #F6F4EE;
                }

                .terms-page-root {
                    background-color: #F6F4EE;
                    height: 100vh;
                    max-height: 100vh;
                    overflow: hidden;
                    color: #1A1A1A;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                }

                /* ── TOP HEADER (FIXED) ── */
                .terms-header {
                    width: 100%;
                    border-bottom: 1px solid #1A1A1A;
                    background-color: #F6F4EE;
                    flex-shrink: 0;
                    z-index: 100;
                }
                .terms-header-inner {
                    max-width: 1360px;
                    margin: 0 auto;
                    padding: 0.85rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .terms-brand-logo {
                    font-family: "Cinzel", "Didot", "Bodoni MT", serif;
                    font-size: 1.35rem;
                    font-weight: 500;
                    letter-spacing: 0.24em;
                    color: #A07855;
                    text-decoration: none;
                }
                .terms-nav-links {
                    display: flex;
                    gap: 2.5rem;
                }
                .terms-nav-item {
                    font-size: 0.72rem;
                    font-weight: 500;
                    letter-spacing: 0.12em;
                    color: #1A1A1A;
                    text-decoration: none;
                    text-transform: uppercase;
                    transition: opacity 0.15s ease;
                }
                .terms-nav-item:hover {
                    opacity: 0.65;
                }
                .terms-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }
                .terms-icon-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #1A1A1A;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    position: relative;
                    transition: opacity 0.15s ease;
                }
                .terms-icon-btn:hover {
                    opacity: 0.65;
                }
                .terms-cart-btn {
                    position: relative;
                }
                .terms-cart-badge {
                    position: absolute;
                    top: -6px;
                    right: -7px;
                    background: #1A1A1A;
                    color: #F6F4EE;
                    font-size: 0.6rem;
                    font-weight: 700;
                    border-radius: 50%;
                    width: 15px;
                    height: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* ── MAIN CONTAINER (FILLS SPACE BETWEEN FIXED HEADER & FIXED FOOTER) ── */
                .terms-main-container {
                    max-width: 1360px;
                    margin: 0 auto;
                    padding: 2.75rem 2rem 1rem 2rem;
                    width: 100%;
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                    display: flex;
                }

                /* ── CONTENT GRID (Matching image 1) ── */
                .terms-content-grid {
                    display: grid;
                    grid-template-columns: 250px 1fr;
                    gap: 5.5rem;
                    width: 100%;
                    height: 100%;
                    min-height: 0;
                    overflow: hidden;
                }

                /* ── SIDEBAR (STATIONARY ON LEFT, MATCHING IMAGE 1 100%) ── */
                .terms-sidebar {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                    user-select: none;
                }
                .terms-title-block {
                    margin-bottom: 2.25rem;
                    flex-shrink: 0;
                }
                .terms-page-title {
                    font-size: 1.45rem;
                    font-weight: 400;
                    letter-spacing: 0.04em;
                    color: #1A1A1A;
                    margin: 0;
                    line-height: 1.2;
                    text-transform: uppercase;
                }
                .terms-title-line {
                    width: 48px;
                    height: 1.5px;
                    background-color: #1A1A1A;
                    margin-top: 0.65rem;
                }

                .terms-toc-block {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .terms-sidebar-heading {
                    font-size: 0.72rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    color: #666666;
                    text-transform: uppercase;
                    margin: 0 0 1.25rem 0;
                    flex-shrink: 0;
                }
                .terms-sidebar-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    overflow-y: auto;
                    scrollbar-width: none;
                }
                .terms-sidebar-list::-webkit-scrollbar {
                    display: none;
                }
                .terms-sidebar-item {
                    margin: 0;
                }
                .terms-sidebar-link {
                    font-size: 0.82rem;
                    color: #555555;
                    text-decoration: none;
                    transition: color 0.15s ease, font-weight 0.15s ease;
                    display: inline-block;
                    cursor: pointer;
                    line-height: 1.35;
                    font-weight: 400;
                }
                .terms-sidebar-link:hover {
                    color: #1A1A1A;
                }
                .terms-sidebar-link.active {
                    font-weight: 700;
                    color: #1A1A1A;
                }

                /* ── RIGHT ARTICLE (MIDDLE TEXT SCROLLS, MATCHING IMAGE 1 100%) ── */
                .terms-article {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow-y: auto;
                    padding-right: 2.5rem;
                    padding-bottom: 4rem;
                    position: relative;
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .terms-article::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                }

                .terms-policy-section {
                    margin-bottom: 2.25rem;
                    position: relative;
                }
                .terms-section-title {
                    font-size: 0.86rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    color: #1A1A1A;
                    text-transform: uppercase;
                    margin: 0;
                }
                .terms-section-divider {
                    width: 100%;
                    height: 1px;
                    background-color: #C5C2BA;
                    margin-top: 0.45rem;
                    margin-bottom: 0.85rem;
                }
                .terms-section-text {
                    font-size: 0.82rem;
                    line-height: 1.72;
                    color: #383838;
                    margin: 0 0 0.85rem 0;
                    font-weight: 400;
                }
                .terms-section-text:last-child {
                    margin-bottom: 0;
                }

                .terms-clause-list {
                    list-style: none;
                    padding-left: 0.25rem;
                    margin: 0.75rem 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .terms-clause-list-item {
                    font-size: 0.82rem;
                    line-height: 1.7;
                    color: #383838;
                    position: relative;
                    padding-left: 1.25rem;
                }
                .terms-clause-list-item::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    top: 0;
                    color: #A07855;
                    font-weight: bold;
                    font-size: 1rem;
                }

                /* ── FIXED FOOTER ── */
                .terms-footer-wrapper {
                    flex-shrink: 0;
                    width: 100%;
                    background-color: #F6F4EE;
                    z-index: 100;
                }
                .terms-divider-line {
                    width: 100%;
                    height: 1px;
                    background-color: #1A1A1A;
                }
                .terms-footer {
                    max-width: 1360px;
                    margin: 0 auto;
                    width: 100%;
                    padding: 0.9rem 2rem 1.1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.72rem;
                    letter-spacing: 0.08em;
                    color: #1A1A1A;
                }
                .terms-footer-brand {
                    font-weight: 600;
                    color: #1A1A1A;
                    text-decoration: none;
                    letter-spacing: 0.12em;
                }
                .terms-footer-copy {
                    font-weight: 400;
                    color: #444444;
                }

                @media (max-width: 900px) {
                    html, body, .terms-page-root {
                        height: auto;
                        overflow: auto;
                    }
                    .terms-main-container {
                        height: auto;
                        overflow: visible;
                        padding: 1.5rem 1.25rem;
                    }
                    .terms-content-grid {
                        grid-template-columns: 1fr;
                        height: auto;
                        overflow: visible;
                        gap: 2rem;
                    }
                    .terms-sidebar {
                        height: auto;
                        overflow: visible;
                    }
                    .terms-article {
                        height: auto;
                        overflow: visible;
                        padding-right: 0;
                    }
                    .terms-sidebar-list {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: wrap;
                        gap: 0.5rem 0.85rem;
                        max-height: 140px;
                        overflow-y: auto;
                    }
                    .terms-nav-links {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}

export default function LegalPage(props) {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F6F4EE' }} />}>
            <LegalContent {...props} />
        </Suspense>
    );
}
