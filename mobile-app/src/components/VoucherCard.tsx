// src/components/VoucherCard.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Share2, Phone, Shield, AlertCircle } from 'lucide-react';

interface VoucherCardProps {
    code: string;
    productName: string;
    reference: string;
    quantity?: number;
    totalCredits?: string;
    createdAt?: string;
    ussdCode?: string;
    onSupport?: () => void;
}

export default function VoucherCard({
                                        code,
                                        productName,
                                        reference,
                                        quantity = 1,
                                        totalCredits,
                                        createdAt,
                                        ussdCode,
                                        onSupport
                                    }: VoucherCardProps) {
    const [showCode, setShowCode] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
    };

    const handleShareWhatsApp = () => {
        const message = `🎉 *Compra realizada com sucesso!*\n\n📦 Produto: ${productName}\n🔑 Código: ${code}\n📋 Referência: ${reference}\n\nObrigado por usar KaregaAki! 🇲🇿`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleUssdCall = () => {
        if (ussdCode) {
            window.location.href = `tel:${ussdCode}`;
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10 animate-scale-in">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">Voucher Ativo</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{reference}</span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                {/* Product Info */}
                <div>
                    <h3 className="text-sm font-bold text-white">{productName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">
                            {quantity > 1 ? `${quantity} unidades` : '1 unidade'}
                        </span>
                        {totalCredits && (
                            <>
                                <span className="text-slate-600">•</span>
                                <span className="text-[10px] text-slate-400">{totalCredits} créditos</span>
                            </>
                        )}
                        {createdAt && (
                            <>
                                <span className="text-slate-600">•</span>
                                <span className="text-[10px] text-slate-400">
                                    {new Date(createdAt).toLocaleDateString('pt-PT')}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Code Display */}
                <div className="bg-slate-950 border border-emerald-900/50 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            {showCode ? (
                                <p className="text-lg font-mono font-bold text-emerald-400 tracking-wider break-all">
                                    {code}
                                </p>
                            ) : (
                                <p className="text-lg font-mono font-bold text-slate-500 tracking-wider">
                                    ••••••••••••••
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() => setShowCode(!showCode)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                                title={showCode ? 'Ocultar código' : 'Mostrar código'}
                            >
                                {showCode ? (
                                    <EyeOff className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <Eye className="w-4 h-4 text-slate-400" />
                                )}
                            </button>
                            <button
                                onClick={handleCopy}
                                className={`p-2 rounded-lg transition ${
                                    copied
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                }`}
                                title="Copiar código"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    {ussdCode && (
                        <button
                            onClick={handleUssdCall}
                            className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs"
                        >
                            <Phone className="w-4 h-4" />
                            Recarregar Agora
                        </button>
                    )}
                    <button
                        onClick={handleShareWhatsApp}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs"
                    >
                        <Share2 className="w-4 h-4" />
                        Partilhar
                    </button>
                    {onSupport && (
                        <button
                            onClick={onSupport}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs"
                        >
                            <AlertCircle className="w-4 h-4" />
                            Suporte
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}