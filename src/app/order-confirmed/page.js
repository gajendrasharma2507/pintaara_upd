"use client";

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function OrderConfirmedRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/account/collection');
    }, [router]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F1EC', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', letterSpacing: '0.14em', color: '#6C645C', textTransform: 'uppercase', fontWeight: 600 }}>
                REDIRECTING TO YOUR ATELIER COLLECTION...
            </span>
        </div>
    );
}

export default function OrderConfirmedPage() {
    return (
        <Suspense fallback={null}>
            <OrderConfirmedRedirect />
        </Suspense>
    );
}
