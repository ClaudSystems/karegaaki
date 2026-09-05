import { useEffect, useState } from 'react';
import { Search, Star, Shield, Lock, Unlock, Edit } from 'lucide-react';
import apiClient from '../api/client';
import { toast, Toaster } from 'react-hot-toast';

const kycColors: Record<string, string> = {
    basic: 'bg-gray-500/20 text-gray-400',
    verified: 'bg-blue-500/20 text-blue-400',
    premium: 'bg-yellow-500/20 text-yellow-400',
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page] = useState(1);
    const [search, setSearch] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        kyc_level: '',
        credit_score: 0,
        max_credit_limit: 0,
        adjust_credits: 0,
        is_blocked: false,
        blocked_reason: ''
    });

    const fetchCustomers = () => {
        setLoading(true);
        apiClient.get('/admin/customers', { params: { page, page_size: 20, search: search || undefined } })
            .then(res => {
                setCustomers(res.data.items);
                setTotal(res.data.total);
            })
            .catch(() => {
                toast.error('Erro ao carregar clientes');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCustomers();
    }, [page, search]);

    const handleEdit = (customer: any) => {
        setEditingCustomer(customer);
        setEditForm({
            kyc_level: customer.kyc_level || 'basic',
            credit_score: customer.credit_score || 0,
            max_credit_limit: customer.max_credit_limit || 500,
            adjust_credits: 0,
            is_blocked: customer.is_blocked || false,
            blocked_reason: customer.blocked_reason || '',
        });
        setShowEditModal(true);
    };

    const handleSave = async () => {
        if (!editingCustomer) return;
        try {
            await apiClient.put(`/admin/customers/${editingCustomer.id}`, editForm);
            toast.success('Cliente atualizado!');
            setShowEditModal(false);
            fetchCustomers();
        } catch {
            toast.error('Erro ao atualizar');
        }
    };

    return (
        <div>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Clientes</h2>
                    <p className="text-slate-400 text-sm mt-1">{total} clientes</p>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm mt-3">Carregando...</p>
                </div>
            ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left p-4 text-sm text-slate-400">Cliente</th>
                            <th className="text-left p-4 text-sm text-slate-400">Saldo</th>
                            <th className="text-left p-4 text-sm text-slate-400">KYC</th>
                            <th className="text-left p-4 text-sm text-slate-400">Score</th>
                            <th className="text-left p-4 text-sm text-slate-400">Gasto Total</th>
                            <th className="text-left p-4 text-sm text-slate-400">Transações</th>
                            <th className="text-left p-4 text-sm text-slate-400">Status</th>
                            <th className="text-left p-4 text-sm text-slate-400">Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {customers.map(c => (
                            <tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                <td className="p-4">
                                    <div>
                                        <span className="text-white text-sm font-medium">{c.full_name}</span>
                                        <p className="text-slate-500 text-xs">{c.phone_number}</p>
                                    </div>
                                </td>
                                <td className="p-4 text-white font-medium">{c.balance_credit} créditos</td>
                                <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${kycColors[c.kyc_level] || ''}`}>
                                            <Shield size={10} className="inline mr-1" />{c.kyc_level}
                                        </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1">
                                        <Star size={14} className={c.credit_score >= 70 ? 'text-yellow-400' : c.credit_score >= 40 ? 'text-orange-400' : 'text-slate-500'} />
                                        <span className="text-white text-sm">{c.credit_score}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-400 text-sm">{c.total_spent_mzn} MZN</td>
                                <td className="p-4 text-slate-400 text-sm">{c.total_transactions}</td>
                                <td className="p-4">
                                    {c.is_blocked ? (
                                        <span className="text-red-400 flex items-center gap-1 text-xs"><Lock size={12} /> Bloqueado</span>
                                    ) : (
                                        <span className="text-green-400 flex items-center gap-1 text-xs"><Unlock size={12} /> Ativo</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <button onClick={() => handleEdit(c)} className="text-blue-400 hover:text-blue-300">
                                        <Edit size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showEditModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowEditModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 p-6 rounded-xl border border-slate-700 z-50 w-[450px] max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-white mb-4">
                            Editar: {editingCustomer?.full_name}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Nível KYC</label>
                                <select
                                    value={editForm.kyc_level}
                                    onChange={e => setEditForm({ ...editForm, kyc_level: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                >
                                    <option value="basic">Básico</option>
                                    <option value="verified">Verificado</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Credit Score (0-100)</label>
                                <input
                                    type="number"
                                    value={editForm.credit_score}
                                    min={0}
                                    max={100}
                                    onChange={e => setEditForm({ ...editForm, credit_score: Number(e.target.value) })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Limite de Crédito</label>
                                <input
                                    type="number"
                                    value={editForm.max_credit_limit}
                                    onChange={e => setEditForm({ ...editForm, max_credit_limit: Number(e.target.value) })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Ajustar Créditos (+/-)</label>
                                <input
                                    type="number"
                                    value={editForm.adjust_credits}
                                    step="0.5"
                                    onChange={e => setEditForm({ ...editForm, adjust_credits: Number(e.target.value) })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Bloquear Cliente</span>
                                <button
                                    onClick={() => setEditForm({ ...editForm, is_blocked: !editForm.is_blocked })}
                                    className={`w-10 h-5 rounded-full transition-colors ${editForm.is_blocked ? 'bg-red-600' : 'bg-slate-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${editForm.is_blocked ? 'ml-5' : 'ml-0.5'}`} />
                                </button>
                            </div>
                            {editForm.is_blocked && (
                                <input
                                    placeholder="Motivo do bloqueio"
                                    value={editForm.blocked_reason}
                                    onChange={e => setEditForm({ ...editForm, blocked_reason: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            )}
                            <button
                                onClick={handleSave}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                            >
                                Guardar Alterações
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}