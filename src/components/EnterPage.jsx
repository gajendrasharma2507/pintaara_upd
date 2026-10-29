"use client";

import React, { useEffect, useState } from 'react';

export default function EnterPage({ onEnter, isExiting, config }) {
    const [isTriggered, setIsTriggered] = useState(false);

    const handleTrigger = () => {
        if (isTriggered) return;
        setIsTriggered(true);
        if (onEnter) onEnter();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                handleTrigger();
            }
        };

        const handlePreventScroll = (e) => {
            e.preventDefault();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('wheel', handlePreventScroll, { passive: false });
        window.addEventListener('touchmove', handlePreventScroll, { passive: false });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('wheel', handlePreventScroll);
            window.removeEventListener('touchmove', handlePreventScroll);
        };
    }, [onEnter, isTriggered]);

    const activeExit = isExiting || isTriggered;

    return (
        <aside
            className={`enter-page-overlay ${activeExit ? 'enter-page-exit' : ''}`}
            onClick={handleTrigger}
            aria-label="Enter Screen"
            style={{ cursor: 'pointer' }}
        >
            <div
                className="enter-page-bg"
                style={{
                    backgroundImage: `url('${config?.bgImage || "/images/concept-enter.png"}')`,
                    backgroundPosition: config?.bgPosition || 'center',
                    ...(config?.mobileBgImage ? { '--mobile-bg': `url('${config.mobileBgImage}')` } : {}),
                    ...(config?.tabletBgImage ? { '--tablet-bg': `url('${config.tabletBgImage}')` } : {})
                }}
            />
            <div className="enter-page-shimmer" />
            <div className="enter-page-content" onClick={(e) => e.stopPropagation()}>
                <h1 className="brand-title">
                    <span className="brand-title-text">{config?.title || "PINTAARA"}</span>
                    {/* wordmark image from Website Design Mobile.pdf (phones only) */}
                    <img src="/images/mobile/enter-wordmark.png" alt="" aria-hidden="true" className="brand-title-img-mobile" />
                </h1>
                <button
                    type="button"
                    className={`enter-button ${activeExit ? 'pressed' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleTrigger();
                    }}
                    aria-label="Enter Pintaara"
                >
                    <span className="enter-btn-label">{config?.buttonText || "ENTER"}</span>
                </button>
            </div>
        </aside>
    );
}
