"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeStorage } from '@/lib/storage';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    // Hydrate cart from localStorage on mount
    useEffect(() => {
        const storedCart = safeStorage.getItem('pintaara_cart');
        if (storedCart) {
            try {
                const parsed = JSON.parse(storedCart);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setCart(parsed);
                }
            } catch (e) {
                console.error("Failed to parse cart data", e);
            }
        }
    }, []);

    // Save cart to localStorage on changes
    useEffect(() => {
        safeStorage.setItem('pintaara_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        setCart((prevCart) => {
            // Check if an item with the exact same customizations already exists
            const existingIndex = prevCart.findIndex(
                (i) => i.code === item.code &&
                       i.metal === item.metal &&
                       i.finish === item.finish &&
                       i.gem === item.gem &&
                       i.size === item.size &&
                       i.chain === item.chain
            );

            if (existingIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingIndex].qty += item.qty;
                return newCart;
            } else {
                return [...prevCart, item];
            }
        });
    };

    const removeFromCart = (index) => {
        setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
    };

    const updateQty = (index, newQty) => {
        if (newQty < 1) return;
        setCart((prevCart) => {
            const newCart = [...prevCart];
            newCart[index].qty = newQty;
            return newCart;
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((total, item) => total + item.qty, 0);

    const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
    const shipping = 0; // FREE
    const tax = Math.round(subtotal * 0.03); // 3%
    const total = subtotal + shipping + tax;

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQty,
            clearCart,
            cartCount,
            subtotal,
            shipping,
            tax,
            total
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
