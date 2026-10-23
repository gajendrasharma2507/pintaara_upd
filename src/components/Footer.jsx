"use client";

import React from 'react';
import Link from 'next/link';

export default function Footer({ theme = 'dark' }) {
    const isLight = theme === 'light' || theme === 'olive';

    return (
        <footer className={`collection-bottom-bar ${isLight ? 'light-theme' : ''}`}>
            <span className="bottom-brand">PINTAARA™</span>
            <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
        </footer>
    );
}
