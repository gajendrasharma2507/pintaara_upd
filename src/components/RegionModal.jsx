"use client";

import React, { useEffect, useMemo } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

const REGION_BY_CURRENCY = {
    USD: 'North & South America',
    CAD: 'North & South America',
    MXN: 'North & South America',
    BRL: 'North & South America',
    GBP: 'Europe',
    EUR: 'Europe',
    CHF: 'Europe',
    NOK: 'Europe',
    SEK: 'Europe',
    PLN: 'Europe',
    TRY: 'Europe',
    AED: 'Middle East',
    SAR: 'Middle East',
    QAR: 'Middle East',
    KWD: 'Middle East',
    JOD: 'Middle East',
    ILS: 'Middle East',
    INR: 'Asia Pacific',
    SGD: 'Asia Pacific',
    AUD: 'Asia Pacific',
    NZD: 'Asia Pacific',
    MYR: 'Asia Pacific',
    JPY: 'Asia Pacific',
    KRW: 'Asia Pacific',
    THB: 'Asia Pacific',
    PHP: 'Asia Pacific',
    HKD: 'Asia Pacific',
    ZAR: 'Africa',
    MAD: 'Africa',
};

const REGION_ORDER = [
    'North & South America',
    'Europe',
    'Middle East',
    'Asia Pacific',
    'Africa',
    'International',
];

export default function RegionModal({ isOpen, onClose }) {
    const { currencies, activeCurrency, setCurrencyByCode } = useCurrency();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const groupedRegions = useMemo(() => {
        const groups = {};
        (currencies || []).forEach((c) => {
            const region = REGION_BY_CURRENCY[c.currency_code] || 'International';
            if (!groups[region]) groups[region] = [];
            groups[region].push(c);
        });
        return REGION_ORDER.filter((r) => groups[r]?.length > 0).map((r) => ({
            region: r,
            items: groups[r],
        }));
    }, [currencies]);

    if (!isOpen) return null;

    const handleSelectCurrency = (code) => {
        setCurrencyByCode(code);
        setTimeout(() => {
            onClose();
        }, 120);
    };

    return (
        <div className="region-modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
            <div className="region-modal-container" onClick={(e) => e.stopPropagation()}>

                {/* Modal Top Header */}
                <div className="region-modal-header">
                    <div className="region-modal-brand">
                        <img src="/images/logo-wordmark.png" alt="PINTAARA" className="region-modal-logo" />
                        <span className="region-modal-title">Select Region &amp; Currency</span>
                    </div>
                    <button className="region-modal-close" onClick={onClose} aria-label="Close modal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Enabled Admin Currencies Grouped by Region */}
                <div className="region-modal-body">
                    <div className="region-columns-grid">
                        {groupedRegions.map((group) => (
                            <div key={group.region} className="region-column">
                                <h3 className="region-group-title">{group.region}</h3>
                                <div className="region-countries-list">
                                    {group.items.map((c) => {
                                        const isSelected = activeCurrency?.currency_code === c.currency_code;
                                        return (
                                            <div key={c.currency_code} className="region-country-item">
                                                <span className="country-name">
                                                    {c.country_name || c.currency_name || c.currency_code}
                                                </span>
                                                <div className="country-langs">
                                                    <button
                                                        type="button"
                                                        className={`lang-choice-btn ${isSelected ? 'active-lang' : ''}`}
                                                        onClick={() => handleSelectCurrency(c.currency_code)}
                                                    >
                                                        {c.currency_code} ({c.currency_symbol || c.currency_code})
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer disclaimer */}
                <div className="region-modal-footer">
                    <span className="region-footer-note">PINTAARA™ Global &amp; International Concierge Services</span>
                </div>

            </div>
        </div>
    );
}
