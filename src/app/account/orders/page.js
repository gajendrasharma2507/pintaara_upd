'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function AccountOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placedOrderNum, setPlacedOrderNum] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const placed = params.get('placed');
            if (placed) {
                setPlacedOrderNum(placed);
            }
        }
    }, []);

    const statusToStep = {
        'confirmed': 1,
        'in_production': 2,
        'inspection': 3,
        'shipped': 4,
        'delivered': 5,
    };

    const defaultSteps = [
        { num: '01', title: 'Order placed' },
        { num: '02', title: 'In creation' },
        { num: '03', title: 'Quality Check' },
        { num: '04', title: 'Dispatched' },
        { num: '05', title: 'Delivered' }
    ];

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await apiFetch('/user/orders');
                let mapped = [];
                if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
                    mapped = res.data.map((o) => ({
                        id: o.order_number,
                        itemCode: o.items?.[0]?.design_code || o.items?.[0]?.product_name || `ORDER #${o.order_number}`,
                        totalAmount: o.total_amount ? '₹' + Number(o.total_amount).toLocaleString('en-IN') : null,
                        createdAt: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
                        currentStep: statusToStep[o.status] || 1,
                        steps: defaultSteps,
                    }));
                } else {
                    // Check if recently placed order in session
                    try {
                        const localOrder = JSON.parse(localStorage.getItem('pintaara_last_order') || '{}');
                        if (localOrder?.order_number) {
                            const orderRes = await apiFetch(`/orders/${localOrder.order_number}`);
                            if (orderRes && orderRes.data) {
                                mapped = [{
                                    id: orderRes.data.order_number,
                                    itemCode: orderRes.data.items?.[0]?.design_code || orderRes.data.items?.[0]?.product_name || `ORDER #${orderRes.data.order_number}`,
                                    totalAmount: orderRes.data.pricing?.total_amount ? '₹' + Number(orderRes.data.pricing.total_amount).toLocaleString('en-IN') : null,
                                    createdAt: orderRes.data.created_at ? new Date(orderRes.data.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
                                    currentStep: orderRes.data.current_step || statusToStep[orderRes.data.status] || 1,
                                    steps: defaultSteps,
                                }];
                            }
                        }
                    } catch (e) {}
                }
                setOrders(mapped);
            } catch (err) {
                console.warn('Orders fetch note:', err.message);
                try {
                    const localOrder = JSON.parse(localStorage.getItem('pintaara_last_order') || '{}');
                    if (localOrder?.order_number) {
                        const orderRes = await apiFetch(`/orders/${localOrder.order_number}`);
                        if (orderRes && orderRes.data) {
                            setOrders([{
                                id: orderRes.data.order_number,
                                itemCode: orderRes.data.items?.[0]?.design_code || orderRes.data.items?.[0]?.product_name || 'PD-SD-OR-001',
                                currentStep: orderRes.data.current_step || statusToStep[orderRes.data.status] || 1,
                                steps: defaultSteps,
                            }]);
                        }
                    }
                } catch (e) {}
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="acct-orders-page">
            {/* Header */}
            <div className="acct-page-header">
                <div className="acct-title-group">
                    <h1 className="acct-page-title">ORDERS</h1>
                </div>
                <div className="acct-hairline" />
            </div>

            {/* Newly placed order success notification */}
            {placedOrderNum && (
                <div style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.08)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    borderRadius: '8px',
                    padding: '1.2rem 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.12em', color: '#9E7D28', textTransform: 'uppercase' }}>
                            ✓ Order #{placedOrderNum} Placed Successfully
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#5C554E', marginTop: '4px' }}>
                            Your bespoke fine jewelry order has been recorded in your patron account. Production has commenced.
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => setPlacedOrderNum(null)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#888', padding: '4px 8px' }}
                        aria-label="Dismiss"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Orders list */}
            <div className="acct-orders-list">
                {loading ? (
                    <div style={{ padding: '3rem 0', color: '#6C645C', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                        LOADING ORDERS...
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: '3.5rem 0', color: '#6C645C', fontSize: '0.85rem', letterSpacing: '0.08em', display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'flex-start' }}>
                        <p style={{ margin: 0, textTransform: 'uppercase' }}>NO ORDERS RECORDED FOR THIS ACCOUNT.</p>
                        <a 
                            href="/collection" 
                            style={{
                                display: 'inline-block',
                                border: '1px solid #1A1A1A',
                                padding: '10px 24px',
                                color: '#1A1A1A',
                                textDecoration: 'none',
                                fontSize: '0.78rem',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            Explore Atelier Collection
                        </a>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="acct-order-row">
                            <div className="acct-order-id-group">
                                <h2 className="acct-order-id">#{order.id}</h2>
                                <p className="acct-order-code">{order.itemCode}</p>
                                {order.totalAmount && (
                                    <span style={{ fontSize: '0.8rem', color: '#6C645C', letterSpacing: '0.04em', marginTop: '4px', display: 'block' }}>
                                        {order.totalAmount} {order.createdAt ? `• ${order.createdAt}` : ''}
                                    </span>
                                )}
                            </div>

                            {/* Milestone tracker matching Page 0009 */}
                            <div className="acct-tracker-wrapper">
                                <div className="acct-steps-labels">
                                    {order.steps.map((st) => (
                                        <div key={st.num} className="acct-step-col">
                                            <div className="acct-step-num">{st.num}</div>
                                            <div className="acct-step-title">{st.title}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Milestone track line */}
                                <div className="acct-track-line-row">
                                    {order.steps.map((st, idx) => {
                                        const isActive = idx + 1 === order.currentStep;
                                        const isLast = idx === order.steps.length - 1;
                                        return (
                                            <React.Fragment key={st.num}>
                                                <div className="acct-segment-solid">
                                                    {isActive && (
                                                        <div className="acct-active-dot">
                                                            <div className="acct-active-dot-inner" />
                                                        </div>
                                                    )}
                                                </div>
                                                {!isLast && <div className="acct-segment-dotted" />}
                                            </React.Fragment>
                                        );
                                    })}
                                    <div className="acct-segment-dotted-end" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx global>{`
                .acct-orders-page {
                    width: 100%;
                    max-width: 1100px;
                }
                .acct-page-header {
                    margin-bottom: 2.8rem;
                }
                .acct-title-group {
                    display: flex;
                    align-items: baseline;
                    gap: 0.8rem;
                    margin-bottom: 1.2rem;
                }
                .acct-page-title {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-size: 1.6rem;
                    font-weight: 400;
                    letter-spacing: 0.04em;
                    color: #111111;
                    margin: 0;
                }
                .acct-page-subtitle {
                    font-size: 0.88rem;
                    font-weight: 400;
                    letter-spacing: 0.04em;
                    color: #222222;
                    text-transform: uppercase;
                }
                .acct-hairline {
                    height: 1px;
                    background-color: #D6D0C6;
                    width: 100%;
                }
                .acct-order-row {
                    margin-bottom: 4rem;
                }
                .acct-order-id-group {
                    margin-bottom: 3.2rem;
                }
                .acct-order-id {
                    font-size: 1.05rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    color: #111111;
                    margin: 0 0 0.35rem 0;
                }
                .acct-order-code {
                    font-size: 0.92rem;
                    font-weight: 400;
                    letter-spacing: 0.04em;
                    color: #2F2A24;
                    margin: 0;
                }
                .acct-tracker-wrapper {
                    width: 100%;
                }
                .acct-steps-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1.4rem;
                }
                .acct-step-col {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .acct-step-num {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #111111;
                    letter-spacing: 0.04em;
                }
                .acct-step-title {
                    font-size: 0.9rem;
                    font-weight: 400;
                    color: #333333;
                    letter-spacing: 0.02em;
                }
                .acct-track-line-row {
                    display: flex;
                    align-items: center;
                    position: relative;
                    width: 100%;
                    height: 24px;
                }
                .acct-segment-solid {
                    flex: 1.2;
                    height: 1.5px;
                    background-color: #1F1F1F;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .acct-segment-dotted {
                    flex: 2;
                    height: 0px;
                    border-top: 1.5px dotted #333333;
                }
                .acct-segment-dotted-end {
                    flex: 1;
                    height: 0px;
                    border-top: 1.5px dotted #333333;
                }
                .acct-active-dot {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    border: 1.5px solid #8C8D5B;
                    background-color: #F5F2EB;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    box-sizing: border-box;
                }
                .acct-active-dot-inner {
                    width: 9px;
                    height: 9px;
                    border-radius: 50%;
                    background-color: #727344;
                }
                @media (max-width: 768px) {
                    .acct-steps-labels {
                        flex-direction: column;
                        gap: 1.5rem;
                    }
                    .acct-track-line-row {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
