// src/screens/TransactionsScreen.tsx
import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../api/client';
import { formatCurrency } from '../utils/format';
import { ArrowLeft, Gift, Copy, Check, ChevronDown, ChevronUp, Clock, CheckCircle, Truck } from 'lucide-react';

interface TransactionsScreenProps {
    onBack: () => void;
}

export default function TransactionsScreen({ onBack }: TransactionsScreenProps) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const res: any = await transactionsAPI.list();
            const data = res?.items || res?.data || res || [];
            setTransactions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erro ao carregar transações:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-emerald-400';
            case 'pending': return 'text-amber-400';
            case 'failed': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
            case 'pending': return <Clock className="w-3.5 h-3.5 text-amber-400" />;
            case 'failed': return <Clock className="w-3.5 h-3.5 text-red-400" />;
            default: return null;
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
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-white">Minhas Compras</h1>
                </div>
            </div>

            <div className="p-4 space-y-2">
                {transactions.length === 0 ? (
                    <div className="text-center py-10">
                        <Gift className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">Nenhuma compra realizada</p>
                    </div>
                ) : (
                    transactions.map((tx: any) => (
                        <div
                            key={tx.id}
                            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
                        >
                            {/* Cabeçalho da Transação */}
                            <button
                                onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                                className="w-full p-3 flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        tx.payment_status === 'confirmed' ? 'bg-emerald-950' : 'bg-amber-950'
                                    }`}>
                                        {tx.payment_status === 'confirmed' ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-amber-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-white truncate">
                                            {tx.items?.[0]?.product_name || 'Compra'}
                                            {tx.items?.length > 1 && ` +${tx.items.length - 1}`}
                                        </p>
                                        <p className="text-[10px] text-slate-500">{tx.reference}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-white">
                    {formatCurrency(tx.total_credit)} cr
                  </span>
                                    {expandedId === tx.id ? (
                                        <ChevronUp className="w-4 h-4 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    )}
                                </div>
                            </button>

                            {/* Detalhes Expandidos */}
                            {expandedId === tx.id && (
                                <div className="border-t border-slate-800 p-3 space-y-2">
                                    {/* Status */}
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-slate-400">Status</span>
                                        <span className={`font-bold ${getStatusColor(tx.payment_status)}`}>
                      {tx.payment_status === 'confirmed' ? 'Confirmado' : tx.payment_status}
                    </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-slate-400">Entrega</span>
                                        <span className="text-white">{tx.delivery_status === 'delivered' ? 'Entregue' : tx.delivery_status}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-slate-400">Data</span>
                                        <span className="text-white">
                      {tx.created_at ? new Date(tx.created_at).toLocaleString('pt-MZ') : '-'}
                    </span>
                                    </div>

                                    {/* Itens */}
                                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                                        {tx.items?.map((item: any, i: number) => (
                                            <div key={i} className="bg-slate-800 rounded-lg p-2 flex items-center justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-bold text-white truncate">{item.product_name}</p>
                                                    <p className="text-[9px] text-slate-400">
                                                        Qtd: {item.quantity} × {formatCurrency(item.unit_credit_price)} cr
                                                    </p>
                                                    {item.code_delivered && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <code className="text-[9px] text-amber-400 font-mono truncate">{item.code_delivered}</code>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCopyCode(item.code_delivered);
                                                                }}
                                                                className="text-slate-500 hover:text-white shrink-0"
                                                            >
                                                                {copiedCode === item.code_delivered ? (
                                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                                ) : (
                                                                    <Copy className="w-3 h-3" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-white shrink-0 ml-2">
                          {formatCurrency(item.unit_credit_price * item.quantity)} cr
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}