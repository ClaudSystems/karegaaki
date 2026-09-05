import { useEffect, useState } from 'react';
import {
    Package, Users, TrendingUp, CreditCard, AlertCircle,
    CheckCircle, RefreshCw, ShoppingBag
} from 'lucide-react';
import apiClient from '../api/client';

export default function Dashboard() {
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = () => {
        setLoading(true);
        setError(null);
        apiClient.get('/admin/dashboard/stats')
            .then(res => {
                setStats(res.data || {});
            })
            .catch(() => {
                setError('Erro ao carregar estatísticas');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const cards = [
        {
            label: 'Vendas Hoje',
            value: `${stats.sales_today_credits || 0} créditos`,
            icon: TrendingUp,
            color: 'text-blue-400',
            bg: 'bg-blue-950/50',
            border: 'border-blue-900/50'
        },
        {
            label: 'Vendas Mês',
            value: `${stats.sales_month_credits || 0} créditos`,
            icon: CreditCard,
            color: 'text-green-400',
            bg: 'bg-green-950/50',
            border: 'border-green-900/50'
        },
        {
            label: 'Clientes Ativos',
            value: stats.active_clients || 0,
            icon: Users,
            color: 'text-purple-400',
            bg: 'bg-purple-950/50',
            border: 'border-purple-900/50'
        },
        {
            label: 'Stock Disponível',
            value: stats.available_stock || 0,
            icon: Package,
            color: 'text-orange-400',
            bg: 'bg-orange-950/50',
            border: 'border-orange-900/50'
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                <button
                    onClick={loadStats}
                    className="p-2 text-slate-400 hover:text-white transition"
                    title="Atualizar"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/50 border border-red-900/50 p-3 rounded-xl mb-4">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className={`${card.bg} rounded-xl p-5 border ${card.border} hover:scale-[1.02] transition-transform`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-slate-400">{card.label}</span>
                            <card.icon size={18} className={card.color} />
                        </div>
                        <p className="text-2xl font-black text-white">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transações Recentes */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-indigo-400" />
                        Atividade Recente
                    </h3>
                    {stats.recent_transactions && stats.recent_transactions.length > 0 ? (
                        <div className="space-y-2">
                            {stats.recent_transactions.map((tx: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                                    <div>
                                        <p className="text-xs font-bold text-white">{tx.reference || `#TX-${idx}`}</p>
                                        <p className="text-[10px] text-slate-500">{tx.created_at || ''}</p>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-400">
                                        {tx.total_credit || 0} cr
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500 text-center py-4">Sem atividade recente</p>
                    )}
                </div>

                {/* Status do Sistema */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Status do Sistema
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                            <span className="text-xs text-slate-400">Disputas Pendentes</span>
                            <span className={`text-xs font-bold ${stats.pending_disputes ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {stats.pending_disputes || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                            <span className="text-xs text-slate-400">KYC Pendente</span>
                            <span className={`text-xs font-bold ${stats.pending_kyc ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {stats.pending_kyc || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                            <span className="text-xs text-slate-400">Produtos Ativos</span>
                            <span className="text-xs font-bold text-emerald-400">
                                {stats.active_products || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                            <span className="text-xs text-slate-400">Stock Baixo</span>
                            <span className={`text-xs font-bold ${stats.low_stock_count ? 'text-red-400' : 'text-emerald-400'}`}>
                                {stats.low_stock_count || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}