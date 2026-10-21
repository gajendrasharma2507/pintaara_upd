"use client";

import React, { Suspense } from 'react';
import LegalPage from '../terms-of-use/page';

export default function TermsPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F6F4EE' }} />}>
            <LegalPage pageType="terms" />
        </Suspense>
    );
}
