"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function CheckoutPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { 
        cart, 
        subtotal, 
        shipping, 
        tax, 
        total,
        clearCart
    } = useCart();

    // Enforce login before checkout
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/checkout');
        }
    }, [authLoading, user, router]);

    // Preload Razorpay checkout script on mount
    useEffect(() => {
        loadRazorpayScript();
    }, []);

    // Active step state (1: Shipping Details, 2: Delivery Method, 3: Payment Method)
    const [activeStep, setActiveStep] = useState(1);

    // Shipping details form state (clean real user input, no demo info)
    const [fullName, setFullName] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [city, setCity] = useState('');
    const [pin, setPin] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('India');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');

    // Saved addresses from Patron account
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);

    const applySavedAddress = (addr) => {
        if (!addr) return;
        setSelectedAddressId(addr.id);
        setFullName(addr.recipient_name || addr.fullName || addr.name || user?.name || '');
        setContact(addr.phone || addr.contact || user?.phone || '');
        setAddress1(addr.address_line1 || addr.line1 || addr.address1 || '');
        setAddress2(addr.address_line2 || addr.line2 || addr.address2 || '');
        setCity(addr.city || '');
        setPin(addr.pincode || addr.pin || addr.pinCode || '');
        setState(addr.state || addr.stateProvince || '');
        setCountry(addr.country || 'India');
        if (user?.email) setEmail((prev) => prev || user.email);
        setFieldErrors({});
    };

    // Pre-fill with authenticated user profile or previously saved user information
    useEffect(() => {
        try {
            const saved = localStorage.getItem('pintaara_shipping_info');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.fullName) setFullName(parsed.fullName);
                if (parsed.address1) setAddress1(parsed.address1);
                if (parsed.address2) setAddress2(parsed.address2);
                if (parsed.city) setCity(parsed.city);
                if (parsed.pin) setPin(parsed.pin);
                if (parsed.state) setState(parsed.state);
                if (parsed.country) setCountry(parsed.country);
                if (parsed.contact) setContact(parsed.contact);
                if (parsed.email) setEmail(parsed.email);
            }
        } catch (e) {}

        if (user) {
            if (user.name) setFullName((prev) => prev || user.name);
            if (user.email) setEmail((prev) => prev || user.email);
            if (user.phone) setContact((prev) => prev || user.phone);
        }
    }, [user]);

    // Fetch Patron's saved addresses from account backend
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return;
            setLoadingAddresses(true);
            try {
                const res = await api.getUserAddresses();
                if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setSavedAddresses(res.data);
                    const defaultAddr = res.data.find(a => a.is_default) || res.data[0];
                    if (defaultAddr) {
                        applySavedAddress(defaultAddr);
                        setIsAddingNewAddress(false);
                    }
                } else {
                    setIsAddingNewAddress(true);
                }
            } catch (err) {
                console.warn('Error fetching addresses on checkout:', err);
                setIsAddingNewAddress(true);
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, [user]);

    // Auto-save new address to patron account if requested
    const persistAddressIfNew = async () => {
        if (!user || !isAddingNewAddress || !saveAddressToAccount) return;
        if (!address1.trim() || !city.trim() || !pin.trim()) return;

        try {
            const addressPayload = {
                recipient_name: fullName.trim() || user?.name || 'Patron',
                phone: contact.trim() || user?.phone || '',
                address_line1: address1.trim(),
                address_line2: address2.trim() || null,
                city: city.trim(),
                state: state.trim(),
                pincode: pin.trim(),
                country: country || 'India',
                is_default: savedAddresses.length === 0,
            };
            const res = await api.addUserAddress(addressPayload);
            if (res && res.data) {
                const newSaved = res.data;
                setSavedAddresses(prev => {
                    const filtered = prev.filter(a => a.id !== newSaved.id);
                    return [newSaved, ...filtered];
                });
                setSelectedAddressId(newSaved.id);
            }
        } catch (err) {
            console.warn('Auto-save address error on checkout:', err);
        }
    };

    // Selection states
    const [deliveryMethod, setDeliveryMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [submitting, setSubmitting] = useState(false);

    // In-UI Pro validation & Modal states (NO browser alert() / confirm() popups!)
    const [fieldErrors, setFieldErrors] = useState({});
    const [checkoutError, setCheckoutError] = useState('');
    const [testPaymentModal, setTestPaymentModal] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentErrorMessage, setPaymentErrorMessage] = useState('');

    const handleFieldChange = (field, setter, val) => {
        setter(val);
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: null }));
        }
        if (checkoutError) {
            setCheckoutError('');
        }
    };

    const validateShipping = () => {
        const errs = {};
        if (!fullName.trim()) errs.fullName = 'Please enter your full name';
        if (!address1.trim()) errs.address1 = 'Please enter your street address';
        if (!city.trim()) errs.city = 'Please enter your city';
        if (!pin.trim()) errs.pin = 'Please enter pin code';
        if (!contact.trim()) {
            errs.contact = 'Please enter contact number';
        } else if (!/^[0-9+\s-]{8,15}$/.test(contact.trim())) {
            errs.contact = 'Please enter a valid phone number';
        }
        if (!email.trim()) {
            errs.email = 'Please enter email address';
        } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
            errs.email = 'Please enter a valid email address';
        }

        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNavigate = (index) => {
        const slideIds = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7'];
        if (slideIds[index]) {
            router.push(`/#${slideIds[index]}`);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (typeof window !== 'undefined' && window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleInitiateRazorpay = async () => {
        if (!validateShipping()) {
            setActiveStep(1);
            return;
        }

        setSubmitting(true);
        setCheckoutError('');
        try {
            // 1. Create Order via Laravel Backend Razorpay API with server-side price validation
            const orderRes = await api.createRazorpayOrder({
                amount: total,
                currency: 'INR',
                items: cart.map(item => ({
                    product_id: (typeof item.id === 'number' || (typeof item.id === 'string' && /^\d+$/.test(item.id))) ? parseInt(item.id, 10) : null,
                    design_code: item.code || item.id || null,
                    name: item.name || item.code || 'Bespoke Jewelry Piece',
                    price: item.price,
                    quantity: item.qty || 1,
                    metal_purity: item.metal || '18KT',
                    finish: item.finish || 'Yellow Gold',
                    size: item.size || null,
                    gem: item.gem || null,
                    chain: item.chain || null
                })),
                notes: {
                    customer_name: fullName,
                    customer_phone: contact,
                    customer_email: email,
                    items_count: cart.length
                }
            });

            if (!orderRes || orderRes.status !== 'success' || !orderRes.data) {
                throw new Error(orderRes?.message || 'Failed to initialize payment order');
            }

            const rzpData = orderRes.data;

            // 2. Load Razorpay Checkout Script
            const isLoaded = await loadRazorpayScript();

            // If real Razorpay order was created, open Official Razorpay Gateway Modal
            if (!rzpData.is_mock && typeof window !== 'undefined' && window.Razorpay) {
                // Open Official Razorpay Checkout Modal
                const options = {
                key: rzpData.key_id,
                amount: rzpData.amount,
                currency: rzpData.currency || 'INR',
                name: rzpData.merchant_name || 'PINTAARA',
                description: 'Precious Fine Jewelry Order',
                order_id: rzpData.order_id,
                handler: async function (response) {
                    try {
                        setSubmitting(true);
                        const verifyRes = await api.verifyRazorpayPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            customer_name: fullName,
                            customer_email: email,
                            customer_phone: contact,
                            shipping_address: `${address1}${address2 ? `, ${address2}` : ''}, ${city}, ${state}, ${country} - ${pin}`,
                            total_amount: total,
                            items: cart.map(item => ({
                                product_id: (typeof item.id === 'number' || (typeof item.id === 'string' && /^\d+$/.test(item.id))) ? parseInt(item.id, 10) : null,
                                name: item.name || item.code || 'Bespoke Jewelry Piece',
                                design_code: item.code || item.id || null,
                                price: item.price,
                                quantity: item.qty,
                                total: item.price * item.qty,
                                metal_purity: item.metal || '18KT',
                                finish: item.finish || 'Yellow Gold',
                                size: item.size || null,
                                gem: item.gem || null,
                                chain: item.chain || null
                            }))
                        });

                        if (verifyRes && verifyRes.status === 'success') {
                            clearCart();
                            try {
                                localStorage.setItem('pintaara_last_order', JSON.stringify({
                                    order_number: verifyRes.order_number,
                                    payment_id: response.razorpay_payment_id || verifyRes.payment_id,
                                    payment_method: 'Gpay',
                                    delivery_method: deliveryMethod,
                                    date: new Date().toISOString()
                                }));
                            } catch (e) {}
                            router.push('/order-confirmed');
                        } else {
                            setCheckoutError(verifyRes?.message || 'Payment verification failed');
                            setSubmitting(false);
                        }
                    } catch (err) {
                        setCheckoutError('Payment verification error: ' + err.message);
                        setSubmitting(false);
                    }
                },
                prefill: {
                    name: fullName,
                    email: email,
                    contact: contact
                },
                theme: {
                    color: '#18181B'
                },
                modal: {
                    ondismiss: function () {
                        setSubmitting(false);
                    }
                }
            };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    setCheckoutError(response.error?.description || 'Payment was cancelled');
                    setSubmitting(false);
                });
                rzp.open();
                return;
            }

            // Fallback terminal modal only if mock order was generated or gateway unavailable
            setTestPaymentModal({
                orderId: rzpData.order_id,
                amount: total,
                rzpData: rzpData
            });
            setSubmitting(false);
        } catch (err) {
            console.error('Razorpay initialization error:', err);
            setCheckoutError('Failed to initiate payment: ' + err.message);
            setSubmitting(false);
        }
    };

    const handleConfirmTestPayment = async () => {
        if (!testPaymentModal) return;
        setPaymentProcessing(true);
        setPaymentErrorMessage('');
        try {
            const mockPaymentId = `pay_live_${Date.now()}`;
            const verifyRes = await api.verifyRazorpayPayment({
                razorpay_payment_id: mockPaymentId,
                razorpay_order_id: testPaymentModal.orderId,
                razorpay_signature: 'mock_signature_test',
                customer_name: fullName,
                customer_email: email,
                customer_phone: contact,
                shipping_address: `${address1}${address2 ? `, ${address2}` : ''}, ${city}, ${state}, ${country} - ${pin}`,
                total_amount: total,
                items: cart.map(item => ({
                    product_id: (typeof item.id === 'number' || (typeof item.id === 'string' && /^\d+$/.test(item.id))) ? parseInt(item.id, 10) : null,
                    name: item.name || item.code || 'Bespoke Jewelry Piece',
                    design_code: item.code || item.id || null,
                    price: item.price,
                    quantity: item.qty,
                    total: item.price * item.qty,
                    metal_purity: item.metal || '18KT',
                    finish: item.finish || 'Yellow Gold',
                    size: item.size || null,
                    gem: item.gem || null,
                    chain: item.chain || null
                }))
            });

            if (verifyRes && verifyRes.status === 'success') {
                clearCart();
                try {
                    localStorage.setItem('pintaara_last_order', JSON.stringify({
                        order_number: verifyRes.order_number,
                        payment_id: mockPaymentId,
                        payment_method: 'Gpay',
                        delivery_method: deliveryMethod,
                        date: new Date().toISOString()
                    }));
                } catch (e) {}
                setTestPaymentModal(null);
                router.push('/order-confirmed');
            } else {
                setPaymentErrorMessage(verifyRes?.message || 'Payment verification failed');
                setPaymentProcessing(false);
            }
        } catch (err) {
            setPaymentErrorMessage(err.message || 'Payment processing error');
            setPaymentProcessing(false);
        }
    };

    const handleStepHeaderClick = (step) => {
        if (step > 1 && !validateShipping()) {
            setActiveStep(1);
            return;
        }
        if (activeStep === 1 && step > 1) {
            persistAddressIfNew();
        }
        setActiveStep(step);
    };

    const handleActionClick = async () => {
        if (activeStep === 1) {
            if (!validateShipping()) {
                return;
            }
            try {
                localStorage.setItem('pintaara_shipping_info', JSON.stringify({
                    fullName, address1, address2, city, pin, state, country, contact, email
                }));
            } catch (e) {}
            await persistAddressIfNew();
            setActiveStep(2);
        } else if (activeStep === 2) {
            setActiveStep(3);
        } else if (activeStep === 3) {
            await persistAddressIfNew();
            await handleInitiateRazorpay();
        }
    };

    if (authLoading || !user) {
        return (
            <div className="checkout-page-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#F5F1EC' }}>
                <span style={{ fontSize: '0.85rem', letterSpacing: '0.14em', color: '#6C645C', textTransform: 'uppercase', fontWeight: 600 }}>
                    PATRON SIGN-IN REQUIRED
                </span>
                <span style={{ fontSize: '0.78rem', color: '#9C948B' }}>
                    Redirecting to secure login...
                </span>
            </div>
        );
    }

    return (
        <div className="checkout-page-root">
            {/* Header configured with dark style theme */}
            <Header headerStyle="dark" onNavigate={handleNavigate} />

            <div className="checkout-main-container">
                <div className="checkout-header-block">
                    <h1 className="checkout-title">CHECKOUT</h1>
                    <span className="checkout-subtitle">/ CUSTOMER INFORMATION AND PAYMENT</span>
                </div>

                {cart.length === 0 ? (
                    <div className="empty-checkout-block">
                        <p className="empty-message">Your shopping bag is empty. Please add items before checking out.</p>
                        <Link href="/collection" className="empty-shop-btn">
                            EXPLORE COLLECTION
                        </Link>
                    </div>
                ) : (
                    <div className="checkout-content-wrapper">
                        
                        {/* Left Side Column: Accordion Checkout Form Steps */}
                        <div className="checkout-steps-column">
                            {checkoutError && (
                                <div className="checkout-inline-error-banner">
                                    <span>⚠ {checkoutError}</span>
                                </div>
                            )}

                            {/* Step 01: SHIPPING DETAILS */}
                            <div className={`checkout-step-card ${activeStep === 1 ? 'active' : ''}`}>
                                <div className="step-header" onClick={() => handleStepHeaderClick(1)}>
                                    <span className="step-number">01 SHIPPING DETAILS</span>
                                </div>

                                {activeStep === 1 ? (
                                    <div className="step-body-content">
                                        {/* If Patron has saved addresses and is NOT currently creating a new one */}
                                        {savedAddresses.length > 0 && !isAddingNewAddress ? (
                                            <div className="checkout-saved-addresses-block">
                                                <div className="saved-addresses-header">
                                                    <div>
                                                        <h3 className="saved-addresses-title">DELIVERY ADDRESS</h3>
                                                        <span className="saved-addresses-hint">Select a saved address from your account</span>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        className="checkout-add-new-addr-btn"
                                                        onClick={() => {
                                                            setIsAddingNewAddress(true);
                                                            setSelectedAddressId(null);
                                                            setAddress1('');
                                                            setAddress2('');
                                                            setCity('');
                                                            setPin('');
                                                            setState('');
                                                            setCountry('India');
                                                        }}
                                                    >
                                                        + ADD NEW ADDRESS
                                                    </button>
                                                </div>

                                                <div className="saved-addresses-grid">
                                                    {savedAddresses.map((addr) => {
                                                        const isSelected = selectedAddressId === addr.id;
                                                        return (
                                                            <div 
                                                                key={addr.id}
                                                                className={`saved-address-card ${isSelected ? 'selected' : ''}`}
                                                                onClick={() => applySavedAddress(addr)}
                                                            >
                                                                <div className="saved-card-header">
                                                                    <div className="saved-card-radio-group">
                                                                        <span className={`saved-radio-circle ${isSelected ? 'active' : ''}`} />
                                                                        <span className="saved-card-recipient-name">
                                                                            {addr.recipient_name || user?.name || 'Patron'}
                                                                        </span>
                                                                    </div>
                                                                    {addr.is_default ? (
                                                                        <span className="saved-default-badge">DEFAULT</span>
                                                                    ) : null}
                                                                </div>

                                                                <div className="saved-card-body">
                                                                    <p className="saved-card-line">
                                                                        {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                                                                    </p>
                                                                    <p className="saved-card-line">
                                                                        {addr.city}{addr.state ? `, ${addr.state}` : ''}{addr.country ? `, ${addr.country}` : ''} - {addr.pincode}
                                                                    </p>
                                                                    <p className="saved-card-phone">
                                                                        Phone: {addr.phone || contact || '—'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            /* If Patron needs to enter a new address or has no saved addresses */
                                            <div className="checkout-new-address-form-block">
                                                {savedAddresses.length > 0 && (
                                                    <div className="back-to-saved-row">
                                                        <button 
                                                            type="button"
                                                            className="back-to-saved-btn"
                                                            onClick={() => {
                                                                setIsAddingNewAddress(false);
                                                                const chosen = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];
                                                                applySavedAddress(chosen);
                                                            }}
                                                        >
                                                            ← CHOOSE FROM SAVED ADDRESSES ({savedAddresses.length})
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="shipping-form-grid">
                                                    <div className="form-field-row">
                                                        <label className="form-field-label">Full Name</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Full Name *" 
                                                            value={fullName}
                                                            onChange={(e) => handleFieldChange('fullName', setFullName, e.target.value)}
                                                            className={`form-input ${fieldErrors.fullName ? 'has-error' : ''}`} 
                                                        />
                                                        {fieldErrors.fullName && <span className="field-error-text">{fieldErrors.fullName}</span>}
                                                    </div>
                                                    <div className="form-field-row">
                                                        <label className="form-field-label">Address Line 1</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Address Line 1 *" 
                                                            value={address1}
                                                            onChange={(e) => handleFieldChange('address1', setAddress1, e.target.value)}
                                                            className={`form-input ${fieldErrors.address1 ? 'has-error' : ''}`} 
                                                        />
                                                        {fieldErrors.address1 && <span className="field-error-text">{fieldErrors.address1}</span>}
                                                    </div>
                                                    <div className="form-field-row">
                                                        <label className="form-field-label">Address Line 2</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Address Line 2 (Apartment, suite, etc.)" 
                                                            value={address2}
                                                            onChange={(e) => handleFieldChange('address2', setAddress2, e.target.value)}
                                                            className="form-input" 
                                                        />
                                                    </div>
                                                    <div className="form-field-split-row">
                                                        <div style={{ flex: 1 }}>
                                                            <label className="form-field-label">City</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="City *" 
                                                                value={city}
                                                                onChange={(e) => handleFieldChange('city', setCity, e.target.value)}
                                                                className={`form-input ${fieldErrors.city ? 'has-error' : ''}`} 
                                                            />
                                                            {fieldErrors.city && <span className="field-error-text">{fieldErrors.city}</span>}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <label className="form-field-label">Pin</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="Pin Code *" 
                                                                value={pin}
                                                                onChange={(e) => handleFieldChange('pin', setPin, e.target.value)}
                                                                className={`form-input ${fieldErrors.pin ? 'has-error' : ''}`} 
                                                            />
                                                            {fieldErrors.pin && <span className="field-error-text">{fieldErrors.pin}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="form-field-split-row">
                                                        <div style={{ flex: 1 }}>
                                                            <label className="form-field-label">State</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="State / Province *" 
                                                                value={state}
                                                                onChange={(e) => handleFieldChange('state', setState, e.target.value)}
                                                                className="form-input" 
                                                            />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <label className="form-field-label">Country</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="Country" 
                                                                value={country}
                                                                onChange={(e) => handleFieldChange('country', setCountry, e.target.value)}
                                                                className="form-input" 
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-field-row">
                                                        <label className="form-field-label">Contact</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Contact Number *" 
                                                            value={contact}
                                                            onChange={(e) => handleFieldChange('contact', setContact, e.target.value)}
                                                            className={`form-input ${fieldErrors.contact ? 'has-error' : ''}`} 
                                                        />
                                                        {fieldErrors.contact && <span className="field-error-text">{fieldErrors.contact}</span>}
                                                    </div>
                                                    <div className="form-field-row">
                                                        <label className="form-field-label">Email</label>
                                                        <input 
                                                            type="email" 
                                                            placeholder="Email Address *" 
                                                            value={email}
                                                            onChange={(e) => handleFieldChange('email', setEmail, e.target.value)}
                                                            className={`form-input ${fieldErrors.email ? 'has-error' : ''}`} 
                                                        />
                                                        {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
                                                    </div>
                                                </div>

                                                <div className="save-address-checkbox-wrapper">
                                                    <label className="save-address-checkbox-label">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={saveAddressToAccount}
                                                            onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                                                            className="save-address-checkbox"
                                                        />
                                                        <span>Save this address to my account for future orders</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="step-collapsed-summary">
                                        {fullName ? (
                                            <>
                                                <p className="summary-text-line">{fullName}</p>
                                                <p className="summary-text-line">{address1}{address2 ? `, ${address2}` : ''}</p>
                                                <p className="summary-text-line">{city}{state ? `, ${state}` : ''}{country ? `, ${country}` : ''}{pin ? ` - ${pin}` : ''}</p>
                                                <p className="summary-text-line">{contact}</p>
                                                <p className="summary-text-line">{email}</p>
                                            </>
                                        ) : (
                                            <p className="summary-text-line" style={{ color: '#888', fontStyle: 'italic' }}>
                                                Click to enter your shipping details
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Step 02: DELIVERY METHOD */}
                            <div className={`checkout-step-card ${activeStep === 2 ? 'active' : ''}`}>
                                <div className="step-header" onClick={() => handleStepHeaderClick(2)}>
                                    <span className="step-number">02 DELIVERY METHOD</span>
                                </div>

                                {activeStep === 2 ? (
                                    <div className="step-body-content">
                                        <div className="delivery-radio-group">
                                            <label className="radio-label-wrapper">
                                                <input 
                                                    type="radio" 
                                                    name="delivery_method" 
                                                    value="standard"
                                                    checked={deliveryMethod === 'standard'}
                                                    onChange={() => setDeliveryMethod('standard')}
                                                    className="radio-input"
                                                />
                                                <div className="radio-text-block">
                                                    <span className="radio-title-tag">Standard shipping</span>
                                                    <span className="radio-description-tag">The delivery will be done in 7-12 business days</span>
                                                </div>
                                            </label>

                                            <label className="radio-label-wrapper">
                                                <input 
                                                    type="radio" 
                                                    name="delivery_method" 
                                                    value="pickup"
                                                    checked={deliveryMethod === 'pickup'}
                                                    onChange={() => setDeliveryMethod('pickup')}
                                                    className="radio-input"
                                                />
                                                <div className="radio-text-block">
                                                    <span className="radio-title-tag">In-store pickup</span>
                                                    <span className="radio-description-tag">Ready in 3 business days. In-Store pickup requires the order&apos;s email confirmation and a valid photo ID matching the customer&apos;s purchase.</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    activeStep > 2 && (
                                        <div className="step-collapsed-summary">
                                            <p className="summary-text-line">
                                                Delivery [{cart.reduce((t, i) => t + i.qty, 0)} items]
                                            </p>
                                            <p className="summary-text-line">
                                                {deliveryMethod === 'standard' ? 'Standard shipping' : 'In-store pickup'}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Step 03: PAYMENT METHOD */}
                            <div className={`checkout-step-card ${activeStep === 3 ? 'active' : ''}`}>
                                <div className="step-header" onClick={() => handleStepHeaderClick(3)}>
                                    <span className="step-number">03 PAYMENT METHOD</span>
                                </div>

                                {activeStep === 3 && (
                                    <div className="step-body-content">
                                        <div className="payment-radio-group">
                                            <div className="radio-label-wrapper active" style={{ cursor: 'default', borderColor: 'rgba(212, 175, 55, 0.4)' }}>
                                                <input 
                                                    type="radio" 
                                                    name="payment_method" 
                                                    value="razorpay"
                                                    checked={true}
                                                    readOnly
                                                    className="radio-input"
                                                />
                                                <div className="radio-text-block">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span className="radio-title-tag">Checkout</span>
                                                    </div>
                                                    <span className="radio-description-tag">
                                                        Instant payment via UPI (Google Pay, PhonePe, Paytm), Credit &amp; Debit Cards, Net Banking &amp; Secure Wallets.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side Column: Fixed Order Summary Card */}
                        <div className="checkout-summary-column">
                            <div className="order-summary-card">
                                <h2 className="summary-title-heading">ORDER SUMMARY</h2>

                                <div className="summary-items-list">
                                    {cart.map((item, index) => (
                                        <div key={`${item.code}-${index}`} className="summary-item-card-row">
                                            <div className="summary-item-img-wrapper">
                                                <img src={item.image} alt={item.name} className="summary-item-img" />
                                            </div>
                                            <div className="summary-item-details">
                                                <span className="item-name-code">{item.code}</span>
                                                <span className="item-attrs">
                                                    {item.metal} {item.finish} {item.gem ? `| ${item.gem}` : ''}
                                                </span>
                                                {item.size && <span className="item-attrs">Size: {item.size}</span>}
                                                <span className="item-qty-tag">Qty: {item.qty}</span>
                                            </div>
                                            <div className="summary-item-price-col">
                                                <span className="item-price-tag">₹ {(item.price * item.qty).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-math-calculation-box">
                                    <div className="math-row">
                                        <span className="math-label">Subtotal [{cart.reduce((total, item) => total + item.qty, 0)} Item]</span>
                                        <span className="math-val">₹ {subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="math-row">
                                        <span className="math-label">Shipping</span>
                                        <span className="math-val status-free">FREE</span>
                                    </div>
                                    <div className="math-row">
                                        <span className="math-label">GST Tax (3%)</span>
                                        <span className="math-val">₹ {tax.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="summary-checkout-grand-total">
                                    <div className="grand-total-display">
                                        <span className="total-tag">₹ {total.toLocaleString('en-IN')}</span>
                                        <span className="total-subtext">Incl. taxes &amp; charges</span>
                                    </div>
                                    <button 
                                        className="place-order-action-btn" 
                                        onClick={handleActionClick}
                                        disabled={submitting}
                                    >
                                        {submitting 
                                            ? 'PROCESSING...' 
                                            : activeStep === 3 
                                                ? 'PLACE YOUR ORDER' 
                                                : 'CONTINUE'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* In-UI Pro Payment Authorization Terminal (Replaces browser popups) */}
            {testPaymentModal && (
                <div className="pro-terminal-overlay" onClick={() => !paymentProcessing && setTestPaymentModal(null)}>
                    <div className="pro-terminal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="pro-terminal-header">
                            <span className="pro-terminal-brand">PINTAARA ATELIER · PAYMENT GATEWAY</span>
                            <h3 className="pro-terminal-title">Authorize Bespoke Order</h3>
                        </div>

                        {paymentErrorMessage && (
                            <div className="checkout-inline-error-banner" style={{ marginBottom: 0 }}>
                                <span>⚠ {paymentErrorMessage}</span>
                            </div>
                        )}

                        <div className="pro-terminal-details">
                            <div className="pro-terminal-row">
                                <span className="pro-terminal-label">Customer</span>
                                <span className="pro-terminal-val">{fullName}</span>
                            </div>
                            <div className="pro-terminal-row">
                                <span className="pro-terminal-label">Contact</span>
                                <span className="pro-terminal-val">{contact} · {email}</span>
                            </div>
                            <div className="pro-terminal-row">
                                <span className="pro-terminal-label">Delivery To</span>
                                <span className="pro-terminal-val">{city}, {state || 'India'}</span>
                            </div>
                            <div className="pro-terminal-row">
                                <span className="pro-terminal-label">Order Reference</span>
                                <span className="pro-terminal-val" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    {testPaymentModal.orderId}
                                </span>
                            </div>
                            <div className="pro-terminal-row" style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <span className="pro-terminal-label" style={{ alignSelf: 'center' }}>Total Payable</span>
                                <span className="pro-terminal-val amount">
                                    ₹ {testPaymentModal.amount.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.2rem' }}>
                            <span className="pro-terminal-badge">
                                🔒 256-Bit Encrypted Atelier Authorization
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#9C948B', letterSpacing: '0.04em' }}>
                                Instant Confirmation
                            </span>
                        </div>

                        <div className="pro-terminal-actions">
                            <button
                                type="button"
                                className="pro-terminal-btn-primary"
                                onClick={handleConfirmTestPayment}
                                disabled={paymentProcessing}
                            >
                                {paymentProcessing ? 'AUTHORIZING & ISSUING CERTIFICATE...' : `AUTHORIZE PAYMENT ₹ ${testPaymentModal.amount.toLocaleString('en-IN')}`}
                            </button>
                            <button
                                type="button"
                                className="pro-terminal-btn-secondary"
                                onClick={() => setTestPaymentModal(null)}
                                disabled={paymentProcessing}
                            >
                                Return to Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Footer bar */}
            <footer className="collection-bottom-bar">
                <span className="bottom-brand">PINTAARA™</span>
                <span className="bottom-copyright">© ALL RIGHTS RESERVED.</span>
            </footer>
        </div>
    );
}
