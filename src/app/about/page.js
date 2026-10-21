"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
    const router = useRouter();

    const handleNavigate = (index) => {
        const slideIds = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7'];
        if (slideIds[index]) {
            router.push(`/#${slideIds[index]}`);
        }
    };

    return (
        <div className="about-page">
            {/* Header configured with light style theme */}
            <Header headerStyle="light" activeIndex={4} onNavigate={handleNavigate} />

            {/* Dark Overlay */}
            <div className="about-overlay"></div>

            {/* HERO CONTENT CONTAINER */}
            <div className="about-content">
                <div className="about-top-label">
                    <span className="about-label">ABOUT US</span>
                </div>

                <div className="about-main-block">
                    <h1 className="about-title">
                        A NEW NAME.<br />
                        DECADES OF CRAFT.
                    </h1>

                    <div className="about-divider"></div>

                    <p className="about-description">
                        A design-led jewellery house exploring rare, intentional and timeless forms.
                    </p>
                </div>

                <div className="about-actions">
                    <Link href="/about/philosophy" className="about-action action-philosophy">
                        <span className="about-action-line line-gold"></span>
                        EXPLORE PHILOSOPHY
                    </Link>

                    <Link href="/about/story" className="about-action action-story">
                        <span className="about-action-line line-blue"></span>
                        EXPLORE OUR STORY
                    </Link>
                </div>
            </div>

            {/* Shared Subpage Footer Bar */}
            <Footer theme="dark" />
        </div>
    );
}
