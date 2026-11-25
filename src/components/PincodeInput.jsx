'use client';

import React, { useState, useMemo } from 'react';
import {
    getPincodeSuggestions,
    isServiceablePincode,
    UNSERVICEABLE_PINCODE_MESSAGE,
} from '@/data/serviceablePincodes';

/**
 * Autocomplete pincode input that suggests serviceable pincodes while typing
 * (not a dropdown select) and displays an inline error for unserviceable areas.
 */
export default function PincodeInput({
    value = '',
    onChange,
    className = '',
    placeholder = 'Pin Code *',
    required = false,
    externalError = '',
}) {
    const [focused, setFocused] = useState(false);

    const cleanVal = String(value || '');
    const suggestions = useMemo(() => {
        if (!cleanVal || (cleanVal.length === 6 && isServiceablePincode(cleanVal))) {
            return [];
        }
        return getPincodeSuggestions(cleanVal, 8);
    }, [cleanVal]);

    const showSuggestions = focused && suggestions.length > 0;
    const isUnserviceableComplete = cleanVal.trim().length === 6 && !isServiceablePincode(cleanVal);

    const handleInput = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
        onChange(digitsOnly);
    };

    const handleSelectSuggestion = (pin) => {
        onChange(pin);
        setFocused(false);
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                required={required}
                placeholder={placeholder}
                value={cleanVal}
                onChange={handleInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={className}
            />

            {showSuggestions && (
                <div
                    role="listbox"
                    aria-label="Serviceable pincode suggestions"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #D6D0C6',
                        borderTop: 'none',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                        maxHeight: '185px',
                        overflowY: 'auto',
                    }}
                >
                    {suggestions.map((pin) => (
                        <button
                            key={pin}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectSuggestion(pin);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '1px solid #F3EFE8',
                                textAlign: 'left',
                                fontSize: '0.82rem',
                                letterSpacing: '0.08em',
                                color: '#1A1A1A',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            <span>{pin}</span>
                            <span style={{ fontSize: '0.68rem', color: '#6E8B63', letterSpacing: '0.06em' }}>
                                SERVICEABLE
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {isUnserviceableComplete && !externalError && (
                <div
                    style={{
                        marginTop: '5px',
                        fontSize: '0.75rem',
                        color: '#B91C1C',
                        lineHeight: 1.35,
                    }}
                >
                    {UNSERVICEABLE_PINCODE_MESSAGE}
                </div>
            )}
        </div>
    );
}
