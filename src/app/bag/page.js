"use client";

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function BagPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { 
        cart, 
        removeFromCart, 
        updateQty, 
        subtotal, 
        shipping, 
        tax, 
        total 
    } = useCart();

    const handleNavigate = (index) => {
        const slideIds = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7'];
        if (slideIds[index]) {
            router.push(`/#${slideIds[index]}`);
        }
    };

    return (
        <div className="bag-page-root">
            {/* Header with dark style theme on cream page */}
            <Header headerStyle="dark" onNavigate={handleNavigate} />

            <div className="bag-main-container">
                <div className="bag-header-block">
                    <h1 className="bag-title">BAG</h1>
                    <span className="bag-subtitle">/ ORDER SUMMARY</span>
                </div>

                {cart.length === 0 ? (
                    <div className="empty-bag-block">
                        <p className="empty-message">Your shopping bag is currently empty.</p>
                        <Link href="/collection" className="empty-shop-btn">
                            EXPLORE THE COLLECTION
                        </Link>
                    </div>
                ) : (
                    <div className="bag-content-wrapper">
                        {/* Cart Items Table */}
                        <div className="cart-table-container">
                            <div className="cart-table-header">
                                <span className="th-col col-item">Item</span>
                                <span className="th-col col-details">Details</span>
                                <span className="th-col col-price">Price</span>
                                <span className="th-col col-qty">Qty</span>
                                <span className="th-col col-total">Total</span>
                                <span className="th-col col-action"></span>
                            </div>

                            <div className="cart-table-body">
                                {cart.map((item, index) => (
                                    <div key={`${item.code}-${index}`} className="cart-table-row">
                                        {/* Column 1: Image */}
                                        <div className="td-col col-item">
                                            <div className="cart-item-img-wrapper">
                                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                            </div>
                                        </div>

                                        {/* Column 2: Details */}
                                        <div className="td-col col-details">
                                            <span className="cart-item-code">{item.code}</span>
                                            <div className="cart-item-specs">
                                                <span className="spec-line">Metal: &nbsp;{item.metal}</span>
                                                <span className="spec-line">Finish: &nbsp;{item.finish}</span>
                                                {item.gem && <span className="spec-line">Gem: &nbsp;{item.gem}</span>}
                                                {item.size && <span className="spec-line">Size: &nbsp;{item.size}</span>}
                                                {item.chain && <span className="spec-line">Chain: &nbsp;{item.chain}</span>}
                                            </div>
                                        </div>

                                        {/* Column 3: Unit Price */}
                                        <div className="td-col col-price">
                                            <span className="price-val">₹ {item.price.toLocaleString('en-IN')}</span>
                                        </div>

                                        {/* Column 4: Quantity Control */}
                                        <div className="td-col col-qty">
                                            <div className="qty-control-box">
                                                <button 
                                                    className="qty-btn" 
                                                    onClick={() => updateQty(index, item.qty - 1)}
                                                    disabled={item.qty <= 1}
                                                >
                                                    &minus;
                                                </button>
                                                <span className="qty-val">{item.qty}</span>
                                                <button 
                                                    className="qty-btn" 
                                                    onClick={() => updateQty(index, item.qty + 1)}
                                                >
                                                    &#43;
                                                </button>
                                            </div>
                                        </div>

                                        {/* Column 5: Item Total */}
                                        <div className="td-col col-total">
                                            <span className="price-val">₹ {(item.price * item.qty).toLocaleString('en-IN')}</span>
                                        </div>

                                        {/* Column 6: Remove Button */}
                                        <div className="td-col col-action">
                                            <button className="remove-item-btn" onClick={() => removeFromCart(index)} title="Remove item">
                                                X
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Totals & Checkout Actions */}
                        <div className="bag-summary-totals-wrapper">
                            {/* Left: Summary breakdown list */}
                            <div className="summary-breakdown-box">
                                <div className="summary-breakdown-row">
                                    <span className="breakdown-label">Subtotal [{cart.reduce((total, item) => total + item.qty, 0)} Item]</span>
                                    <span className="breakdown-value">₹ {subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="summary-breakdown-row">
                                    <span className="breakdown-label">Shipping</span>
                                    <span className="breakdown-value status-free">FREE</span>
                                </div>
                                <div className="summary-breakdown-row">
                                    <span className="breakdown-label">Tax</span>
                                    <span className="breakdown-value">₹ {tax.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* Right: Grand total & action buttons */}
                            <div className="summary-grand-total-box">
                                <div className="grand-total-display">
                                    <span className="grand-total-amount">₹ {total.toLocaleString('en-IN')}</span>
                                    <span className="grand-total-subtext">Incl. taxes & charges</span>
                                </div>
                                <div className="bag-action-buttons-group">
                                    <Link href={user ? "/checkout" : "/login?redirect=/checkout"} className="proceed-checkout-btn">
                                        {user ? "PROCEED TO CHECKOUT" : "SIGN IN & CHECKOUT"}
                                    </Link>
                                    <Link href="/collection" className="continue-shopping-btn">
                                        &larr; CONTINUE SHOPPING
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Footer bar */}
            <footer className="collection-bottom-bar">
                <span className="bottom-brand">PINTAARA™</span>
                <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
            </footer>
        </div>
    );
}
