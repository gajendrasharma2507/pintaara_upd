"use client";

import React, { useEffect, useState } from 'react';

const REGIONS_DATA = [
    {
        region: "North & South America",
        countries: [
            { name: "United States", languages: [{ code: "en-US", label: "English" }] },
            { name: "Canada", languages: [{ code: "en-CA", label: "English" }, { code: "fr-CA", label: "Français" }] },
            { name: "México", languages: [{ code: "es-MX", label: "Español" }] },
            { name: "Chile", languages: [{ code: "es-CL", label: "Español" }] },
            { name: "Colombia", languages: [{ code: "es-CO", label: "Español" }] },
            { name: "Uruguay", languages: [{ code: "es-UY", label: "Español" }] },
            { name: "Brasil", languages: [{ code: "pt-BR", label: "Português" }] }
        ]
    },
    {
        region: "Europe",
        countries: [
            { name: "United Kingdom", languages: [{ code: "en-GB", label: "English" }] },
            { name: "France", languages: [{ code: "fr-FR", label: "Français" }] },
            { name: "Deutschland", languages: [{ code: "de-DE", label: "Deutsch" }] },
            { name: "Italia", languages: [{ code: "it-IT", label: "Italiano" }] },
            { name: "España", languages: [{ code: "es-ES", label: "Español" }] },
            { name: "Nederland", languages: [{ code: "nl-NL", label: "Nederlands" }] },
            { name: "Norge", languages: [{ code: "no-NO", label: "Norsk" }] },
            { name: "Österreich", languages: [{ code: "de-AT", label: "Deutsch" }] },
            { name: "Schweiz / Suisse", languages: [{ code: "de-CH", label: "Deutsch" }, { code: "fr-CH", label: "Français" }, { code: "it-CH", label: "Italiano" }] },
            { name: "Sverige", languages: [{ code: "sv-SE", label: "Svenska" }] },
            { name: "Polska", languages: [{ code: "pl-PL", label: "Polski" }] },
            { name: "Portugal", languages: [{ code: "pt-PT", label: "Português" }] },
            { name: "Hrvatska", languages: [{ code: "hr-HR", label: "Hrvatski" }] },
            { name: "Magyarország", languages: [{ code: "hu-HU", label: "Magyar" }] },
            { name: "Ελλάδα", languages: [{ code: "el-GR", label: "Ελληνικά" }] },
            { name: "Suomi", languages: [{ code: "fi-FI", label: "Suomi" }] },
            { name: "Türkiye", languages: [{ code: "tr-TR", label: "Türkçe" }] },
            { name: "Other Europe", languages: [{ code: "en-EU", label: "English" }] }
        ]
    },
    {
        region: "Middle East",
        countries: [
            { name: "UAE", languages: [{ code: "en-AE", label: "English" }, { code: "ar-AE", label: "العَرَبِية" }] },
            { name: "Saudi Arabia", languages: [{ code: "en-SA", label: "English" }, { code: "ar-SA", label: "العَرَبِية" }] },
            { name: "Qatar", languages: [{ code: "en-QA", label: "English" }, { code: "ar-QA", label: "العَرَبِية" }] },
            { name: "Kuwait", languages: [{ code: "en-KW", label: "English" }, { code: "ar-KW", label: "العَرَبِية" }] },
            { name: "Jordan", languages: [{ code: "en-JO", label: "English" }] },
            { name: "ישראל (Israel)", languages: [{ code: "he-IL", label: "עִבְרִית" }, { code: "en-IL", label: "English" }] }
        ]
    },
    {
        region: "Asia Pacific",
        countries: [
            { name: "India", languages: [{ code: "en-IN", label: "English" }] },
            { name: "Singapore", languages: [{ code: "en-SG", label: "English" }] },
            { name: "Malaysia", languages: [{ code: "en-MY", label: "English" }] },
            { name: "Australia", languages: [{ code: "en-AU", label: "English" }] },
            { name: "New Zealand", languages: [{ code: "en-NZ", label: "English" }] },
            { name: "日本 (Japan)", languages: [{ code: "ja-JP", label: "日本語" }] },
            { name: "대한민국 (South Korea)", languages: [{ code: "ko-KR", label: "한국어" }] },
            { name: "Thailand", languages: [{ code: "th-TH", label: "ภาษาไทย" }, { code: "en-TH", label: "English" }] },
            { name: "Philippines", languages: [{ code: "en-PH", label: "English" }] },
            { name: "Hong Kong", languages: [{ code: "zh-HK", label: "繁體中文" }, { code: "en-HK", label: "English" }] }
        ]
    },
    {
        region: "Africa",
        countries: [
            { name: "Morocco", languages: [{ code: "ar-MA", label: "العَرَبِية" }, { code: "fr-MA", label: "Français" }] },
            { name: "South Africa", languages: [{ code: "en-ZA", label: "English" }] }
        ]
    }
];

import { safeStorage } from '@/lib/storage';

export default function RegionModal({ isOpen, onClose }) {
    const [selectedLang, setSelectedLang] = useState("en-US");

    useEffect(() => {
        const saved = safeStorage.getItem('pintaara_region_lang');
        if (saved) {
            setSelectedLang(saved);
        }
    }, []);

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

    if (!isOpen) return null;

    const handleSelectLanguage = (langCode) => {
        setSelectedLang(langCode);
        safeStorage.setItem('pintaara_region_lang', langCode);
        setTimeout(() => {
            onClose();
        }, 150);
    };

    return (
        <div className="region-modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
            <div className="region-modal-container" onClick={(e) => e.stopPropagation()}>
                
                {/* Modal Top Header */}
                <div className="region-modal-header">
                    <div className="region-modal-brand">
                        <img src="/images/logo-wordmark.png" alt="PINTAARA" className="region-modal-logo" />
                        <span className="region-modal-title">Select Region & Language</span>
                    </div>
                    <button className="region-modal-close" onClick={onClose} aria-label="Close modal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Regions Columns Grid */}
                <div className="region-modal-body">
                    <div className="region-columns-grid">
                        {REGIONS_DATA.map((group) => (
                            <div key={group.region} className="region-column">
                                <h3 className="region-group-title">{group.region}</h3>
                                <div className="region-countries-list">
                                    {group.countries.map((country) => (
                                        <div key={country.name} className="region-country-item">
                                            <span className="country-name">{country.name}</span>
                                            <div className="country-langs">
                                                {country.languages.map((lang, idx) => {
                                                    const isSelected = selectedLang === lang.code;
                                                    return (
                                                        <React.Fragment key={lang.code}>
                                                            <button
                                                                type="button"
                                                                className={`lang-choice-btn ${isSelected ? 'active-lang' : ''}`}
                                                                onClick={() => handleSelectLanguage(lang.code)}
                                                            >
                                                                {lang.label}
                                                            </button>
                                                            {idx < country.languages.length - 1 && (
                                                                <span className="lang-sep">/</span>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer disclaimer */}
                <div className="region-modal-footer">
                    <span className="region-footer-note">PINTAARA™ Global Atelier & International Concierge Services</span>
                </div>

            </div>
        </div>
    );
}
