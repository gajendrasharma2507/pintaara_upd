"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { safeStorage } from '@/lib/storage';

const COUNTRY_TO_CURRENCY = {
    'India': 'INR',
    'United States': 'USD',
    'Canada': 'CAD',
    'United Kingdom': 'GBP',
    'UAE': 'AED',
    'Australia': 'AUD',
    'Singapore': 'SGD',
    'Schweiz / Suisse': 'CHF',
    '日本 (Japan)': 'JPY',
    'France': 'EUR',
    'Deutschland': 'EUR',
    'Italia': 'EUR',
    'España': 'EUR',
    'Nederland': 'EUR',
    'Österreich': 'EUR',
    'Portugal': 'EUR',
    'Suomi': 'EUR',
    'Ελλάδα': 'EUR',
    'Hrvatska': 'EUR',
    'Other Europe': 'EUR',
};

const LANG_TO_CURRENCY = {
    'en-IN': 'INR',
    'en-US': 'USD',
    'en-CA': 'CAD',
    'fr-CA': 'CAD',
    'en-GB': 'GBP',
    'en-AE': 'AED',
    'ar-AE': 'AED',
    'en-AU': 'AUD',
    'en-SG': 'SGD',
    'de-CH': 'CHF',
    'fr-CH': 'CHF',
    'it-CH': 'CHF',
    'ja-JP': 'JPY',
    'fr-FR': 'EUR',
    'de-DE': 'EUR',
    'it-IT': 'EUR',
    'es-ES': 'EUR',
    'nl-NL': 'EUR',
    'de-AT': 'EUR',
    'pt-PT': 'EUR',
    'fi-FI': 'EUR',
    'el-GR': 'EUR',
    'hr-HR': 'EUR',
    'en-EU': 'EUR',
};

const DEFAULT_INR = {
    currency_code: 'INR',
    currency_name: 'Indian Rupee',
    currency_symbol: '₹',
    country_name: 'India',
    exchange_rate: 1,
    country_markup: 0,
};

const CurrencyContext = createContext({
    currencies: [DEFAULT_INR],
    activeCurrency: DEFAULT_INR,
    setCurrencyByCode: () => {},
    setCurrencyByRegion: () => {},
    convertPrice: (inr) => inr,
    formatPrice: (inr) => `₹ ${Math.round(Number(inr) || 0).toLocaleString('en-IN')}`,
    formatRawAmount: (amt) => `₹ ${Math.round(Number(amt) || 0).toLocaleString('en-IN')}`,
    calculateCartTotals: (cart, taxInr) => ({ subtotal: 0, tax: taxInr || 0, total: taxInr || 0 }),
});

export function CurrencyProvider({ children }) {
    const [currencies, setCurrencies] = useState([DEFAULT_INR]);
    const [selectedCode, setSelectedCode] = useState('INR');

    useEffect(() => {
        const savedCode = safeStorage.getItem('pintaara_currency_code');
        if (savedCode) {
            setSelectedCode(savedCode.toUpperCase());
        } else {
            const savedLang = safeStorage.getItem('pintaara_region_lang');
            if (savedLang && LANG_TO_CURRENCY[savedLang]) {
                setSelectedCode(LANG_TO_CURRENCY[savedLang]);
            }
        }

        let active = true;
        api.getCurrencyRates()
            .then((res) => {
                if (!active) return;
                const list = res?.data?.currencies;
                if (Array.isArray(list) && list.length > 0) {
                    setCurrencies(list);
                }
            })
            .catch(() => {
                // Fallback silently to default INR
            });

        return () => {
            active = false;
        };
    }, []);

    const activeCurrency = useMemo(() => {
        const found = currencies.find((c) => c.currency_code === selectedCode);
        if (found) return found;
        return currencies.find((c) => c.currency_code === 'INR') || DEFAULT_INR;
    }, [currencies, selectedCode]);

    const setCurrencyByCode = useCallback((code) => {
        const upper = String(code || 'INR').toUpperCase();
        setSelectedCode(upper);
        safeStorage.setItem('pintaara_currency_code', upper);
    }, []);

    const setCurrencyByRegion = useCallback((countryName, langCode) => {
        const candidate =
            COUNTRY_TO_CURRENCY[countryName] ||
            LANG_TO_CURRENCY[langCode] ||
            'INR';
        const isEnabled = currencies.some((c) => c.currency_code === candidate);
        const target = isEnabled ? candidate : 'INR';
        setCurrencyByCode(target);
    }, [currencies, setCurrencyByCode]);

    /**
     * Foreign price = (INR product price × INR-to-foreign exchange rate) + country markup.
     * Never overwrites original INR prices.
     */
    const convertPrice = useCallback((inrAmount) => {
        const base = Number(inrAmount) || 0;
        const markup = Number(activeCurrency.country_markup) || 0;
        const isPercent = activeCurrency.markup_type === 'percent';

        if (activeCurrency.currency_code === 'INR') {
            return isPercent
                ? Math.round(base * (1 + (markup / 100)))
                : Math.round(base + markup);
        }
        const rate = Number(activeCurrency.exchange_rate) || 1;
        const converted = base * rate;
        return isPercent
            ? Math.round(converted * (1 + (markup / 100)) * 100) / 100
            : Math.round((converted + markup) * 100) / 100;
    }, [activeCurrency]);

    const formatRawAmount = useCallback((amount) => {
        const val = Number(amount) || 0;
        const sym = activeCurrency.currency_symbol || activeCurrency.currency_code || '₹';
        if (activeCurrency.currency_code === 'INR') {
            return `${sym} ${Math.round(val).toLocaleString('en-IN')}`;
        }
        return `${sym} ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }, [activeCurrency]);

    const formatPrice = useCallback((inrAmount) => {
        return formatRawAmount(convertPrice(inrAmount));
    }, [convertPrice, formatRawAmount]);

    const calculateCartTotals = useCallback((cart, taxInr = 0) => {
        const list = Array.isArray(cart) ? cart : [];
        const subtotal = list.reduce((sum, item) => sum + convertPrice(item.price) * (item.qty || 1), 0);
        const rate = activeCurrency.currency_code === 'INR' ? 1 : (Number(activeCurrency.exchange_rate) || 1);
        const tax = activeCurrency.currency_code === 'INR'
            ? Math.round(Number(taxInr) || 0)
            : Math.round(((Number(taxInr) || 0) * rate) * 100) / 100;
        const total = Math.round((subtotal + tax) * 100) / 100;
        return { subtotal, tax, total };
    }, [activeCurrency, convertPrice]);

    return (
        <CurrencyContext.Provider
            value={{
                currencies,
                activeCurrency,
                setCurrencyByCode,
                setCurrencyByRegion,
                convertPrice,
                formatPrice,
                formatRawAmount,
                calculateCartTotals,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    return useContext(CurrencyContext);
}
