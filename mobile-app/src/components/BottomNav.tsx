// src/components/BottomNav.tsx
import React from 'react';
import { ShoppingBag, ShoppingCart, CreditCard, History, UserCheck } from 'lucide-react';

interface BottomNavProps {
    currentScreen: string;
    onNavigate: (screen: string) => void;
    cartCount: number;
}

export default function BottomNav({ currentScreen, onNavigate, cartCount }: BottomNavProps) {
    const tabs = [
        { id: 'home', icon: ShoppingBag, label: 'Loja' },
        { id: 'cart', icon: ShoppingCart, label: 'Carrinho' },
        { id: 'wallet', icon: CreditCard, label: 'Créditos' },
        { id: 'transactions', icon: History, label: 'Compras' },
        { id: 'profile', icon: UserCheck, label: 'Perfil' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 p-2 grid grid-cols-5 gap-1 text-[9px] z-50">
            {tabs.map((tab) => {
                const isActive = currentScreen === tab.id ||
                    (currentScreen === 'product_detail' && tab.id === 'home') ||
                    (currentScreen === 'wallet' && tab.id === 'wallet');

                return (
                    <button
                        key={tab.id}
                        onClick={() => onNavigate(tab.id)}
                        className={`relative flex flex-col items-center gap-1 py-1.5 rounded-xl cursor-pointer transition ${
                            isActive
                                ? 'bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm'
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.id === 'cart' && cartCount > 0 && (
                            <span className="absolute top-1 right-2 bg-indigo-600 text-white font-black text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {cartCount}
              </span>
                        )}
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}