"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function PhilosophyPage() {
    const router = useRouter();

    const handleNavigate = (index) => {
        const slideIds = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7'];
        if (slideIds[index]) {
            router.push(`/#${slideIds[index]}`);
        }
    };

    return (
        <div className="about-normal-page-root theme-olive-bg">
            {/* Global Header */}
            <Header headerStyle="dark" onNavigate={handleNavigate} />

            {/* Main Wide Container */}
            <main className="philosophy-page-container">

                {/* ── SECTION 1: PHILOSOPHY ────────────────────────────── */}
                <div className="philosophy-grid-row">
                    <div className="phil-text-col text-left">
                        <div className="phil-header-subtitle">
                            PHILOSOPHY
                            <span className="subtitle-dark-underline"></span>
                        </div>

                        <h2 className="phil-section-headline">
                            <span className="phil-headline-line">Others follow what already exists.</span>
                            <span className="phil-headline-line">PINTAARA searches for forms that don&rsquo;t.</span>
                        </h2>

                        <p className="phil-quote-text">
                            In a world where trends are repeated and familiarity is rewarded, I believe the rarest creations begin with a different question:<br />
                            <em>&ldquo;What is yet to be explored?&rdquo;</em>
                        </p>

                        <div className="phil-body-paragraphs">
                            <p>
                                PINTAARA exists to pursue forms with purpose – pieces that carry identity, emotion, and presence beyond ornamentation. The pursuit is guided by what is uncommon, intentional, and timeless. Not because it is different for the sake of being different, but because originality leaves a lasting impression.
                            </p>
                            <p>
                                Every design begins with a search for a form that deserves to exist.
                            </p>
                        </div>
                    </div>

                    <div className="phil-media-col justify-end">
                        <div className="phil-media-frame">
                            <img
                                src="/images/about/philosophy1.png"
                                alt="Pintaara Gold Butterfly Pendant"
                                className="phil-media-img"
                            />
                        </div>
                    </div>
                </div>

                {/* ── SECTION 2: WHY PINTAARA EXISTS? ──────────────────── */}
                <div className="philosophy-grid-row reversed">
                    <div className="phil-media-col justify-start">
                        <div className="phil-media-frame">
                            <img
                                src="/images/about/philosophy2.png"
                                alt="Why Pintaara Exists Star Emblem"
                                className="phil-media-img"
                            />
                        </div>
                    </div>

                    <div className="phil-text-col text-right">
                        <div className="phil-header-subtitle align-right">
                            Why PINTAARA Exists?
                            <span className="subtitle-dark-underline"></span>
                        </div>

                        <h2 className="phil-section-headline text-right">
                            <span className="phil-headline-line">The most memorable forms are created</span>
                            <span className="phil-headline-line">with intention.</span>
                        </h2>

                        <div className="phil-body-paragraphs text-right">
                            <p>
                                Jewellery is more than something worn. It is often tied to a memory, a milestone, a promise, or a moment of transformation. It becomes part of a person&rsquo;s story.
                            </p>
                            <p>
                                PINTAARA exists to create pieces that are worthy of those moments.
                            </p>
                            <p>
                                Every design is approached as an original expression – thoughtfully crafted to feel meaningful today and be remembered years from now. Because pieces that people treasure for a lifetime should be created with intention, not convenience.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 3: WHAT DRIVES ME? ───────────────────────── */}
                <div className="philosophy-grid-row">
                    <div className="phil-text-col text-left">
                        <div className="phil-header-subtitle">
                            What Drives Me?
                            <span className="subtitle-dark-underline"></span>
                        </div>

                        <h2 className="phil-section-headline">
                            <span className="phil-headline-line">The pursuit of identity.</span>
                        </h2>

                        <div className="phil-body-paragraphs">
                            <p>
                                Every new design is an opportunity to create something with its own language, character, and emotion – something that can be recognized not by a logo, but by its form.
                            </p>
                            <p>
                                I challenge myself to move beyond the familiar and seek what feels distinctive.
                            </p>
                            <p>
                                The goal is not to be louder than the crowd, but to create something impossible to overlook.
                            </p>
                            <p>
                                Gold is more than a finish; it is a symbol of permanence, it carries value beyond appearance, and endures across generations.
                            </p>
                        </div>
                    </div>

                    <div className="phil-media-col justify-end">
                        <div className="phil-media-frame">
                            <img
                                src="/images/about/philosophy3.png"
                                alt="What Drives Me Flame Emblem"
                                className="phil-media-img"
                            />
                        </div>
                    </div>
                </div>

            </main>

            {/* Global Footer */}
            <Footer theme="light" />
        </div>
    );
}
