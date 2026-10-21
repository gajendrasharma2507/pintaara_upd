"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function Header({ headerStyle, reveal, onNavigate }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolledPast, setIsScrolledPast] = useState(false);
    const { cartCount } = useCart();

    const isHome = pathname === '/';

    // Inner pages: the header sits at the top of the page and scrolls away
    // with it; once it is out of view it floats hidden and reappears on
    // hover — the same behaviour as the home slides.
    useEffect(() => {
        if (isHome) return undefined;
        const onScroll = () => setIsScrolledPast(window.scrollY > 120);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [isHome]);

    // Style class logic
    let headerClass = "main-header";
    if (headerStyle === "hidden") {
        headerClass += " hidden";
    } else if (headerStyle === "footer-only-icons") {
        headerClass += " header-light header-icons-only";
    } else if (headerStyle === "dark") {
        headerClass += " header-dark";
    } else {
        headerClass += " header-light";
    }
    // Hidden until the pointer moves over the top of the screen
    if (reveal) {
        headerClass += " header-reveal";
    }
    if (!isHome) {
        headerClass += isScrolledPast ? " header-page-floating header-reveal" : " header-page-scroll";
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLocalLinkClick = (e, targetIndex) => {
        e.preventDefault();
        setIsMenuOpen(false);
        if (onNavigate) {
            onNavigate(targetIndex);
        }
    };

    const isCollectionPage = pathname === '/collection' || pathname.startsWith('/collection/');
    const isDesignLogPage = pathname === '/design-log' || pathname.startsWith('/design-log/');
    const isAboutPage = pathname === '/about' || pathname.startsWith('/about/');
    const isLegacyPage = pathname === '/1976';
    const isBagPage = pathname === '/bag';
    const isCheckoutPage = pathname === '/checkout';
    const isSubPage = pathname !== '/';

    return (
        <>
            <header className={headerClass} id="main-header">
                <div className="header-container">
                    {isSubPage ? (
                        <Link href="/" className="logo" aria-label="PINTAARA Home">
                            <span className="header-logo-text">PINTAARA</span>
                        </Link>
                    ) : (
                        <a href="#slide-2" className="logo" aria-label="PINTAARA Home" onClick={(e) => handleLocalLinkClick(e, 0)}>
                            <span className="header-logo-text">PINTAARA</span>
                        </a>
                    )}
                    
                    <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`} id="nav-menu">
                        {/* Keep COLLECTION underlined if we are on collection page or product detail page */}
                        {(pathname === '/collection' || pathname.startsWith('/collection/')) ? (
                            <>
                                <Link href="/collection" className="nav-link active-underlined">COLLECTION</Link>
                                <Link href="/design-log" className="nav-link">DESIGN LOG</Link>
                                <Link href="/about" className="nav-link">ABOUT</Link>
                                <Link href="/1976" className="nav-link">1976</Link>
                            </>
                        ) : isDesignLogPage ? (
                            <>
                                <Link href="/collection" className="nav-link">COLLECTION</Link>
                                <Link href="/design-log" className="nav-link active-underlined">DESIGN LOG</Link>
                                <Link href="/about" className="nav-link">ABOUT</Link>
                                <Link href="/1976" className="nav-link">1976</Link>
                            </>
                        ) : isAboutPage ? (
                            <>
                                <Link href="/collection" className="nav-link">COLLECTION</Link>
                                <Link href="/design-log" className="nav-link">DESIGN LOG</Link>
                                <Link href="/about" className="nav-link active-underlined">ABOUT</Link>
                                <Link href="/1976" className="nav-link">1976</Link>
                            </>
                        ) : isLegacyPage ? (
                            <>
                                <Link href="/collection" className="nav-link">COLLECTION</Link>
                                <Link href="/design-log" className="nav-link">DESIGN LOG</Link>
                                <Link href="/about" className="nav-link">ABOUT</Link>
                                <Link href="/1976" className="nav-link active-underlined">1976</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/collection" className="nav-link">COLLECTION</Link>
                                <Link href="/design-log" className="nav-link">DESIGN LOG</Link>
                                <Link href="/about" className="nav-link">ABOUT</Link>
                                <Link href="/1976" className="nav-link">1976</Link>
                            </>
                        )}
                    </nav>

                    <div className="header-icons">
                        <Link href="/account" className="icon-link" aria-label="Profile">
                            <svg className="header-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2.5a4.6 4.6 0 0 1 4.6 4.6c0 2.3-1.2 4.3-3 5.1 4 .6 7.3 3.2 7.9 7.8.1.6-.3 1.1-.9 1.1H3.4c-.6 0-1-.5-.9-1.1.6-4.6 3.9-7.2 7.9-7.8-1.8-.8-3-2.8-3-5.1A4.6 4.6 0 0 1 12 2.5z"></path>
                            </svg>
                        </Link>
                        <Link href="/bag" className="icon-link cart-icon-wrapper" aria-label="Shopping Cart">
                            <svg className="header-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="4.5" y="7" width="15" height="15"></rect>
                                <path d="M8.5 10V5.5a3.5 3.5 0 0 1 7 0V10"></path>
                            </svg>
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>
                    </div>

                    <button 
                        className={`mobile-menu-toggle ${isMenuOpen ? 'open' : ''}`} 
                        aria-label="Toggle Menu" 
                        onClick={toggleMenu}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>
        </>
    );
}
