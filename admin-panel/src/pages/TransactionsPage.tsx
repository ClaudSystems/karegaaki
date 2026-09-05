import { useEffect, useState } from 'react';
import { ArrowLeftRight, Search, Plus, CheckCircle, XCircle, Eye } from 'lucide-react';
import apiClient from '../api/client';
import { formatDate } from '../utils/formatters';
import { toast, Toaster } from 'react-hot-toast';
import TransactionCancelSlideover from '../components/transactions/TransactionCancelSlideover';
import TransactionDetailModal from '../components/transactions/TransactionDetailModal';

const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    delivered: 'Entregue',
    failed: 'Falhou',
    cancelled: 'Cancelado',
    processing: 'Processando',
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    processing: 'bg-purple-100 text-purple-800',
};

function ProductSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        apiClient.get('/admin/products').then(res => setProducts(res.data.items || []));
    }, []);

    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">Selecionar produto...</option>
            {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({p.credit_price} créditos)</option>
            ))}
        </select>
    );
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTxPhone, setNewTxPhone] = useState('');
    const [newTxProductId, setNewTxProductId] = useState('');
    const [cancelModalTx, setCancelModalTx] = useState<any>(null);
    const [detailModalTx, setDetailModalTx] = useState<any>(null);

    const fetchTransactions = () => {
        setLoading(true);
        apiClient.get('/admin/transactions', { params: { page, page_size: 20 } })
            .then(res => {
                setTransactions(res.data.items);
                setTotal(res.data.total);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTransactions();
    }, [page]);

    const handleCreatePending = async () => {
        try {
            await apiClient.post('/admin/transactions/create-pending', {
                user_phone: newTxPhone,
                product_id: newTxProductId,
            });
            toast.success('Transação pendente criada!');
            setShowCreateModal(false);
            setNewTxPhone('');
            setNewTxProductId('');
            fetchTransactions();
        } catch {
            toast.error('Erro ao criar transação');
        }
    };

    const handleConfirm = async (txId: string) => {
        try {
            await apiClient.post('/admin/transactions/confirm-pending', { transaction_id: txId });
            toast.success('Transação confirmada e entregue!');
            fetchTransactions();
        } catch {
            toast.error('Erro ao confirmar');
        }
    };

    const handleOpenCancel = (tx: any) => setCancelModalTx(tx);
    const handleCloseCancel = () => setCancelModalTx(null);

    const handleConfirmCancel = async (refundCredits?: boolean, releaseStock?: boolean) => {
        if (!cancelModalTx) return;
        try {
            const res = await apiClient.post('/admin/transactions/cancel', {
                transaction_id: cancelModalTx.id,
                refund_credits: refundCredits ?? true,
                release_stock: releaseStock ?? true,
            });
            toast.success('Transação cancelada!');
            if (res.data.refunded) {
                toast.success(`${res.data.refund_amount} créditos devolvidos ao cliente!`);
            }
            if (res.data.stock_liberado) {
                toast.success('Stock libertado!');
            }
            setCancelModalTx(null);
            fetchTransactions();
        } catch {
            toast.error('Erro ao cancelar');
        }
    };

    const handleOpenDetail = (tx: any) => setDetailModalTx(tx);

    return (
        <div>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />

            <TransactionCancelSlideover
                isOpen={!!cancelModalTx}
                transaction={cancelModalTx}
                onClose={handleCloseCancel}
                onConfirm={handleConfirmCancel}
            />

            <TransactionDetailModal
                isOpen={!!detailModalTx}
                transaction={detailModalTx}
                onClose={() => setDetailModalTx(null)}
            />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Transações</h2>
                    <p className="text-slate-400 text-sm mt-1">{total} transações encontradas</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                    <Plus size={16} /> Simular Transação Pendente
                </button>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-slate-700">
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Referência</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Data</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Método</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Total</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Pagamento</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Entrega</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Itens</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                            <td className="p-4">
                                <span className="text-white text-sm font-mono">{tx.reference}</span>
                            </td>
                            <td className="p-4 text-slate-400 text-sm">{formatDate(tx.created_at)}</td>
                            <td className="p-4">
                                <span className="text-white text-sm capitalize">{tx.payment_method}</span>
                            </td>
                            <td className="p-4">
                                <span className="text-white font-medium">{tx.total_credit} créditos</span>
                                {tx.total_mzn && <span className="text-slate-500 text-xs ml-1">({tx.total_mzn} MZN)</span>}
                            </td>
                            <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[tx.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[tx.payment_status] || tx.payment_status}
                  </span>
                            </td>
                            <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[tx.delivery_status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[tx.delivery_status] || tx.delivery_status}
                  </span>
                            </td>
                            <td className="p-4">
                                <span className="text-slate-400 text-sm">{tx.items?.length || 0} itens</span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleOpenDetail(tx)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                        title="Ver detalhes"
                                    >
                                        <Eye size={14} />
                                    </button>
                                    {tx.payment_status === 'pending' && (
                                        <button
                                            onClick={() => handleConfirm(tx.id)}
                                            className="text-green-400 hover:text-green-300 flex items-center gap-1 text-sm transition-colors"
                                            title="Confirmar entrega"
                                        >
                                            <CheckCircle size={14} />
                                        </button>
                                    )}
                                    {tx.payment_status !== 'cancelled' && (
                                        <button
                                            onClick={() => handleOpenCancel(tx)}
                                            className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm transition-colors"
                                            title="Cancelar transação"
                                        >
                                            <XCircle size={14} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {transactions.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-500">
                        <ArrowLeftRight size={48} className="mx-auto mb-3 opacity-50" />
                        Nenhuma transação encontrada.
                    </div>
                )}
                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>

            {total > 20 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-slate-800 text-slate-400 rounded-lg disabled:opacity-50 hover:text-white text-sm"
                    >
                        Anterior
                    </button>
                    <span className="px-4 py-2 text-slate-400 text-sm">Página {page}</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={transactions.length < 20}
                        className="px-4 py-2 bg-slate-800 text-slate-400 rounded-lg disabled:opacity-50 hover:text-white text-sm"
                    >
                        Próxima
                    </button>
                </div>
            )}

            {showCreateModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCreateModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 p-6 rounded-xl border border-slate-700 z-50 w-96">
                        <h3 className="text-lg font-bold text-white mb-4">Simular Transação Pendente</h3>
                        <p className="text-sm text-slate-400 mb-4">Simula um pagamento via M-Pesa que precisa de confirmação manual.</p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Telefone do Cliente</label>
                                <input
                                    type="text"
                                    placeholder="+258841234567"
                                    value={newTxPhone}
                                    onChange={e => setNewTxPhone(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Produto</label>
                                <ProductSelect value={newTxProductId} onChange={setNewTxProductId} />
                            </div>
                            <button
                                onClick={handleCreatePending}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-medium transition-colors"
                            >
                                Criar Transação Pendente
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}