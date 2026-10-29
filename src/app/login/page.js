'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RegionModal from '@/components/RegionModal';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRegionOpen, setIsRegionOpen] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const user = await login(formData);
            let targetDestination = user?.role === 'admin' ? '/admin/dashboard' : '/account';
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                const redirectPath = params.get('redirect');
                if (redirectPath && redirectPath.startsWith('/')) {
                    targetDestination = redirectPath;
                }
            }
            router.push(targetDestination);
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <header className="auth-header">
                <Link href="/" className="auth-logo">
                    <span className="header-logo-text">PINTAARA</span>
                    <img src="/images/mobile/logo-wordmark.png" alt="" aria-hidden="true" className="header-logo-img-mobile" />
                </Link>
                <button type="button" className="auth-globe-btn" aria-label="Select Region" onClick={() => setIsRegionOpen(true)}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                </button>
            </header>

            <RegionModal isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} />

            <main className="auth-center">
                <div className="auth-card">
                    <div className="auth-butterfly">
                        <img src="/images/logo-butterfly-exact.png" alt="Pintaara Butterfly" style={{ width: '48px', height: '42px', objectFit: 'contain' }} />
                    </div>
                    <h1 className="auth-title">WELCOME</h1>
                    <p className="auth-subtitle">What you chose to make yours - lives here.</p>

                    {error && <p className="auth-error">{error}</p>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="login-email">EMAIL</label>
                            <input id="login-email" className="auth-input" type="email" name="email" required placeholder="Enter your email" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="login-password">PASSWORD</label>
                            <input id="login-password" className="auth-input" type="password" name="password" required placeholder="Enter your password" value={formData.password} onChange={handleChange} />
                            <div className="auth-forgot-row">
                                <Link href="/password/forgot" className="auth-forgot-link">Forgot your password?</Link>
                            </div>
                        </div>
                        <button id="login-submit-btn" type="submit" className="auth-btn-primary" disabled={loading}>
                            {loading ? 'SIGNING IN...' : 'SIGN IN'}
                        </button>
                        <Link 
                            href={typeof window !== 'undefined' && window.location.search ? `/register${window.location.search}` : "/register"} 
                            className="auth-btn-secondary"
                        >
                            CREATE ACCOUNT
                        </Link>
                    </form>
                </div>
            </main>

            {/* Bottom Footer bar (same footer as every page) */}
            <footer className="collection-bottom-bar auth-footer">
                <span className="bottom-brand">PINTAARA™</span>
                <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
            </footer>

            <style jsx global>{`
                /* Chrome & Safari Autofill Reset to prevent pale blue background */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 1000px #EFE8DE inset !important;
                    -webkit-text-fill-color: #111111 !important;
                    font-family: inherit !important;
                    transition: background-color 5000s ease-in-out 0s;
                }

                html, body { height: 100%; margin: 0; padding: 0; }
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
                    padding: 2.5rem 2rem;
                    box-sizing: border-box;
                }
                .auth-card {
                    width: 100%;
                    max-width: 1180px;
                    background: rgba(244, 239, 231, 0.78);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    padding: 3.5rem 4rem 3.5rem 4rem;
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
                }
                .auth-title {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-size: 2.1rem;
                    font-weight: 400;
                    letter-spacing: 0.12em;
                    color: #111111;
                    margin: 0 0 0.5rem 0;
                    text-align: center;
                }
                .auth-subtitle {
                    font-size: 0.95rem;
                    font-weight: 300;
                    color: #1F1F1F;
                    margin: 0 0 2.8rem 0;
                    text-align: center;
                    letter-spacing: 0.02em;
                }
                .auth-error {
                    font-size: 0.8rem;
                    color: #b02a1c;
                    margin: 0 0 1.2rem 0;
                    text-align: center;
                }
                .auth-form { width: 100%; max-width: 440px; }
                .auth-field { margin-bottom: 1.35rem; }
                .auth-label {
                    display: block;
                    font-size: 0.74rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    color: #111111;
                    text-transform: uppercase;
                    margin-bottom: 0.45rem;
                }
                .auth-input {
                    width: 100%;
                    border: 1px solid #1F1F1F;
                    background: transparent !important;
                    padding: 0.82rem 1rem;
                    font-size: 0.92rem;
                    font-weight: 300;
                    color: #111111;
                    outline: none;
                    box-sizing: border-box;
                    font-family: inherit;
                    transition: border-color 0.15s, background-color 0.15s;
                }
                .auth-input:focus { border-color: #000000; background: rgba(255, 255, 255, 0.1) !important; }
                .auth-input::placeholder { color: #867F77; font-weight: 300; }
                .auth-forgot-row { display: flex; justify-content: flex-end; margin-top: 0.45rem; }
                .auth-forgot-link {
                    font-size: 0.82rem;
                    color: #2F2A24;
                    text-decoration: none;
                    font-style: italic;
                    font-weight: 300;
                    transition: opacity 0.15s;
                }
                .auth-forgot-link:hover { opacity: 0.65; }
                .auth-btn-primary {
                    width: 100%;
                    background: #1F1F1F;
                    color: #F8F6F0;
                    border: 1px solid #1F1F1F;
                    padding: 0.92rem;
                    font-size: 0.82rem;
                    font-weight: 500;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    cursor: pointer;
                    margin-top: 1.6rem;
                    margin-bottom: 0.75rem;
                    transition: opacity 0.15s, background-color 0.15s;
                    font-family: inherit;
                }
                .auth-btn-primary:hover:not(:disabled) { background: #000000; }
                .auth-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
                .auth-btn-secondary {
                    width: 100%;
                    display: block;
                    background: transparent;
                    color: #1F1F1F;
                    border: 1px solid #1F1F1F;
                    padding: 0.88rem;
                    font-size: 0.82rem;
                    font-weight: 500;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    text-align: center;
                    text-decoration: none;
                    transition: background 0.15s;
                    box-sizing: border-box;
                    font-family: inherit;
                }
                .auth-btn-secondary:hover { background: rgba(0, 0, 0, 0.05); }
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
