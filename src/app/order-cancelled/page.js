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
        <div className="confirmed-page-root order-cancelled-root">
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

            <style jsx global>{`
                .order-cancelled-root {
                    background-color: #F8EFE6 !important;
                    min-height: 100vh;
                    display: flex !important;
                    flex-direction: column !important;
                    color: #1A1A1A;
                    container-type: inline-size;
                    --p: calc(100cqw / 1920);
                }

                .order-cancelled-root .confirmed-main {
                    flex: 1 0 auto !important;
                    height: auto !important;
                    min-height: calc(100vh - 220px) !important;
                    box-sizing: border-box;
                }

                /* Identical Footer to /account/collection */
                .order-cancelled-root .collection-bottom-bar {
                    margin-top: auto !important;
                    margin-bottom: 0 !important;
                    margin-left: calc(66 * var(--p)) !important;
                    margin-right: calc(66 * var(--p)) !important;
                    padding: calc(34 * var(--p)) calc(4 * var(--p)) 0 !important;
                    height: calc(99 * var(--p)) !important;
                    border-top: 1px solid currentColor !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: flex-start !important;
                    background: transparent !important;
                    width: auto !important;
                    box-sizing: border-box !important;
                    flex-shrink: 0 !important;
                }

                .order-cancelled-root .collection-bottom-bar span,
                .order-cancelled-root .collection-bottom-bar .bottom-brand,
                .order-cancelled-root .collection-bottom-bar .bottom-copyright {
                    font-family: var(--font-body) !important;
                    font-size: calc(18 * var(--p)) !important;
                    font-weight: 400 !important;
                    line-height: 1.389 !important;
                    letter-spacing: 0 !important;
                    text-transform: uppercase !important;
                    color: #1A1A1A !important;
                    opacity: 1 !important;
                }

                @media (max-width: 600px) {
                    .order-cancelled-root .collection-bottom-bar {
                        --m: calc(var(--u, 1px));
                        height: calc(46.5 * var(--m)) !important;
                        margin-left: calc(29 * var(--m)) !important;
                        margin-right: calc(32 * var(--m)) !important;
                        margin-top: auto !important;
                        padding: calc(13.2 * var(--m)) 0 0 calc(1 * var(--m)) !important;
                        border-top: max(1px, calc(0.45 * var(--m))) solid currentColor !important;
                    }

                    .order-cancelled-root .collection-bottom-bar span,
                    .order-cancelled-root .collection-bottom-bar .bottom-brand,
                    .order-cancelled-root .collection-bottom-bar .bottom-copyright {
                        font-size: max(10px, calc(7.2 * var(--m))) !important;
                        line-height: max(13px, calc(9.2 * var(--m))) !important;
                    }
                }
            `}</style>
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
