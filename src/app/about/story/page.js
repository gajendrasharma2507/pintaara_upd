"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function StoryPage() {
    const router = useRouter();

    const handleNavigate = (index) => {
        const slideIds = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7'];
        if (slideIds[index]) {
            router.push(`/#${slideIds[index]}`);
        }
    };

    return (
        <div className="about-normal-page-root story-dark-section">
            {/* Global Header */}
            <Header headerStyle="light" activeIndex={4} onNavigate={handleNavigate} />

            {/* Main Wide Container */}
            <main className="story-page-container">

                    {/* ROW 1: BEYOND THE NAME */}
                    <div className="story-row-layout">
                        {/* LEFT: Text */}
                        <div className="story-text-col">
                            <span className="story-label">
                                OUR STORY
                                <span className="story-label-underline"></span>
                            </span>

                            <h2 className="story-main-title">Beyond the Name.</h2>

                            <p className="story-intro-text">PINTAARA is derived from two ideas:</p>

                            <div className="story-etymology">
                                <p><strong>Pinnacle</strong> – the highest point of a journey.</p>
                                <p><strong>Taara</strong> – the Sanskrit word for star.</p>
                            </div>

                            <div className="story-body-paragraphs">
                                <p>
                                    Together, they represent aspiration, achievement, and the pursuit of something greater than oneself.
                                </p>
                                <p>
                                    The name was chosen to feel rare, timeless, and quietly powerful — qualities that continue to guide the brand today.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: Mountain with annotations */}
                        <div className="story-media-col">
                            <div className="story-mountain-annotated">
                                <div className="story-annotation annotation-taara">
                                    <span className="annotation-label">TAARA</span>
                                    <span className="annotation-line"></span>
                                    <span className="annotation-desc">The star that guides<br />the path.</span>
                                </div>
                                <div className="story-annotation annotation-pinnacle">
                                    <span className="annotation-label">PINNACLE</span>
                                    <span className="annotation-line short"></span>
                                    <span className="annotation-desc">The pursuit of<br />excellence.</span>
                                </div>
                                <img src="/images/about/story_mountain.png" alt="PINTAARA Pinnacle — glowing mountain peak" className="story-mountain-img" />
                            </div>
                        </div>
                    </div>

                    {/* ROW 2: MORE THAN A NAME (Gems on Left ↔ More Than A Name on Right) */}
                    <div className="story-row-layout">
                        {/* LEFT: Gems image */}
                        <div className="story-media-col story-gems-col">
                            <div className="story-gems-frame">
                                <img src="/images/about/story_gems.png" alt="PINTAARA gold jewellery collection on rocks" className="story-gems-img" />
                            </div>
                        </div>

                        {/* RIGHT: More Than A Name */}
                        <div className="story-text-col">
                            <div className="story-more-name-block">
                                <h3 className="story-more-title">More Than A Name</h3>
                                <div className="story-more-paragraphs">
                                    <p>
                                        PINTAARA was founded on the belief that jewellery should be able to speak through form.
                                    </p>
                                    <p>
                                        Our collections may draw from different inspirations, but they share a common purpose: to create pieces that carry emotion, meaning, and individuality.
                                    </p>
                                    <p>
                                        Some designs are deeply symbolic. Others are simply explorations of rare and beautiful forms. What connects them is a commitment to originality and thoughtful creation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ROW 3: THE BUTTERFLY SECTION */}
                    <div className="story-row-layout story-butterfly-layout">
                        {/* LEFT: Text */}
                        <div className="butterfly-text-col">
                            <h2 className="butterfly-title">The Butterfly</h2>

                            <p className="butterfly-intro">
                                The butterfly within the PINTAARA identity represents transformation.
                            </p>

                            <div className="butterfly-body-paragraphs">
                                <p>
                                    Just as a butterfly emerges from its cocoon, transformed by a journey unseen, people are shaped by the moments that redefine their lives. Engagements, weddings, anniversaries, achievements, and personal reinvention often mark the beginning of a new chapter.
                                </p>
                                <p>
                                    It serves as a reminder that the pieces we wear often become symbols of who we were, who we are, and who we are becoming.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: Cocoon image */}
                        <div className="butterfly-media-col">
                            <img src="/images/about/story_cocoon.png" alt="Gold chrysalis on branch — PINTAARA The Butterfly" className="butterfly-cocoon-img" />
                        </div>
                    </div>
            </main>

            {/* Global Footer (Full Width Divider Line) */}
            <Footer theme="dark" />
        </div>
    );
}
