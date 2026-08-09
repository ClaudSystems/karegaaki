// src/stores/cartStore.ts
import { create } from 'zustand';
import { Product } from '../types';

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
    count: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (product) => {
        set((state) => {
            const existing = state.items.find((item) => item.product.id === product.id);
            if (existing) {
                return {
                    items: state.items.map((item) =>
                        item.product.id === product.id
                            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock_available) }
                            : item
                    ),
                };
            }
            return { items: [...state.items, { product, quantity: 1 }] };
        });
    },

    removeItem: (productId) => {
        set((state) => ({
            items: state.items.filter((item) => item.product.id !== productId),
        }));
    },

    updateQuantity: (productId, quantity) => {
        set((state) => ({
            items: quantity <= 0
                ? state.items.filter((item) => item.product.id !== productId)
                : state.items.map((item) =>
                    item.product.id === productId ? { ...item, quantity } : item
                ),
        }));
    },

    clearCart: () => set({ items: [] }),

    total: () => {
        return get().items.reduce(
            (sum, item) => sum + parseFloat(item.product.credit_price) * item.quantity,
            0
        );
    },

    count: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    },
}));