'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AccountAddressesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [shippingAddresses, setShippingAddresses] = useState([]);
    const [billingAddresses, setBillingAddresses] = useState([]);

    const fetchAddrs = async () => {
        try {
            const res = await api.getUserAddresses();
            if (res && res.data && Array.isArray(res.data)) {
                const mapped = res.data.map(a => ({
                    id: a.id,
                    tag: 'HOME',
                    isDefault: Boolean(a.is_default),
                    name: a.recipient_name,
                    contact: a.phone,
                    line1: a.address_line1,
                    line2: a.address_line2,
                    city: a.city,
                    state: a.state,
                    pincode: a.pincode,
                    country: a.country || 'India',
                    cityStateCountryPin: `${a.city || ''}, ${a.state || ''}, ${a.country || 'India'} - ${a.pincode || ''}`.replace(/^,\s*|,\s*$/g, ''),
                }));
                setShippingAddresses(mapped);
                setBillingAddresses(mapped);
            } else {
                setShippingAddresses([]);
                setBillingAddresses([]);
            }
        } catch (err) {
            console.warn('Addresses load note:', err.message);
            setShippingAddresses([]);
            setBillingAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchAddrs();
    }, []);

    // Modals: null | { type: 'SHIPPING' | 'BILLING', mode: 'ADD' | 'EDIT', data?: any }
    const [modalState, setModalState] = useState(null);
    const [successModal, setSuccessModal] = useState(null);

    // Form inputs matching 0016/0017
    const [formData, setFormData] = useState({
        tag: 'HOME',
        fullName: '',
        contact: '',
        line1: '',
        line2: '',
        city: '',
        stateProvince: '',
        country: '',
        pinCode: '',
        makeDefault: false,
    });

    const openAddModal = (type) => {
        setFormData({
            tag: 'HOME',
            fullName: '',
            contact: '',
            line1: '',
            line2: '',
            city: '',
            stateProvince: '',
            country: '',
            pinCode: '',
            makeDefault: false,
        });
        setModalState({ type, mode: 'ADD' });
    };

    const openEditModal = (type, addr) => {
        setFormData({
            tag: addr.tag || 'HOME',
            fullName: addr.name || '',
            contact: addr.contact || '',
            line1: addr.line1 || '',
            line2: addr.line2 || '',
            city: addr.city || '',
            stateProvince: addr.state || '',
            country: addr.country || 'India',
            pinCode: addr.pincode || '',
            makeDefault: addr.isDefault || false,
        });
        setModalState({ type, mode: 'EDIT', id: addr.id });
    };

    const handleDeleteAddress = async (id) => {
        if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to remove this saved address?')) return;
        try {
            await api.deleteUserAddress(id);
            await fetchAddrs();
        } catch (err) {
            console.warn('Delete address error:', err);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formattedCityLine = formData.city
            ? `${formData.city}, ${formData.stateProvince || ''}, ${formData.country || 'India'}${formData.pinCode ? ` - ${formData.pinCode}` : ''}`
            : '';

        const defaultName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') || 'Darshit Soni';
        const defaultPhone = user?.phone || user?.mobile || '95102 81139';

        const newItem = {
            id: modalState.id || `${modalState.type.toLowerCase()}-${Date.now()}`,
            tag: formData.tag || 'HOME',
            name: formData.fullName || defaultName,
            contact: formData.contact || defaultPhone,
            line1: formData.line1 || formData.line2 || '',
            cityStateCountryPin: formattedCityLine,
            isDefault: formData.makeDefault,
        };

        const isEdit = modalState.mode === 'EDIT' && typeof modalState.id === 'number';
        const addressPayload = {
            recipient_name: formData.fullName || defaultName,
            phone: formData.contact || defaultPhone,
            address_line1: formData.line1 || formData.line2 || '',
            address_line2: formData.line2 || '',
            city: formData.city,
            state: formData.stateProvince,
            pincode: formData.pinCode,
            country: formData.country || 'India',
            is_default: formData.makeDefault,
        };

        try {
            if (isEdit) {
                await api.updateUserAddress(modalState.id, addressPayload);
            } else {
                const res = await api.addUserAddress(addressPayload);
                if (res && res.data) {
                    newItem.id = res.data.id;
                }
            }
            await fetchAddrs();
        } catch (err) {
            console.warn('Address save error:', err);
        }

        const typeName = modalState.type === 'SHIPPING' ? 'SHIPPING' : 'BILLING';
        setModalState(null);
        setSuccessModal({
            title: `${typeName} ADDRESS ${isEdit ? 'UPDATED' : 'ADDED'}`,
            item: newItem,
        });
    };

    return (
        <div className="acct-address-page">
            {/* Header */}
            <div className="acct-address-header">
                <h1 className="acct-addr-title">ADDRESS</h1>
                <div className="acct-addr-divider" />
            </div>

            {loading ? (
                <div style={{ padding: '3rem 0', color: '#6C645C', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                    LOADING ADDRESSES...
                </div>
            ) : shippingAddresses.length === 0 && billingAddresses.length === 0 ? (
                /* EMPTY STATE VIEW (0015.jpg) */
                <div className="acct-empty-buttons-row">
                    <button
                        type="button"
                        className="acct-addr-outline-btn"
                        onClick={() => openAddModal('SHIPPING')}
                    >
                        ADD SHIPPING ADDRESS
                    </button>
                    <button
                        type="button"
                        className="acct-addr-outline-btn"
                        onClick={() => openAddModal('BILLING')}
                    >
                        ADD BILLING ADDRESS
                    </button>
                </div>
            ) : (
                /* POPULATED 2-COLUMN VIEW (0027.jpg / 0028.jpg) */
                <div className="acct-addr-columns">
                    {/* Left Column: Shipping Address */}
                    <div className="acct-addr-col">
                        <div className="acct-cards-stack">
                            {shippingAddresses.map((addr) => (
                                <div key={addr.id} className="acct-addr-card">
                                    <div className="acct-card-head">
                                        <span className="acct-tag-title">{addr.tag}</span>
                                        {addr.isDefault && (
                                            <span className="acct-default-label">Default</span>
                                        )}
                                    </div>

                                    <div className="acct-card-content">
                                        <p className="acct-addr-line">{addr.name}</p>
                                        <p className="acct-addr-line">{addr.line1}</p>
                                        <p className="acct-addr-line">{addr.cityStateCountryPin}</p>
                                        <p className="acct-addr-line">{addr.contact}</p>
                                    </div>

                                    <div className="acct-card-foot" style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            className="acct-edit-link"
                                            onClick={() => openEditModal('SHIPPING', addr)}
                                        >
                                            EDIT
                                        </button>
                                        <button
                                            type="button"
                                            className="acct-edit-link"
                                            style={{ color: '#888' }}
                                            onClick={() => handleDeleteAddress(addr.id)}
                                        >
                                            DELETE
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="acct-addr-outline-btn"
                            onClick={() => openAddModal('SHIPPING')}
                        >
                            ADD SHIPPING ADDRESS
                        </button>
                    </div>

                    {/* Right Column: Billing Address */}
                    <div className="acct-addr-col">
                        <div className="acct-cards-stack">
                            {billingAddresses.map((addr) => (
                                <div key={addr.id} className="acct-addr-card">
                                    <div className="acct-card-head">
                                        <span className="acct-tag-title">{addr.tag}</span>
                                        {addr.isDefault && (
                                            <span className="acct-default-label">Default</span>
                                        )}
                                    </div>

                                    <div className="acct-card-content">
                                        <p className="acct-addr-line">{addr.name}</p>
                                        <p className="acct-addr-line">{addr.line1}</p>
                                        <p className="acct-addr-line">{addr.cityStateCountryPin}</p>
                                        <p className="acct-addr-line">{addr.contact}</p>
                                    </div>

                                    <div className="acct-card-foot" style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            className="acct-edit-link"
                                            onClick={() => openEditModal('BILLING', addr)}
                                        >
                                            EDIT
                                        </button>
                                        <button
                                            type="button"
                                            className="acct-edit-link"
                                            style={{ color: '#888' }}
                                            onClick={() => handleDeleteAddress(addr.id)}
                                        >
                                            DELETE
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="acct-addr-outline-btn"
                            onClick={() => openAddModal('BILLING')}
                        >
                            ADD BILLING ADDRESS
                        </button>
                    </div>
                </div>
            )}

            {/* ADD/EDIT ADDRESS MODAL (Matching Image 2 / Image 3 & Figma 0016 / 0017) */}
            {modalState && (
                <div className="acct-modal-backdrop" onClick={() => setModalState(null)}>
                    <div className="acct-addr-modal-box" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="acct-modal-close-x"
                            onClick={() => setModalState(null)}
                            aria-label="Close"
                        >
                            ✕
                        </button>

                        <form onSubmit={handleFormSubmit} className="acct-addr-modal-form">
                            <div className="acct-modal-field">
                                <label className="acct-modal-lbl">Address line 2</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Area / Street / Landmark"
                                    value={formData.line2}
                                    onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                                    className="acct-modal-input"
                                    autoFocus
                                />
                            </div>

                            <div className="acct-modal-field">
                                <label className="acct-modal-lbl">City</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="acct-modal-input"
                                />
                            </div>

                            <div className="acct-modal-split-fields">
                                <div className="acct-modal-field">
                                    <label className="acct-modal-lbl">State / Province</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.stateProvince}
                                        onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                                        className="acct-modal-input"
                                    />
                                </div>
                                <div className="acct-modal-field">
                                    <label className="acct-modal-lbl">Country</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="acct-modal-input"
                                    />
                                </div>
                            </div>

                            <div className="acct-modal-field">
                                <label className="acct-modal-lbl">PIN code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.pinCode}
                                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                                    className="acct-modal-input"
                                />
                            </div>

                            <label className="acct-modal-checkbox-row">
                                <input
                                    type="checkbox"
                                    checked={formData.makeDefault}
                                    onChange={(e) => setFormData({ ...formData, makeDefault: e.target.checked })}
                                    className="acct-modal-chk"
                                />
                                <span>
                                    Make this my default {modalState.type === 'SHIPPING' ? 'Shipping' : 'billing'} address.
                                </span>
                            </label>

                            <button type="submit" className="acct-modal-solid-btn">
                                {modalState.mode === 'ADD' ? 'ADD ADDRESS' : 'SAVE CHANGES'}
                            </button>

                            {modalState.mode === 'EDIT' ? (
                                <div className="acct-modal-edit-btn-row">
                                    <button
                                        type="button"
                                        className="acct-modal-cancel-btn"
                                        onClick={() => setModalState(null)}
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="button"
                                        className="acct-modal-delete-btn"
                                        onClick={() => {
                                            if (modalState.id) {
                                                handleDeleteAddress(modalState.id);
                                                setModalState(null);
                                            }
                                        }}
                                    >
                                        DELETE
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="acct-modal-cancel-btn"
                                    onClick={() => setModalState(null)}
                                >
                                    CANCEL
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* SUCCESS MODAL (0018.jpg) */}
            {successModal && (
                <div className="acct-modal-backdrop" onClick={() => setSuccessModal(null)}>
                    <div className="acct-success-modal-box" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="acct-modal-close-x"
                            onClick={() => setSuccessModal(null)}
                        >
                            ✕
                        </button>

                        <div className="acct-success-check-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <polyline points="20 6 9 17 4 12" stroke="#7B7D50" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <h3 className="acct-success-heading">{successModal.title}</h3>

                        <div className="acct-success-preview-card">
                            <div className="acct-success-tag">{successModal.item.tag}</div>
                            <div className="acct-success-text">{successModal.item.name}</div>
                            <div className="acct-success-text">{successModal.item.line1}</div>
                            <div className="acct-success-text">{successModal.item.cityStateCountryPin}</div>
                            <div className="acct-success-text">{successModal.item.contact}</div>
                        </div>

                        <button
                            type="button"
                            className="acct-modal-solid-btn"
                            onClick={() => setSuccessModal(null)}
                        >
                            DONE
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .acct-address-page {
                    width: 100%;
                }
                .acct-address-header {
                    margin-bottom: 2rem;
                }
                .acct-addr-title {
                    font-size: 1.4rem;
                    font-weight: 500;
                    letter-spacing: 0.04em;
                    color: #1A1A1A;
                    margin: 0 0 1.25rem 0;
                }
                .acct-addr-subtitle-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .acct-addr-subtitle {
                    font-size: 0.85rem;
                    letter-spacing: 0.05em;
                    color: #1A1A1A;
                    font-weight: 400;
                }
                .acct-view-switchers {
                    display: flex;
                    gap: 0.5rem;
                }
                .acct-mode-tag {
                    background: transparent;
                    border: 1px solid #D6D2C8;
                    font-size: 0.72rem;
                    padding: 3px 8px;
                    color: #666;
                    cursor: pointer;
                    font-family: inherit;
                }
                .acct-mode-tag.active {
                    background: #1A1A1A;
                    color: #F5F2EB;
                    border-color: #1A1A1A;
                }
                .acct-addr-divider {
                    width: 100%;
                    height: 1px;
                    background-color: #D6D2C8;
                }

                /* EMPTY STATE BUTTONS ROW (0015) */
                .acct-empty-buttons-row {
                    display: grid;
                    grid-template-columns: 360px 360px;
                    gap: 5rem;
                    margin-top: 1rem;
                }

                /* 2-COLUMN POPULATED (0027) */
                .acct-addr-columns {
                    display: grid;
                    grid-template-columns: 360px 360px;
                    gap: 5rem;
                }
                .acct-addr-col {
                    display: flex;
                    flex-direction: column;
                    gap: 1.8rem;
                }
                .acct-cards-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 1.8rem;
                }

                /* Clean Address Card (No card color, no border) */
                .acct-addr-card {
                    background: transparent;
                    border: none;
                    border-radius: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                .acct-card-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.1rem;
                }
                .acct-tag-title {
                    font-size: 0.95rem;
                    font-weight: 500;
                    letter-spacing: 0.05em;
                    color: #1A1A1A;
                }
                .acct-default-label {
                    font-size: 0.82rem;
                    color: #7A7670;
                }
                .acct-card-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                    margin-bottom: 0.6rem;
                }
                .acct-addr-line {
                    font-size: 0.88rem;
                    color: #1A1A1A;
                    margin: 0;
                    line-height: 1.45;
                }
                .acct-card-foot {
                    display: flex;
                    justify-content: flex-end;
                }
                .acct-edit-link {
                    background: none;
                    border: none;
                    font-size: 0.82rem;
                    letter-spacing: 0.06em;
                    color: #7A7670;
                    cursor: pointer;
                    padding: 0;
                    font-family: inherit;
                    transition: color 0.2s ease;
                }
                .acct-edit-link:hover {
                    color: #1A1A1A;
                }

                /* Outline Button */
                .acct-addr-outline-btn {
                    width: 100%;
                    height: 46px;
                    background: transparent;
                    border: 1px solid #1A1A1A;
                    color: #1A1A1A;
                    font-size: 0.84rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: inherit;
                    transition: all 0.2s ease;
                }
                .acct-addr-outline-btn:hover {
                    background-color: #1A1A1A;
                    color: #F5F2EB;
                }

                /* MODAL BACKDROP */
                .acct-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(235, 230, 220, 0.72);
                    backdrop-filter: blur(2px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                /* ADD/EDIT ADDRESS MODAL BOX (Matching Image 2 / Image 3 & Figma 0016 / 0017) */
                .acct-addr-modal-box {
                    width: 100%;
                    max-width: 480px;
                    background-color: #F5F2EB;
                    padding: 2.25rem 2.25rem 2.25rem 2.25rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
                    position: relative;
                    box-sizing: border-box;
                    font-family: var(--font-body), sans-serif;
                }
                .acct-modal-close-x {
                    position: absolute;
                    right: 1.5rem;
                    top: 1.25rem;
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    color: #1A1A1A;
                    cursor: pointer;
                    padding: 0.25rem;
                    line-height: 1;
                    z-index: 2;
                    transition: opacity 0.15s ease;
                }
                .acct-modal-close-x:hover {
                    opacity: 0.7;
                }

                .acct-addr-modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                    margin-top: 0.5rem;
                }
                .acct-modal-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
                .acct-modal-lbl {
                    font-family: var(--font-body), sans-serif;
                    font-size: 0.85rem;
                    color: #1A1A1A;
                    font-weight: 400;
                }
                .acct-modal-input {
                    width: 100%;
                    height: 42px;
                    border: 1px solid #1A1A1A;
                    background: transparent;
                    padding: 0 12px;
                    font-size: 0.88rem;
                    color: #1A1A1A;
                    font-family: var(--font-body), sans-serif;
                    outline: none;
                    border-radius: 0;
                    box-sizing: border-box;
                }
                .acct-modal-input::placeholder {
                    color: #888;
                    font-family: var(--font-body), sans-serif;
                }
                .acct-modal-split-fields {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                }

                .acct-modal-checkbox-row {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    font-family: var(--font-body), sans-serif;
                    font-size: 0.85rem;
                    color: #1A1A1A;
                    cursor: pointer;
                    margin-top: 0.4rem;
                }
                .acct-modal-chk {
                    width: 16px;
                    height: 16px;
                    border: 1px solid #1A1A1A;
                    accent-color: #1A1A1A;
                    border-radius: 0;
                    cursor: pointer;
                }

                .acct-modal-solid-btn {
                    width: 100%;
                    height: 46px;
                    background-color: #1A1A1A;
                    color: #F5F2EB;
                    border: 1px solid #1A1A1A;
                    font-family: var(--font-body), sans-serif;
                    font-size: 0.84rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    cursor: pointer;
                    margin-top: 0.6rem;
                    text-transform: uppercase;
                    transition: background 0.15s ease;
                }
                .acct-modal-solid-btn:hover {
                    background-color: #333333;
                }

                .acct-modal-cancel-btn {
                    width: 100%;
                    height: 46px;
                    background-color: transparent;
                    color: #1A1A1A;
                    border: 1px solid #1A1A1A;
                    font-family: var(--font-body), sans-serif;
                    font-size: 0.84rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    cursor: pointer;
                    text-transform: uppercase;
                    transition: all 0.2s ease;
                }
                .acct-modal-cancel-btn:hover {
                    background-color: rgba(0,0,0,0.04);
                }

                .acct-modal-edit-btn-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1.5rem;
                }
                .acct-modal-edit-btn-row .acct-modal-cancel-btn {
                    flex: 1;
                }
                .acct-modal-delete-btn {
                    background: none;
                    border: none;
                    color: #F15B4C;
                    font-family: var(--font-body), sans-serif;
                    font-size: 0.84rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    cursor: pointer;
                    padding: 0 1rem;
                    text-transform: uppercase;
                    transition: opacity 0.15s ease;
                }
                .acct-modal-delete-btn:hover {
                    opacity: 0.8;
                }

                /* SUCCESS MODAL (0018) */
                .acct-success-modal-box {
                    width: 100%;
                    max-width: 480px;
                    background-color: #F5F2EB;
                    padding: 3rem 2.5rem 2.5rem 2.5rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.06);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                .acct-success-check-icon {
                    margin-bottom: 1.5rem;
                }
                .acct-success-heading {
                    font-size: 1.05rem;
                    font-weight: 500;
                    letter-spacing: 0.06em;
                    color: #1A1A1A;
                    margin: 0 0 1.8rem 0;
                }
                .acct-success-preview-card {
                    width: 100%;
                    background-color: #FAF7F2;
                    border-radius: 20px;
                    padding: 1.6rem 2rem;
                    text-align: left;
                    margin-bottom: 2rem;
                }
                .acct-success-tag {
                    font-size: 0.95rem;
                    font-weight: 500;
                    letter-spacing: 0.05em;
                    color: #1A1A1A;
                    margin-bottom: 0.8rem;
                }
                .acct-success-text {
                    font-size: 0.88rem;
                    color: #1A1A1A;
                    line-height: 1.45;
                }

                @media (max-width: 900px) {
                    .acct-addr-columns, .acct-empty-buttons-row {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                }
            `}</style>
        </div>
    );
}
