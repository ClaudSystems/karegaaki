import { useEffect, useState } from 'react';
import { Coins, Edit, Trash2, Wallet, Plus } from 'lucide-react';
import apiClient from '../api/client';
import { Toaster, toast } from 'react-hot-toast';
import CreditSlideover from '../components/credits/CreditSlideover';

export default function CreditsPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'packages' | 'balances'>('packages');
    const [loading, setLoading] = useState(false);
    const [slideoverOpen, setSlideoverOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<any>(null);

    const fetchPackages = () => {
        setLoading(true);
        apiClient.get('/credits/packages')
            .then(res => setPackages(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (activeTab === 'packages') fetchPackages();
    }, [activeTab]);

    const handleSave = async (data: any) => {
        try {
            if (editingPackage) {
                await apiClient.put(`/admin/credits/packages/${editingPackage.id}`, data);
                toast.success('Pacote atualizado!');
            } else {
                await apiClient.post('/admin/credits/packages', data);
                toast.success('Pacote criado!');
            }
            setSlideoverOpen(false);
            setEditingPackage(null);
            fetchPackages();
        } catch {
            toast.error('Erro ao salvar pacote');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Eliminar este pacote?')) return;
        try {
            await apiClient.delete(`/admin/credits/packages/${id}`);
            toast.success('Pacote eliminado!');
            fetchPackages();
        } catch {
            toast.error('Erro ao eliminar');
        }
    };

    return (
        <div>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />

            {slideoverOpen && (
                <CreditSlideover
                    editingPackage={editingPackage}
                    onClose={() => { setSlideoverOpen(false); setEditingPackage(null); }}
                    onSave={handleSave}
                />
            )}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Créditos</h2>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('packages')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'packages' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Coins size={16} className="inline mr-1" /> Pacotes
                    </button>
                    <button onClick={() => setActiveTab('balances')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'balances' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Wallet size={16} className="inline mr-1" /> Saldos
                    </button>
                </div>
            </div>

            {activeTab === 'packages' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => { setEditingPackage(null); setSlideoverOpen(true); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                            <Plus size={16} /> Novo Pacote
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {packages.map((pkg) => (
                            <div key={pkg.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setEditingPackage(pkg); setSlideoverOpen(true); }}
                                                className="text-slate-400 hover:text-white"><Edit size={14} /></button>
                                        <button onClick={() => handleDelete(pkg.id)}
                                                className="text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Créditos</span>
                                        <span className="text-white font-bold text-lg">{pkg.credit_amount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Preço</span>
                                        <span className="text-green-400 font-medium">{pkg.price_mzn} MZN</span>
                                    </div>
                                    {pkg.bonus_credit > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Bónus</span>
                                            <span className="text-yellow-400 font-medium">+{pkg.bonus_credit}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}