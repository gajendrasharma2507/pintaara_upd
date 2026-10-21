"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

// Order confirmation — Website Design.pdf p.18.
// Checkout stores the placed order in localStorage ('pintaara_last_order')
// and sends the customer here; without a recent order we fall back to the
// customer's collection as before.
function OrderConfirmedContent() {
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        let last = null;
        try {
            last = JSON.parse(localStorage.getItem('pintaara_last_order') || 'null');
        } catch (e) {
            last = null;
        }
        // only show a confirmation for an order placed in the last hour
        const placedAt = last?.date ? new Date(last.date).getTime() : 0;
        if (!last?.order_number || Date.now() - placedAt > 60 * 60 * 1000) {
            router.replace('/account/collection');
            return;
        }
        setOrder(last);
        setChecked(true);
    }, [router]);

    if (!checked || !order) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F1EC' }}>
                <span style={{ fontSize: '0.85rem', letterSpacing: '0.14em', color: '#6C645C', textTransform: 'uppercase', fontWeight: 600 }}>
                    LOADING YOUR ORDER...
                </span>
            </div>
        );
    }

    const orderNumber = String(order.order_number).startsWith('#') ? order.order_number : `#${order.order_number}`;
    const estimate = order.delivery_method === 'pickup' ? 'READY IN 3 BUSINESS DAYS' : '7-12 BUSINESS DAYS';

    return (
        <div className="confirmed-page-root">
            <Header headerStyle="dark" />

            <main className="confirmed-main">
                <img src="/images/logo-butterfly.png" alt="" aria-hidden="true" className="confirmed-watermark" />

                <section className="confirmed-intro">
                    <h1 className="confirmed-title">ORDER CONFIRMED</h1>
                    <p className="confirmed-tagline">THE JOURNEY FROM FORM TO PRESENCE BEGINS.</p>
                    <div className="confirmed-rule" />
                    <p className="confirmed-note">
                        The specifications have been recorded, and your piece has entered production.
                    </p>
                </section>

                <section className="confirmed-meta" aria-label="Order details">
                    <div className="confirmed-meta-col">
                        <span className="confirmed-meta-label">ORDER NUMBER</span>
                        <span className="confirmed-meta-value">{orderNumber}</span>
                    </div>
                    <div className="confirmed-meta-col">
                        <span className="confirmed-meta-label">STATUS</span>
                        <span className="confirmed-meta-value">CONFIRMED</span>
                    </div>
                    <div className="confirmed-meta-col">
                        <span className="confirmed-meta-label">ESTIMATED DELIVERY</span>
                        <span className="confirmed-meta-value">{estimate}</span>
                    </div>
                </section>

                <section className="confirmed-bottom">
                    <div className="confirmed-bottom-col">
                        <svg className="confirmed-mail-icon" viewBox="0 0 40 25" fill="none" stroke="#5E5E5E" strokeWidth="1" aria-hidden="true">
                            <rect x="0.5" y="0.5" width="39" height="24" />
                            <path d="M0.5 0.5 L20 14 L39.5 0.5" />
                        </svg>
                        <p className="confirmed-bottom-text">
                            A confirmation email has been sent with your order details,<br />
                            and updates will be shared as your piece progresses.
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

export default function OrderConfirmedPage() {
    return (
        <Suspense fallback={null}>
            <OrderConfirmedContent />
        </Suspense>
    );
}
