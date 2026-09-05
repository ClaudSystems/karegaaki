// src/components/BottomNav.tsx - MELHORADO
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
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 p-2 grid grid-cols-5 gap-1 z-50 safe-area-bottom">
            {tabs.map((tab) => {
                const isActive = currentScreen === tab.id ||
                    (currentScreen === 'product_detail' && tab.id === 'home') ||
                    (currentScreen === 'wallet' && tab.id === 'wallet');

                return (
                    <button
                        key={tab.id}
                        onClick={() => onNavigate(tab.id)}
                        className={`relative flex flex-col items-center gap-1.5 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            isActive
                                ? 'bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                    >
                        <tab.icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                        {tab.id === 'cart' && cartCount > 0 && (
                            <span className="absolute top-1 right-2 bg-indigo-600 text-white font-black text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg shadow-indigo-600/30 animate-pulse">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                        <span className={`text-[10px] ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}