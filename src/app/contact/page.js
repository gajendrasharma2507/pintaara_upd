"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import RegionModal from '@/components/RegionModal';

export default function ContactPage() {
    const { cartCount } = useCart();
    const [isRegionOpen, setIsRegionOpen] = useState(false);

    return (
        <div className="contact-root">
            {/* ── HEADER ── */}
            <header className="contact-header">
                <div className="contact-header-inner">
                    <Link href="/" className="contact-brand-logo">
                        <span className="header-logo-text">PINTAARA</span>
                    </Link>

                    <nav className="contact-nav-links">
                        <Link href="/collection" className="contact-nav-item">COLLECTION</Link>
                        <Link href="/design-log" className="contact-nav-item">DESIGN LOG</Link>
                        <Link href="/about" className="contact-nav-item">ABOUT</Link>
                        <Link href="/1976" className="contact-nav-item">1976</Link>
                    </nav>

                    <div className="contact-header-actions">
                        <button
                            type="button"
                            className="contact-icon-btn"
                            aria-label="Select Region and Language"
                            onClick={() => setIsRegionOpen(true)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                        </button>
                        <Link href="/account" className="contact-icon-btn" aria-label="Profile">
                            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </Link>
                        <Link href="/bag" className="contact-icon-btn contact-cart-btn" aria-label="Shopping Bag">
                            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            {cartCount > 0 && <span className="contact-cart-badge">{cartCount}</span>}
                        </Link>
                    </div>
                </div>
            </header>

            <RegionModal isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} />

            {/* ── MAIN CONTENT ── */}
            <main className="contact-main">
                <div className="contact-inner">

                    {/* Page Title */}
                    <div className="contact-page-heading">
                        <h1 className="contact-page-title">CONTACT US</h1>
                        <div className="contact-title-line" />
                    </div>

                    {/* 4-Column Info Grid */}
                    <div className="contact-grid">

                        {/* CALL US */}
                        <div className="contact-col">
                            <p className="contact-col-label">CALL US</p>
                            <p className="contact-col-primary">+91 95104 00753</p>
                            <p className="contact-col-secondary">
                                For general enquiries<br />
                                (10:30 am - 7:30 pm from<br />
                                Tuesday - Sunday)
                            </p>
                        </div>

                        {/* E-MAIL US */}
                        <div className="contact-col">
                            <p className="contact-col-label">E-MAIL US</p>
                            <a href="mailto:info@pintaara.com" className="contact-col-link">
                                info@pintaara.com
                            </a>
                            <p className="contact-col-secondary">
                                Send us your enquiries and we&apos;ll get back to you. Send us your enquiries and we&apos;ll get back to you.
                            </p>
                        </div>

                        {/* MESSAGE US */}
                        <div className="contact-col">
                            <p className="contact-col-label">MESSAGE US</p>
                            <a
                                href="https://wa.me/919510400753"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-col-link"
                            >
                                Send a message ↗
                            </a>
                            <p className="contact-col-secondary">
                                Chat with us on WhatsApp about anything you&apos;d like to discuss.
                            </p>
                        </div>

                        {/* BOOK AN APPOINTMENT */}
                        <div className="contact-col">
                            <p className="contact-col-label">BOOK AN APPOINTMENT</p>
                            <Link href="/book-an-appointment" className="contact-col-link">
                                Click here to book
                            </Link>
                            <p className="contact-col-secondary">
                                Join us at our store or schedule a virtual appointment.
                            </p>
                        </div>

                    </div>

                    {/* Google Map */}
                    <div className="contact-map-wrapper">
                        <iframe
                            id="contact-map-frame"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.4847!2d72.8376!3d23.0225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848abad1c28b%3A0xd68f59ac09753ec4!2sBababhai%20Jewellers!5e0!3m2!1sen!2sin!4v1690000000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Pintaara Store Location"
                        />
                    </div>

                </div>
            </main>

            {/* ── FOOTER ── */}
            <div className="contact-footer-wrapper">
                <footer className="collection-bottom-bar light-theme">
                    <Link href="/" className="bottom-brand">PINTAARA™</Link>
                    <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
                </footer>
            </div>

            <style jsx global>{`
                html, body {
                    height: 100%;
                    overflow: hidden;
                    background-color: #F6F4EE;
                }
                .contact-root {
                    background-color: #F6F4EE;
                    height: 100vh;
                    max-height: 100vh;
                    overflow: hidden;
                    color: #1A1A1A;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                }
                .contact-header {
                    width: 100%;
                    border-bottom: 1px solid #1A1A1A;
                    background-color: #F6F4EE;
                    flex-shrink: 0;
                    z-index: 100;
                }
                .contact-header-inner {
                    max-width: 1360px;
                    margin: 0 auto;
                    padding: 0.85rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .contact-brand-logo {
                    font-family: "Cinzel", "Didot", "Bodoni MT", serif;
                    font-size: 1.35rem;
                    font-weight: 500;
                    letter-spacing: 0.24em;
                    color: #A07855;
                    text-decoration: none;
                }
                .contact-nav-links {
                    display: flex;
                    gap: 2.5rem;
                }
                .contact-nav-item {
                    font-size: 0.72rem;
                    font-weight: 500;
                    letter-spacing: 0.12em;
                    color: #1A1A1A;
                    text-decoration: none;
                    text-transform: uppercase;
                    transition: opacity 0.15s ease;
                }
                .contact-nav-item:hover { opacity: 0.65; }
                .contact-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }
                .contact-icon-btn {
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
                .contact-icon-btn:hover { opacity: 0.65; }
                .contact-cart-btn { position: relative; }
                .contact-cart-badge {
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
                .contact-main {
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                    display: flex;
                }
                .contact-inner {
                    max-width: 1360px;
                    margin: 0 auto;
                    padding: 2.8rem 2rem 1.5rem 2rem;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .contact-page-heading {
                    margin-bottom: 2.5rem;
                    flex-shrink: 0;
                }
                .contact-page-title {
                    font-size: 1.55rem;
                    font-weight: 400;
                    letter-spacing: 0.05em;
                    color: #1A1A1A;
                    margin: 0;
                    line-height: 1.2;
                }
                .contact-title-line {
                    width: 120px;
                    height: 1.5px;
                    background-color: #1A1A1A;
                    margin-top: 0.65rem;
                }
                .contact-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0;
                    margin-bottom: 2.5rem;
                    flex-shrink: 0;
                }
                .contact-col { padding-right: 2rem; }
                .contact-col-label {
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    color: #1A1A1A;
                    text-transform: uppercase;
                    margin: 0 0 1rem 0;
                }
                .contact-col-primary {
                    font-size: 0.84rem;
                    color: #1A1A1A;
                    margin: 0 0 0.85rem 0;
                    font-weight: 400;
                }
                .contact-col-link {
                    font-size: 0.84rem;
                    color: #1A1A1A;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    display: inline-block;
                    margin-bottom: 0.85rem;
                    cursor: pointer;
                    transition: opacity 0.15s ease;
                }
                .contact-col-link:hover { opacity: 0.6; }
                .contact-col-secondary {
                    font-size: 0.82rem;
                    line-height: 1.72;
                    color: #444444;
                    margin: 0;
                    font-weight: 400;
                }
                .contact-map-wrapper {
                    flex: 1;
                    min-height: 0;
                    width: 100%;
                    overflow: hidden;
                    background-color: #e8e4d9;
                }
                .contact-map-wrapper iframe {
                    display: block;
                    width: 100%;
                    height: 100%;
                    border: 0;
                }
                .contact-footer-wrapper {
                    flex-shrink: 0;
                    width: 100%;
                    background-color: #F6F4EE;
                    z-index: 100;
                }
                .contact-divider-line {
                    width: 100%;
                    height: 1px;
                    background-color: #1A1A1A;
                }
                .contact-footer {
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
                .contact-footer-brand { font-weight: 600; }
                .contact-footer-copy { font-weight: 400; color: #444444; }

                @media (max-width: 900px) {
                    html, body, .contact-root {
                        height: auto;
                        overflow: auto;
                    }
                    .contact-main { height: auto; overflow: visible; }
                    .contact-inner { height: auto; }
                    .contact-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 2rem;
                    }
                    .contact-map-wrapper {
                        height: 280px;
                        flex: none;
                    }
                    .contact-nav-links { display: none; }
                }
                @media (max-width: 540px) {
                    .contact-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
