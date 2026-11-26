    "use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function BookAppointmentPage() {
    const router = useRouter();
    const { user } = useAuth();

    const handleNavigate = (index) => {
        const slideIds = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7'];
        if (slideIds[index]) {
            router.push(`/#${slideIds[index]}`);
        }
    };
    const [formData, setFormData] = useState({
        fullName: '',
        contact: '',
        email: '',
        date: '',
        time: '',
        purpose: 'Design a Jewellery Piece',
        notes: ''
    });
    const [bookingModal, setBookingModal] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');
        const submittedInfo = {
            ...formData,
            email: user?.email || formData.email,
        };
        try {
            await apiFetch('/appointments', {
                method: 'POST',
                body: JSON.stringify(submittedInfo),
            });
            setBookingModal(submittedInfo);
            setFormData({
                fullName: '',
                contact: '',
                email: '',
                date: '',
                time: '',
                purpose: 'Design a Jewellery Piece',
                notes: ''
            });
        } catch (err) {
            setSubmitError(err?.message || 'Unable to book appointment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="appointment-page-root">
            <Header headerStyle="dark" onNavigate={handleNavigate} />

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
                        {submitError && (
                            <div className="appointment-success-banner" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}>
                                {submitError}
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

                            {/* EMAIL (Only shown for guests who are not logged in) */}
                            {!user && (
                                <div className="appointment-form-group">
                                    <label className="appointment-form-label">EMAIL</label>
                                    <div className="appointment-input-wrapper">
                                        <input
                                            type="email"
                                            required
                                            placeholder="Email Address"
                                            className="appointment-input"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                        <span className="appointment-input-arrow">&gt;</span>
                                    </div>
                                </div>
                            )}

                            {/* DATE */}
                            <div className="appointment-form-group">
                                <label className="appointment-form-label">DATE</label>
                                <div className="appointment-input-wrapper">
                                    <input
                                        type="text"
                                        required
                                        placeholder="yyyy/mm/dd"
                                        pattern="\d{4}/\d{2}/\d{2}"
                                        title="Enter date in yyyy/mm/dd format"
                                        className="appointment-input"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                    <input
                                        type="date"
                                        aria-label="Choose appointment date"
                                        value={/^\d{4}\/\d{2}\/\d{2}$/.test(formData.date) ? formData.date.replace(/\//g, '-') : ''}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setFormData({ ...formData, date: e.target.value.replace(/-/g, '/') });
                                            }
                                        }}
                                        style={{
                                            position: 'absolute',
                                            right: '6px',
                                            width: '30px',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer',
                                            zIndex: 3,
                                        }}
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
                                        required
                                        className="appointment-select"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    >
                                        <option value="" disabled>Select a time</option>
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
                                        <option value="Design a Jewellery Piece">Design a Jewellery Piece</option>
                                        <option value="Explore & Try on collection">Explore &amp; Try on collection</option>
                                        <option value="Complain">Complain</option>
                                        <option value="Refund">Refund</option>
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
                                <button type="submit" disabled={isSubmitting} className="appointment-submit-btn">
                                    {isSubmitting ? 'BOOKING...' : 'BOOK AN APPOINTMENT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Bottom Footer Bar */}
            <footer className="collection-bottom-bar">
                <span className="bottom-brand">PINTAARA™</span>
                <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
            </footer>

            <style jsx global>{`
                .appointment-page-root {
                    background-color: #F6F4EE;
                    min-height: 100vh;
                    color: #1A1A1A;
                    font-family: var(--font-body);
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
                    padding: calc(var(--header-height) + 2.8rem) 2rem 3.5rem 2rem;
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
                .appointment-input[type="date"]::-webkit-calendar-picker-indicator {
                    opacity: 0;
                    position: absolute;
                    right: 10px;
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                    z-index: 2;
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

                .appt-success-backdrop {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 1.5rem;
                }
                .appt-success-modal-box {
                    width: 100%;
                    max-width: 480px;
                    background-color: #F5F2EB;
                    padding: 3rem 2.5rem 2.5rem 2.5rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.06);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                .appt-success-close-x {
                    position: absolute;
                    top: 1.25rem;
                    right: 1.25rem;
                    background: transparent;
                    border: none;
                    font-size: 1.15rem;
                    color: #1A1A1A;
                    cursor: pointer;
                    padding: 4px 8px;
                    line-height: 1;
                }
                .appt-success-close-x:hover {
                    opacity: 0.7;
                }
                .appt-success-check-icon {
                    margin-bottom: 1.5rem;
                }
                .appt-success-heading {
                    font-size: 1.05rem;
                    font-weight: 500;
                    letter-spacing: 0.06em;
                    color: #1A1A1A;
                    margin: 0 0 1.8rem 0;
                    text-transform: uppercase;
                }
                .appt-success-preview-card {
                    width: 100%;
                    background-color: #FAF7F2;
                    border-radius: 20px;
                    padding: 1.6rem 2rem;
                    text-align: left;
                    margin-bottom: 2rem;
                    box-sizing: border-box;
                }
                .appt-success-tag {
                    font-size: 0.95rem;
                    font-weight: 500;
                    letter-spacing: 0.05em;
                    color: #1A1A1A;
                    margin-bottom: 0.8rem;
                    text-transform: uppercase;
                }
                .appt-success-text {
                    font-size: 0.88rem;
                    color: #1A1A1A;
                    line-height: 1.45;
                }
                .appt-success-done-btn {
                    width: 100%;
                    height: 46px;
                    background-color: #1A1A1A;
                    color: #F5F2EB;
                    border: 1px solid #1A1A1A;
                    font-family: var(--font-body), sans-serif;
                    font-size: 0.84rem;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: opacity 0.15s ease;
                }
                .appt-success-done-btn:hover {
                    opacity: 0.88;
                }
            `}</style>

            {bookingModal && (
                <div className="appt-success-backdrop" onClick={() => setBookingModal(null)}>
                    <div className="appt-success-modal-box" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="appt-success-close-x"
                            aria-label="Close"
                            onClick={() => setBookingModal(null)}
                        >
                            ✕
                        </button>

                        <div className="appt-success-check-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <polyline points="20 6 9 17 4 12" stroke="#7B7D50" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <h3 className="appt-success-heading">BOOK AN APPOINTMENT</h3>

                        <div className="appt-success-preview-card">
                            <div className="appt-success-tag">{bookingModal.purpose || 'APPOINTMENT'}</div>
                            <div className="appt-success-text">{bookingModal.fullName}</div>
                            <div className="appt-success-text">
                                {bookingModal.date}{bookingModal.time ? ` · ${bookingModal.time}` : ''}
                            </div>
                            <div className="appt-success-text">{bookingModal.contact}</div>
                            {bookingModal.email && (
                                <div className="appt-success-text">{bookingModal.email}</div>
                            )}
                            {bookingModal.notes && (
                                <div className="appt-success-text" style={{ marginTop: '0.5rem', color: '#555' }}>
                                    {bookingModal.notes}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className="appt-success-done-btn"
                            onClick={() => setBookingModal(null)}
                        >
                            DONE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
