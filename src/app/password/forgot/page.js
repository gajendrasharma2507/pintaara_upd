'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RegionModal from '@/components/RegionModal';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(45);
    const [isRegionOpen, setIsRegionOpen] = useState(false);

    const otpRefs = useRef([]);

    // Timer countdown for resend
    useEffect(() => {
        let interval;
        if (step === 2 && resendTimer > 0) {
            interval = setInterval(() => setResendTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, resendTimer]);

    // Handle OTP typing & paste
    const handleOtpChange = (index, value) => {
        const raw = value.replace(/\D/g, '');
        if (raw.length > 1) {
            // User pasted multi-digit code
            const digits = raw.slice(0, 6).split('');
            const updated = [...otp];
            digits.forEach((d, i) => {
                if (index + i < 6) updated[index + i] = d;
            });
            setOtp(updated);
            const nextIdx = Math.min(5, index + digits.length);
            otpRefs.current[nextIdx]?.focus();
            return;
        }

        const val = raw.slice(-1);
        const updated = [...otp];
        updated[index] = val;
        setOtp(updated);

        if (val && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                otpRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            otpRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // Step 1: Submit Email
    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('Please enter your registered email address.');
            return;
        }
        setError('');
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            setResendTimer(45);
        }, 600);
    };

    // Step 2: Verify OTP
    const handleOtpSubmit = (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter all 6 digits of the code.');
            return;
        }
        setError('');
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(3);
        }, 600);
    };

    // Step 3: Reset Password
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(4);
        }, 600);
    };

    return (
        <div className="auth-root">
            {/* Header */}
            <header className="auth-header">
                <Link href="/" className="auth-logo">
                    <span className="header-logo-text">PINTAARA</span>
                </Link>
                <button
                    type="button"
                    className="auth-globe-btn"
                    aria-label="Select Region"
                    onClick={() => setIsRegionOpen(true)}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                </button>
            </header>

            <RegionModal isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} />

            {/* Main Center Area */}
            <main className="auth-center">
                <div className="auth-card">
                    {/* Rose gold butterfly logo */}
                    <div className="auth-butterfly">
                        <img
                            src="/images/logo-butterfly.png"
                            alt="Pintaara Butterfly"
                            style={{ width: '48px', height: '42px', objectFit: 'contain' }}
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    {/* ── STEP 1: ENTER EMAIL (Page 0004) ── */}
                    {step === 1 && (
                        <>
                            <h1 className="auth-title">FORGOT PASSWORD?</h1>

                            <form onSubmit={handleEmailSubmit} className="auth-form">
                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="forgot-email">ENTER EMAIL OR MOBILE NUMBER</label>
                                    <input
                                        id="forgot-email"
                                        className="auth-input"
                                        type="text"
                                        required
                                        placeholder="Enter your email or mobile number"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className="auth-btn-primary" disabled={loading}>
                                    {loading ? 'CONTINUING...' : 'CONTINUE'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP 2: VERIFY OTP (Page 0005) ── */}
                    {step === 2 && (
                        <>
                            <h1 className="auth-title auth-title-with-sub">FORGOT PASSWORD?</h1>
                            <p className="auth-subtitle">
                                Enter the 6-digit code sent to your email / Mobile Number
                            </p>

                            <form onSubmit={handleOtpSubmit} className="auth-form">
                                <div className="auth-field">
                                    <label className="auth-label">VERIFY IT'S YOU</label>
                                    <div className="auth-otp-grid">
                                        {otp.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                ref={(el) => { otpRefs.current[idx] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                size={1}
                                                className="auth-otp-box"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                                autoFocus={idx === 0}
                                                style={{ minWidth: 0 }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="auth-btn-primary" disabled={loading}>
                                    {loading ? 'VERIFYING...' : 'VERIFY'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP 3: RESET PASSWORD (Page 0006) ── */}
                    {step === 3 && (
                        <>
                            <h1 className="auth-title">FORGOT PASSWORD?</h1>

                            <form onSubmit={handlePasswordSubmit} className="auth-form">
                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="new-pass">NEW PASSWORD</label>
                                    <input
                                        id="new-pass"
                                        className="auth-input"
                                        type="password"
                                        required
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="confirm-pass">CONFIRM NEW PASSWORD</label>
                                    <input
                                        id="confirm-pass"
                                        className="auth-input"
                                        type="password"
                                        required
                                        placeholder="Re-enter New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className="auth-btn-primary" disabled={loading}>
                                    {loading ? 'CONTINUING...' : 'CONTINUE'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP 4: SUCCESS (Page 0007) ── */}
                    {step === 4 && (
                        <div className="auth-success-flow">
                            <div className="auth-check-icon">
                                <svg width="44" height="34" viewBox="0 0 24 24" fill="none" stroke="#5C6642" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <h1 className="auth-title auth-title-success">NEW PASSWORD CREATED</h1>

                            <Link href="/login" className="auth-btn-primary">
                                SIGN IN
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <style jsx global>{`
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
                    font-family: var(--font-body, "Montserrat", -apple-system, sans-serif);
                }
                .auth-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.15rem 3.5rem;
                    border-bottom: 1px solid rgba(40, 30, 20, 0.45);
                }
                .auth-logo {
                    font-family: var(--font-logo, "Bodoni Moda", serif);
                    font-size: 1.35rem;
                    font-weight: 500;
                    letter-spacing: 0.24em;
                    color: #A07855;
                    text-decoration: none;
                }
                .auth-globe-btn {
                    background: none; border: none; cursor: pointer;
                    color: #2A2018; display: flex; align-items: center;
                    padding: 0; transition: opacity 0.15s;
                }
                .auth-globe-btn:hover { opacity: 0.65; }
                .auth-center {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem 1rem;
                }
                .auth-card {
                    width: 100%;
                    max-width: 1200px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem 1rem 2.5rem 1rem;
                    box-sizing: border-box;
                }
                .auth-butterfly {
                    margin-bottom: 1.5rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .auth-title {
                    font-family: var(--font-body, "Montserrat", sans-serif);
                    font-size: 1.65rem;
                    font-weight: 400;
                    letter-spacing: 0.14em;
                    color: #1A1A1A;
                    margin: 0 0 2.2rem 0;
                    text-align: center;
                    text-transform: uppercase;
                }
                .auth-title-with-sub {
                    margin: 0 0 0.5rem 0;
                }
                .auth-title-success {
                    margin: 1.2rem 0 0 0;
                }
                .auth-subtitle {
                    font-family: var(--font-body, "Montserrat", sans-serif);
                    font-size: 0.88rem;
                    font-weight: 300;
                    color: #38322C;
                    margin: 0 0 2.2rem 0;
                    text-align: center;
                    letter-spacing: 0.02em;
                }
                .auth-error {
                    font-size: 0.8rem;
                    color: #b02a1c;
                    margin: 0 0 1.2rem 0;
                    text-align: center;
                }
                .auth-form {
                    width: 100%;
                    max-width: 380px;
                    margin: 0 auto;
                    box-sizing: border-box;
                }
                .auth-field {
                    margin-bottom: 1.4rem;
                    width: 100%;
                    box-sizing: border-box;
                }
                .auth-label {
                    display: block;
                    font-family: var(--font-body, "Montserrat", sans-serif);
                    font-size: 0.68rem;
                    font-weight: 500;
                    letter-spacing: 0.1em;
                    color: #1E1A16;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                    text-align: left;
                }
                .auth-input {
                    width: 100%;
                    height: 46px;
                    border: 1px solid #1F1F1F;
                    background: transparent !important;
                    padding: 0 1rem;
                    font-size: 0.88rem;
                    font-weight: 300;
                    color: #111111;
                    outline: none;
                    box-sizing: border-box;
                    border-radius: 0;
                    font-family: var(--font-body, "Montserrat", sans-serif);
                    transition: border-color 0.15s, background-color 0.15s;
                }
                .auth-input:focus {
                    border-color: #000000;
                    background: rgba(255, 255, 255, 0.15) !important;
                }
                .auth-input::placeholder {
                    color: #8A8177;
                    font-weight: 300;
                }
                /* OTP 6-box grid */
                .auth-otp-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 10px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .auth-otp-box {
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                    height: 46px !important;
                    text-align: center;
                    font-size: 1.15rem;
                    font-weight: 500;
                    border: 1px solid #1F1F1F !important;
                    background: transparent !important;
                    color: #111111;
                    outline: none;
                    box-sizing: border-box;
                    border-radius: 0;
                    padding: 0;
                    font-family: var(--font-body, "Montserrat", sans-serif);
                    transition: border-color 0.15s, background-color 0.15s;
                }
                .auth-otp-box:focus {
                    border-color: #000000 !important;
                    background: rgba(255, 255, 255, 0.2) !important;
                }
                .auth-btn-primary {
                    width: 100%;
                    height: 46px;
                    background: #1F1F1F;
                    color: #F8F6F0;
                    border: 1px solid #1F1F1F;
                    font-size: 0.78rem;
                    font-weight: 500;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                    cursor: pointer;
                    margin-top: 2.4rem;
                    margin-bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    border-radius: 0;
                    font-family: var(--font-body, "Montserrat", sans-serif);
                    transition: background-color 0.15s, border-color 0.15s;
                    text-decoration: none;
                }
                .auth-btn-primary:hover:not(:disabled) {
                    background: #000000;
                    border-color: #000000;
                }
                .auth-btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .auth-success-flow {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    max-width: 380px;
                    margin: 0 auto;
                }
                .auth-check-icon {
                    margin-bottom: 0.8rem;
                    display: flex;
                    justify-content: center;
                }
                @media (max-width: 900px) {
                    .auth-card {
                        background: rgba(240, 235, 227, 0.88);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        padding: 2.5rem 1.5rem;
                        max-width: 92%;
                    }
                    .auth-header { padding: 1rem 1.5rem; }
                }
            `}</style>
        </div>
    );
}
