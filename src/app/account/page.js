'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch, getApiHost } from '@/lib/api';

/* ─── Modal Shell matching 0031.jpg – 0038.jpg ─── */
function Modal({ onClose, children }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-window">
                <button className="modal-x" onClick={onClose} aria-label="Close">✕</button>
                {children}
            </div>
        </div>
    );
}

/* ─── 6-Digit OTP Box Row matching 0033.jpg & 0036.jpg ─── */
function OtpInput({ length = 6, value, onChange }) {
    const inputs = useRef([]);
    const vals = value.split('');

    const handleChange = (i, e) => {
        const char = e.target.value.replace(/\D/g, '').slice(-1);
        const next = [...vals];
        while (next.length < length) next.push('');
        next[i] = char;
        onChange(next.join(''));
        if (char && i < length - 1) {
            inputs.current[i + 1]?.focus();
        }
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace') {
            if (!vals[i] && i > 0) {
                inputs.current[i - 1]?.focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pasted);
        if (pasted.length > 0) {
            const nextIdx = Math.min(pasted.length, length - 1);
            inputs.current[nextIdx]?.focus();
        }
    };

    return (
        <div className="otp-box-row" onPaste={handlePaste}>
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    className="otp-box"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={vals[i] || ''}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                />
            ))}
        </div>
    );
}

export default function AccountProfilePage() {
    const { user, updateProfile, logout } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef(null);

    // Profile State (Matching 0029.jpg / 0030.jpg)
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [idProof, setIdProof] = useState("Aadhar, Driver's License, Passport");
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Modals:
    // 'editName' (0031.jpg)
    // 'changePhone' (0032.jpg) -> 'verifyPhone' (0033.jpg) -> 'phoneUpdated' (0034.jpg)
    // 'changeEmail' -> 'verifyEmail' -> 'emailUpdated'
    // 'changePassword' (0035.jpg) -> 'verifyPassword' (0036.jpg) -> 'passwordUpdated' (0037.jpg)
    // 'deleteAccount' (0038.jpg)
    const [modal, setModal] = useState(null);

    // Modal Temporary Inputs
    const [tempName, setTempName] = useState('');
    const [tempPhone, setTempPhone] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const [userOrders, setUserOrders] = useState([]);
    const [primaryAddress, setPrimaryAddress] = useState(null);

    useEffect(() => {
        if (user) {
            if (user.name) setName(user.name);
            if (user.phone) setPhone(user.phone);
            if (user.email) setEmail(user.email);
        }
    }, [user]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await apiFetch('/user/orders');
                if (res && (res.status === 'success' || res.success) && Array.isArray(res.data)) {
                    setUserOrders(res.data);
                }
            } catch (err) {}

            try {
                const addrsRes = await apiFetch('/user/addresses');
                if (addrsRes && addrsRes.data && Array.isArray(addrsRes.data) && addrsRes.data.length > 0) {
                    const defaultAddr = addrsRes.data.find(a => a.is_default) || addrsRes.data[0];
                    setPrimaryAddress(defaultAddr);
                }
            } catch (err) {}
        };
        fetchUserData();
    }, [user]);

    const closeModal = () => {
        setModal(null);
        setErrorMsg('');
        setOtpCode('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // Actions
    const handleOpenEditProfile = () => {
        setTempName(displayName || '');
        setTempPhone(displayPhone !== '—' ? displayPhone : '');
        setErrorMsg('');
        setModal('editProfile');
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!tempName.trim()) {
            setErrorMsg('Please enter your name');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await apiFetch('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    name: tempName.trim(),
                    phone: tempPhone.trim(),
                }),
            });
            if (res && res.user) {
                if (updateProfile) await updateProfile(res.user);
                setName(res.user.name);
                setPhone(res.user.phone);
                localStorage.setItem('pintaara_user', JSON.stringify(res.user));
            } else {
                if (updateProfile) await updateProfile({ name: tempName.trim(), phone: tempPhone.trim() });
                setName(tempName.trim());
                setPhone(tempPhone.trim());
            }
            closeModal();
        } catch (err) {
            setErrorMsg(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveName = async (e) => {
        e.preventDefault();
        if (!tempName.trim()) {
            setErrorMsg('Please enter your preferred name');
            return;
        }
        setLoading(true);
        try {
            if (updateProfile) await updateProfile({ name: tempName });
            setName(tempName);
            closeModal();
        } catch (err) {
            setErrorMsg(err.message || 'Failed to update name');
        } finally {
            setLoading(false);
        }
    };

    const handleContinuePhone = (e) => {
        e.preventDefault();
        if (!tempPhone.trim()) {
            setErrorMsg('Please enter a new phone number');
            return;
        }
        setErrorMsg('');
        setOtpCode('');
        setModal('verifyPhone');
    };

    const handleVerifyPhone = async (e) => {
        e.preventDefault();
        if (otpCode.length < 6) {
            setErrorMsg('Please enter the 6-digit verification code');
            return;
        }
        setLoading(true);
        try {
            if (updateProfile) await updateProfile({ phone: tempPhone });
            setPhone(tempPhone);
            setErrorMsg('');
            setModal('phoneUpdated');
        } catch (err) {
            setErrorMsg(err.message || 'Failed to update phone');
        } finally {
            setLoading(false);
        }
    };

    const handleContinueEmail = async (e) => {
        e.preventDefault();
        if (!tempEmail.trim() || !tempEmail.includes('@')) {
            setErrorMsg('Please enter a valid email address');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        try {
            await apiFetch('/auth/send-email-change-otp', {
                method: 'POST',
                body: JSON.stringify({ new_email: tempEmail }),
            });
            setOtpCode('');
            setModal('verifyEmail');
        } catch (err) {
            setErrorMsg(err.message || 'Failed to dispatch email verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        if (otpCode.length < 6) {
            setErrorMsg('Please enter the 6-digit verification code');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        try {
            await apiFetch('/auth/verify-email-change-otp', {
                method: 'POST',
                body: JSON.stringify({ new_email: tempEmail, otp: otpCode }),
            });
            setEmail(tempEmail);
            setModal('emailUpdated');
        } catch (err) {
            setErrorMsg(err.message || 'Invalid or expired verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleContinuePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword) {
            setErrorMsg('Please enter your old password');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setErrorMsg('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg('Passwords do not match');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        try {
            await apiFetch('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword,
                }),
            });
            setModal('passwordUpdated');
        } catch (err) {
            setErrorMsg(err.message || 'Current password incorrect');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPassword = (e) => {
        e.preventDefault();
        setModal('passwordUpdated');
    };

    const handleToggle2FA = () => {
        setTwoFactorEnabled(!twoFactorEnabled);
    };

    const handleConfirmDelete = () => {
        closeModal();
        alert('Your account deletion request has been submitted to PINTAARA Concierge.');
        if (logout) logout();
        router.push('/');
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setIdProof(file.name);
        }
    };

    const resolveDocUrl = (path) => {
        if (!path) return '';
        let clean = String(path).replace(/[\uFEFF\u200B-\u200D\u00A0]/g, '').trim();
        if (clean.includes('profile_driver_licence')) return '';
        if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
        if (clean.startsWith('/images/')) return clean;
        
        const apiHost = getApiHost().replace(/[\uFEFF\u200B-\u200D\u00A0]/g, '').trim();
        if (clean.startsWith('/storage/')) return `${apiHost}${clean}`;
        if (clean.startsWith('storage/')) return `${apiHost}/${clean}`;
        return `${apiHost}/storage/id_proofs/${clean}`;
    };

    const displayName = user?.name || name || 'Patron';
    const displayPhone = user?.phone || phone || '—';
    const displayEmail = user?.email || email || '—';
    const displayId = user?.id_number || (user?.id ? `PATRON #${user.id}` : 'PATRON ACCOUNT');
    
    const addressLine1 = primaryAddress?.address_line1 
        || user?.address_line1 
        || (userOrders[0]?.shipping_address ? userOrders[0].shipping_address.split(',')[0].trim() : 'No address on file');
    const addressLine2 = primaryAddress
        ? `${primaryAddress.city || ''}, ${primaryAddress.state || ''}, ${primaryAddress.country || 'India'}${primaryAddress.pincode ? ` - ${primaryAddress.pincode}` : ''}`.replace(/^,\s*|,\s*$/g, '')
        : (user?.address_line2 || (userOrders[0]?.shipping_address ? userOrders[0].shipping_address.split(',').slice(1).join(',').trim() : 'Manage addresses in the Addresses tab'));

    const [uploadingDoc, setUploadingDoc] = useState(false);

    const handleUploadDocument = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingDoc(true);
        try {
            const formData = new FormData();
            formData.append('id_proof_file', file);
            formData.append('id_proof_name', file.name);
            formData.append('_method', 'PUT');
            const res = await apiFetch('/auth/profile', {
                method: 'POST',
                body: formData,
            });
            const updatedUser = res?.user || res?.data;
            if (updatedUser) {
                if (updateProfile) await updateProfile(updatedUser);
                localStorage.setItem('pintaara_user', JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error('Document upload error:', err);
            alert('Failed to upload document: ' + (err.message || 'Please try again.'));
        } finally {
            setUploadingDoc(false);
            if (e.target) e.target.value = '';
        }
    };

    const rawDoc = user?.id_proof_path;
    const isMock = !rawDoc || (typeof rawDoc === 'string' && rawDoc.includes('profile_driver_licence'));
    const docPath = isMock ? null : rawDoc;
    const hasDoc = Boolean(docPath);
    const isPdf = hasDoc && docPath.toLowerCase().endsWith('.pdf');
    const isImage = hasDoc && !isPdf;

    return (
        <div className="profile-container">
            {/* Hidden Document File Uploader */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUploadDocument} 
                accept="application/pdf,image/*" 
                style={{ display: 'none' }} 
            />

            {/* ── Page Header ── */}
            <div className="profile-header">
                <h1 className="profile-title">PROFILE</h1>
                <p className="profile-subtitle">/ MANAGE YOUR PERSONAL INFORMATION AND ACCOUNT SETTINGS</p>
                <div className="profile-divider" />
            </div>

            {/* ── Profile Information & Security Settings Form (Matching Figma 0029/0030) ── */}
            <div className="profile-form-wrap">
                <h2 className="section-title">PERSONAL INFORMATION</h2>

                {/* FULL NAME */}
                <div className="form-group">
                    <label className="field-label">FULL NAME</label>
                    <div className="input-box clickable" onClick={() => setModal('editName')}>
                        <span className={name || (user?.name && user.name !== 'Patron') ? "input-val" : "input-placeholder"}>
                            {name || user?.name || "Name as per ID Proof"}
                        </span>
                        <span className="chevron">&gt;</span>
                    </div>
                </div>

                {/* CONTACT */}
                <div className="form-group">
                    <label className="field-label">CONTACT</label>
                    <div className="input-box clickable" onClick={() => setModal('changePhone')}>
                        <span className={phone && phone !== '—' ? "input-val" : "input-placeholder"}>
                            {phone && phone !== '—' ? phone : (user?.phone && user.phone !== '—' ? user.phone : "Mobile Number")}
                        </span>
                        <span className="chevron">&gt;</span>
                    </div>
                </div>

                {/* EMAIL */}
                <div className="form-group">
                    <label className="field-label">EMAIL</label>
                    <div className="input-box clickable" onClick={() => setModal('changeEmail')}>
                        <span className={email && email !== '—' ? "input-val" : "input-placeholder"}>
                            {email && email !== '—' ? email : (user?.email && user.email !== '—' ? user.email : "Email")}
                        </span>
                        <span className="chevron">&gt;</span>
                    </div>
                </div>

                {/* ID PROOF */}
                <div className="form-group">
                    <label className="field-label">ID PROOF</label>
                    <div className="id-proof-row">
                        <div className="input-box flex-1">
                            <span className={docPath ? "input-val" : "input-placeholder"}>
                                {docPath ? docPath.split('/').pop() : "Aadhar, Driver's License, Passport"}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="upload-square-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload ID Document"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* SECURITY */}
                <h2 className="section-title security-section-title">SECURITY</h2>

                {/* PASSWORD */}
                <div className="form-group">
                    <label className="field-label">PASSWORD</label>
                    <div className="input-box">
                        <span className="password-dots">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span>
                        <button
                            type="button"
                            className="inline-action-btn"
                            onClick={() => setModal('changePassword')}
                        >
                            CHANGE
                        </button>
                    </div>
                </div>

                {/* TWO-STEP VERIFICATION */}
                <div className="form-group">
                    <label className="field-label">TWO-STEP VERIFICATION</label>
                    <div className="input-box">
                        <span className="input-val">{twoFactorEnabled ? 'Enable' : 'Disable'}</span>
                        <button
                            type="button"
                            className="inline-action-btn"
                            onClick={handleToggle2FA}
                        >
                            {twoFactorEnabled ? 'DISABLE' : 'ENABLE'}
                        </button>
                    </div>
                </div>

                {/* DELETE ACCOUNT */}
                <div className="delete-row">
                    <button
                        type="button"
                        className="delete-account-link"
                        onClick={() => setModal('deleteAccount')}
                    >
                        DELETE ACCOUNT
                    </button>
                </div>
            </div>

            {/* ══════════════ MODALS ══════════════ */}

            {/* ── EDIT PROFILE MODAL ── */}
            {modal === 'editProfile' && (
                <Modal onClose={closeModal}>
                    <h3 className="modal-title">EDIT PROFILE</h3>
                    <form onSubmit={handleSaveProfile} className="modal-form">
                        <div className="modal-field">
                            <label className="modal-label">PREFERRED NAME</label>
                            <input
                                type="text"
                                className="modal-text-input"
                                placeholder="Full Name"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">CONTACT NUMBER</label>
                            <input
                                type="tel"
                                className="modal-text-input"
                                placeholder="Mobile Number"
                                value={tempPhone}
                                onChange={(e) => setTempPhone(e.target.value)}
                            />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">EMAIL ADDRESS (LOGIN)</label>
                            <input
                                type="email"
                                className="modal-text-input"
                                value={displayEmail}
                                readOnly
                                style={{ background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed', color: '#6C645C' }}
                            />
                        </div>
                        {errorMsg && <p className="modal-error">{errorMsg}</p>}
                        <div className="modal-buttons">
                            <button type="submit" className="btn-solid" disabled={loading}>
                                {loading ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                            <button type="button" className="btn-outline" onClick={closeModal}>
                                CANCEL
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── 0031.jpg: EDIT NAME ── */}
            {modal === 'editName' && (
                <Modal onClose={closeModal}>
                    <h3 className="modal-title">EDIT NAME</h3>
                    <form onSubmit={handleSaveName} className="modal-form">
                        <div className="modal-field">
                            <label className="modal-label">PREFERRED NAME</label>
                            <input
                                type="text"
                                className="modal-text-input"
                                placeholder="Name"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {errorMsg && <p className="modal-error">{errorMsg}</p>}
                        <div className="modal-buttons">
                            <button type="submit" className="btn-solid" disabled={loading}>
                                {loading ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                            <button type="button" className="btn-outline" onClick={closeModal}>
                                CANCEL
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── 0032.jpg: CHANGE CONTACT NUMBER ── */}
            {modal === 'changePhone' && (
                <Modal onClose={closeModal}>
                    <h3 className="modal-title">CHANGE CONTACT NUMBER</h3>
                    <form onSubmit={handleContinuePhone} className="modal-form">
                        <div className="modal-field">
                            <label className="modal-label">CURRENT NUMBER</label>
                            <input
                                type="text"
                                className="modal-text-input"
                                value={phone || '00000 08956'}
                                readOnly
                            />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">NEW NUMBER</label>
                            <input
                                type="tel"
                                className="modal-text-input"
                                placeholder="New Mobile Number"
                                value={tempPhone}
                                onChange={(e) => setTempPhone(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {errorMsg && <p className="modal-error">{errorMsg}</p>}
                        <div className="modal-buttons">
                            <button type="submit" className="btn-solid">
                                CONTINUE
                            </button>
                            <button type="button" className="btn-outline" onClick={closeModal}>
                                CANCEL
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── 0033.jpg: VERIFY CONTACT NUMBER ── */}
            {modal === 'verifyPhone' && (
                <Modal onClose={closeModal}>
                    <h3 className="modal-title">VERIFY CONTACT NUMBER</h3>
                    <div className="modal-instruction">
                        <div>ENTER THE CODE SENT TO</div>
                        <div className="highlight-contact">{tempPhone || '+92 18000 33488'}</div>
                    </div>
                    <form onSubmit={handleVerifyPhone} className="modal-form">
                        <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
                        {errorMsg && <p className="modal-error">{errorMsg}</p>}
                        <div className="modal-buttons">
                            <button type="submit" className="btn-solid">
                                VERIFY
                            </button>
                            <button type="button" className="btn-outline" onClick={closeModal}>
                                CANCEL
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── 0034.jpg: CONTACT NUMBER UPDATED ── */}
            {modal === 'phoneUpdated' && (
                <Modal onClose={closeModal}>
                    <div className="success-content">
                        <div className="olive-check-icon">
                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                <path
                                    d="M11 22 L19 30 L33 14"
                                    stroke="#5E6338"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <h3 className="modal-title no-margin">CONTACT NUMBER UPDATED</h3>
                        <div className="modal-buttons full-width" style={{ marginTop: '2.5rem' }}>
                            <button type="button" className="btn-solid" onClick={closeModal}>
                                DONE
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── CHANGE EMAIL MODAL ── */}
            {modal === 'changeEmail' && (
                <Modal onClose={closeModal}>
                    <h3 className="modal-title">CHANGE EMAIL</h3>
                    <form onSubmit={handleContinueEmail} className="modal-form">
                        <div className="modal-field">
                            <label className="modal-label">CURRENT EMAIL</label>
                            <input
                                type="text"
                                className="modal-text-input"
                                value={email || 'darshit@pintaara.com'}
                                readOnly
                            />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">NEW EMAIL</label>
                            <input
                                type="email"
                                className="modal-text-input"
                                placeholder="New Email Address"
                                value={tempEmail}
                                onChange={(e) => setTempEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {errorMsg && <p className="modal-error">{errorMsg}</p>}
                        <div className="modal-buttons">
                            <button type="submit" className="btn-solid">
                                CONTINUE
                            </button>
                            <button type="button" className="btn-outline" onClick={closeModal}>
                                CANCEL
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── VERIFY EMAIL MODAL ── */}
            {modal === 'verifyEmail' && (
                <Modal onClose={closeModal}>
                    <h3 className="modal-title">VERIFY EMAIL</h3>
                    <div className="modal-instruction">
                        <div>ENTER THE CODE SENT TO</div>
                        <div className="highlight-contact">{tempEmail}</div>
                    </div>
                    <form onSubmit={handleVerifyEmail} className="modal-form">
                        <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
                        {errorMsg && <p className="modal-error">{errorMsg}</p>}
                        <div className="modal-buttons">
                            <button type="submit" className="btn-solid">
                                VERIFY
                            </button>
                            <button type="button" className="btn-outline" onClick={closeModal}>
                                CANCEL
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── EMAIL UPDATED SUCCESS ── */}
            {modal === 'emailUpdated' && (
                <Modal onClose={closeModal}>
                    <div className="success-content">
                        <div className="olive-check-icon">
                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                <path
                                    d="M11 22 L19 30 L33 14"
                                    stroke="#5E6338"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <h3 className="modal-title no-margin">EMAIL UPDATED</h3>
                        <div className="modal-buttons full-width" style={{ marginTop: '2.5rem' }}>
                            <button type="button" className="btn-solid" onClick={closeModal}>
                                DONE
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── 0035.jpg: CHANGE PASSWORD ── */}
            {modal === 'changePassword' && (
                <Modal onClose={closeModal}>
                    <h3 className="modal-title">CHANGE PASSWORD</h3>
                    <form onSubmit={handleContinuePassword} className="modal-form">
                        <div className="modal-field">
                            <label className="modal-label">OLD PASSWORD</label>
                            <input
                                type="password"
                                className="modal-text-input"
                                placeholder="••••••••"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">NEW PASSWORD</label>
                            <input
                                type="password"
                                className="modal-text-input"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">CONFIRM NEW PASSWORD</label>
                            <input
                                type="password"
                                className="modal-text-input"
                                placeholder="Re-enter New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        {errorMsg && <p className="modal-error">{errorMsg}</p>}
                        <div className="modal-buttons">
                            <button type="submit" className="btn-solid">
                                CONTINUE
                            </button>
                            <button type="button" className="btn-outline" onClick={closeModal}>
                                CANCEL
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── 0036.jpg: VERIFY PASSWORD ── */}
            {modal === 'verifyPassword' && (
                <Modal onClose={closeModal}>
                    <h3 className="modal-title">VERIFY PASSWORD</h3>
                    <div className="modal-instruction">
                        <div>ENTER THE CODE SENT TO</div>
                        <div className="highlight-contact">
                            {email ? email.replace(/(.{2})(.*)(@.*)/, '$1*******$3') : '*******@gmail.com'}
                        </div>
                    </div>
                    <form onSubmit={handleVerifyPassword} className="modal-form">
                        <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
                        {errorMsg && <p className="modal-error">{errorMsg}</p>}
                        <div className="modal-buttons">
                            <button type="submit" className="btn-solid">
                                VERIFY
                            </button>
                            <button type="button" className="btn-outline" onClick={closeModal}>
                                CANCEL
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── 0037.jpg: PASSWORD UPDATED ── */}
            {modal === 'passwordUpdated' && (
                <Modal onClose={closeModal}>
                    <div className="success-content">
                        <div className="olive-check-icon">
                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                <path
                                    d="M11 22 L19 30 L33 14"
                                    stroke="#5E6338"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <h3 className="modal-title no-margin">PASSWORD UPDATED</h3>
                        <div className="modal-buttons full-width" style={{ marginTop: '2.5rem' }}>
                            <button type="button" className="btn-solid" onClick={closeModal}>
                                DONE
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── 0038.jpg: DELETE ACCOUNT? ── */}
            {modal === 'deleteAccount' && (
                <Modal onClose={closeModal}>
                    <div className="delete-modal-content">
                        <div className="trash-icon-wrap">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F15B4C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                        </div>
                        <h3 className="modal-title delete-title">DELETE ACCOUNT?</h3>
                        <div className="delete-warning-text">
                            <div className="warning-strong">This action cannot be undone.</div>
                            <div className="warning-sub">Are you sure to permenantly delete your account with PINTAARA?</div>
                        </div>
                        <div className="modal-buttons full-width" style={{ marginTop: '2.2rem' }}>
                            <button type="button" className="btn-solid" onClick={handleConfirmDelete}>
                                DELETE
                            </button>
                            <button type="button" className="btn-outline" onClick={closeModal}>
                                CANCEL
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ══════════════ STYLES ══════════════ */}
            <style jsx global>{`
                .profile-container {
                    width: 100%;
                }

                /* Header matching user reference */
                .profile-header {
                    margin-bottom: 2rem;
                }
                .profile-title {
                    font-size: 1.15rem;
                    font-weight: 500;
                    letter-spacing: 0.06em;
                    color: #1A1A1A;
                    margin: 0 0 1.25rem 0;
                    text-transform: uppercase;
                }
                .profile-subtitle {
                    font-size: 0.72rem;
                    letter-spacing: 0.08em;
                    color: #222222;
                    font-weight: 400;
                    margin-top: 0.45rem;
                    margin-bottom: 1.25rem;
                    text-transform: uppercase;
                }
                .profile-divider {
                    width: 100%;
                    height: 1px;
                    background-color: #D3CDC2;
                    margin: 0;
                }

                /* Profile Form (Matching Figma 0029 / 0030) */
                .profile-form-wrap {
                    width: 100%;
                    max-width: 680px;
                    padding-top: 1.5rem;
                }
                .section-title {
                    font-family: var(--font-body), sans-serif;
                    font-size: 0.84rem;
                    font-weight: 400;
                    letter-spacing: 0.08em;
                    color: #1A1A1A;
                    text-transform: uppercase;
                    margin: 0 0 1.5rem 0;
                }
                .security-section-title {
                    margin-top: 2.75rem;
                    margin-bottom: 1.5rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.45rem;
                    margin-bottom: 1.35rem;
                }
                .field-label {
                    font-size: 0.72rem;
                    font-weight: 400;
                    letter-spacing: 0.05em;
                    color: #1A1A1A;
                    text-transform: uppercase;
                }

                /* Inputs */
                .input-box {
                    height: 44px;
                    border: 1px solid #1A1A1A;
                    background-color: transparent;
                    padding: 0 14px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-sizing: border-box;
                    transition: background 0.15s ease;
                }
                .input-box.clickable {
                    cursor: pointer;
                }
                .input-box.clickable:hover {
                    background-color: rgba(26, 26, 26, 0.03);
                }
                .input-val {
                    font-size: 0.85rem;
                    color: #1A1A1A;
                    letter-spacing: 0.02em;
                }
                .input-placeholder {
                    font-size: 0.85rem;
                    color: #7A7670;
                    letter-spacing: 0.02em;
                }
                .chevron {
                    font-size: 0.95rem;
                    color: #1A1A1A;
                    font-weight: 400;
                    user-select: none;
                }
                .flex-1 {
                    flex: 1;
                }

                /* ID Proof row */
                .id-proof-row {
                    display: flex;
                    gap: 14px;
                    align-items: center;
                }
                .upload-square-btn {
                    width: 44px;
                    height: 44px;
                    border: 1px solid #1A1A1A;
                    background-color: #D2D0C8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: opacity 0.15s ease;
                }
                .upload-square-btn:hover {
                    opacity: 0.85;
                }

                /* Password & 2FA */
                .password-dots {
                    font-size: 1.3rem;
                    letter-spacing: 0.15em;
                    line-height: 1;
                    color: #1A1A1A;
                }
                .inline-action-btn {
                    background: transparent;
                    border: none;
                    color: #1A1A1A;
                    font-size: 0.75rem;
                    font-weight: 500;
                    letter-spacing: 0.06em;
                    cursor: pointer;
                    padding: 4px 6px;
                    text-transform: uppercase;
                }
                .inline-action-btn:hover {
                    text-decoration: underline;
                }

                /* Delete Account */
                .delete-row {
                    margin-top: 1.8rem;
                }
                .delete-account-link {
                    background: none;
                    border: none;
                    color: #E25B49;
                    font-size: 0.82rem;
                    letter-spacing: 0.06em;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 0;
                    text-transform: uppercase;
                    transition: opacity 0.2s ease;
                }
                .delete-account-link:hover {
                    opacity: 0.8;
                }

                /* ── MODALS matching 0031.jpg – 0038.jpg ── */
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.45);
                    backdrop-filter: blur(2px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1.5rem;
                }
                .modal-window {
                    background-color: #F5F2EB;
                    width: 100%;
                    max-width: 480px;
                    border: 1px solid #1A1A1A;
                    padding: 3rem 2.8rem 2.5rem 2.8rem;
                    position: relative;
                    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.18);
                    box-sizing: border-box;
                }
                .modal-x {
                    position: absolute;
                    top: 1.25rem;
                    right: 1.25rem;
                    background: none;
                    border: none;
                    font-size: 1.15rem;
                    cursor: pointer;
                    color: #1A1A1A;
                    padding: 0.25rem;
                    line-height: 1;
                }
                .modal-x:hover {
                    opacity: 0.7;
                }

                .modal-title {
                    font-size: 0.95rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    color: #1A1A1A;
                    text-align: center;
                    margin: 0 0 2rem 0;
                    text-transform: uppercase;
                }
                .modal-title.no-margin {
                    margin: 0;
                }
                .modal-title.delete-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0 0 1rem 0;
                }

                .modal-instruction {
                    text-align: center;
                    font-size: 0.82rem;
                    letter-spacing: 0.05em;
                    line-height: 1.6;
                    color: #1A1A1A;
                    margin-bottom: 2rem;
                }
                .highlight-contact {
                    font-weight: 500;
                    letter-spacing: 0.04em;
                }

                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.3rem;
                }
                .modal-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.45rem;
                }
                .modal-label {
                    font-size: 0.72rem;
                    font-weight: 400;
                    letter-spacing: 0.05em;
                    color: #1A1A1A;
                    text-transform: uppercase;
                }
                .modal-text-input {
                    height: 44px;
                    border: 1px solid #1A1A1A;
                    background-color: transparent;
                    padding: 0 14px;
                    font-size: 0.85rem;
                    color: #1A1A1A;
                    font-family: inherit;
                    width: 100%;
                    box-sizing: border-box;
                    border-radius: 0;
                }
                .modal-text-input:focus {
                    outline: none;
                    background-color: rgba(255, 255, 255, 0.4);
                }
                .modal-error {
                    color: #E25B49;
                    font-size: 0.78rem;
                    margin: -0.3rem 0 0 0;
                    text-align: center;
                }

                .modal-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.65rem;
                    margin-top: 1rem;
                }
                .modal-buttons.full-width {
                    width: 100%;
                }

                .btn-solid {
                    height: 44px;
                    background-color: #1A1A1A;
                    color: #F5F2EB;
                    border: 1px solid #1A1A1A;
                    font-size: 0.78rem;
                    font-weight: 500;
                    letter-spacing: 0.1em;
                    cursor: pointer;
                    width: 100%;
                    text-transform: uppercase;
                    transition: background 0.15s ease;
                }
                .btn-solid:hover {
                    background-color: #333333;
                }
                .btn-solid:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-outline {
                    height: 44px;
                    background-color: transparent;
                    color: #1A1A1A;
                    border: 1px solid #1A1A1A;
                    font-size: 0.78rem;
                    font-weight: 500;
                    letter-spacing: 0.1em;
                    cursor: pointer;
                    width: 100%;
                    text-transform: uppercase;
                    transition: background 0.15s ease;
                }
                .btn-outline:hover {
                    background-color: rgba(26, 26, 26, 0.05);
                }

                /* ── 6-Box OTP Row ── */
                .otp-box-row {
                    display: flex;
                    gap: 0.6rem;
                    justify-content: center;
                    margin-bottom: 0.5rem;
                }
                .otp-box {
                    width: 44px;
                    height: 44px;
                    text-align: center;
                    font-size: 1.15rem;
                    font-weight: 500;
                    border: 1px solid #1A1A1A;
                    background-color: transparent;
                    color: #1A1A1A;
                    border-radius: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                .otp-box:focus {
                    outline: none;
                    background-color: rgba(255, 255, 255, 0.5);
                }

                /* ── Success content ── */
                .success-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                .olive-check-icon {
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* ── Delete Modal Content ── */
                .delete-modal-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                .trash-icon-wrap {
                    margin-bottom: 1.25rem;
                }
                .delete-warning-text {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
                .warning-strong {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #1A1A1A;
                }
                .warning-sub {
                    font-size: 0.82rem;
                    color: #4A4A4A;
                    line-height: 1.4;
                    max-width: 320px;
                }
            `}</style>
        </div>
    );
}
