import { useEffect, useState } from 'react';
import { Package, Coins, Users, TrendingUp } from 'lucide-react';
import apiClient from '../api/client';

export default function Dashboard() {
    const [stats, setStats] = useState<any>({});

    useEffect(() => {
        apiClient.get('/admin/dashboard/stats')
            .then(res => setStats(res.data))
            .catch(() => {});
    }, []);

    const cards = [
        { label: 'Vendas Hoje', value: `${stats.sales_today_credits || 0} créditos`, icon: TrendingUp, color: 'text-blue-400' },
        { label: 'Vendas Mês', value: `${stats.sales_month_credits || 0} créditos`, icon: TrendingUp, color: 'text-green-400' },
        { label: 'Clientes Ativos', value: stats.active_clients || 0, icon: Users, color: 'text-purple-400' },
        { label: 'Stock Disponível', value: stats.available_stock || 0, icon: Package, color: 'text-orange-400' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((card) => (
                    <div key={card.label} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-slate-400">{card.label}</span>
                            <card.icon size={20} className={card.color} />
                        </div>
                        <p className="text-2xl font-bold text-white">{card.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}