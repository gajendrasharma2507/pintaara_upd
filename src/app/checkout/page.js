"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import api from '@/lib/api';
import PincodeInput from '@/components/PincodeInput';
import { isServiceablePincode, UNSERVICEABLE_PINCODE_MESSAGE } from '@/data/serviceablePincodes';

export default function CheckoutPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { formatRawAmount, convertPrice, calculateCartTotals, activeCurrency } = useCurrency();
    const { 
        cart, 
        subtotal, 
        shipping, 
        tax, 
        total,
        clearCart
    } = useCart();
    const checkoutTotals = calculateCartTotals(cart, tax);

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
                    const shippingOnly = res.data.filter(a => (a.type || 'shipping').toLowerCase() === 'shipping');
                    const list = shippingOnly.length > 0 ? shippingOnly : res.data;
                    setSavedAddresses(list);
                    const defaultAddr = list.find(a => a.is_default) || list[0];
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
        if (!pin.trim()) {
            errs.pin = 'Please enter pin code';
        } else if (!isServiceablePincode(pin)) {
            errs.pin = UNSERVICEABLE_PINCODE_MESSAGE;
        }
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
                amount: checkoutTotals.total,
                currency: activeCurrency?.currency_code || 'INR',
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

            if (!isLoaded || typeof window === 'undefined' || !window.Razorpay) {
                throw new Error('Unable to load Razorpay payment gateway. Please check your internet connection and try again.');
            }

            if (!rzpData?.key_id || !rzpData?.order_id) {
                throw new Error('Razorpay API keys are not configured. Please add them in Admin Settings.');
            }

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
                            currency: activeCurrency?.currency_code || 'INR',
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
                                    payment_method: 'Razorpay',
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
        } catch (err) {
            console.error('Razorpay initialization error:', err);
            setCheckoutError('Failed to initiate payment: ' + err.message);
            setSubmitting(false);
        }
    };

    const activeCode = (activeCurrency?.currency_code || 'INR').toUpperCase();
    const isIndiaCurrency = activeCode === 'INR';
    const PAYPAL_SUPPORTED = ['AUD', 'BRL', 'CAD', 'CNY', 'CZK', 'DKK', 'EUR', 'HKD', 'HUF', 'ILS', 'JPY', 'MYR', 'MXN', 'TWD', 'NZD', 'NOK', 'PHP', 'PLN', 'GBP', 'RUB', 'SGD', 'SEK', 'CHF', 'THB', 'USD'];
    const paypalSdkCurrency = PAYPAL_SUPPORTED.includes(activeCode) ? activeCode : 'USD';

    const paypalContainerRef = useRef(null);
    const [paypalReady, setPaypalReady] = useState(false);
    const [paypalError, setPaypalError] = useState('');
    const checkoutStateRef = useRef({});
    checkoutStateRef.current = {
        cart,
        checkoutTotals,
        activeCode,
        fullName,
        email,
        contact,
        address1,
        address2,
        city,
        state,
        country,
        pin,
        deliveryMethod,
    };

    useEffect(() => {
        if (isIndiaCurrency || activeStep !== 3) {
            setPaypalReady(false);
            setPaypalError('');
            return;
        }

        let cancelled = false;
        const initPayPal = async () => {
            try {
                const cfgRes = await api.getPayPalConfig();
                const cfg = cfgRes?.data;
                if (!cfg?.enabled || !cfg?.client_id) {
                    if (!cancelled) setPaypalError('PayPal is not configured in Admin Settings.');
                    return;
                }

                const existingScript = document.querySelector('script[data-pintaara-paypal="1"]');
                if (existingScript && existingScript.getAttribute('data-currency') !== paypalSdkCurrency) {
                    existingScript.remove();
                    if (typeof window !== 'undefined') delete window.paypal;
                }

                await new Promise((resolve, reject) => {
                    if (typeof window !== 'undefined' && window.paypal) {
                        resolve(true);
                        return;
                    }
                    const script = document.createElement('script');
                    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cfg.client_id)}&currency=${encodeURIComponent(paypalSdkCurrency)}&intent=capture`;
                    script.async = true;
                    script.setAttribute('data-pintaara-paypal', '1');
                    script.setAttribute('data-currency', paypalSdkCurrency);
                    script.onload = () => resolve(true);
                    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
                    document.body.appendChild(script);
                });

                if (cancelled || !paypalContainerRef.current || !window.paypal) return;
                paypalContainerRef.current.innerHTML = '';

                window.paypal.Buttons({
                    style: { layout: 'horizontal', color: 'black', shape: 'rect', label: 'pay', tagline: false, height: 42 },
                    onClick: (data, actions) => {
                        if (!validateShipping()) {
                            setActiveStep(1);
                            return actions.reject();
                        }
                        setCheckoutError('');
                        return actions.resolve();
                    },
                    createOrder: async () => {
                        const st = checkoutStateRef.current;
                        const res = await api.createPayPalOrder({
                            amount: st.checkoutTotals.total,
                            currency: st.activeCode,
                            items: st.cart.map(item => ({
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
                        });
                        if (res?.status !== 'success' || !res?.data?.order_id) {
                            throw new Error(res?.message || 'Unable to create PayPal order');
                        }
                        return res.data.order_id;
                    },
                    onApprove: async (data) => {
                        setSubmitting(true);
                        setCheckoutError('');
                        try {
                            const st = checkoutStateRef.current;
                            const capRes = await api.capturePayPalOrder({
                                paypal_order_id: data.orderID,
                                currency: st.activeCode,
                                customer_name: st.fullName,
                                customer_email: st.email,
                                customer_phone: st.contact,
                                shipping_address: `${st.address1}${st.address2 ? `, ${st.address2}` : ''}, ${st.city}, ${st.state}, ${st.country} - ${st.pin}`,
                                total_amount: st.checkoutTotals.total,
                                items: st.cart.map(item => ({
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
                                })),
                            });
                            if (capRes && capRes.status === 'success') {
                                clearCart();
                                try {
                                    localStorage.setItem('pintaara_last_order', JSON.stringify({
                                        order_number: capRes.order_number,
                                        payment_id: capRes.payment_id,
                                        payment_method: 'PayPal',
                                        delivery_method: st.deliveryMethod,
                                        date: new Date().toISOString()
                                    }));
                                } catch (e) {}
                                router.push('/order-confirmed');
                            } else {
                                setCheckoutError(capRes?.message || 'PayPal capture failed');
                                setSubmitting(false);
                            }
                        } catch (err) {
                            setCheckoutError('PayPal payment error: ' + err.message);
                            setSubmitting(false);
                        }
                    },
                    onCancel: () => {
                        setSubmitting(false);
                    },
                    onError: (err) => {
                        console.error('PayPal button error:', err);
                        setCheckoutError('PayPal error: ' + (err?.message || 'Unable to process payment'));
                        setSubmitting(false);
                    },
                }).render(paypalContainerRef.current);

                if (!cancelled) setPaypalReady(true);
            } catch (err) {
                if (!cancelled) {
                    setPaypalError(err?.message || 'Unable to load PayPal');
                }
            }
        };

        initPayPal();
        return () => { cancelled = true; };
    }, [isIndiaCurrency, activeStep, paypalSdkCurrency]);

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
                                                {fieldErrors.pin && <span className="field-error-text" style={{ display: 'block', marginTop: '8px' }}>{fieldErrors.pin}</span>}
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
                                                            <PincodeInput
                                                                placeholder="Pin Code *"
                                                                value={pin}
                                                                onChange={(val) => handleFieldChange('pin', setPin, val)}
                                                                className={`form-input ${fieldErrors.pin ? 'has-error' : ''}`}
                                                                externalError={fieldErrors.pin || ''}
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
                                                    value={isIndiaCurrency ? 'razorpay' : 'paypal'}
                                                    checked={true}
                                                    readOnly
                                                    className="radio-input"
                                                />
                                                <div className="radio-text-block">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span className="radio-title-tag">{isIndiaCurrency ? 'Checkout' : 'PayPal Checkout'}</span>
                                                    </div>
                                                    <span className="radio-description-tag">
                                                        {isIndiaCurrency
                                                            ? 'Instant payment via UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, Net Banking & Secure Wallets.'
                                                            : 'International payment via PayPal & Global Credit / Debit Cards.'}
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
                                                <span className="item-price-tag">{formatRawAmount(convertPrice(item.price) * item.qty)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-math-calculation-box">
                                    <div className="math-row">
                                        <span className="math-label">Subtotal [{cart.reduce((total, item) => total + item.qty, 0)} Item]</span>
                                        <span className="math-val">{formatRawAmount(checkoutTotals.subtotal)}</span>
                                    </div>
                                    <div className="math-row">
                                        <span className="math-label">Shipping</span>
                                        <span className="math-val status-free">FREE</span>
                                    </div>
                                    <div className="math-row">
                                        <span className="math-label">GST Tax (3%)</span>
                                        <span className="math-val">{formatRawAmount(checkoutTotals.tax)}</span>
                                    </div>
                                </div>

                                <div className="summary-checkout-grand-total">
                                    <div className="grand-total-display">
                                        <span className="total-tag">{formatRawAmount(checkoutTotals.total)}</span>
                                        <span className="total-subtext">Incl. taxes &amp; charges</span>
                                    </div>
                                    {activeStep === 3 && !isIndiaCurrency ? (
                                        <div style={{ minWidth: '180px' }}>
                                            {paypalError ? (
                                                <button
                                                    className="place-order-action-btn"
                                                    type="button"
                                                    onClick={() => setCheckoutError(paypalError)}
                                                >
                                                    PAYPAL UNAVAILABLE
                                                </button>
                                            ) : (
                                                <div ref={paypalContainerRef} />
                                            )}
                                        </div>
                                    ) : (
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
                                    )}
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
