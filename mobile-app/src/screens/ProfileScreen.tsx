import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { walletAPI, kycAPI } from '../api/client';
import { formatCurrency } from '../utils/format';
import { ArrowLeft, LogOut, RefreshCw, MessageSquare } from 'lucide-react';

interface ProfileScreenProps {
    onBack: () => void;
    onNavigateToDisputes?: () => void;
}

export default function ProfileScreen({ onBack, onNavigateToDisputes }: ProfileScreenProps) {
    const { user, logout, loadUser } = useAuthStore();
    const [balance, setBalance] = useState<number>(0);
    const [kycData, setKycData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [biInput, setBiInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Usar ANY para evitar problema de tipo
    const userAny = user as any;
    const phoneNumber = userAny?.phone_number || userAny?.phone || '84XXXXXXX';
    const fullName = userAny?.full_name || '';
    const isVerified = userAny?.is_verified || false;

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await loadUser();
            const [balRes, kycRes]: any[] = await Promise.all([
                walletAPI.balance(),
                kycAPI.status().catch(() => null),
            ]);
            setBalance(parseFloat(balRes?.balance_credit || balRes?.balance || 0));
            if (kycRes) setKycData(kycRes.data || kycRes);
        } catch (err) {
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitKyc = async () => {
        if (!biInput.trim()) return;
        setSubmitting(true);
        setMessage(null);
        try {
            await kycAPI.submit({ document_type: 'BI', document_number: biInput });
            setMessage('BI submetido com sucesso!');
            setBiInput('');
            loadData();
        } catch (err: any) {
            setMessage(err?.detail || 'Erro ao submeter');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        logout();
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const kyc = kycData || {};
    const kycLevel = kyc.kyc_level || 'basic';

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="text-slate-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-white">Perfil & KYC</h1>
                    </div>
                    <button onClick={loadData} className="text-slate-400 hover:text-white p-1">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* User Info */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                                {phoneNumber.substring(0, 2)}
                            </div>
                            <div>
                                <div className="font-bold text-white text-xs">{phoneNumber}</div>
                                <div className="text-[10px] text-slate-400">{fullName}</div>
                                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Sessão Ativa
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KYC Level */}
                <div className="bg-gradient-to-tr from-indigo-900 to-blue-900 rounded-2xl p-3.5 text-white">
                    <div className="text-[10px] uppercase font-bold text-indigo-200">Nível KYC Atual</div>
                    <div className="text-xl font-bold">{kycLevel.toUpperCase()}</div>
                    <div className="text-[11px] text-indigo-200">Limite: {formatCurrency(kyc.max_credit_limit || 500)} MZN</div>
                </div>

                {/* Saldo */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-slate-400">Saldo</div>
                        <div className="text-lg font-bold text-white">{formatCurrency(balance)} cr</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400">Verificado</div>
                        <div className="text-sm font-bold text-indigo-400">
                            {isVerified ? 'Sim ✓' : 'Não'}
                        </div>
                    </div>
                </div>

                {/* Documentos Status */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="font-bold text-white text-xs">Documentos KYC</div>
                    <div className="flex justify-between text-[10px] p-2 bg-slate-950 rounded">
                        <span>BI (Número)</span>
                        <span className={kyc.document_verified ? 'text-emerald-400' : 'text-amber-400'}>
                            {kyc.document_verified ? '✓ Verificado' : 'Pendente'}
                        </span>
                    </div>
                </div>

                {/* Submeter BI */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="font-bold text-white text-xs">Submeter BI</div>
                    <input
                        type="text"
                        value={biInput}
                        onChange={(e) => setBiInput(e.target.value)}
                        placeholder="Número do BI"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                    />
                    <button
                        onClick={handleSubmitKyc}
                        disabled={submitting || !biInput.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-2 rounded-lg text-xs"
                    >
                        {submitting ? 'Submetendo...' : 'Submeter BI'}
                    </button>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-xs ${message.includes('sucesso') ? 'bg-emerald-950/50 text-emerald-400' : 'bg-red-950/50 text-red-400'}`}>
                        {message}
                    </div>
                )}

                {/* Disputas */}
                {onNavigateToDisputes && (
                    <button
                        onClick={onNavigateToDisputes}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs text-white">Disputas</span>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-slate-500 rotate-180" />
                    </button>
                )}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-950/50 border border-red-800 rounded-xl p-3 flex items-center justify-center gap-2"
                >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400">Terminar Sessão</span>
                </button>
            </div>
        </div>
    );
}