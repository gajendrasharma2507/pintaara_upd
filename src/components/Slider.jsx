"use client";

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function Slider({ slidesConfig, activeIdx, setActiveIdx, scrollToSlideRef, justEntered }) {
    const containerRef = useRef(null);
    const slideRefs = useRef([]);

    // Keep references to all slide DOM nodes
    useEffect(() => {
        slideRefs.current = slideRefs.current.slice(0, slidesConfig.length);
    }, [slidesConfig]);

    // 1. Observe active slide
    useEffect(() => {
        const observerOptions = {
            root: containerRef.current,
            rootMargin: '0px',
            threshold: 0.55 // Trigger when slide covers 55%+ of the viewport
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index'), 10);
                    setActiveIdx(index);
                }
            });
        }, observerOptions);

        slideRefs.current.forEach(slideNode => {
            if (slideNode) observer.observe(slideNode);
        });

        return () => {
            observer.disconnect();
        };
    }, [slidesConfig, setActiveIdx]);

    // 2. Expose scroll method to parent component
    const scrollToSlide = (index) => {
        if (slideRefs.current[index]) {
            slideRefs.current[index].scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (scrollToSlideRef) {
            scrollToSlideRef.current = scrollToSlide;
        }
    }, [scrollToSlideRef]);

    // 3. Arrow Keys and Enter navigation between content slides
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore key events when typing inside inputs or textareas
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                return;
            }

            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                if (activeIdx < slidesConfig.length - 1) {
                    scrollToSlide(activeIdx + 1);
                }
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                if (activeIdx > 0) {
                    scrollToSlide(activeIdx - 1);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIdx, slidesConfig]);

    const currentSlide = slidesConfig[activeIdx] || slidesConfig[0];
    const currentHeaderStyle = currentSlide?.headerStyle || "light";
    const currentHeaderReveal = !!currentSlide?.headerReveal;

    return (
        <div className={`slider-root-wrapper ${justEntered ? 'hero-animate-in' : ''}`} data-active-slide={currentSlide?.id}>
            {/* Global Header on Home Page */}
            <Header
                headerStyle={currentHeaderStyle}
                reveal={currentHeaderReveal}
                onNavigate={scrollToSlide}
            />

            {/* Slide Indicators / Dot Navigation */}
            <nav className="slide-indicators" aria-label="Slide navigation">
                {slidesConfig.map((slide, idx) => (
                    <button
                        key={slide.id}
                        className={`indicator ${idx === activeIdx ? 'active' : ''}`}
                        onClick={() => scrollToSlide(idx)}
                        aria-label={`Slide ${idx + 1}`}
                    />
                ))}
            </nav>

            {/* Vertical Slider Container */}
            <main
                className="slider-container"
                id="slider-container"
                ref={containerRef}
            >
                {slidesConfig.map((slide, idx) => {
                    const isActive = idx === activeIdx;
                    
                    return (
                        <section
                            key={slide.id}
                            id={slide.id}
                            className={`slide theme-${slide.theme} ${isActive ? 'active' : ''}`}
                            style={{
                                backgroundImage: slide.bgImage ? `url('${slide.bgImage}')` : 'none',
                                backgroundPosition: slide.bgPosition || 'center',
                                ...(slide.mobileBgImage ? { '--mobile-bg': `url('${slide.mobileBgImage}')` } : {}),
                                ...(slide.desktopBgImage ? { '--desktop-bg': `url('${slide.desktopBgImage}')` } : {}),
                                ...(slide.tabletBgImage ? { '--tablet-bg': `url('${slide.tabletBgImage}')` } : {})
                            }}
                            data-index={idx}
                            ref={el => slideRefs.current[idx] = el}
                        >
                            {/* Right-side content image (rendered as <img>, not bg) */}
                            {slide.contentImage && (
                                <img
                                    src={slide.contentImage}
                                    alt={slide.subtitle || slide.title}
                                    className={`slide-content-img slide-content-img-${slide.id}`}
                                />
                            )}
                            <div className={
                                slide.isFooter ? "footer-layout" : "slide-content text-left"
                            }>
                                {slide.isFooter ? (
                                    <>
                                        <div className="footer-top">
                                            <h2 className="footer-title">{slide.title}</h2>
                                            <p className="footer-subtitle">{slide.subtitle}</p>
                                        </div>
                                        
                                        <div className="footer-columns">
                                            <div className="footer-col footer-col-membership">
                                                <h3>MEMBERSHIP</h3>
                                                <ul>
                                                    <li><Link href="/register"><span className="tree-symbol">├</span> Register</Link></li>
                                                </ul>
                                            </div>

                                            <div className="footer-col footer-col-about">
                                                <h3>ABOUT</h3>
                                                <ul>
                                                    <li><Link href="/about/philosophy"><span className="tree-symbol">├</span> Our Philosophy</Link></li>
                                                    <li><Link href="/about/story"><span className="tree-symbol">└</span> Our Story</Link></li>
                                                </ul>
                                            </div>

                                            <div className="footer-col footer-col-cs">
                                                <h3>CUSTOMER SERVICE</h3>
                                                <ul>
                                                    <li><Link href="/contact"><span className="tree-symbol">├</span> Contact Us</Link></li>
                                                    <li><Link href="/account/orders"><span className="tree-symbol">└</span> Order Status</Link></li>
                                                    <li><Link href="/terms-of-use#delivery"><span className="tree-symbol">└</span> Shipping</Link></li>
                                                </ul>
                                            </div>

                                            <div className="footer-col footer-col-legal">
                                                <h3>LEGAL</h3>
                                                <ul>
                                                    <li><Link href="/terms-of-use"><span className="tree-symbol">├</span> Terms of Use</Link></li>
                                                    <li><Link href="/privacy"><span className="tree-symbol">└</span> Privacy Policy</Link></li>
                                                    <li><Link href="/terms-of-use#intellectual-property"><span className="tree-symbol">└</span> Intellectual Property Notice</Link></li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="footer-bottom-bar">
                                            <div className="footer-bottom-brand">
                                                <picture>
                                                    <source media="(max-width: 767px)" srcSet="/images/mobile/logo-butterfly.png" />
                                                    <img src="/images/logo-butterfly.png" alt="Pintaara Butterfly" className="footer-bottom-butterfly" />
                                                </picture>
                                                <span className="footer-bottom-logo">P I N T A A R A<span className="footer-bottom-mark">™</span></span>
                                                <img src="/images/mobile/logo-wordmark.png" alt="" aria-hidden="true" className="footer-bottom-logo-img-mobile" />
                                            </div>
                                            <div className="footer-bottom-center">
                                                <p className="footer-copy-line">
                                                    <span className="slide-desc-desktop">Copyright © 2026 PINTAARA™. All Rights Reserved.</span>
                                                    {/* wording from Website Design Mobile.pdf (phones only) */}
                                                    <span className="slide-desc-mobile">Copyright © 2026. All Rights Reserved.</span>
                                                </p>
                                                <p className="footer-copy-sub">
                                                    <span className="slide-desc-desktop">PINTAARA and the BUTTERFLY logo are trademarks of PINTAARA™</span>
                                                    <span className="slide-desc-mobile">PINTAARA and the BUTTERFLY logo are registered &amp; trademarks of PINTAARA®</span>
                                                </p>
                                            </div>
                                            <div className="footer-bottom-right">
                                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-ig-link" aria-label="Instagram">
                                                    <picture>
                                                        <source media="(max-width: 767px)" srcSet="/images/mobile/instagram.png" />
                                                        <img src="/images/instagram-icon.svg" alt="Instagram" className="footer-ig-icon" />
                                                    </picture>
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* TOP: Subtitle label */}
                                        <div className="slide-top-label">
                                            {slide.subtitle && (
                                                <span className="slide-subtitle section-label">{slide.subtitle}</span>
                                            )}
                                        </div>

                                        {/* MIDDLE: Main content block */}
                                        <div className="slide-main-block">
                                            <h2 className={`slide-title hero-title ${
                                                slide.id === 'slide-2' ? 'slide-2-title' :
                                                slide.id === 'slide-3' ? 'collection-title' :
                                                slide.id === 'slide-4' ? 'design-log-title' :
                                                slide.id === 'slide-5' ? 'philosophy-title' :
                                                slide.id === 'slide-6' ? 'story-title' : ''
                                            }`}>
                                                <span className="slide-title-desktop">
                                                    {slide.title.split('\n').map((line, lineIdx) => (
                                                        <span key={lineIdx} className="slide-title-line" style={{ display: 'block', whiteSpace: 'nowrap' }}>
                                                            {line}
                                                        </span>
                                                    ))}
                                                </span>
                                                {/* Line breaks from Website Design Mobile.pdf (shown on phones only) */}
                                                <span className="slide-title-mobile">
                                                    {(slide.mobileTitle || slide.title).split('\n').map((line, lineIdx) => (
                                                        <span key={lineIdx} className="slide-title-mobile-line">{line}</span>
                                                    ))}
                                                </span>
                                            </h2>

                                            {slide.desc && (
                                                <>
                                                    <div className="divider hero-divider"></div>
                                                    <p className="slide-desc hero-description">
                                                        <span className="slide-desc-desktop">{slide.desc}</span>
                                                        <span className={`slide-desc-mobile ${slide.mobileDescJustify ? 'is-justified' : ''}`}>
                                                            {(slide.mobileDesc || slide.desc).split('\n').map((line, lineIdx, lines) => (
                                                                <span
                                                                    key={lineIdx}
                                                                    className={`slide-desc-mobile-line ${!line ? 'is-gap' : ''} ${!lines[lineIdx + 1] ? 'is-last' : ''}`}
                                                                >
                                                                    {line}
                                                                </span>
                                                            ))}
                                                        </span>
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {/* BOTTOM: Action button */}
                                        <div className="slide-bottom-action">
                                            {slide.buttonText && (
                                                slide.buttonLink?.startsWith('/') ? (
                                                    <Link
                                                        href={slide.buttonLink}
                                                        className="action-btn cta-link"
                                                    >
                                                        {slide.buttonText}
                                                    </Link>
                                                ) : (
                                                    <a
                                                        href={slide.buttonLink || '#'}
                                                        className="action-btn cta-link"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (idx + 1 < slidesConfig.length) {
                                                                scrollToSlide(idx + 1);
                                                            }
                                                        }}
                                                    >
                                                        {slide.buttonText}
                                                    </a>
                                                )
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    );
                })}
            </main>
        </div>
    );
}
