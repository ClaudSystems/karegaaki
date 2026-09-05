import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Eye, Search, Filter, X, MessageSquare } from 'lucide-react';
import apiClient from '../api/client';
import { formatDate } from '../utils/formatters';
import { toast, Toaster } from 'react-hot-toast';
import MessageSlideover from '../components/disputes/MessageSlideover';

const typeLabels: Record<string, string> = {
    payment_not_confirmed: 'Pagamento não confirmado',
    code_not_received: 'Código não recebido',
    wrong_amount: 'Valor errado',
    expired_code: 'Código expirado',
    code_not_working: 'Código não funciona',
    code_already_used: 'Código já utilizado',
    wrong_product: 'Produto errado',
    payment_issue: 'Problema com pagamento',
    other: 'Outro',
};

const statusLabels: Record<string, string> = {
    open: 'Aberto',
    under_review: 'Em análise',
    resolved_refunded: 'Reembolsado',
    resolved_resent: 'Código reenviado',
    resolved_rejected: 'Rejeitado',
    closed: 'Fechado',
    reopened: 'Reaberto',
};

const statusColors: Record<string, string> = {
    open: 'bg-red-500/20 text-red-400',
    under_review: 'bg-yellow-500/20 text-yellow-400',
    resolved_refunded: 'bg-green-500/20 text-green-400',
    resolved_resent: 'bg-blue-500/20 text-blue-400',
    resolved_rejected: 'bg-gray-500/20 text-gray-400',
    closed: 'bg-gray-500/20 text-gray-400',
    reopened: 'bg-orange-500/20 text-orange-400',
};

const priorityLabels: Record<string, string> = {
    low: 'Baixa',
    normal: 'Normal',
    high: 'Alta',
    urgent: 'Urgente',
};

const priorityColors: Record<string, string> = {
    low: 'bg-gray-500/20 text-gray-400',
    normal: 'bg-blue-500/20 text-blue-400',
    high: 'bg-orange-500/20 text-orange-400',
    urgent: 'bg-red-500/20 text-red-400',
};

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    // Filtros
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [detailModal, setDetailModal] = useState<any>(null);
    const [resolveModal, setResolveModal] = useState<any>(null);
    const [messageDispute, setMessageDispute] = useState<any>(null);
    const [resolveAction, setResolveAction] = useState('refund');
    const [resolveResponse, setResolveResponse] = useState('');
    const [refundAmount, setRefundAmount] = useState(0);

    const fetchDisputes = () => {
        setLoading(true);
        apiClient.get('/disputes/admin/all', {
            params: {
                page,
                page_size: 20,
                status: statusFilter || undefined,
                priority: priorityFilter || undefined,
                dispute_type: typeFilter || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                search: search || undefined,
            },
        })
            .then(res => {
                setDisputes(res.data.items);
                setTotal(res.data.total);
            })
            .catch(() => {
                toast.error('Erro ao carregar reclamações');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchDisputes();
    }, [page, statusFilter, priorityFilter, typeFilter, startDate, endDate, search]);

    const handleClearFilters = () => {
        setStatusFilter('');
        setPriorityFilter('');
        setTypeFilter('');
        setStartDate('');
        setEndDate('');
        setSearch('');
        setPage(1);
    };

    const hasActiveFilters = statusFilter || priorityFilter || typeFilter || startDate || endDate || search;

    const handleResolve = async () => {
        if (!resolveModal) return;
        try {
            await apiClient.post(`/disputes/admin/${resolveModal.id}/resolve`, {
                action: resolveAction,
                response: resolveResponse,
                refund_amount: resolveAction === 'refund' ? refundAmount : undefined,
            });
            toast.success('Reclamação resolvida!');
            setResolveModal(null);
            setResolveResponse('');
            fetchDisputes();
        } catch {
            toast.error('Erro ao resolver');
        }
    };

    return (
        <div>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Disputas / Reclamações</h2>
                    <p className="text-slate-400 text-sm mt-1">{total} reclamações</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                            showFilters || hasActiveFilters
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        <Filter size={16} />
                        Filtros
                        {hasActiveFilters && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                !
                            </span>
                        )}
                    </button>
                    <button onClick={fetchDisputes} className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-2 rounded-lg transition-colors">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Filtros */}
            {showFilters && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-4 space-y-3 animate-slide-down">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Estado</label>
                            <select
                                value={statusFilter}
                                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                            >
                                <option value="">Todos</option>
                                <option value="open">Aberto</option>
                                <option value="under_review">Em análise</option>
                                <option value="resolved_refunded">Reembolsado</option>
                                <option value="resolved_resent">Reenviado</option>
                                <option value="resolved_rejected">Rejeitado</option>
                                <option value="closed">Fechado</option>
                                <option value="reopened">Reaberto</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Prioridade</label>
                            <select
                                value={priorityFilter}
                                onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                            >
                                <option value="">Todas</option>
                                <option value="low">Baixa</option>
                                <option value="normal">Normal</option>
                                <option value="high">Alta</option>
                                <option value="urgent">Urgente</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Tipo</label>
                            <select
                                value={typeFilter}
                                onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                            >
                                <option value="">Todos</option>
                                {Object.entries(typeLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Busca</label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Ref ou descrição..."
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-sm text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Data Início</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => { setStartDate(e.target.value); setPage(1); }}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Data Fim</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => { setEndDate(e.target.value); setPage(1); }}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                            />
                        </div>
                        {hasActiveFilters && (
                            <div className="flex items-end">
                                <button
                                    onClick={handleClearFilters}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                                >
                                    <X size={14} />
                                    Limpar Filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-slate-700">
                        <th className="text-left p-4 text-sm text-slate-400">Ref</th>
                        <th className="text-left p-4 text-sm text-slate-400">Tipo</th>
                        <th className="text-left p-4 text-sm text-slate-400">Estado</th>
                        <th className="text-left p-4 text-sm text-slate-400">Prioridade</th>
                        <th className="text-left p-4 text-sm text-slate-400">Data</th>
                        <th className="text-left p-4 text-sm text-slate-400">Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {disputes.map((d) => (
                        <tr key={d.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="p-4">
                                <span className="text-white text-sm font-mono">{d.reference}</span>
                            </td>
                            <td className="p-4 text-slate-400 text-sm">{typeLabels[d.dispute_type] || d.dispute_type}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[d.status] || ''}`}>
                                    {statusLabels[d.status] || d.status}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[d.priority] || ''}`}>
                                    {priorityLabels[d.priority] || d.priority}
                                </span>
                            </td>
                            <td className="p-4 text-slate-400 text-xs">{formatDate(d.created_at)}</td>
                            <td className="p-4">
                                <div className="flex gap-2">
                                    <button onClick={() => setDetailModal(d)} className="text-blue-400 hover:text-blue-300" title="Ver detalhes">
                                        <Eye size={16} />
                                    </button>
                                    <button onClick={() => setMessageDispute(d)} className="text-indigo-400 hover:text-indigo-300" title="Mensagens">
                                        <MessageSquare size={16} />
                                    </button>
                                    {(d.status === 'open' || d.status === 'under_review' || d.status === 'reopened') && (
                                        <button onClick={() => { setResolveModal(d); setRefundAmount(0); setResolveResponse(''); }}
                                                className="text-green-400 hover:text-green-300" title="Resolver">
                                            <CheckCircle size={16} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {disputes.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-500">
                        <AlertTriangle size={48} className="mx-auto mb-3 opacity-50" />
                        Nenhuma reclamação encontrada.
                    </div>
                )}
                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-400">
                    Página {page} de {Math.max(1, Math.ceil(total / 20))}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= Math.ceil(total / 20)}
                        className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Próxima
                    </button>
                </div>
            </div>

            {/* Modal de Detalhe */}
            {detailModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDetailModal(null)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 p-6 rounded-xl border border-slate-700 z-50 w-[500px] max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-white mb-4">Detalhes da Reclamação</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-slate-400">Referência</span><span className="text-white font-mono">{detailModal.reference}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Tipo</span><span className="text-white">{typeLabels[detailModal.dispute_type]}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Estado</span><span className="text-white">{statusLabels[detailModal.status]}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Prioridade</span><span className="text-white">{priorityLabels[detailModal.priority] || detailModal.priority}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Data</span><span className="text-white">{formatDate(detailModal.created_at)}</span></div>
                            {detailModal.reopen_count > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Reaberturas</span>
                                    <span className="text-orange-400 font-bold">{detailModal.reopen_count}</span>
                                </div>
                            )}
                            {detailModal.reopen_reason && (
                                <div>
                                    <span className="text-slate-400 block mb-1">Motivo da Reabertura</span>
                                    <p className="text-orange-400 bg-slate-900 p-3 rounded-lg">{detailModal.reopen_reason}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-slate-400 block mb-1">Descrição do Cliente</span>
                                <p className="text-white bg-slate-900 p-3 rounded-lg">{detailModal.description}</p>
                            </div>
                            {detailModal.admin_response && (
                                <div>
                                    <span className="text-slate-400 block mb-1">Resposta do Admin</span>
                                    <p className="text-green-400 bg-slate-900 p-3 rounded-lg">{detailModal.admin_response}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setDetailModal(null)} className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Fechar</button>
                    </div>
                </>
            )}

            {/* Modal de Resolução */}
            {resolveModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setResolveModal(null)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 p-6 rounded-xl border border-slate-700 z-50 w-[500px]">
                        <h3 className="text-lg font-bold text-white mb-4">Resolver Reclamação: {resolveModal.reference}</h3>
                        <p className="text-slate-400 text-sm mb-3">{resolveModal.description}</p>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Ação</label>
                                <select value={resolveAction} onChange={e => setResolveAction(e.target.value)}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                                    <option value="refund">💰 Reembolsar</option>
                                    <option value="resend_code">📧 Reenviar código</option>
                                    <option value="reject">❌ Rejeitar</option>
                                    <option value="request_info">💬 Pedir mais informações</option>
                                </select>
                            </div>

                            {resolveAction === 'refund' && (
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Valor a reembolsar (créditos)</label>
                                    <input type="number" value={refundAmount} onChange={e => setRefundAmount(Number(e.target.value))}
                                           className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                                </div>
                            )}

                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Resposta para o cliente</label>
                                <textarea value={resolveResponse} onChange={e => setResolveResponse(e.target.value)} rows={3}
                                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none"
                                          placeholder="Ex: Lamentamos o inconveniente. O valor foi reembolsado..." />
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => setResolveModal(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Cancelar</button>
                                <button onClick={handleResolve} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium">Confirmar Resolução</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Slideover de Mensagens */}
            {messageDispute && (
                <MessageSlideover
                    dispute={messageDispute}
                    onClose={() => setMessageDispute(null)}
                />
            )}
        </div>
    );
}