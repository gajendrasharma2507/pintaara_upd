"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import RegionModal from '@/components/RegionModal';
import { apiFetch } from '@/lib/api';

export default function BookAppointmentPage() {
    const { cartCount } = useCart();
    const [isRegionOpen, setIsRegionOpen] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        contact: '',
        date: '',
        time: '',
        purpose: 'Design a Jewellery Piece / Explore & Try on collection / Complain / Refund / Others',
        notes: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiFetch('/appointments', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
        } catch (err) {
            console.warn('Backend appointment recording note:', err.message);
        }
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 5000);
    };


    return (
        <div className="appointment-page-root">
            {/* Header */}
            <header className="appointment-header">
                <div className="appointment-header-inner">
                    <Link href="/" className="appointment-brand-logo">
                        <span className="header-logo-text">PINTAARA</span>
                    </Link>

                    <nav className="appointment-nav-links">
                        <Link href="/collection" className="appointment-nav-item">COLLECTION</Link>
                        <Link href="/design-log" className="appointment-nav-item">DESIGN LOG</Link>
                        <Link href="/about" className="appointment-nav-item">ABOUT</Link>
                        <Link href="/1976" className="appointment-nav-item">1976</Link>
                    </nav>

                    <div className="appointment-header-actions">
                        <button
                            type="button"
                            className="appointment-icon-btn"
                            aria-label="Select Region and Language"
                            onClick={() => setIsRegionOpen(true)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                        </button>
                        <Link href="/account" className="appointment-icon-btn" aria-label="Profile">
                            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </Link>
                        <Link href="/bag" className="appointment-icon-btn appointment-cart-btn" aria-label="Shopping Bag">
                            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            {cartCount > 0 && <span className="appointment-cart-badge">{cartCount}</span>}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Region Modal */}
            <RegionModal isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} />

            {/* Main Content Area */}
            <main className="appointment-main-container">
                <div className="appointment-content-grid">
                    {/* Left Column: Title, Intro & Studio Details */}
                    <aside className="appointment-info-column">
                        <div className="appointment-title-block">
                            <h1 className="appointment-page-title">BOOK AN APPOINTMENT</h1>
                            <div className="appointment-title-line" />
                        </div>

                        <div className="appointment-intro-text">
                            <p>We&apos;d love to welcome you to our Vadodara studio.</p>
                            <p style={{ marginTop: '1.4rem' }}>
                                Meet with our team to explore our collections, discuss bespoke designs or receive a personalised consultation.
                            </p>
                        </div>

                        <div className="appointment-studio-section">
                            <h2 className="appointment-subheading">STUDIO</h2>
                            <address className="appointment-address">
                                Shop 1, GF, Suvarnraj Complex,<br />
                                Shamal Bechar Pole<br />
                                Mandvi, M.G. Road,<br />
                                Vadodara, GJ, IND - 390001
                            </address>
                        </div>

                        <div className="appointment-info-divider" />

                        <div className="appointment-hours-section">
                            <h2 className="appointment-subheading">STUDIO HOURS</h2>
                            <p className="appointment-hours">
                                10:30 am - 7:30 pm<br />
                                Tuesday - Sunday
                            </p>
                        </div>
                    </aside>

                    {/* Right Column: Appointment Booking Form */}
                    <div className="appointment-form-column">
                        {isSubmitted && (
                            <div className="appointment-success-banner">
                                Thank you. Your appointment request has been received. Our atelier team will contact you shortly.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="appointment-form">
                            {/* FULL NAME */}
                            <div className="appointment-form-group">
                                <label className="appointment-form-label">FULL NAME</label>
                                <div className="appointment-input-wrapper">
                                    <input
                                        type="text"
                                        required
                                        placeholder="First and Last Name"
                                        className="appointment-input"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                    <span className="appointment-input-arrow">&gt;</span>
                                </div>
                            </div>

                            {/* CONTACT */}
                            <div className="appointment-form-group">
                                <label className="appointment-form-label">CONTACT</label>
                                <div className="appointment-input-wrapper">
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Mobile Number"
                                        className="appointment-input"
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    />
                                    <span className="appointment-input-arrow">&gt;</span>
                                </div>
                            </div>

                            {/* DATE */}
                            <div className="appointment-form-group">
                                <label className="appointment-form-label">DATE</label>
                                <div className="appointment-input-wrapper">
                                    <input
                                        type="text"
                                        onFocus={(e) => (e.target.type = 'date')}
                                        onBlur={(e) => {
                                            if (!e.target.value) e.target.type = 'text';
                                        }}
                                        placeholder="Select a date"
                                        className="appointment-input"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                    <span className="appointment-calendar-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="1.5" ry="1.5"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                            <rect x="7" y="13" width="2" height="2" fill="#1A1A1A"></rect>
                                            <rect x="11" y="13" width="2" height="2" fill="#1A1A1A"></rect>
                                            <rect x="15" y="13" width="2" height="2" fill="#1A1A1A"></rect>
                                            <rect x="7" y="17" width="2" height="2" fill="#1A1A1A"></rect>
                                            <rect x="11" y="17" width="2" height="2" fill="#1A1A1A"></rect>
                                            <rect x="15" y="17" width="2" height="2" fill="#1A1A1A"></rect>
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* TIME */}
                            <div className="appointment-form-group">
                                <label className="appointment-form-label">TIME</label>
                                <div className="appointment-input-wrapper">
                                    <select
                                        className="appointment-select"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    >
                                        <option value="" disabled>Email</option>
                                        <option value="10:30 AM - 12:00 PM">10:30 AM - 12:00 PM</option>
                                        <option value="12:00 PM - 01:30 PM">12:00 PM - 01:30 PM</option>
                                        <option value="02:30 PM - 04:00 PM">02:30 PM - 04:00 PM</option>
                                        <option value="04:00 PM - 05:30 PM">04:00 PM - 05:30 PM</option>
                                        <option value="05:30 PM - 07:00 PM">05:30 PM - 07:00 PM</option>
                                    </select>
                                    <span className="appointment-select-arrow">v</span>
                                </div>
                            </div>

                            {/* PURPOSE */}
                            <div className="appointment-form-group">
                                <label className="appointment-form-label">I WOULD LIKE TO BOOK AN APPOINTMENT TO:</label>
                                <div className="appointment-input-wrapper">
                                    <select
                                        className="appointment-select"
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    >
                                        <option value="Design a Jewellery Piece / Explore & Try on collection / Complain / Refund / Others">
                                            Design a Jewellery Piece / Explore &amp; Try on collection / Complain / Refund / Others
                                        </option>
                                        <option value="Bespoke Bridal Commission">Bespoke Bridal Commission</option>
                                        <option value="Explore & Try on Collection">Explore &amp; Try on Collection</option>
                                        <option value="Gold Hallmarking Verification">Gold Hallmarking Verification</option>
                                        <option value="Private Vault Consultation">Private Vault Consultation</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    <span className="appointment-select-arrow">v</span>
                                </div>
                            </div>

                            {/* TELL US NOTES */}
                            <div className="appointment-form-group" style={{ marginBottom: '1.25rem' }}>
                                <textarea
                                    rows="3"
                                    placeholder="Tell us..."
                                    className="appointment-textarea"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            {/* SUBMIT BUTTON */}
                            <div className="appointment-submit-row">
                                <button type="submit" className="appointment-submit-btn">
                                    BOOK AN APPOINTMENT
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Bottom Footer Bar */}
            <footer className="collection-bottom-bar light-theme">
                <Link href="/" className="bottom-brand">PINTAARA™</Link>
                <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
            </footer>

            <style jsx global>{`
                .appointment-page-root {
                    background-color: #F6F4EE;
                    min-height: 100vh;
                    color: #1A1A1A;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                /* ── TOP HEADER ── */
                .appointment-header {
                    width: 100%;
                    border-bottom: 1px solid #1A1A1A;
                    background-color: #F6F4EE;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .appointment-header-inner {
                    max-width: 1360px;
                    margin: 0 auto;
                    padding: 0.85rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .appointment-brand-logo {
                    font-family: "Cinzel", "Didot", "Bodoni MT", serif;
                    font-size: 1.35rem;
                    font-weight: 500;
                    letter-spacing: 0.24em;
                    color: #A07855;
                    text-decoration: none;
                }
                .appointment-nav-links {
                    display: flex;
                    gap: 2.5rem;
                }
                .appointment-nav-item {
                    font-size: 0.72rem;
                    font-weight: 500;
                    letter-spacing: 0.12em;
                    color: #1A1A1A;
                    text-decoration: none;
                    text-transform: uppercase;
                    transition: opacity 0.15s ease;
                }
                .appointment-nav-item:hover {
                    opacity: 0.65;
                }
                .appointment-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }
                .appointment-icon-btn {
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
                .appointment-icon-btn:hover {
                    opacity: 0.65;
                }
                .appointment-cart-btn {
                    position: relative;
                }
                .appointment-cart-badge {
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

                /* ── MAIN CONTAINER ── */
                .appointment-main-container {
                    max-width: 1360px;
                    margin: 0 auto;
                    padding: 2.8rem 2rem 3.5rem 2rem;
                    width: 100%;
                    flex: 1;
                }

                /* ── CONTENT GRID ── */
                .appointment-content-grid {
                    display: grid;
                    grid-template-columns: 310px 1fr;
                    gap: 5.5rem;
                    align-items: start;
                }

                /* ── LEFT INFO COLUMN ── */
                .appointment-info-column {
                    display: flex;
                    flex-direction: column;
                }
                .appointment-title-block {
                    margin-bottom: 2rem;
                }
                .appointment-page-title {
                    font-size: 1.55rem;
                    font-weight: 400;
                    letter-spacing: 0.04em;
                    color: #1A1A1A;
                    margin: 0;
                    line-height: 1.2;
                }
                .appointment-title-line {
                    width: 120px;
                    height: 1.5px;
                    background-color: #1A1A1A;
                    margin-top: 0.65rem;
                }

                .appointment-intro-text {
                    font-size: 0.83rem;
                    line-height: 1.6;
                    color: #383838;
                    margin-bottom: 2.4rem;
                }
                .appointment-intro-text p {
                    margin: 0;
                }

                .appointment-subheading {
                    font-size: 0.76rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    color: #4A4A4A;
                    margin: 0 0 0.4rem 0;
                    text-transform: uppercase;
                }
                .appointment-address {
                    font-size: 0.74rem;
                    line-height: 1.55;
                    color: #555555;
                    font-style: normal;
                    margin-bottom: 1.5rem;
                }

                .appointment-info-divider {
                    width: 120px;
                    height: 1px;
                    background-color: #1A1A1A;
                    margin-bottom: 1.5rem;
                }

                .appointment-hours-section {
                    margin-bottom: 1rem;
                }
                .appointment-hours {
                    font-size: 0.74rem;
                    line-height: 1.55;
                    color: #555555;
                    margin: 0;
                }

                /* ── RIGHT FORM COLUMN ── */
                .appointment-form-column {
                    display: flex;
                    flex-direction: column;
                    padding-top: 0.2rem;
                }
                .appointment-success-banner {
                    background-color: #1A1A1A;
                    color: #F6F4EE;
                    font-size: 0.8rem;
                    padding: 0.75rem 1.25rem;
                    margin-bottom: 1.25rem;
                    border-radius: 1px;
                    letter-spacing: 0.03em;
                }

                .appointment-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                }
                .appointment-form-group {
                    display: flex;
                    flex-direction: column;
                }
                .appointment-form-label {
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    color: #383838;
                    text-transform: uppercase;
                    margin-bottom: 0.35rem;
                }

                .appointment-input-wrapper {
                    position: relative;
                    width: 100%;
                    display: flex;
                    align-items: center;
                }
                .appointment-input, .appointment-select {
                    width: 100%;
                    height: 38px;
                    background-color: #F6F4EE;
                    border: 1px solid #777777;
                    border-radius: 1px;
                    padding: 0 2.2rem 0 0.85rem;
                    font-size: 0.8rem;
                    color: #1A1A1A;
                    outline: none;
                    transition: border-color 0.15s ease;
                    font-family: inherit;
                    -webkit-appearance: none;
                    appearance: none;
                }
                .appointment-input::placeholder {
                    color: #8E8E8E;
                    font-weight: 400;
                }
                .appointment-input:focus, .appointment-select:focus, .appointment-textarea:focus {
                    border-color: #1A1A1A;
                }

                .appointment-input-arrow {
                    position: absolute;
                    right: 14px;
                    font-size: 0.95rem;
                    color: #666666;
                    pointer-events: none;
                    font-family: monospace, sans-serif;
                }
                .appointment-select-arrow {
                    position: absolute;
                    right: 14px;
                    font-size: 0.75rem;
                    color: #555555;
                    pointer-events: none;
                    font-family: sans-serif;
                    transform: scaleY(0.75);
                }
                .appointment-calendar-icon {
                    position: absolute;
                    right: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                }

                .appointment-textarea {
                    width: 100%;
                    min-height: 85px;
                    background-color: #F6F4EE;
                    border: 1px solid #777777;
                    border-radius: 1px;
                    padding: 0.7rem 0.85rem;
                    font-size: 0.8rem;
                    color: #1A1A1A;
                    outline: none;
                    font-family: inherit;
                    resize: vertical;
                    transition: border-color 0.15s ease;
                }
                .appointment-textarea::placeholder {
                    color: #8E8E8E;
                }

                /* Submit Row */
                .appointment-submit-row {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 0.5rem;
                }
                .appointment-submit-btn {
                    height: 40px;
                    background-color: #1C1C1C;
                    color: #FFFFFF;
                    border: none;
                    border-radius: 1px;
                    font-size: 0.74rem;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    padding: 0 2rem;
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }
                .appointment-submit-btn:hover {
                    background-color: #333333;
                }

                /* ── BOTTOM DIVIDER & FOOTER ── */
                .appointment-divider-line {
                    width: 100%;
                    height: 1px;
                    background-color: #1A1A1A;
                }
                .appointment-footer {
                    max-width: 1360px;
                    margin: 0 auto;
                    width: 100%;
                    padding: 1.25rem 2rem 2.5rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.72rem;
                    letter-spacing: 0.08em;
                    color: #1A1A1A;
                }
                .appointment-footer-brand {
                    font-weight: 600;
                }
                .appointment-footer-copy {
                    font-weight: 400;
                    color: #444444;
                }

                @media (max-width: 900px) {
                    .appointment-content-grid {
                        grid-template-columns: 1fr;
                        gap: 3rem;
                    }
                    .appointment-nav-links {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
