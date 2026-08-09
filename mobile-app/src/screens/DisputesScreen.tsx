// src/screens/DisputesScreen.tsx
import React, { useState, useEffect } from 'react';
import { disputesAPI } from '../api/client';
import { ArrowLeft, Plus, MessageSquare, Clock, CheckCircle, XCircle, Send, AlertCircle } from 'lucide-react';

interface DisputesScreenProps {
    onBack: () => void;
}

const DISPUTE_TYPES: Record<string, string> = {
    payment_not_confirmed: 'Pagamento não confirmado',
    code_not_received: 'Código não recebido',
    wrong_amount: 'Valor errado',
    expired_code: 'Código expirado',
    other: 'Outro',
};

const STATUS_LABELS: Record<string, string> = {
    open: 'Aberta',
    under_review: 'Em Análise',
    resolved_refunded: 'Reembolsado',
    resolved_resent: 'Reenviado',
    resolved_rejected: 'Rejeitado',
};

export default function DisputesScreen({ onBack }: DisputesScreenProps) {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [disputeType, setDisputeType] = useState('code_not_received');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const loadDisputes = async () => {
        setLoading(true);
        try {
            const res: any = await disputesAPI.my();
            const data = res?.items || res?.data || res || [];
            setDisputes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erro ao carregar disputas:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDisputes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;
        setSubmitting(true);
        setErrorMsg(null);
        try {
            await disputesAPI.create({ dispute_type: disputeType, description: description });
            setSuccessMsg('Reclamação registada com sucesso!');
            setDescription('');
            setShowForm(false);
            loadDisputes();
        } catch (err: any) {
            setErrorMsg(err?.detail || 'Erro ao criar reclamação');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <Clock className="w-4 h-4 text-amber-400" />;
            case 'under_review': return <AlertCircle className="w-4 h-4 text-blue-400" />;
            case 'resolved_refunded':
            case 'resolved_resent':
                return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case 'resolved_rejected': return <XCircle className="w-4 h-4 text-red-400" />;
            default: return <Clock className="w-4 h-4 text-slate-400" />;
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
            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="text-slate-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-white">Reclamações</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Nova
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {successMsg && (
                    <div className="bg-emerald-950/50 border border-emerald-800/50 rounded-xl p-3 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {successMsg}
                    </div>
                )}

                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                        <h3 className="text-sm font-bold text-white">Nova Reclamação</h3>
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Tipo</label>
                            <select
                                value={disputeType}
                                onChange={(e) => setDisputeType(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                            >
                                {Object.entries(DISPUTE_TYPES).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Descrição</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Descreva o problema..."
                                rows={3}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                                required
                            />
                        </div>
                        {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition">
                                Cancelar
                            </button>
                            <button type="submit" disabled={submitting} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition">
                                {submitting ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><Send className="w-3 h-3" /> Enviar</>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {disputes.length === 0 && !showForm ? (
                    <div className="text-center py-10">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">Nenhuma reclamação</p>
                        <button onClick={() => setShowForm(true)} className="mt-3 text-indigo-400 text-sm hover:text-indigo-300">
                            Criar reclamação
                        </button>
                    </div>
                ) : (
                    disputes.map((d: any) => (
                        <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(d.status)}
                                    <span className="text-xs font-bold text-white">{DISPUTE_TYPES[d.dispute_type] || d.dispute_type}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    d.status === 'open' ? 'bg-amber-950 text-amber-400' :
                                        d.status === 'under_review' ? 'bg-blue-950 text-blue-400' :
                                            d.status?.includes('resolved') && !d.status?.includes('rejected') ? 'bg-emerald-950 text-emerald-400' :
                                                'bg-red-950 text-red-400'
                                }`}>
                  {STATUS_LABELS[d.status] || d.status}
                </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">{d.description}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span>{d.reference}</span>
                                <span>{new Date(d.created_at).toLocaleDateString('pt-MZ')}</span>
                            </div>
                            {d.admin_response && (
                                <div className="mt-2 pt-2 border-t border-slate-800">
                                    <p className="text-[10px] text-slate-400">Resposta do suporte:</p>
                                    <p className="text-xs text-indigo-300">{d.admin_response}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}