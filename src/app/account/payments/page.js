'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPaymentsPage() {
    const router = useRouter();

    useEffect(() => {
        // Payments are securely processed via Razorpay & Cash on Delivery at checkout
        router.replace('/account/orders');
    }, [router]);

    return (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: '#6C645C', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
            REDIRECTING TO ORDERS...
        </div>
    );
}
