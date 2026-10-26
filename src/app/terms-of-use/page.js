"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
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

    // Gap left above a section when jumping to it (the whole page scrolls)
    const SECTION_OFFSET = 48;

    const scrollWindowTo = (el, behavior) => {
        const top = el.getBoundingClientRect().top + window.scrollY - SECTION_OFFSET;
        window.scrollTo({ top: Math.max(top, 0), behavior });
    };

    // Deep linking hash support
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                setTimeout(() => {
                    const el = document.getElementById(hash);
                    if (el) {
                        scrollWindowTo(el, 'smooth');
                        setActiveSection(hash);
                    }
                }, 120);
            } else {
                setActiveSection(sections[0]?.id || "");
                window.scrollTo(0, 0);
            }
        }
    }, [effectiveType]);

    // Highlight the section currently at the top of the window
    useEffect(() => {
        const handleScroll = () => {
            const doc = document.documentElement;
            if (doc.scrollHeight - window.scrollY - window.innerHeight <= 40) {
                setActiveSection(sections[sections.length - 1]?.id);
                return;
            }

            const triggerPoint = SECTION_OFFSET + 50;
            let currentId = sections[0]?.id;

            for (let i = 0; i < sections.length; i++) {
                const el = document.getElementById(sections[i].id);
                if (el && el.getBoundingClientRect().top <= triggerPoint) {
                    currentId = sections[i].id;
                }
            }

            setActiveSection(currentId);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sections]);

    // Smooth scroll the page to a section
    const scrollToSection = (e, id) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            scrollWindowTo(el, 'smooth');
            setActiveSection(id);
            window.history.replaceState(null, '', `#${id}`);
        }
    };

    return (
        <div className="terms-page-root">
            {/* Header: Fixed at top */}
            <Header headerStyle="dark" />

            {/* Region Modal */}
            <RegionModal isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} />

            {/* Main Center Area: Fixed Height between Header and Fixed Footer */}
            <main className="terms-main-container">
                <div className="terms-content-grid">
                    {/* Left Sidebar: 100% matching image */}
                    <aside className="terms-sidebar">
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
                    <article className="terms-article">
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
                /* ── ROOT LAYOUT (the whole page scrolls) ── */
                html, body {
                    background-color: #F6F4EE;
                }

                .terms-page-root {
                    background-color: #F6F4EE;
                    min-height: 100vh;
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

                /* ── MAIN CONTAINER (grows with the text, footer follows it) ── */
                .terms-main-container {
                    max-width: 1360px;
                    margin: 0 auto;
                    padding: 2.75rem 2rem 1rem 2rem;
                    width: 100%;
                    flex: 1;
                    display: flex;
                }

                /* ── CONTENT GRID (Matching image 1) ── */
                .terms-content-grid {
                    display: grid;
                    grid-template-columns: 250px 1fr;
                    gap: 5.5rem;
                    width: 100%;
                    align-items: start;
                }

                /* ── SIDEBAR (sticks in view while the page scrolls) ── */
                .terms-sidebar {
                    display: flex;
                    flex-direction: column;
                    position: sticky;
                    top: 48px;
                    max-height: calc(100vh - 96px);
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

                /* ── RIGHT ARTICLE (flows with the page) ── */
                .terms-article {
                    display: flex;
                    flex-direction: column;
                    padding-right: 2.5rem;
                    padding-bottom: 4rem;
                    position: relative;
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
                        position: static;
                        max-height: none;
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
