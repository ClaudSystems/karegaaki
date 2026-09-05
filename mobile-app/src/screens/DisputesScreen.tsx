// src/screens/DisputesScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { disputesAPI } from '../api/client';
import {
    ArrowLeft, MessageSquare, AlertCircle, CheckCircle,
    Clock, Send, RefreshCw, Phone, Shield, X, RotateCcw
} from 'lucide-react';

interface DisputesScreenProps {
    onBack: () => void;
}

interface Dispute {
    id: string;
    reference: string;
    dispute_type: string;
    description: string;
    status: string;
    created_at: string;
    admin_response?: string;
    reopen_count?: number;
}

interface ChatMessage {
    id: string;
    sender_type: 'client' | 'admin';
    sender_id: string | null;
    message: string;
    created_at: string;
}

export default function DisputesScreen({ onBack }: DisputesScreenProps) {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        dispute_type: '',
        description: '',
        transaction_reference: '',
    });

    // Chat states
    const [activeChat, setActiveChat] = useState<Dispute | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Reopen states
    const [showReopen, setShowReopen] = useState(false);
    const [reopenReason, setReopenReason] = useState('');
    const [reopening, setReopening] = useState(false);

    useEffect(() => {
        loadDisputes();
        const savedReference = localStorage.getItem('dispute_reference');
        if (savedReference) {
            setFormData(prev => ({ ...prev, transaction_reference: savedReference }));
            setShowForm(true);
            localStorage.removeItem('dispute_reference');
        }
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadDisputes = async () => {
        setLoading(true);
        setError(null);
        try {
            const res: any = await disputesAPI.my();
            const data = res?.items || res?.data || res || [];
            setDisputes(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError('Erro ao carregar disputas');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (disputeId: string) => {
        setLoadingMessages(true);
        try {
            const res: any = await disputesAPI.getMessages(disputeId);
            setMessages(res?.items || []);
        } catch {
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleOpenChat = (dispute: Dispute) => {
        setActiveChat(dispute);
        loadMessages(dispute.id);
    };

    const handleSendMessage = async () => {
        if (!activeChat || !newMessage.trim()) return;
        setSendingMessage(true);
        try {
            await disputesAPI.sendMessage(activeChat.id, newMessage.trim());
            setNewMessage('');
            await loadMessages(activeChat.id);
        } catch {
            setError('Erro ao enviar mensagem');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleReopen = async () => {
        if (!activeChat || !reopenReason.trim()) return;
        setReopening(true);
        try {
            await disputesAPI.reopen(activeChat.id, reopenReason.trim());
            setSuccess('Disputa reaberta com sucesso!');
            setShowReopen(false);
            setReopenReason('');
            setActiveChat(null);
            loadDisputes();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err?.detail || 'Erro ao reabrir disputa');
        } finally {
            setReopening(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.dispute_type.trim() || !formData.description.trim()) return;

        setSubmitting(true);
        setError(null);
        try {
            const payload: any = {
                dispute_type: formData.dispute_type,
                description: formData.description,
            };

            if (formData.transaction_reference?.trim()) {
                payload.transaction_reference = formData.transaction_reference.trim();
            }

            await disputesAPI.create(payload);
            setSuccess('Disputa submetida com sucesso!');
            setFormData({ dispute_type: '', description: '', transaction_reference: '' });
            setShowForm(false);
            loadDisputes();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            let errorMessage = 'Erro ao submeter disputa';
            if (err?.detail) {
                if (typeof err.detail === 'string') {
                    errorMessage = err.detail;
                } else if (Array.isArray(err.detail)) {
                    errorMessage = err.detail.map((d: any) => d.msg || 'Erro de validação').join(', ');
                }
            }
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'resolved_refunded':
            case 'resolved_resent':
                return (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" />
                        Resolvida
                    </span>
                );
            case 'resolved_rejected':
                return (
                    <span className="flex items-center gap-1 text-red-400 bg-red-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3" />
                        Rejeitada
                    </span>
                );
            case 'open':
            case 'under_review':
            case 'pending':
                return (
                    <span className="flex items-center gap-1 text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        Pendente
                    </span>
                );
            case 'reopened':
                return (
                    <span className="flex items-center gap-1 text-orange-400 bg-orange-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <RotateCcw className="w-3 h-3" />
                        Reaberta
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {status}
                    </span>
                );
        }
    };

    const canReopen = (status: string) => {
        return ['resolved_refunded', 'resolved_resent', 'resolved_rejected', 'closed'].includes(status);
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
                        <h1 className="text-lg font-bold text-white">Suporte & Disputas</h1>
                    </div>
                    <button onClick={loadDisputes} className="text-slate-400 hover:text-white p-1">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {success && (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-950/50 border border-emerald-900/50 p-3 rounded-xl animate-slide-up">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                    <MessageSquare className="w-4 h-4" />
                    {showForm ? 'Fechar Formulário' : 'Nova Disputa'}
                </button>

                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 animate-slide-up">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Tipo de Disputa</label>
                            <select
                                value={formData.dispute_type}
                                onChange={(e) => setFormData({ ...formData, dispute_type: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"
                                required
                            >
                                <option value="">Selecione o tipo...</option>
                                <option value="code_not_working">Código não funciona</option>
                                <option value="code_already_used">Código já utilizado</option>
                                <option value="wrong_product">Produto errado</option>
                                <option value="payment_issue">Problema com pagamento</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Referência da Transação (opcional)</label>
                            <input
                                type="text"
                                value={formData.transaction_reference}
                                onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                                placeholder="Ex: #TX-20260905-697"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Descrição do Problema</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva o problema em detalhe..."
                                rows={4}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
                                required
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{typeof error === 'string' ? error : 'Erro ao processar'}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Submeter Disputa
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Lista de Disputas */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-400" />
                        Minhas Disputas
                    </h3>

                    {disputes.length === 0 && !loading && (
                        <div className="text-center py-10">
                            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">Nenhuma disputa registada</p>
                        </div>
                    )}

                    {disputes.map((dispute) => (
                        <div key={dispute.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white">{dispute.dispute_type || dispute.reference}</p>
                                    {dispute.reference && (
                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{dispute.reference}</p>
                                    )}
                                </div>
                                {getStatusBadge(dispute.status)}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">{dispute.description}</p>
                            <p className="text-[10px] text-slate-600 mt-2">
                                {new Date(dispute.created_at).toLocaleDateString('pt-PT')}
                            </p>
                            {dispute.admin_response && (
                                <div className="mt-2 p-2 bg-emerald-950/30 border border-emerald-900/30 rounded-lg">
                                    <p className="text-[10px] text-emerald-400 font-bold mb-0.5">Resposta do Admin:</p>
                                    <p className="text-xs text-emerald-300">{dispute.admin_response}</p>
                                </div>
                            )}
                            {(dispute.reopen_count || 0) > 0 && (
                                <p className="text-[10px] text-orange-400 mt-1">
                                    Reaberta {dispute.reopen_count} vez(es)
                                </p>
                            )}

                            {/* Botões de ação */}
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => handleOpenChat(dispute)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Mensagens
                                </button>
                                {canReopen(dispute.status) && (
                                    <button
                                        onClick={() => { setActiveChat(dispute); setShowReopen(true); }}
                                        className="flex-1 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Reabrir
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contacto */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <p className="text-xs font-bold text-white mb-2">Contacto Direto</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <span>+258 84 123 4567</span>
                    </div>
                </div>
            </div>

            {/* Chat Slideover */}
            {activeChat && !showReopen && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-800">
                            <div>
                                <h3 className="text-sm font-bold text-white">Conversa</h3>
                                <p className="text-[10px] text-slate-500 font-mono">{activeChat.reference}</p>
                            </div>
                            <button onClick={() => setActiveChat(null)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {loadingMessages ? (
                                <div className="flex justify-center py-6">
                                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <p className="text-center text-xs text-slate-500 py-6">Nenhuma mensagem</p>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                                                msg.sender_type === 'client'
                                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                                    : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                                            }`}
                                        >
                                            <p className="text-xs whitespace-pre-wrap">{msg.message}</p>
                                            <p className={`text-[9px] mt-1 ${msg.sender_type === 'client' ? 'text-indigo-200' : 'text-slate-500'}`}>
                                                {new Date(msg.created_at).toLocaleString('pt-PT')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-slate-800">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escreva uma mensagem..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-indigo-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={sendingMessage || !newMessage.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white p-2 rounded-lg"
                                >
                                    {sendingMessage ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reopen Modal */}
            {showReopen && activeChat && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-sm">
                        <h3 className="text-sm font-bold text-white mb-3">Reabrir Disputa</h3>
                        <p className="text-xs text-slate-400 mb-3">
                            {activeChat.reference} - {activeChat.dispute_type}
                        </p>
                        <label className="block text-xs text-slate-400 mb-1.5">Motivo da Reabertura</label>
                        <textarea
                            value={reopenReason}
                            onChange={(e) => setReopenReason(e.target.value)}
                            rows={3}
                            placeholder="Explique por que não ficou satisfeito..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none resize-none"
                        />
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => { setShowReopen(false); setReopenReason(''); }}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium py-2.5 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReopen}
                                disabled={reopening || !reopenReason.trim()}
                                className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1"
                            >
                                {reopening ? 'Reabrindo...' : 'Reabrir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}