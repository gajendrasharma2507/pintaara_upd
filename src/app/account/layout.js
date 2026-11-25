'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
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
            : 'DARSHIT SONI');

    // Don't render account UI while loading or if unauthenticated (redirecting)
    if (loading || !user) return null;

    return (
        <div className="acct-root">
            {/* ── UNIFIED BRAND MAIN HEADER ── */}
            <Header headerStyle="dark" />

            <RegionModal isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} />

            {/* ── BODY ── */}
            <div className="acct-body">
                {/* Sidebar */}
                <aside className="acct-sidebar">
                    <div className="acct-greeting-section">
                        <span className="acct-greeting-sub">GOOD MORNING / AFTERNOON</span>
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
            <footer className="collection-bottom-bar">
                <span className="bottom-brand">PINTAARA™</span>
                <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
            </footer>

            <style jsx global>{`
                html, body {
                    height: 100%;
                    background-color: #F8EFE6;
                }
                .acct-root {
                    background-color: #F8EFE6;
                    min-height: 100vh;
                    color: #1A1A1A;
                    font-family: var(--font-body), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    container-type: inline-size;
                    --p: calc(100cqw / 1920);
                }

                /* BODY LAYOUT */
                .acct-body {
                    flex: 1;
                    max-width: 1440px;
                    margin: 0 auto;
                    width: 100%;
                    padding: calc(var(--header-height, 80px) + 2.5rem) 3rem 4rem 3rem;
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
                    font-family: var(--font-body), sans-serif;
                    font-size: 0.78rem;
                    font-weight: 400;
                    letter-spacing: 0.04em;
                    color: #1A1A1A;
                    margin-bottom: 0.45rem;
                    text-transform: uppercase;
                    line-height: 1.3;
                }
                .acct-greeting-name {
                    font-family: var(--font-body), sans-serif;
                    font-size: 1.25rem;
                    font-weight: 400;
                    letter-spacing: 0.02em;
                    color: #1A1A1A;
                    margin: 0;
                    text-transform: uppercase;
                    line-height: 1.25;
                }
                .acct-nav-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.85rem;
                    align-items: flex-start;
                }
                .acct-sidebar-link {
                    font-family: var(--font-body), sans-serif;
                    font-size: 0.88rem;
                    font-weight: 400;
                    letter-spacing: 0.05em;
                    color: #1A1A1A;
                    text-decoration: none;
                    text-transform: uppercase;
                    padding: 0;
                    display: inline-block;
                    line-height: 1.35;
                    transition: opacity 0.15s ease;
                }
                .acct-sidebar-link:hover { opacity: 0.7; }
                .acct-sidebar-link.active {
                    background: transparent;
                    color: #1A1A1A;
                    font-weight: 500;
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
                .acct-root .collection-bottom-bar {
                    margin-top: auto;
                    width: auto;
                    flex-shrink: 0;
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
                        padding: calc(var(--header-height, 70px) + 1.25rem) 1.25rem 2rem 1.25rem;
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
