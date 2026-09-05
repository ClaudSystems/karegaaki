// src/screens/WalletScreen.tsx
import React, { useState, useEffect } from 'react';
import { formatCredits } from '../utils/format';
import { walletAPI, creditsAPI, paymentsAPI } from '../api/client';
import { ArrowLeft, Wallet, Plus, Clock, CheckCircle, X, Smartphone } from 'lucide-react';
import { CreditPackage, PaymentMethod, WalletMovement, CreditPurchaseResponse } from '../types';

interface WalletScreenProps {
    onBack: () => void;
}

export default function WalletScreen({ onBack }: WalletScreenProps) {
    const [balance, setBalance] = useState<number>(0);
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [history, setHistory] = useState<WalletMovement[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string>('mpesa');
    const [purchaseResult, setPurchaseResult] = useState<CreditPurchaseResponse | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
        loadPaymentMethods();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [balRes, pkgRes, histRes]: any[] = await Promise.all([
                walletAPI.balance(),
                creditsAPI.packages(),
                walletAPI.history(),
            ]);

            // Corrigir acesso aos dados
            const balanceData = balRes?.balance_credit || balRes?.balance || 0;
            setBalance(parseFloat(balanceData));

            const packagesData = pkgRes?.items || pkgRes?.data || pkgRes || [];
            setPackages(Array.isArray(packagesData) ? packagesData : []);

            const historyData = histRes?.items || histRes?.data || histRes || [];
            setHistory(Array.isArray(historyData) ? historyData : []);
        } catch (err) {
            console.error('Erro ao carregar wallet:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadPaymentMethods = async () => {
        try {
            const res: any = await paymentsAPI.getMethods();
            const methods = res?.data || res?.items || res || [];
            setPaymentMethods(Array.isArray(methods) ? methods : []);
        } catch (err) {
            console.error('Erro ao carregar métodos:', err);
        }
    };

    const handleBuyCredits = async () => {
        if (!selectedPackage) return;
        setError(null);
        try {
            const res: any = await creditsAPI.purchase(selectedPackage.id, selectedMethod);
            const data = res?.data || res;
            setPurchaseResult(data);
        } catch (err: any) {
            setError(err?.detail || 'Erro ao processar compra');
        }
    };

    const handleConfirmPayment = async () => {
        if (!purchaseResult) return;
        setConfirming(true);
        try {
            await paymentsAPI.confirmPurchase(purchaseResult.reference);
            setConfirmed(true);
            await loadData(); // Recarrega saldo
        } catch (err: any) {
            setError(err?.detail || 'Erro ao confirmar pagamento');
        } finally {
            setConfirming(false);
        }
    };

    const closeModal = () => {
        setSelectedPackage(null);
        setSelectedMethod('mpesa');
        setPurchaseResult(null);
        setConfirmed(false);
        setError(null);
    };

    const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);

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
                    <p className="text-3xl font-bold">{formatCredits(balance)} <span className="text-lg">cr</span></p>
                </div>

                {/* Comprar Créditos */}
                <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-400" />
                        Comprar Créditos
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {packages.map((pkg) => (
                            <button
                                key={pkg.id}
                                onClick={() => setSelectedPackage(pkg)}
                                className={`relative p-3 rounded-xl border text-left transition ${
                                    pkg.name === 'Popular'
                                        ? 'bg-indigo-950/50 border-indigo-700/50'
                                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                {pkg.name === 'Popular' && (
                                    <span className="absolute -top-2 right-2 bg-amber-500 text-[9px] font-bold text-black px-2 py-0.5 rounded-full">
                                        Popular
                                    </span>
                                )}
                                <p className="text-xs text-slate-400">{pkg.name}</p>
                                <p className="text-lg font-bold text-white mt-1">
                                    {parseFloat(pkg.credit_amount) + parseFloat(pkg.bonus_credit)} cr
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    {pkg.price_mzn} MZN
                                    {parseFloat(pkg.bonus_credit) > 0 && (
                                        <span className="text-emerald-400 ml-1">+{pkg.bonus_credit} bónus</span>
                                    )}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Histórico */}
                <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Histórico
                    </h3>
                    <div className="space-y-2">
                        {history.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-4">Sem movimentos</p>
                        ) : (
                            history.slice(0, 10).map((mov, i) => (
                                <div key={mov.id || i} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-white">{mov.description || mov.movement_type}</p>
                                        <p className="text-[10px] text-slate-500">
                                            {mov.created_at ? new Date(mov.created_at).toLocaleDateString() : ''}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-bold ${parseFloat(mov.amount) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {parseFloat(mov.amount) > 0 ? '+' : ''}{mov.amount} cr
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Compra */}
            {selectedPackage && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                        {/* Header do Modal */}
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-sm font-bold text-white">
                                {purchaseResult ? 'Pagamento' : confirmed ? 'Confirmado!' : 'Comprar Créditos'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {!purchaseResult && !confirmed && (
                                <>
                                    {/* Pacote selecionado */}
                                    <div className="bg-slate-800 rounded-xl p-3">
                                        <p className="text-xs text-slate-400">{selectedPackage.name}</p>
                                        <p className="text-lg font-bold text-white">
                                            {parseFloat(selectedPackage.credit_amount) + parseFloat(selectedPackage.bonus_credit)} cr
                                        </p>
                                        <p className="text-xs text-slate-500">{selectedPackage.price_mzn} MZN</p>
                                    </div>

                                    {/* Métodos de Pagamento */}
                                    <div>
                                        <p className="text-xs text-slate-400 mb-2">Método de Pagamento</p>
                                        <div className="space-y-2">
                                            {paymentMethods.filter(m => m.enabled).map((method) => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setSelectedMethod(method.id)}
                                                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                                                        selectedMethod === method.id
                                                            ? 'border-indigo-500 bg-indigo-950/30'
                                                            : 'border-slate-800 hover:border-slate-700'
                                                    }`}
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                                        style={{ backgroundColor: method.color }}
                                                    >
                                                        {method.icon === 'mpesa' ? 'M' : method.icon === 'emola' ? 'E' : 'm'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-white">{method.name}</p>
                                                        <p className="text-[10px] text-slate-400">{method.confirmation_name}</p>
                                                    </div>
                                                    {selectedMethod === method.id && (
                                                        <CheckCircle className="w-4 h-4 text-indigo-400" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-xs bg-red-950/50 p-3 rounded-lg">{error}</p>
                                    )}

                                    <button
                                        onClick={handleBuyCredits}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition text-sm"
                                    >
                                        Continuar para Pagamento
                                    </button>
                                </>
                            )}

                            {/* Instruções de Pagamento */}
                            {purchaseResult && !confirmed && (
                                <>
                                    <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 text-center">
                                        <Smartphone className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                                        <p className="text-amber-300 font-bold text-sm">Pagamento Pendente</p>
                                        <p className="text-amber-200/70 text-xs mt-1">{purchaseResult.payment_instructions}</p>
                                    </div>

                                    <div className="bg-slate-800 rounded-xl p-3 space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Referência</span>
                                            <span className="text-white font-mono font-bold">{purchaseResult.reference}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Valor</span>
                                            <span className="text-white font-bold">{purchaseResult.amount_mzn} MZN</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Método</span>
                                            <span className="text-white">{purchaseResult.confirmation_name}</span>
                                        </div>
                                        {purchaseResult.payment_number && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Número</span>
                                                <span className="text-white font-mono">{purchaseResult.payment_number}</span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedPaymentMethod?.instructions && (
                                        <div className="bg-slate-800 rounded-xl p-3">
                                            <p className="text-xs text-slate-400 mb-2">Instruções:</p>
                                            <ol className="text-[10px] text-slate-300 space-y-1 list-decimal list-inside">
                                                {selectedPaymentMethod.instructions.map((inst, i) => (
                                                    <li key={i}>{inst}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}

                                    {error && (
                                        <p className="text-red-400 text-xs bg-red-950/50 p-3 rounded-lg">{error}</p>
                                    )}

                                    <button
                                        onClick={handleConfirmPayment}
                                        disabled={confirming}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
                                    >
                                        {confirming ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Confirmar Pagamento
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            {/* Sucesso */}
                            {confirmed && (
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 bg-emerald-950 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <p className="text-emerald-300 font-bold">Créditos Adicionados!</p>
                                    <p className="text-xs text-slate-400">
                                        +{purchaseResult?.credit_received} créditos na sua carteira
                                    </p>
                                    <button
                                        onClick={closeModal}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition text-sm"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}