'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RegionModal from '@/components/RegionModal';

export default function RegisterPage() {
    const router = useRouter();
    const { register, verifyOtp, resendOtp } = useAuth();
    const fileRef = useRef(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        id_proof_name: '',
        id_proof_file: null,
    });
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);
    const [isRegionOpen, setIsRegionOpen] = useState(false);
    const [isAccountCreated, setIsAccountCreated] = useState(false);

    // OTP Modal State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(60);
    const [devOtpHint, setDevOtpHint] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: null }));
        }
        if (name === 'email') {
            setEmailAlreadyExists(false);
        }
        if (error) setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, id_proof_file: file, id_proof_name: file.name }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setEmailAlreadyExists(false);

        if (!agreed) {
            setError('Please agree to the Terms of Use & Privacy Policy.');
            return;
        }

        setLoading(true);

        try {
            let payload;
            if (formData.id_proof_file) {
                payload = new FormData();
                payload.append('name', `${formData.first_name} ${formData.last_name}`.trim());
                payload.append('email', formData.email.trim());
                payload.append('password', formData.password);
                payload.append('password_confirmation', formData.password);
                payload.append('phone', formData.phone.trim());
                payload.append('id_proof_file', formData.id_proof_file);
                payload.append('id_proof_name', formData.id_proof_file.name);
            } else {
                payload = {
                    name: `${formData.first_name} ${formData.last_name}`.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    password_confirmation: formData.password,
                    phone: formData.phone.trim(),
                    id_proof_name: formData.id_proof_name || null,
                };
            }
            const res = await register(payload);

            if (res && res.data && res.data.requires_otp) {
                setShowOtpModal(true);
                setResendCooldown(res.data.cooldown_seconds || 60);
                if (res.data.dev_otp) setDevOtpHint(res.data.dev_otp);
            } else {
                setIsAccountCreated(true);
            }
        } catch (err) {
            const backendErrors = err.errors || {};
            setFieldErrors(backendErrors);

            const msg = err.message || 'Registration failed. Please check your information.';
            const isEmailTaken =
                (backendErrors?.email && backendErrors.email.some((e) => e.toLowerCase().includes('already'))) ||
                msg.toLowerCase().includes('already been taken') ||
                msg.toLowerCase().includes('already taken');

            if (isEmailTaken) {
                setEmailAlreadyExists(true);
                setError('An account with this email already exists.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otpCode.length < 6) {
            setOtpError('Please enter all 6 digits of the verification code.');
            return;
        }
        setOtpLoading(true);
        setOtpError('');
        try {
            await verifyOtp({
                email: formData.email.trim(),
                otp: otpCode,
                purpose: 'registration',
            });
            setShowOtpModal(false);
            setIsAccountCreated(true);
        } catch (err) {
            setOtpError(err.message || 'Invalid or expired OTP code.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        try {
            const res = await resendOtp({ email: formData.email.trim(), purpose: 'registration' });
            setResendCooldown(60);
            if (res?.data?.dev_otp) setDevOtpHint(res.data.dev_otp);
        } catch (err) {
            setOtpError(err.message || 'Failed to resend verification code.');
        }
    };

    return (
        <div className="auth-root">
            <header className="auth-header">
                <Link href="/" className="auth-logo">
                    <span className="header-logo-text">PINTAARA</span>
                    <img src="/images/mobile/logo-wordmark.png" alt="" aria-hidden="true" className="header-logo-img-mobile" />
                </Link>
                <button
                    type="button"
                    className="auth-globe-btn"
                    aria-label="Select Region"
                    onClick={() => setIsRegionOpen(true)}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                </button>
            </header>

            <RegionModal isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} />

            <main className="auth-center">
                <div className="auth-card">
                    {/* Butterfly Motif */}
                    <div className="auth-butterfly">
                        <img
                            src="/images/logo-butterfly-exact.png"
                            alt="Pintaara Butterfly"
                            style={{ width: '46px', height: '40px', objectFit: 'contain' }}
                        />
                    </div>

                    {isAccountCreated ? (
                        /* SUCCESS STATE: Customer Login_page-0003.jpg */
                        <div className="account-created-wrap">
                            <div className="success-checkmark">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#465440" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h1 className="auth-title">ACCOUNT CREATED</h1>
                            <p className="auth-subtitle">Welcome to PINTAARA</p>
                            <p className="account-created-desc">
                                Your account is ready while we verify the identification you provided.<br />
                                <strong>Until verification is completed, access to certain areas of the website may be temporarily limited.</strong>
                            </p>
                            <Link 
                                href={typeof window !== 'undefined' && window.location.search ? `/login${window.location.search}` : "/login"} 
                                className="auth-btn-primary success-btn"
                            >
                                SIGN IN
                            </Link>
                        </div>
                    ) : (
                        /* REGISTRATION FORM: Customer Login_page-0002.jpg */
                        <>
                            <h1 className="auth-title">CREATE ACCOUNT</h1>
                            <p className="auth-subtitle">A place for what becomes yours.</p>

                            {error && (
                                <div className="auth-alert-banner">
                                    <span className="auth-alert-text">{error}</span>
                                    {emailAlreadyExists && (
                                        <Link
                                            href={`/login?email=${encodeURIComponent(formData.email)}`}
                                            className="auth-alert-action"
                                        >
                                            Sign In to your account →
                                        </Link>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form-wide" noValidate>
                                <div className="auth-grid">
                                    {/* Left Column */}
                                    <div>
                                        <div className="auth-field">
                                            <label className="auth-label" htmlFor="reg-first-name">FIRST NAME</label>
                                            <input
                                                id="reg-first-name"
                                                className={`auth-input ${fieldErrors.first_name ? 'auth-input-has-error' : ''}`}
                                                type="text"
                                                name="first_name"
                                                required
                                                placeholder="As per ID Proof"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                            />
                                            {fieldErrors.first_name && (
                                                <span className="auth-field-error">{fieldErrors.first_name[0]}</span>
                                            )}
                                        </div>

                                        <div className="auth-field">
                                            <label className="auth-label" htmlFor="reg-last-name">LAST NAME</label>
                                            <input
                                                id="reg-last-name"
                                                className={`auth-input ${fieldErrors.last_name ? 'auth-input-has-error' : ''}`}
                                                type="text"
                                                name="last_name"
                                                required
                                                placeholder="As per ID Proof"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                            />
                                            {fieldErrors.last_name && (
                                                <span className="auth-field-error">{fieldErrors.last_name[0]}</span>
                                            )}
                                        </div>

                                        <div className="auth-field">
                                            <label className="auth-label" htmlFor="reg-contact">CONTACT</label>
                                            <input
                                                id="reg-contact"
                                                className={`auth-input ${fieldErrors.phone ? 'auth-input-has-error' : ''}`}
                                                type="tel"
                                                name="phone"
                                                placeholder="Mobile Number"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                            {fieldErrors.phone && (
                                                <span className="auth-field-error">{fieldErrors.phone[0]}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div>
                                        <div className="auth-field">
                                            <label className="auth-label" htmlFor="reg-email">EMAIL</label>
                                            <input
                                                id="reg-email"
                                                className={`auth-input ${fieldErrors.email || emailAlreadyExists ? 'auth-input-has-error' : ''}`}
                                                type="email"
                                                name="email"
                                                required
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                            {fieldErrors.email && (
                                                <span className="auth-field-error">{fieldErrors.email[0]}</span>
                                            )}
                                        </div>

                                        <div className="auth-field">
                                            <label className="auth-label" htmlFor="reg-password">PASSWORD</label>
                                            <input
                                                id="reg-password"
                                                className={`auth-input ${fieldErrors.password ? 'auth-input-has-error' : ''}`}
                                                type="password"
                                                name="password"
                                                required
                                                placeholder="Create new password"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                            {fieldErrors.password && (
                                                <span className="auth-field-error">{fieldErrors.password[0]}</span>
                                            )}
                                        </div>

                                        <div className="auth-field">
                                            <label className="auth-label" htmlFor="reg-id-proof">ID PROOF</label>
                                            <div className="auth-upload-group">
                                                <input
                                                    id="reg-id-proof"
                                                    className="auth-input auth-upload-input"
                                                    type="text"
                                                    readOnly
                                                    placeholder="Aadhar, Driver’s License, Passport"
                                                    value={formData.id_proof_name}
                                                    onClick={() => fileRef.current?.click()}
                                                />
                                                <button
                                                    type="button"
                                                    className="auth-upload-btn"
                                                    onClick={() => fileRef.current?.click()}
                                                    aria-label="Upload ID Proof"
                                                    title="Upload ID Document"
                                                >
                                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M4 17v2a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-2" />
                                                        <polyline points="7 9 12 4 17 9" />
                                                        <line x1="12" y1="4" x2="12" y2="15" />
                                                    </svg>
                                                </button>
                                                <input
                                                    ref={fileRef}
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    style={{ display: 'none' }}
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="auth-submit-wrap">
                                    <button
                                        id="register-submit-btn"
                                        type="submit"
                                        className="auth-btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'CREATING...' : 'CREATE'}
                                    </button>

                                    <div className="auth-terms-row" onClick={() => setAgreed(!agreed)}>
                                        <input
                                            id="reg-terms-checkbox"
                                            type="checkbox"
                                            className="auth-checkbox"
                                            checked={agreed}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setAgreed(e.target.checked);
                                                if (error) setError('');
                                            }}
                                        />
                                        <span className="auth-terms-text">
                                            I agree to the{' '}
                                            <a
                                                href="/terms-of-use"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="auth-terms-strong"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Terms of Use
                                            </a>
                                            {' & '}
                                            <a
                                                href="/privacy"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="auth-terms-strong"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Privacy Policy.
                                            </a>
                                        </span>
                                    </div>

                                    <p className="auth-login-link-row">
                                        Already have an account?{' '}
                                        <Link 
                                            href={typeof window !== 'undefined' && window.location.search ? `/login${window.location.search}` : "/login"} 
                                            className="auth-login-link"
                                        >
                                            Sign In
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </main>

            {/* Bottom Footer bar (same footer as every page) */}
            <footer className="collection-bottom-bar auth-footer">
                <span className="bottom-brand">PINTAARA™</span>
                <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
            </footer>

            {/* OTP VERIFICATION MODAL */}
            {showOtpModal && (
                <div className="otp-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowOtpModal(false); }}>
                    <div className="otp-modal-window">
                        <button className="otp-modal-x" onClick={() => setShowOtpModal(false)} aria-label="Close">✕</button>
                        <div className="otp-modal-content">
                            <h3 className="otp-modal-title">VERIFY YOUR EMAIL</h3>
                            <p className="otp-modal-desc">
                                Enter the 6-digit verification code sent to<br />
                                <strong style={{ color: '#111' }}>{formData.email}</strong>
                            </p>
                            {devOtpHint && (
                                <div className="dev-otp-box">
                                    Local Verification OTP: <strong>{devOtpHint}</strong>
                                </div>
                            )}
                            {otpError && <p className="auth-error-text">{otpError}</p>}
                            <form onSubmit={handleVerifyOtp}>
                                <div className="otp-inputs-row">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <input
                                            key={i}
                                            id={`reg-otp-${i}`}
                                            className="otp-digit-input"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={otpCode[i] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(-1);
                                                const next = otpCode.split('');
                                                while (next.length < 6) next.push('');
                                                next[i] = val;
                                                setOtpCode(next.join(''));
                                                if (val && i < 5) {
                                                    document.getElementById(`reg-otp-${i + 1}`)?.focus();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !otpCode[i] && i > 0) {
                                                    document.getElementById(`reg-otp-${i - 1}`)?.focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                                <button
                                    type="submit"
                                    className="auth-btn-primary"
                                    style={{ width: '100%', marginTop: '1.4rem', marginBottom: '0.8rem' }}
                                    disabled={otpLoading}
                                >
                                    {otpLoading ? 'VERIFYING...' : 'VERIFY & ACTIVATE'}
                                </button>
                                <div style={{ textAlign: 'center', fontSize: '12px', color: '#555' }}>
                                    Didn't receive code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: resendCooldown > 0 ? '#999' : '#111',
                                            fontWeight: 600,
                                            cursor: resendCooldown > 0 ? 'default' : 'pointer',
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                /* Chrome & Safari Autofill Reset */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 1000px #EFE8DE inset !important;
                    -webkit-text-fill-color: #111111 !important;
                    font-family: inherit !important;
                    transition: background-color 5000s ease-in-out 0s;
                }

                html, body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }

                .auth-root {
                    min-height: 100vh;
                    background-image: url('/images/auth-sand-bg.png');
                    background-size: cover;
                    background-position: center center;
                    background-repeat: no-repeat;
                    background-color: #DDD4C6;
                    display: flex;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }

                .auth-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 3.5rem;
                    border-bottom: 1px solid rgba(40, 30, 20, 0.45);
                    box-sizing: border-box;
                }

                .auth-logo {
                    font-family: "Cinzel", "Didot", "Bodoni MT", serif;
                    font-size: 1.35rem;
                    font-weight: 500;
                    letter-spacing: 0.24em;
                    color: #A07855;
                    text-decoration: none;
                }

                .auth-globe-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #2A2018;
                    display: flex;
                    align-items: center;
                    padding: 0;
                    transition: opacity 0.15s;
                }
                .auth-globe-btn:hover {
                    opacity: 0.65;
                }

                .auth-center {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.25rem 2rem;
                    box-sizing: border-box;
                }

                /* Semi-transparent cream card container matching reference design */
                .auth-card {
                    width: 100%;
                    max-width: 1120px;
                    background: rgba(244, 239, 231, 0.78);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    padding: 2.2rem 3.5rem 2rem 3.5rem;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .auth-butterfly {
                    margin-bottom: 0.75rem;
                    display: flex;
                    justify-content: center;
                }

                .auth-title {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-size: 1.85rem;
                    font-weight: 400;
                    letter-spacing: 0.12em;
                    color: #111111;
                    margin: 0 0 0.35rem 0;
                    text-align: center;
                    text-transform: uppercase;
                }

                .auth-subtitle {
                    font-size: 0.92rem;
                    font-weight: 300;
                    color: #1F1F1F;
                    margin: 0 0 1.5rem 0;
                    text-align: center;
                    letter-spacing: 0.02em;
                }

                /* Alert / Error Banner */
                .auth-alert-banner {
                    width: 100%;
                    max-width: 860px;
                    margin-bottom: 1.25rem;
                    padding: 0.65rem 1.1rem;
                    background: rgba(176, 42, 28, 0.08);
                    border: 1px solid rgba(176, 42, 28, 0.35);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.6rem;
                    box-sizing: border-box;
                }

                .auth-alert-text {
                    font-size: 0.84rem;
                    color: #8C1F14;
                    font-weight: 400;
                }

                .auth-alert-action {
                    font-size: 0.84rem;
                    color: #111111;
                    font-weight: 600;
                    text-decoration: underline;
                    transition: opacity 0.15s;
                }
                .auth-alert-action:hover {
                    opacity: 0.75;
                }

                .auth-form-wide {
                    width: 100%;
                    max-width: 860px;
                }

                .auth-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0 3rem;
                    margin-bottom: 1.35rem;
                }

                .auth-field {
                    margin-bottom: 1.1rem;
                    display: flex;
                    flex-direction: column;
                }

                .auth-label {
                    display: block;
                    font-size: 0.72rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    color: #111111;
                    text-transform: uppercase;
                    margin-bottom: 0.38rem;
                }

                .auth-input {
                    width: 100%;
                    border: 1px solid #1F1F1F;
                    background: transparent;
                    padding: 0.72rem 0.95rem;
                    font-size: 0.9rem;
                    font-weight: 300;
                    color: #111111;
                    outline: none;
                    box-sizing: border-box;
                    font-family: inherit;
                    transition: border-color 0.15s, background-color 0.15s;
                }

                .auth-input:focus {
                    border-color: #000000;
                    background: rgba(255, 255, 255, 0.25);
                }

                .auth-input-has-error {
                    border-color: #B02A1C !important;
                }

                .auth-field-error {
                    font-size: 0.72rem;
                    color: #B02A1C;
                    margin-top: 0.28rem;
                    font-weight: 400;
                }

                .auth-input::placeholder {
                    color: #847C74;
                    font-weight: 300;
                }

                /* ID Proof upload group */
                .auth-upload-group {
                    display: flex;
                    align-items: stretch;
                    width: 100%;
                }

                .auth-upload-input {
                    flex: 1;
                    cursor: pointer;
                    border-right: none;
                }

                .auth-upload-btn {
                    width: 48px;
                    background: #CDC1B4;
                    border: 1px solid #1F1F1F;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    transition: background 0.15s, opacity 0.15s;
                }

                .auth-upload-btn:hover {
                    background: #BEB1A3;
                }

                /* Submit section */
                .auth-submit-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: 0.3rem;
                }

                .auth-btn-primary {
                    width: 100%;
                    max-width: 420px;
                    background: #1A1A1A;
                    color: #FAF7F2;
                    border: 1px solid #1A1A1A;
                    padding: 0.85rem;
                    font-size: 0.82rem;
                    font-weight: 500;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    cursor: pointer;
                    margin-bottom: 0.85rem;
                    transition: background-color 0.15s;
                    font-family: inherit;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    box-sizing: border-box;
                }

                .auth-btn-primary:hover:not(:disabled) {
                    background: #000000;
                }

                .auth-btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .auth-terms-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.6rem;
                    cursor: pointer;
                    margin-bottom: 0.65rem;
                    user-select: none;
                }

                .auth-checkbox {
                    width: 15px;
                    height: 15px;
                    flex-shrink: 0;
                    accent-color: #1F1F1F;
                    cursor: pointer;
                }

                .auth-terms-text {
                    font-size: 0.82rem;
                    color: #2F2A24;
                    font-style: italic;
                    font-weight: 300;
                }

                .auth-terms-strong {
                    font-weight: 600;
                    font-style: italic;
                    color: #111111;
                    text-decoration: underline;
                }

                .auth-login-link-row {
                    font-size: 0.82rem;
                    color: #4A423A;
                    margin: 0;
                    text-align: center;
                }

                .auth-login-link {
                    color: #111111;
                    font-weight: 600;
                    text-decoration: underline;
                    margin-left: 0.25rem;
                }

                /* Account Created Screen (Customer Login_page-0003.jpg) */
                .account-created-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 1.5rem 1rem;
                    max-width: 720px;
                }

                .success-checkmark {
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .account-created-desc {
                    font-size: 0.95rem;
                    color: #2A241E;
                    line-height: 1.6;
                    margin: 1rem 0 2.5rem 0;
                    font-weight: 300;
                }

                .account-created-desc strong {
                    font-weight: 600;
                    color: #111111;
                }

                .success-btn {
                    max-width: 380px;
                }

                /* OTP Modal */
                .otp-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.65);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1rem;
                }

                .otp-modal-window {
                    background: #FAF7F2;
                    border: 1px solid #1F1F1F;
                    width: 100%;
                    max-width: 440px;
                    padding: 2.2rem 2rem;
                    position: relative;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.25);
                }

                .otp-modal-x {
                    position: absolute;
                    top: 14px;
                    right: 16px;
                    background: none;
                    border: none;
                    font-size: 16px;
                    color: #555;
                    cursor: pointer;
                }

                .otp-modal-title {
                    font-size: 1.25rem;
                    letter-spacing: 0.1em;
                    font-weight: 500;
                    text-align: center;
                    margin: 0 0 0.5rem 0;
                    color: #111;
                }

                .otp-modal-desc {
                    font-size: 0.88rem;
                    color: #555;
                    text-align: center;
                    margin: 0 0 1.5rem 0;
                    line-height: 1.4;
                }

                .dev-otp-box {
                    padding: 6px 12px;
                    background: rgba(212,175,55,0.15);
                    border: 1px solid rgba(212,175,55,0.4);
                    border-radius: 4px;
                    font-size: 12px;
                    color: #854d0e;
                    margin-bottom: 14px;
                    text-align: center;
                }

                .auth-error-text {
                    font-size: 0.8rem;
                    color: #b02a1c;
                    margin: 0 0 1rem 0;
                    text-align: center;
                }

                .otp-inputs-row {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                }

                .otp-digit-input {
                    width: 44px;
                    height: 52px;
                    text-align: center;
                    font-size: 1.4rem;
                    font-weight: 600;
                    border: 1px solid #1F1F1F;
                    background: transparent;
                    color: #111;
                    outline: none;
                }

                .otp-digit-input:focus {
                    border-color: #000;
                    background: rgba(255,255,255,0.8);
                }

                @media (max-width: 900px) {
                    .auth-card {
                        background: rgba(244, 239, 231, 0.92);
                        padding: 2.2rem 1.4rem;
                        width: 94%;
                    }
                    .auth-grid {
                        grid-template-columns: 1fr;
                        gap: 0;
                    }
                    .auth-header {
                        padding: 1rem 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
