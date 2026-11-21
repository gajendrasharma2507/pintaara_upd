"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';

function OrderCancelledContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [orderNumber, setOrderNumber] = useState('');

    useEffect(() => {
        const refParam = searchParams.get('ref') || searchParams.get('order');
        if (refParam) {
            setOrderNumber(refParam.startsWith('#') ? refParam : `#${refParam}`);
        } else {
            try {
                const last = JSON.parse(localStorage.getItem('pintaara_last_order') || 'null');
                if (last?.order_number) {
                    setOrderNumber(last.order_number.startsWith('#') ? last.order_number : `#${last.order_number}`);
                }
            } catch (e) {}
        }
    }, [searchParams]);

    return (
        <div className="confirmed-page-root">
            <Header headerStyle="dark" />

            <main className="confirmed-main">
                <img src="/images/logo-butterfly.png" alt="" aria-hidden="true" className="confirmed-watermark" />

                <section className="confirmed-intro">
                    <h1 className="confirmed-title" style={{ letterSpacing: '0.14em' }}>ORDER CANCELLED</h1>
                    <p className="confirmed-tagline">YOUR ORDER HAS BEEN CANCELLED.</p>
                    <div className="confirmed-rule" />
                    <p className="confirmed-note">
                        The specifications have been cancelled and production has been stopped. Any payment processed will be refunded to your original payment method.
                    </p>
                </section>

                <section className="confirmed-meta" aria-label="Order cancellation details">
                    <div className="confirmed-meta-col">
                        <span className="confirmed-meta-label">ORDER NUMBER</span>
                        <span className="confirmed-meta-value">{orderNumber || '—'}</span>
                    </div>
                    <div className="confirmed-meta-col">
                        <span className="confirmed-meta-label">STATUS</span>
                        <span className="confirmed-meta-value" style={{ color: '#B91C1C' }}>CANCELLED</span>
                    </div>
                </section>

                <section className="confirmed-bottom">
                    <div className="confirmed-bottom-col">
                        <svg className="confirmed-mail-icon" viewBox="0 0 40 25" fill="none" stroke="#5E5E5E" strokeWidth="1" aria-hidden="true">
                            <rect x="0.5" y="0.5" width="39" height="24" />
                            <path d="M0.5 0.5 L20 14 L39.5 0.5" />
                        </svg>
                        <p className="confirmed-bottom-text">
                            A cancellation confirmation has been recorded.<br />
                            Updates and refund details will be sent to your registered email address.
                        </p>
                    </div>
                    <div className="confirmed-bottom-col">
                        <p className="confirmed-bottom-text">
                            <strong>Need Assistance?</strong><br />
                            <a href="mailto:info@pintaara.com">info@pintaara.com</a>
                        </p>
                    </div>
                </section>
            </main>

            <footer className="collection-bottom-bar">
                <span className="bottom-brand">PINTAARA™</span>
                <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
            </footer>
        </div>
    );
}

export default function OrderCancelledPage() {
    return (
        <Suspense fallback={null}>
            <OrderCancelledContent />
        </Suspense>
    );
}
