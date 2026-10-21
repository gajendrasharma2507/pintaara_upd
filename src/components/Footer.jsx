"use client";

import React from 'react';
import Link from 'next/link';

export default function Footer({ theme = 'dark' }) {
    const isLight = theme === 'light' || theme === 'olive';

    return (
        <footer className={`collection-bottom-bar subpage-footer ${isLight ? 'light-theme' : 'dark-theme'}`}>
            <Link href="/" className="bottom-brand footer-brand">
                PINTAARA™
            </Link>
            <span className="bottom-copyright footer-right">© ALL RIGHTS RESERVED.</span>
        </footer>
    );
}
