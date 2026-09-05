// src/screens/TransactionsScreen.tsx
import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../api/client';
import { formatCredits } from '../utils/format';
import {
    ArrowLeft, ShoppingBag, CheckCircle, Clock, XCircle,
    Eye, EyeOff, Copy, Check, Share2, AlertCircle, RefreshCw, MessageSquare
} from 'lucide-react';

interface TransactionsScreenProps {
    onBack: () => void;
    onNavigateToDisputes?: (reference: string) => void;
}

interface TransactionItem {
    product_id: string;
    product_name?: string;
    quantity: number;
    unit_credit_price: string;
    code_delivered?: string;
}

interface Transaction {
    id: string;
    reference: string;
    total_credit: string;
    payment_status: string;
    delivery_status: string;
    payment_method: string;
    items: TransactionItem[];
    created_at: string;
}

export default function TransactionsScreen({ onBack, onNavigateToDisputes }: TransactionsScreenProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showCode, setShowCode] = useState<{[key: string]: boolean}>({});
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res: any = await transactionsAPI.list();
            const data = res?.items || res?.data || res || [];
            setTransactions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Erro ao carregar transações');
        } finally {
            setLoading(false);
        }
    };

    const toggleCode = (codeId: string) => {
        setShowCode(prev => ({ ...prev, [codeId]: !prev[codeId] }));
    };

    const copyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
    };

    const shareWhatsApp = (tx: Transaction) => {
        const codes = tx.items.map(item =>
            `${item.product_name}: ${item.code_delivered || 'N/A'}`
        ).join('\n');

        const message = `📦 *KaregaAki - Compra Realizada*\n\n` +
            `📋 Referência: ${tx.reference}\n` +
            `📅 Data: ${new Date(tx.created_at).toLocaleDateString('pt-PT')}\n` +
            `💰 Total: ${tx.total_credit} créditos\n\n` +
            `🔑 *Códigos:*\n${codes}\n\n` +
            `Obrigado por usar KaregaAki! 🇲🇿`;

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'delivered':
                return (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" />
                        Entregue
                    </span>
                );
            case 'processing':
                return (
                    <span className="flex items-center gap-1 text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        Processando
                    </span>
                );
            case 'failed':
                return (
                    <span className="flex items-center gap-1 text-red-400 bg-red-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <XCircle className="w-3 h-3" />
                        Falhou
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        {status}
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="text-slate-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-white">Minhas Compras</h1>
                    </div>
                    <button onClick={loadTransactions} className="text-slate-400 hover:text-white p-1">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                        <button onClick={loadTransactions} className="ml-auto text-indigo-400 hover:text-indigo-300">
                            Tentar novamente
                        </button>
                    </div>
                )}

                {transactions.length === 0 && !loading && !error && (
                    <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">Nenhuma compra realizada</p>
                    </div>
                )}

                {transactions.map((tx) => (
                    <div key={tx.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        {/* Transaction Header */}
                        <button
                            onClick={() => setSelectedTransaction(selectedTransaction?.id === tx.id ? null : tx)}
                            className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-950/50 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-white">{tx.reference}</p>
                                    <p className="text-[10px] text-slate-500">
                                        {new Date(tx.created_at).toLocaleDateString('pt-PT')} às {new Date(tx.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-emerald-400">{formatCredits(tx.total_credit)} cr</p>
                                {getStatusBadge(tx.delivery_status)}
                            </div>
                        </button>

                        {/* Expanded Details */}
                        {selectedTransaction?.id === tx.id && (
                            <div className="border-t border-slate-800 p-3 space-y-2 animate-slide-up">
                                {tx.items.map((item, idx) => (
                                    <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-lg p-2.5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-xs font-bold text-white">{item.product_name || 'Produto'}</p>
                                                <p className="text-[10px] text-slate-500">
                                                    Qty: {item.quantity} • {formatCredits(item.unit_credit_price)} cr
                                                </p>
                                            </div>
                                            {item.code_delivered && (
                                                <span className="text-[10px] text-slate-500">Código disponível</span>
                                            )}
                                        </div>

                                        {item.code_delivered && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-slate-900 rounded-lg px-3 py-2">
                                                    {showCode[item.code_delivered] ? (
                                                        <p className="text-sm font-mono font-bold text-emerald-400">
                                                            {item.code_delivered}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm font-mono text-slate-600">
                                                            ••••••••••••
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => toggleCode(item.code_delivered!)}
                                                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg"
                                                >
                                                    {showCode[item.code_delivered] ? (
                                                        <EyeOff className="w-4 h-4 text-slate-400" />
                                                    ) : (
                                                        <Eye className="w-4 h-4 text-slate-400" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => copyCode(item.code_delivered!)}
                                                    className={`p-2 rounded-lg ${
                                                        copiedCode === item.code_delivered
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                                    }`}
                                                >
                                                    {copiedCode === item.code_delivered ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Referência com Copy */}
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2">
                                        <p className="text-[9px] text-slate-500 mb-0.5">Referência da Transação</p>
                                        <p className="text-[11px] font-mono text-slate-300">{tx.reference}</p>
                                    </div>
                                    <button
                                        onClick={() => copyCode(tx.reference)}
                                        className={`p-2.5 rounded-lg ${
                                            copiedCode === tx.reference
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                        }`}
                                        title="Copiar referência"
                                    >
                                        {copiedCode === tx.reference ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => shareWhatsApp(tx)}
                                        className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                                    >
                                        <Share2 className="w-3 h-3" />
                                        Partilhar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedTransaction(null);
                                            if (onNavigateToDisputes) {
                                                onNavigateToDisputes(tx.reference);
                                            }
                                        }}
                                        className="flex-1 bg-red-950/50 hover:bg-red-900/50 text-red-400 font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1 border border-red-900/50"
                                    >
                                        <MessageSquare className="w-3 h-3" />
                                        Criar Disputa
                                    </button>
                                    <button
                                        onClick={() => setSelectedTransaction(null)}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-lg text-xs"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}