// src/components/KaregaCard.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, Plus, TrendingUp, Zap } from 'lucide-react';
import { formatCredits, formatCurrency } from '../utils/format';

interface KaregaCardProps {
    balance: number;
    onRecharge: () => void;
}

export default function KaregaCard({ balance, onRecharge }: KaregaCardProps) {
    const [showBalance, setShowBalance] = useState(true);

    // Conversão: 1 crédito = 10 MZN (ajustar conforme regra de negócio)
    const balanceMZN = balance * 10;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 p-5 animate-slide-up">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-400">Carteira Ativa</span>
                </div>
                <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-slate-400 hover:text-white transition"
                    title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
                >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            {/* Balance */}
            <div className="mb-4 relative z-10">
                <p className="text-xs text-slate-400 mb-1">Saldo Disponível</p>
                {showBalance ? (
                    <>
                        <p className="text-4xl font-black text-white tracking-tight">
                            {formatCredits(balance)}
                            <span className="text-lg font-bold text-emerald-400 ml-2">créditos</span>
                        </p>
                        <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" />
                            Equivalente a {formatCurrency(balanceMZN)} MZN
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-4xl font-black text-white tracking-tight">••••••</p>
                        <p className="text-sm text-slate-400 mt-1">Saldo oculto</p>
                    </>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 relative z-10">
                <button
                    onClick={onRecharge}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-sm shadow-lg shadow-indigo-600/30"
                >
                    <Plus className="w-4 h-4" />
                    Recarregar
                </button>
            </div>

            {/* Promo banner */}
            <div className="mt-3 p-2.5 bg-amber-950/50 border border-amber-800/50 rounded-xl relative z-10">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-[10px] text-amber-300 leading-tight">
                        <strong>Bónus especial:</strong> +5% de créditos grátis em recargas via M-Pesa e e-Mola
                    </p>
                </div>
            </div>
        </div>
    );
}