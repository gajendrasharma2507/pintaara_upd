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
                    const normalizedCart = parsed.map(item => ({
                        ...item,
                        price: Math.round(Number(item.price || 0))
                    }));
                    setCart(normalizedCart);
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
        const cleanItem = {
            ...item,
            price: Math.round(Number(item.price || 0))
        };
        setCart((prevCart) => {
            // Check if an item with the exact same customizations already exists
            const existingIndex = prevCart.findIndex(
                (i) => i.code === cleanItem.code &&
                       i.metal === cleanItem.metal &&
                       i.finish === cleanItem.finish &&
                       i.gem === cleanItem.gem &&
                       i.size === cleanItem.size &&
                       i.chain === cleanItem.chain
            );

            if (existingIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingIndex].qty += cleanItem.qty;
                return newCart;
            } else {
                return [...prevCart, cleanItem];
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

    // Each item.price already represents the final inclusive MRP (inclusive of 3% GST)
    const total = cart.reduce((acc, item) => acc + (Math.round(Number(item.price || 0)) * item.qty), 0);
    const shipping = 0; // FREE
    const tax = cart.reduce((acc, item) => {
        const itemTax = item.gst_amount
            ? Number(item.gst_amount)
            : Math.round(Number(item.price || 0) - (Number(item.price || 0) / 1.03));
        return acc + (itemTax * item.qty);
    }, 0);
    const subtotal = total - tax;

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
