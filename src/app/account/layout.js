'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import RegionModal from '@/components/RegionModal';

export default function AccountLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, loading } = useAuth();
    const { cartCount } = useCart();
    const [isRegionOpen, setIsRegionOpen] = React.useState(false);

    React.useEffect(() => {
        if (!loading && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname || '/account')}`);
        }
    }, [loading, user, router, pathname]);

    const navItems = [
        { label: 'MY COLLECTION', path: '/account/collection' },
        { label: 'ORDER', path: '/account/orders' },
        { label: 'ADDRESSES', path: '/account/addresses' },
        { label: 'PROFILE', path: '/account' },
    ];

    // Real authenticated patron name
    const clientName = user?.name 
        ? user.name.toUpperCase()
        : (user?.first_name 
            ? `${user.first_name} ${user.last_name || ''}`.trim().toUpperCase() 
            : 'PATRON');

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'GOOD MORNING';
        if (hour < 17) return 'GOOD AFTERNOON';
        return 'GOOD EVENING';
    };

    // Don't render account UI while loading or if unauthenticated (redirecting)
    if (loading || !user) return null;

    return (
        <div className="acct-root">
            {/* ── HEADER ── */}
            <header className="acct-header">
                <div className="acct-header-inner">
                    <Link href="/" className="acct-logo">PINTAARA</Link>
                    <nav className="acct-nav-links">
                        <Link href="/collection" className="acct-nav-item">COLLECTION</Link>
                        <Link href="/design-log" className="acct-nav-item">DESIGN LOG</Link>
                        <Link href="/about" className="acct-nav-item">ABOUT</Link>
                        <Link href="/1976" className="acct-nav-item">1976</Link>
                    </nav>
                    <div className="acct-header-actions">
                        <button type="button" className="acct-icon-btn" aria-label="Region" onClick={() => setIsRegionOpen(true)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                        </button>
                        <Link href="/account" className="acct-icon-btn" aria-label="Profile">
                            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                        </Link>
                        <Link href="/bag" className="acct-icon-btn acct-cart-btn" aria-label="Bag">
                            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                            {cartCount > 0 && <span className="acct-cart-badge">{cartCount}</span>}
                        </Link>
                    </div>
                </div>
            </header>

            <RegionModal isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} />

            {/* ── BODY ── */}
            <div className="acct-body">
                {/* Sidebar */}
                <aside className="acct-sidebar">
                    <div className="acct-greeting-section">
                        <span className="acct-greeting-sub">{getGreeting()}</span>
                        <h2 className="acct-greeting-name">{clientName}</h2>
                    </div>

                    <nav className="acct-nav-list">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path || (item.path === '/account/orders' && pathname.startsWith('/account/order'));
                            return (
                                <Link 
                                    key={item.path} 
                                    href={item.path} 
                                    className={`acct-sidebar-link ${isActive ? 'active' : ''}`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <button
                        className="acct-logout-btn"
                        onClick={() => { if (logout) logout(); router.push('/login'); }}
                    >
                        LOG OUT
                    </button>
                </aside>

                {/* Main content */}
                <main className="acct-main">
                    {children}
                </main>
            </div>

            {/* ── FOOTER ── */}
            <div className="acct-footer-wrapper">
                <div className="acct-divider-line" />
                <footer className="acct-footer">
                    <Link href="/" className="acct-footer-brand">PINTAARA™</Link>
                    <span className="acct-footer-copy">© ALL RIGHTS RESERVED.</span>
                </footer>
            </div>

            <style jsx global>{`
                html, body {
                    height: 100%;
                    background-color: #F8EFE6;
                }
                .acct-root {
                    background-color: #F8EFE6;
                    min-height: 100vh;
                    color: #1A1A1A;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                }

                /* HEADER */
                .acct-header {
                    width: 100%;
                    border-bottom: 1px solid #1A1A1A;
                    background-color: #F8EFE6;
                    flex-shrink: 0;
                    z-index: 100;
                }
                .acct-header-inner {
                    max-width: 1440px;
                    margin: 0 auto;
                    padding: 1.2rem 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .acct-logo {
                    font-family: "Cinzel", "Didot", "Bodoni MT", serif;
                    font-size: 1.45rem;
                    font-weight: 500;
                    letter-spacing: 0.16em;
                    color: #A07855;
                    text-decoration: none;
                }
                .acct-nav-links { display: flex; gap: 3.5rem; }
                .acct-nav-item {
                    font-size: 0.8rem;
                    font-weight: 400;
                    letter-spacing: 0.14em;
                    color: #1A1A1A;
                    text-decoration: none;
                    text-transform: uppercase;
                    transition: opacity 0.15s ease;
                }
                .acct-nav-item:hover { opacity: 0.65; }
                .acct-header-actions { display: flex; align-items: center; gap: 1.75rem; }
                .acct-icon-btn {
                    background: none; border: none; cursor: pointer;
                    color: #1A1A1A; display: flex; align-items: center;
                    justify-content: center; text-decoration: none;
                    position: relative; transition: opacity 0.15s ease;
                }
                .acct-icon-btn:hover { opacity: 0.65; }
                .acct-cart-btn { position: relative; }
                .acct-cart-badge {
                    position: absolute; top: -6px; right: -7px;
                    background: #1A1A1A; color: #F8EFE6;
                    font-size: 0.6rem; font-weight: 700; border-radius: 50%;
                    width: 15px; height: 15px; display: flex;
                    align-items: center; justify-content: center;
                }

                /* BODY LAYOUT */
                .acct-body {
                    flex: 1;
                    max-width: 1440px;
                    margin: 0 auto;
                    width: 100%;
                    padding: 3rem 3rem 4rem 3rem;
                    display: grid;
                    grid-template-columns: 250px 1fr;
                    gap: 5rem;
                    align-items: start;
                    box-sizing: border-box;
                }

                /* SIDEBAR */
                .acct-sidebar {
                    display: flex;
                    flex-direction: column;
                    min-height: calc(100vh - 240px);
                }
                .acct-greeting-section {
                    margin-bottom: 2.8rem;
                }
                .acct-greeting-sub {
                    display: block;
                    font-size: 0.72rem;
                    font-weight: 400;
                    letter-spacing: 0.08em;
                    color: #1A1A1A;
                    margin-bottom: 0.35rem;
                    text-transform: uppercase;
                }
                .acct-greeting-name {
                    font-size: 1.05rem;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    color: #1A1A1A;
                    margin: 0;
                    text-transform: uppercase;
                }
                .acct-nav-list {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    align-items: flex-start;
                }
                .acct-sidebar-link {
                    font-size: 0.82rem;
                    font-weight: 400;
                    letter-spacing: 0.08em;
                    color: #1A1A1A;
                    text-decoration: none;
                    text-transform: uppercase;
                    padding: 0;
                    display: inline-block;
                    transition: opacity 0.15s ease;
                }
                .acct-sidebar-link:hover { opacity: 0.7; }
                .acct-sidebar-link.active {
                    background: transparent;
                    color: #1A1A1A;
                    font-weight: 600;
                    padding: 0;
                }
                .acct-logout-btn {
                    margin-top: auto;
                    padding-top: 6rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 0.82rem;
                    font-weight: 400;
                    letter-spacing: 0.08em;
                    color: #1A1A1A;
                    text-transform: uppercase;
                    text-align: left;
                    padding: 0;
                    transition: opacity 0.15s ease;
                }
                .acct-logout-btn:hover { opacity: 0.6; }

                /* MAIN */
                .acct-main { min-width: 0; }

                /* FOOTER */
                .acct-footer-wrapper {
                    flex-shrink: 0;
                    width: 100%;
                    background-color: #F8EFE6;
                }
                .acct-divider-line { width: 100%; height: 1px; background-color: #1A1A1A; }
                .acct-footer {
                    max-width: 1440px;
                    margin: 0 auto;
                    width: 100%;
                    padding: 1.25rem 3rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.75rem;
                    letter-spacing: 0.08em;
                    color: #1A1A1A;
                    box-sizing: border-box;
                }
                .acct-footer-brand {
                    font-weight: 600;
                    color: #1A1A1A;
                    text-decoration: none;
                    letter-spacing: 0.08em;
                }
                .acct-footer-copy {
                    font-weight: 400;
                    color: #1A1A1A;
                    letter-spacing: 0.08em;
                }

                /* MODAL OVERLAY */
                .acct-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.35);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                }
                .acct-modal {
                    background: #F6F4EE;
                    width: 100%;
                    max-width: 360px;
                    padding: 2.5rem 2rem 2rem 2rem;
                    position: relative;
                }
                .acct-modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1.25rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.1rem;
                    color: #1A1A1A;
                    line-height: 1;
                    padding: 0;
                }
                .acct-modal-title {
                    font-size: 0.82rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    text-align: center;
                    color: #1A1A1A;
                    margin: 0 0 2rem 0;
                }
                .acct-modal-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #1A1A1A;
                    display: block;
                    margin-bottom: 0.5rem;
                }
                .acct-modal-input {
                    width: 100%;
                    border: 1px solid #C8C4BB;
                    background: #F6F4EE;
                    padding: 0.75rem 0.9rem;
                    font-size: 0.84rem;
                    color: #1A1A1A;
                    outline: none;
                    box-sizing: border-box;
                    margin-bottom: 1.25rem;
                    font-family: inherit;
                }
                .acct-modal-input:focus { border-color: #1A1A1A; }
                .acct-modal-input::placeholder { color: #AAAAAA; }
                .acct-modal-input:disabled { color: #888; background: #EDEAE2; }
                .acct-modal-btn-primary {
                    width: 100%;
                    background: #1A1A1A;
                    color: #F6F4EE;
                    border: none;
                    padding: 0.9rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    cursor: pointer;
                    margin-bottom: 0.5rem;
                    transition: opacity 0.15s ease;
                    font-family: inherit;
                }
                .acct-modal-btn-primary:hover { opacity: 0.85; }
                .acct-modal-btn-secondary {
                    width: 100%;
                    background: #F6F4EE;
                    color: #1A1A1A;
                    border: 1px solid #C8C4BB;
                    padding: 0.9rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: background 0.15s ease;
                    font-family: inherit;
                }
                .acct-modal-btn-secondary:hover { background: #EDEAE2; }
                .acct-modal-success-icon {
                    display: block;
                    text-align: center;
                    font-size: 2rem;
                    color: #6B7E3A;
                    margin-bottom: 1rem;
                }
                .acct-modal-success-text {
                    font-size: 0.82rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    text-align: center;
                    color: #1A1A1A;
                    margin: 0 0 2rem 0;
                }

                /* OTP boxes */
                .acct-otp-row {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: center;
                    margin-bottom: 2rem;
                }
                .acct-otp-box {
                    width: 44px;
                    height: 52px;
                    border: 1px solid #C8C4BB;
                    background: #F6F4EE;
                    text-align: center;
                    font-size: 1.1rem;
                    color: #1A1A1A;
                    outline: none;
                    font-family: inherit;
                }
                .acct-otp-box:focus { border-color: #1A1A1A; }
                .acct-otp-hint {
                    font-size: 0.72rem;
                    letter-spacing: 0.06em;
                    text-align: center;
                    color: #1A1A1A;
                    margin-bottom: 1.5rem;
                }
                .acct-otp-number {
                    font-weight: 700;
                    display: block;
                }

                @media (max-width: 900px) {
                    .acct-body {
                        grid-template-columns: 1fr;
                        padding: 2rem 1.25rem;
                        gap: 2rem;
                    }
                    .acct-nav-links { display: none; }
                    .acct-sidebar { flex-direction: row; flex-wrap: wrap; gap: 0.5rem 1.25rem; }
                    .acct-sidebar-link { padding: 0.4rem 0; }
                }
            `}</style>
        </div>
    );
}
