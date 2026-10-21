"use client";

import React, { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Legacy1976Page() {
    const [displayYear, setDisplayYear] = useState(2026);
    const [animationDone, setAnimationDone] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const animRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        const START_YEAR = 2026;
        const END_YEAR = 1976;
        const TOTAL_STEPS = START_YEAR - END_YEAR; // 49 steps
        const DURATION_MS = 2800; // total animation duration

        let startTime = null;

        const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / DURATION_MS, 1);
            const eased = easeInOut(progress);
            const currentYear = Math.round(START_YEAR - eased * TOTAL_STEPS);
            setDisplayYear(currentYear);

            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayYear(END_YEAR);
                setAnimationDone(true);
            }
        };

        // Slight delay before starting
        const timer = setTimeout(() => {
            animRef.current = requestAnimationFrame(animate);
        }, 400);

        return () => {
            clearTimeout(timer);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    // Background Audio Handling
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.6;

        // Try autoplay
        const tryPlay = () => {
            audio.play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                    setIsPlaying(false);
                });
        };

        tryPlay();

        // Autoplay on first user interaction if blocked
        const handleUserGesture = () => {
            if (audio.paused) {
                audio.play()
                    .then(() => setIsPlaying(true))
                    .catch(() => {});
            }
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('scroll', handleUserGesture);
            window.removeEventListener('keydown', handleUserGesture);
            window.removeEventListener('touchstart', handleUserGesture);
        };

        window.addEventListener('click', handleUserGesture);
        window.addEventListener('scroll', handleUserGesture);
        window.addEventListener('keydown', handleUserGesture);
        window.addEventListener('touchstart', handleUserGesture);

        return () => {
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('scroll', handleUserGesture);
            window.removeEventListener('keydown', handleUserGesture);
            window.removeEventListener('touchstart', handleUserGesture);
            audio.pause();
        };
    }, []);

    const toggleAudio = (e) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play()
                .then(() => setIsPlaying(true))
                .catch((err) => console.error("Audio playback error:", err));
        }
    };

    return (
        <div className="legacy-page-root">
            <Header headerStyle="light" />

            {/* Sound of Pintaara Audio */}
            <audio ref={audioRef} src="/audio/sound-of-pintaara.mp3" loop preload="auto" />

            {/* Floating Luxury Audio Controller */}
            <button
                className={`legacy-audio-toggle ${isPlaying ? 'audio-playing' : 'audio-muted'}`}
                onClick={toggleAudio}
                title={isPlaying ? "Mute Sound" : "Play Sound of PINTAARA"}
                aria-label="Toggle Sound"
            >
                <div className="sound-bars-icon">
                    <span className="sound-bar bar-1"></span>
                    <span className="sound-bar bar-2"></span>
                    <span className="sound-bar bar-3"></span>
                    <span className="sound-bar bar-4"></span>
                </div>
                <span className="audio-toggle-label">
                    {isPlaying ? "SOUND ON" : "SOUND OFF"}
                </span>
            </button>

            {/* HERO: Full-bleed sepia background with giant year number */}
            <section className="legacy-hero">
                <div className="legacy-bg-overlay" />

                {/* Giant year display */}
                <div className={`legacy-year-display ${animationDone ? 'year-final' : 'year-counting'}`}>
                    {displayYear}
                </div>

                {/* Subtitle overlaid across the middle of the number - permanently visible */}
                <div className="legacy-subtitle-wrap">
                    <p className="legacy-subtitle-text">THE STORY BEFORE PINTAARA</p>
                </div>

                {/* Scroll Down Indicator */}
                <div 
                    className="legacy-scroll-indicator"
                    onClick={() => {
                        const timelineEl = document.querySelector('.legacy-timeline-section');
                        if (timelineEl) timelineEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <span>EXPLORE LEGACY</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                </div>
            </section>

            {/* TIMELINE SECTION (Warm Sepia Brown Theme) */}
            <section className="legacy-timeline-section">
                {/* Central vertical timeline line with clock icon */}
                <div className="timeline-center-line">
                    <div className="timeline-clock-badge">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                </div>

                <div className="legacy-container">
                    {/* ITEM 1: THE BEGINNING 1976 */}
                    <div className="timeline-item item-left-text">
                        <div className="timeline-text-col text-right-align">
                            <h2 className="timeline-title">THE BEGINNING</h2>
                            <span className="timeline-year">1976</span>
                            <div className="timeline-desc">
                                <p>
                                    In 1976, my father began his journey in jewellery with a simple belief that honesty, quality, and relationships matter above everything else.
                                </p>
                                <p>
                                    What started as one craftsman's dedication became the foundation of everything that followed.
                                </p>
                            </div>
                        </div>
                        <div className="timeline-media-col">
                            <div className="timeline-image-wrapper">
                                <img src="/images/1976/1976_s.png" alt="1976 Workshop and sketches" className="timeline-img" />
                            </div>
                        </div>
                    </div>

                    {/* ITEM 2: 50+ YEARS OF CRAFT & TRUST */}
                    <div className="timeline-item item-right-text">
                        <div className="timeline-media-col">
                            <div className="timeline-image-wrapper">
                                <img src="/images/1976/1976_h.png" alt="50+ Years of Craft & Trust — Jewellery Store" className="timeline-img" />
                            </div>
                        </div>
                        <div className="timeline-text-col text-left-align">
                            <h2 className="timeline-title"><span className="timeline-title-num">50+</span> YEARS</h2>
                            <span className="timeline-year">OF CRAFT & TRUST</span>
                            <div className="timeline-desc">
                                <p>
                                    Over five decades, that dedication earned the trust of generations of families.
                                </p>
                                <p>
                                    For us, jewellery has never been just metal and stones; it has always been a part of life's most meaningful moments.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ITEM 3: TODAY 2025 */}
                    <div className="timeline-item item-left-text">
                        <div className="timeline-text-col text-right-align">
                            <h2 className="timeline-title">TODAY</h2>
                            <span className="timeline-year">2025</span>
                            <div className="timeline-desc">
                                <p>
                                    PINTAARA is the next chapter of that journey.
                                </p>
                                <p>
                                    Built on decades of craftsmanship, it carries the same values forward through original design, thoughtful creation, and jewellery made to be remembered for generations.
                                </p>
                            </div>
                        </div>
                        <div className="timeline-media-col">
                            <div className="timeline-image-wrapper">
                                <img src="/images/1976/1976_p.png" alt="Today 2025 — PINTAARA Gold Ring Design" className="timeline-img" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: THE PAST SHAPED US BANNER */}
            <section className="legacy-future-banner">
                <div className="future-bg-wrapper">
                    <img src="/images/1976/1976_main.png" alt="The Past Shaped Us — Designer at Work" className="future-bg-img" />
                    <div className="future-overlay"></div>
                </div>

                <div className="future-content-container">
                    <h2 className="future-headline">
                        THE PAST SHAPED US. NOW IT'S TIME TO SHAPE WHAT'S NEXT.
                    </h2>
                    <p className="future-subtext">
                        Foundation – Old. Vision – New. Commitment – The same.
                    </p>
                </div>

                <div className="future-action-wrap">
                    <Link href="/collection" className="future-begin-link">
                        <span className="link-vertical-line"></span>
                        BEGIN YOURS
                    </Link>
                </div>

                {/* Footer overlay integrated inside banner */}
                <Footer theme="dark" />
            </section>
        </div>
    );
}
