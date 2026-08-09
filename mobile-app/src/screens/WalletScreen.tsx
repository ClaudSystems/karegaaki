// src/screens/WalletScreen.tsx
import React, { useState, useEffect } from 'react';
import { walletAPI, creditsAPI } from '../api/client';
import { ArrowLeft, Wallet, Plus, Clock, CheckCircle, Copy } from 'lucide-react';

interface WalletScreenProps {
    onBack: () => void;
}

export default function WalletScreen({ onBack }: WalletScreenProps) {
    const [balance, setBalance] = useState<number>(0);
    const [packages, setPackages] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Estado da compra de créditos
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [purchaseRef, setPurchaseRef] = useState<string | null>(null);
    const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'pending' | 'confirmed'>('idle');
    const [buying, setBuying] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [balRes, pkgRes, histRes]: any[] = await Promise.all([
                walletAPI.balance(),
                creditsAPI.packages(),
                walletAPI.history(),
            ]);
            setBalance(balRes?.balance_credit || balRes?.data?.balance_credit || 0);
            setPackages(Array.isArray(pkgRes) ? pkgRes : pkgRes?.items || []);
            setHistory(histRes?.items || histRes?.data || histRes || []);
        } catch (err) {
            console.error('Erro ao carregar wallet:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInstructions = async () => {
        if (!selectedPackage) return;
        setBuying(true);
        try {
            const res: any = await creditsAPI.purchase(selectedPackage.id);
            setPurchaseRef(res.reference || res.data?.reference || '#CRE-OK');
            setPurchaseStatus('pending');
        } catch (err: any) {
            console.error('Erro:', err);
        } finally {
            setBuying(false);
        }
    };

    const handleSimulatePayment = async () => {
        // Simula confirmação - na vida real seria um webhook
        setPurchaseStatus('confirmed');
        await loadData(); // Recarrega saldo
    };

    const handleCopyRef = () => {
        if (purchaseRef) {
            navigator.clipboard.writeText(purchaseRef);
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
                    <h1 className="text-lg font-bold text-white">Carteira</h1>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Saldo */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-indigo-300" />
                        <span className="text-xs text-indigo-200">Saldo Disponível</span>
                    </div>
                    <p className="text-3xl font-bold">{Number(balance).toFixed(0)} <span className="text-lg">cr</span></p>
                </div>

                {/* Compra de Créditos - Estado Idle */}
                {purchaseStatus === 'idle' && (
                    <div>
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-emerald-400" />
                            Comprar Créditos
                        </h3>

                        {/* Lista de Pacotes */}
                        <div className="space-y-2 mb-3">
                            {packages.map((pkg: any) => (
                                <div
                                    key={pkg.id}
                                    onClick={() => setSelectedPackage(pkg)}
                                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                                        selectedPackage?.id === pkg.id
                                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                    }`}
                                >
                                    <div>
                                        <div className="font-bold text-sm">{pkg.name}</div>
                                        <div className="text-[10px] text-slate-400">{pkg.credit_amount} cr</div>
                                        {pkg.bonus_credit > 0 && (
                                            <div className="text-[10px] text-emerald-400">+{pkg.bonus_credit} cr Bónus</div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-indigo-300 text-sm">{pkg.price_mzn} MZN</div>
                                        {pkg.name === 'Popular' && (
                                            <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                        Popular
                      </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botão Gerar Instruções */}
                        <button
                            onClick={handleGenerateInstructions}
                            disabled={!selectedPackage || buying}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold transition text-sm"
                        >
                            {buying ? 'Gerando...' : 'Gerar Instruções M-Pesa'}
                        </button>
                    </div>
                )}

                {/* Compra de Créditos - Estado Pendente */}
                {purchaseStatus === 'pending' && selectedPackage && (
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                        <div className="text-amber-400 font-bold flex items-center gap-1.5 text-sm">
                            <Clock className="w-4 h-4 animate-pulse" /> Pagamento Pendente
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl font-mono border border-slate-800">
                            Envie <strong className="text-white">{selectedPackage.price_mzn} MZN</strong> para{' '}
                            <strong className="text-white">84XXXXXXX</strong> com a referência{' '}
                            <strong className="text-amber-300">{purchaseRef}</strong>
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleCopyRef}
                                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                            >
                                <Copy className="w-3 h-3" /> Copiar Ref
                            </button>
                            <button
                                onClick={handleSimulatePayment}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                            >
                                Simular Pagamento
                            </button>
                        </div>
                    </div>
                )}

                {/* Compra Confirmada */}
                {purchaseStatus === 'confirmed' && (
                    <div className="p-3.5 bg-emerald-950/50 border border-emerald-800 rounded-2xl space-y-2 text-center">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                        <p className="text-emerald-300 font-bold text-sm">Pagamento Confirmado!</p>
                        <p className="text-emerald-400 text-xs">+{selectedPackage?.credit_amount + selectedPackage?.bonus_credit} créditos adicionados</p>
                        <button
                            onClick={() => {
                                setPurchaseStatus('idle');
                                setSelectedPackage(null);
                                setPurchaseRef(null);
                            }}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition mt-2"
                        >
                            Comprar Mais
                        </button>
                    </div>
                )}

                {/* Histórico */}
                <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Histórico
                    </h3>
                    <div className="space-y-2">
                        {!Array.isArray(history) || history.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-4">Sem movimentos</p>
                        ) : (
                            history.slice(0, 10).map((mov: any, i: number) => (
                                <div key={mov.id || i} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-white">{mov.description || mov.movement_type || 'Movimento'}</p>
                                        <p className="text-[10px] text-slate-500">
                                            {mov.created_at ? new Date(mov.created_at).toLocaleDateString() : ''}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-bold ${mov.movement_type === 'credit' || mov.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {mov.amount > 0 ? '+' : ''}{mov.amount} cr
                  </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}