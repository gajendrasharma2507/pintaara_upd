"use client";

import React, { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const COPY = {
    en: {
        soundOn: 'SOUND ON',
        soundOff: 'SOUND OFF',
        muteTitle: 'Mute Sound',
        playTitle: 'Play Sound of PINTAARA',
        heroSubtitle: 'THE STORY BEFORE PINTAARA',
        exploreLegacy: 'EXPLORE LEGACY',
        item1Title: 'THE BEGINNING',
        item1Year: '1976',
        item1P1: "In 1976, my father began his journey in jewellery with a simple belief that honesty, quality, and relationships matter above everything else.",
        item1P2: "What started as one craftsman's dedication became the foundation of everything that followed.",
        item2YearsLabel: 'YEARS',
        item2Sub: 'A LIFE IN JEWELLERY',
        item2P1: "Over five decades, my father's work became part of the lives of generations of families.",
        item2P2: "The relationships he built, and the responsibility that came with them, shaped my earliest understanding of jewellery.",
        item3Title: 'A DIFFERENT DIRECTION',
        item3Year: '2025',
        item3P1: 'I chose a different path through design. With a background in interior design and a lifelong familiarity with jewellery, I began exploring how ideas, structures, and forms could be translated into pieces of precious metal.',
        item3P2: 'From that exploration, PINTAARA was founded. An independent design house, shaped by its own ideas.',
        futureHeadline: "THE PAST SHAPED US. NOW IT'S TIME TO SHAPE WHAT'S NEXT.",
        futureSubtext: 'Foundation — Old.\u00A0 Vision — New.\u00A0 Commitment — The same.',
        beginYours: 'BEGIN YOURS',
    },
    gu: {
        soundOn: 'અવાજ ચાલુ',
        soundOff: 'અવાજ બંધ',
        muteTitle: 'અવાજ બંધ કરો',
        playTitle: 'PINTAARA નો અવાજ ચાલુ કરો',
        heroSubtitle: 'પિંતારા પહેલાંની વાર્તા',
        exploreLegacy: 'વારસો જાણો',
        item1Title: 'શરૂઆત',
        item1Year: '1976',
        item1P1: '૧૯૭૬માં, મારા પિતાએ એક સરળ વિશ્વાસ સાથે જ્વેલરીની સફર શરૂ કરી હતી કે પ્રામાણિકતા, ગુણવત્તા અને સંબંધો દરેક બાબત કરતાં વધુ મહત્વપૂર્ણ છે.',
        item1P2: 'એક કારીગરના સમર્પણથી જે શરૂ થયું, તે પછીના દરેક અધ્યાયનો પાયો બન્યું.',
        item2YearsLabel: 'વર્ષ',
        item2Sub: 'કારીગરી અને વિશ્વાસના',
        item2P1: 'પાંચ દાયકાથી વધુ સમયમાં, તે સમર્પણે પેઢી દર પેઢી પરિવારોનો વિશ્વાસ જીત્યો છે.',
        item2P2: 'અમારા માટે જ્વેલરી ક્યારેય માત્ર ધાતુ અને રત્નો નથી રહી; તે હંમેશા જીવનની સૌથી યાદગાર ક્ષણોનો હિસ્સો રહી છે.',
        item3Title: 'આજે',
        item3Year: '2025',
        item3P1: 'PINTAARA એ જ સફરનો આગળનો અધ્યાય છે.',
        item3P2: 'દાયકાઓની કારીગરી પર બનેલું, તે મૌલિક ડિઝાઇન, વિચારશીલ સર્જન અને પેઢીઓ સુધી યાદ રહે તેવા ઘરેણાં દ્વારા એ જ મૂલ્યોને આગળ ધપાવે છે.',
        futureHeadline: 'ભૂતકાળે અમને ઘડ્યા છે. હવે સમય છે આવનારા ભવિષ્યને ઘડવાનો.',
        futureSubtext: 'પાયો — જૂનો.\u00A0 દ્રષ્ટિ — નવી.\u00A0 પ્રતિબદ્ધતા — એ જ.',
        beginYours: 'તમારી શરૂઆત કરો',
    },
};

export default function Legacy1976Page() {
    const [displayYear, setDisplayYear] = useState(2026);
    const [animationDone, setAnimationDone] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [lang, setLang] = useState('en');
    const t = COPY[lang];
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

            {/* HERO: Full-bleed sepia background with giant year number */}
            <section className="legacy-hero">
                <div className="legacy-bg-overlay" />

                {/* Giant year display */}
                <div className={`legacy-year-display ${animationDone ? 'year-final' : 'year-counting'}`}>
                    {displayYear}
                </div>

                {/* Subtitle overlaid across the middle of the number - permanently visible */}
                <div className="legacy-subtitle-wrap">
                    <p className="legacy-subtitle-text">{t.heroSubtitle}</p>
                </div>

                {/* Scroll Down Indicator */}
                <div 
                    className="legacy-scroll-indicator"
                    onClick={() => {
                        const timelineEl = document.querySelector('.legacy-timeline-section');
                        if (timelineEl) timelineEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <span>{t.exploreLegacy}</span>
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
                            <h2 className="timeline-title">{t.item1Title}</h2>
                            <span className="timeline-year">{t.item1Year}</span>
                            <div className="timeline-desc">
                                <p>{t.item1P1}</p>
                                <p>{t.item1P2}</p>
                            </div>
                        </div>
                        <div className="timeline-media-col">
                            <div className="timeline-image-wrapper">
                                <img src="/images/1976/1976_s1.png" alt="1976 Workshop and sketches" className="timeline-img" />
                            </div>
                        </div>
                    </div>

                    {/* ITEM 2: 50+ YEARS OF CRAFT & TRUST */}
                    <div className="timeline-item item-right-text">
                        <div className="timeline-media-col">
                            <div className="timeline-image-wrapper">
                                <img src="/images/1976/1976_h%20-%20Copy.png" alt="50+ Years of Craft & Trust — Jewellery Store" className="timeline-img" />
                            </div>
                        </div>
                        <div className="timeline-text-col text-left-align">
                            <h2 className="timeline-title"><span className="timeline-title-num">50</span> {t.item2YearsLabel}</h2>
                            <span className="timeline-year">{t.item2Sub}</span>
                            <div className="timeline-desc">
                                <p>{t.item2P1}</p>
                                <p>{t.item2P2}</p>
                            </div>
                        </div>
                    </div>

                    {/* ITEM 3: TODAY 2025 */}
                    <div className="timeline-item item-left-text">
                        <div className="timeline-text-col text-right-align">
                            <h2 className="timeline-title">{t.item3Title}</h2>
                            <span className="timeline-year">{t.item3Year}</span>
                            <div className="timeline-desc">
                                <p>{t.item3P1}</p>
                                <p>{t.item3P2}</p>
                            </div>
                        </div>
                        <div className="timeline-media-col">
                            <div className="timeline-image-wrapper">
                                <img src="/images/1976/1976_p2.png" alt="Today 2025 — PINTAARA Gold Ring Design" className="timeline-img" />
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
                        {t.futureHeadline}
                    </h2>
                    <p className="future-subtext">
                        {t.futureSubtext}
                    </p>
                </div>

                <div className="future-action-wrap">
                    <Link href="/collection" className="future-begin-link">
                        <span className="link-vertical-line"></span>
                        {t.beginYours}
                    </Link>
                </div>

                {/* Controls (Language + Audio) anchored above footer only */}
                <div className="legacy-floating-controls">
                    <div
                        role="group"
                        aria-label="Language"
                        className="legacy-lang-toggle"
                    >
                        <button
                            type="button"
                            onClick={() => setLang('en')}
                            className={`legacy-lang-btn ${lang === 'en' ? 'active' : ''}`}
                        >
                            ENGLISH
                        </button>
                        <button
                            type="button"
                            onClick={() => setLang('gu')}
                            className={`legacy-lang-btn legacy-lang-gu ${lang === 'gu' ? 'active' : ''}`}
                        >
                            ગુજરાતી
                        </button>
                    </div>

                    <button
                        className={`legacy-audio-toggle ${isPlaying ? 'audio-playing' : 'audio-muted'}`}
                        onClick={toggleAudio}
                        title={isPlaying ? t.muteTitle : t.playTitle}
                        aria-label="Toggle Sound"
                    >
                        <div className="sound-bars-icon">
                            <span className="sound-bar bar-1"></span>
                            <span className="sound-bar bar-2"></span>
                            <span className="sound-bar bar-3"></span>
                            <span className="sound-bar bar-4"></span>
                        </div>
                        <span className="audio-toggle-label">
                            {isPlaying ? t.soundOn : t.soundOff}
                        </span>
                    </button>
                </div>
                <style jsx>{`
                    .legacy-floating-controls {
                        position: absolute;
                        bottom: clamp(108px, 13vh, 132px);
                        right: clamp(24px, 4vw, 50px);
                        z-index: 15;
                        display: inline-flex;
                        flex-direction: row;
                        align-items: center;
                        gap: 10px;
                    }
                    .legacy-lang-toggle {
                        display: inline-flex;
                        align-items: center;
                        padding: 4px;
                        background: rgba(22, 14, 9, 0.75);
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        border: 1px solid rgba(235, 191, 154, 0.3);
                        border-radius: 30px;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                    }
                    .legacy-lang-btn {
                        border: none;
                        border-radius: 24px;
                        padding: 6px 13px;
                        font-size: 11px;
                        font-weight: 500;
                        letter-spacing: 0.14em;
                        cursor: pointer;
                        background: transparent;
                        color: #EBBF9A;
                        transition: all 0.2s ease;
                        white-space: nowrap;
                    }
                    .legacy-lang-gu {
                        font-size: 12px;
                        letter-spacing: 0.04em;
                    }
                    .legacy-lang-btn.active {
                        background: #EBBF9A;
                        color: #160E09;
                    }
                    .legacy-floating-controls :global(.legacy-audio-toggle) {
                        position: static !important;
                        bottom: auto !important;
                        right: auto !important;
                    }
                    @media (max-width: 1024px) {
                        .legacy-floating-controls {
                            bottom: calc(62 * var(--u, 1px));
                            right: calc(20 * var(--u, 1px));
                            flex-direction: column;
                            align-items: flex-end;
                            gap: 8px;
                        }
                        .legacy-lang-btn {
                            padding: 5px 10px;
                            font-size: 10px;
                            letter-spacing: 0.1em;
                        }
                        .legacy-lang-gu {
                            font-size: 11px;
                            letter-spacing: 0.02em;
                        }
                        .legacy-floating-controls :global(.legacy-audio-toggle) {
                            padding: 8px 14px !important;
                            font-size: 10px !important;
                            gap: 8px !important;
                        }
                    }
                `}</style>

                {/* Footer overlay integrated inside banner */}
                <footer className="collection-bottom-bar">
                    <span className="bottom-brand">PINTAARA™</span>
                    <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
                </footer>
            </section>
        </div>
    );
}
