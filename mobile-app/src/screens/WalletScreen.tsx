// src/screens/WalletScreen.tsx
import React, { useState, useEffect } from 'react';
import { formatCredits, formatCurrency } from '../utils/format';
import { walletAPI, creditsAPI, paymentsAPI } from '../api/client';
import {
    ArrowLeft, Wallet, Plus, Clock, CheckCircle, X, Smartphone,
    Copy, Check, Loader, Shield
} from 'lucide-react';

interface WalletScreenProps {
    onBack: () => void;
}

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    color: string;
    bg: string;
    enabled: boolean;
    confirmation_name: string;
    number?: string;
    instructions: string[];
    reference_format: string;
    note: string;
}

interface PurchaseResponse {
    id: string;
    reference: string;
    amount_mzn: string;
    credit_received: string;
    status: string;
    payment_method: string;
    payment_name?: string;
    payment_number?: string;
    confirmation_name?: string;
    payment_instructions?: string;
}

export default function WalletScreen({ onBack }: WalletScreenProps) {
    const [balance, setBalance] = useState<number>(0);
    const [packages, setPackages] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [selectedMethod, setSelectedMethod] = useState<string>('mpesa');
    const [step, setStep] = useState<'select' | 'waiting' | 'confirmed'>('select');
    const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [copied, setCopied] = useState(false);
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
            setBalance(parseFloat(balRes?.balance_credit || balRes?.balance || 0));
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
            setStep('waiting');
        } catch (err: any) {
            setError(err?.detail || 'Erro ao processar compra');
        }
    };

    const handleConfirmPayment = async () => {
        if (!purchaseResult) return;
        setConfirming(true);
        try {
            await paymentsAPI.confirmPurchase(purchaseResult.reference);
            setStep('confirmed');
            await loadData();
        } catch (err: any) {
            setError(err?.detail || 'Erro ao confirmar pagamento');
        } finally {
            setConfirming(false);
        }
    };

    const handleCopyReference = async () => {
        if (!purchaseResult) return;
        try {
            await navigator.clipboard.writeText(purchaseResult.reference);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
    };

    const closeModal = () => {
        setSelectedPackage(null);
        setSelectedMethod('mpesa');
        setStep('select');
        setPurchaseResult(null);
        setError(null);
        setCopied(false);
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
                <div className="bg-gradient-to-br from-indigo-600 to-emerald-700 rounded-2xl p-5 text-white shadow-xl shadow-indigo-600/20">
                    <div className="flex items-center gap-2 mb-1">
                        <Wallet className="w-4 h-4 text-indigo-200" />
                        <span className="text-xs text-indigo-200">Saldo Disponível</span>
                    </div>
                    <p className="text-3xl font-black">{formatCredits(balance)} <span className="text-lg font-bold">cr</span></p>
                    <p className="text-xs text-indigo-200 mt-1">≈ {formatCurrency(balance * 10)} MZN</p>
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
                                onClick={() => {
                                    setSelectedPackage(pkg);
                                    setStep('select');
                                }}
                                className={`relative p-3 rounded-xl border text-left transition ${
                                    pkg.name === 'Popular'
                                        ? 'bg-indigo-950/50 border-indigo-700/50 shadow-lg shadow-indigo-600/10'
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

            {/* Modal */}
            {selectedPackage && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-sm font-bold text-white">
                                {step === 'select' && 'Comprar Créditos'}
                                {step === 'waiting' && 'Pagamento Pendente'}
                                {step === 'confirmed' && 'Confirmado!'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* ETAPA 1: Seleção */}
                            {step === 'select' && (
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
                                                            ? 'border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-600/10'
                                                            : 'border-slate-800 hover:border-slate-700'
                                                    }`}
                                                >
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-black"
                                                        style={{ backgroundColor: method.color || '#6366f1' }}
                                                    >
                                                        {method.icon === 'mpesa' ? 'M' : method.icon === 'emola' ? 'E' : 'm'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-white">{method.name}</p>
                                                        <p className="text-[10px] text-slate-400">{method.confirmation_name}</p>
                                                    </div>
                                                    {selectedMethod === method.id && (
                                                        <CheckCircle className="w-5 h-5 text-indigo-400" />
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
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-sm shadow-lg shadow-indigo-600/30"
                                    >
                                        Continuar para Pagamento
                                    </button>
                                </>
                            )}

                            {/* ETAPA 2: Aguardando Push USSD */}
                            {step === 'waiting' && purchaseResult && (
                                <>
                                    <div className="text-center space-y-3">
                                        <div className="w-16 h-16 bg-amber-950/50 rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
                                            <Smartphone className="w-8 h-8 text-amber-400 animate-float" />
                                        </div>
                                        <div>
                                            <p className="text-amber-300 font-bold text-sm">Push USSD Enviado!</p>
                                            <p className="text-slate-400 text-xs mt-1">
                                                Verifique o seu telemóvel e insira o PIN da sua carteira móvel
                                            </p>
                                        </div>
                                    </div>

                                    {/* Referência */}
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
                                            <span className="text-slate-400">Créditos a receber</span>
                                            <span className="text-emerald-400 font-bold">+{purchaseResult.credit_received} cr</span>
                                        </div>
                                    </div>

                                    {/* Instruções */}
                                    <div className="bg-slate-800 rounded-xl p-3">
                                        <p className="text-xs text-slate-400 mb-2">Como confirmar:</p>
                                        <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside">
                                            <li>Abra o menu USSD no seu telemóvel</li>
                                            <li>Digite o PIN da sua carteira {selectedPaymentMethod?.name}</li>
                                            <li>Aguarde a mensagem de confirmação</li>
                                            <li>Clique em "Confirmar Pagamento" abaixo</li>
                                        </ol>
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-xs bg-red-950/50 p-3 rounded-lg">{error}</p>
                                    )}

                                    <button
                                        onClick={handleConfirmPayment}
                                        disabled={confirming}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                                    >
                                        {confirming ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Confirmando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Confirmar Pagamento
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            {/* ETAPA 3: Confirmado */}
                            {step === 'confirmed' && (
                                <div className="text-center space-y-3">
                                    <div className="w-16 h-16 bg-emerald-950 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <p className="text-emerald-300 font-bold text-lg">Créditos Adicionados!</p>
                                    <p className="text-xs text-slate-400">
                                        +{purchaseResult?.credit_received} créditos na sua carteira
                                    </p>
                                    <button
                                        onClick={closeModal}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-sm shadow-lg shadow-indigo-600/30"
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