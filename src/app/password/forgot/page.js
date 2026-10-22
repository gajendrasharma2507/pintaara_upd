'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
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
    const [infoMessage, setInfoMessage] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [isResending, setIsResending] = useState(false);
    const [isRegionOpen, setIsRegionOpen] = useState(false);

    const otpRefs = useRef([]);

    // Timer countdown for resend
    useEffect(() => {
        let interval;
        if (step === 2 && resendTimer > 0) {
            interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
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
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            setError('Please enter your registered email address.');
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.forgotPassword({ email: cleanEmail });
            setStep(2);
            setResendTimer(res?.cooldown_seconds || 60);
            setInfoMessage(res?.message || `A 6-digit verification code has been dispatched to ${cleanEmail}.`);
        } catch (err) {
            setError(err.message || 'Unable to dispatch reset code. Please check your email and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');

        const code = otp.join('').trim();
        if (code.length < 6) {
            setError('Please enter all 6 digits of the verification code.');
            return;
        }

        setLoading(true);
        try {
            await api.verifyOtp({
                email: email.trim().toLowerCase(),
                otp: code,
                purpose: 'password_reset',
            });
            setStep(3);
        } catch (err) {
            setError(err.message || 'Invalid or expired verification code. Please request a new code.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Resend OTP
    const handleResendOtp = async () => {
        if (resendTimer > 0 || isResending) return;
        setError('');
        setInfoMessage('');
        setIsResending(true);

        try {
            const res = await api.resendOtp({
                email: email.trim().toLowerCase(),
                purpose: 'password_reset',
            });
            setResendTimer(res?.data?.cooldown_seconds || 60);
            setInfoMessage(res?.message || 'A new verification code has been dispatched to your email.');
        } catch (err) {
            setError(err.message || 'Failed to resend code. Please try again shortly.');
        } finally {
            setIsResending(false);
        }
    };

    // Step 3: Reset Password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match. Please re-enter.');
            return;
        }

        const code = otp.join('').trim();
        setLoading(true);
        try {
            await api.resetPassword({
                email: email.trim().toLowerCase(),
                otp: code,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            setStep(4);
        } catch (err) {
            setError(err.message || 'Could not reset password. Please request a new code if expired.');
        } finally {
            setLoading(false);
        }
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
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                </button>
            </header>

            <RegionModal isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} />

            {/* Main Center Area */}
            <main className="auth-center">
                <div className="auth-card">
                    {/* Exact Rose Gold Butterfly Logo */}
                    <div className="auth-butterfly">
                        <img
                            src="/images/logo-butterfly-exact.png"
                            alt="Pintaara Butterfly"
                            style={{ width: '48px', height: '42px', objectFit: 'contain' }}
                        />
                    </div>

                    {/* Messages */}
                    {error && <p className="auth-error">{error}</p>}
                    {infoMessage && <p className="auth-info">{infoMessage}</p>}

                    {/* ── STEP 1: ENTER EMAIL ── */}
                    {step === 1 && (
                        <>
                            <h1 className="auth-title">FORGOT PASSWORD?</h1>
                            <p className="auth-subtitle">
                                Enter your registered email address to receive a 6-digit verification code.
                            </p>

                            <form onSubmit={handleEmailSubmit} className="auth-form" noValidate>
                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="forgot-email">EMAIL ADDRESS</label>
                                    <input
                                        id="forgot-email"
                                        className="auth-input"
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (error) setError('');
                                        }}
                                        autoComplete="email"
                                    />
                                </div>

                                <button type="submit" className="auth-btn-primary" disabled={loading}>
                                    {loading ? 'SENDING CODE...' : 'CONTINUE'}
                                </button>

                                <div className="auth-back-row">
                                    <Link href="/login" className="auth-secondary-link">
                                        Back to Sign In
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}

                    {/* ── STEP 2: VERIFY OTP ── */}
                    {step === 2 && (
                        <>
                            <h1 className="auth-title auth-title-with-sub">VERIFY IT&apos;S YOU</h1>
                            <p className="auth-subtitle">
                                Enter the 6-digit code sent to <strong className="auth-email-highlight">{email}</strong>
                            </p>

                            <div className="auth-change-email-row">
                                <button
                                    type="button"
                                    className="auth-change-email-btn"
                                    onClick={() => {
                                        setStep(1);
                                        setError('');
                                        setInfoMessage('');
                                    }}
                                >
                                    Wrong email? Change email
                                </button>
                            </div>

                            <form onSubmit={handleOtpSubmit} className="auth-form">
                                <div className="auth-field">
                                    <label className="auth-label">6-DIGIT VERIFICATION CODE</label>
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
                                                onChange={(e) => {
                                                    handleOtpChange(idx, e.target.value);
                                                    if (error) setError('');
                                                }}
                                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                                autoFocus={idx === 0}
                                                style={{ minWidth: 0 }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="auth-resend-row">
                                    {resendTimer > 0 ? (
                                        <span className="auth-resend-timer">
                                            Resend code in {resendTimer}s
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="auth-resend-btn"
                                            onClick={handleResendOtp}
                                            disabled={isResending}
                                        >
                                            {isResending ? 'RESENDING...' : 'RESEND CODE'}
                                        </button>
                                    )}
                                </div>

                                <button type="submit" className="auth-btn-primary" disabled={loading}>
                                    {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP 3: RESET PASSWORD ── */}
                    {step === 3 && (
                        <>
                            <h1 className="auth-title">CREATE NEW PASSWORD</h1>
                            <p className="auth-subtitle">
                                Your identity has been verified. Choose a new secure password.
                            </p>

                            <form onSubmit={handlePasswordSubmit} className="auth-form">
                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="new-pass">NEW PASSWORD</label>
                                    <input
                                        id="new-pass"
                                        className="auth-input"
                                        type="password"
                                        required
                                        placeholder="At least 8 characters"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (error) setError('');
                                        }}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="confirm-pass">CONFIRM NEW PASSWORD</label>
                                    <input
                                        id="confirm-pass"
                                        className="auth-input"
                                        type="password"
                                        required
                                        placeholder="Re-enter your new password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (error) setError('');
                                        }}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <button type="submit" className="auth-btn-primary" disabled={loading}>
                                    {loading ? 'UPDATING PASSWORD...' : 'RESET PASSWORD'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP 4: SUCCESS ── */}
                    {step === 4 && (
                        <div className="auth-success-flow">
                            <div className="auth-check-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2D5A27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h1 className="auth-title auth-title-success">NEW PASSWORD CREATED</h1>
                            <p className="auth-subtitle">
                                Your password has been successfully updated. You may now sign in with your new credentials.
                            </p>

                            <Link href="/login" className="auth-btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                                SIGN IN
                            </Link>
                        </div>
                    )}
                </div>
            </main>

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
                    padding: 1.15rem 3.5rem;
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
                    padding: 2.5rem 2rem;
                    box-sizing: border-box;
                }
                .auth-card {
                    width: 100%;
                    max-width: 1180px;
                    background: rgba(244, 239, 231, 0.78);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    padding: 3.5rem 4rem;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .auth-butterfly {
                    margin-bottom: 1.25rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .auth-title {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-size: 1.65rem;
                    font-weight: 400;
                    letter-spacing: 0.14em;
                    color: #1A1A1A;
                    margin: 0 0 0.6rem 0;
                    text-align: center;
                    text-transform: uppercase;
                }
                .auth-title-with-sub {
                    margin: 0 0 0.5rem 0;
                }
                .auth-title-success {
                    margin: 1rem 0 0.5rem 0;
                }
                .auth-subtitle {
                    font-size: 0.88rem;
                    font-weight: 300;
                    color: #38322C;
                    margin: 0 0 2rem 0;
                    text-align: center;
                    letter-spacing: 0.02em;
                    max-width: 440px;
                    line-height: 1.5;
                }
                .auth-email-highlight {
                    font-weight: 600;
                    color: #111;
                }
                .auth-change-email-row {
                    margin: -1.2rem 0 1.5rem 0;
                    text-align: center;
                }
                .auth-change-email-btn {
                    background: none;
                    border: none;
                    font-size: 0.8rem;
                    color: #8C6A48;
                    text-decoration: underline;
                    cursor: pointer;
                    letter-spacing: 0.03em;
                    padding: 0;
                }
                .auth-change-email-btn:hover {
                    color: #111;
                }
                .auth-error {
                    font-size: 0.82rem;
                    color: #b02a1c;
                    background: rgba(176, 42, 28, 0.08);
                    border: 1px solid rgba(176, 42, 28, 0.25);
                    padding: 0.6rem 1rem;
                    margin: 0 0 1.4rem 0;
                    text-align: center;
                    width: 100%;
                    max-width: 380px;
                    box-sizing: border-box;
                }
                .auth-info {
                    font-size: 0.82rem;
                    color: #2D5A27;
                    background: rgba(45, 90, 39, 0.08);
                    border: 1px solid rgba(45, 90, 39, 0.25);
                    padding: 0.6rem 1rem;
                    margin: 0 0 1.4rem 0;
                    text-align: center;
                    width: 100%;
                    max-width: 380px;
                    box-sizing: border-box;
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
                    transition: border-color 0.15s, background-color 0.15s;
                }
                .auth-input:focus {
                    border-color: #000000;
                    background: rgba(255, 255, 255, 0.25) !important;
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
                    height: 48px !important;
                    text-align: center;
                    font-size: 1.25rem;
                    font-weight: 500;
                    border: 1px solid #1F1F1F !important;
                    background: transparent !important;
                    color: #111111;
                    outline: none;
                    box-sizing: border-box;
                    border-radius: 0;
                    padding: 0;
                    transition: border-color 0.15s, background-color 0.15s;
                }
                .auth-otp-box:focus {
                    border-color: #000000 !important;
                    background: rgba(255, 255, 255, 0.4) !important;
                }
                .auth-resend-row {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 0.6rem;
                }
                .auth-resend-timer {
                    font-size: 0.76rem;
                    color: #7A726A;
                    letter-spacing: 0.05em;
                }
                .auth-resend-btn {
                    background: none;
                    border: none;
                    font-size: 0.76rem;
                    letter-spacing: 0.08em;
                    color: #1F1F1F;
                    text-decoration: underline;
                    cursor: pointer;
                    padding: 0;
                    font-weight: 500;
                }
                .auth-resend-btn:hover:not(:disabled) {
                    color: #000;
                }
                .auth-resend-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
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
                    margin-top: 2rem;
                    margin-bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    border-radius: 0;
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
                .auth-back-row {
                    margin-top: 1.5rem;
                    text-align: center;
                }
                .auth-secondary-link {
                    font-size: 0.78rem;
                    letter-spacing: 0.08em;
                    color: #554D45;
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .auth-secondary-link:hover {
                    color: #000;
                    text-decoration: underline;
                }
                .auth-success-flow {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    max-width: 400px;
                    margin: 0 auto;
                    text-align: center;
                }
                .auth-check-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: rgba(45, 90, 39, 0.12);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.25rem;
                }
                @media (max-width: 900px) {
                    .auth-card {
                        background: rgba(244, 239, 231, 0.92);
                        padding: 2.5rem 1.5rem;
                        max-width: 94%;
                    }
                    .auth-header {
                        padding: 1rem 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
