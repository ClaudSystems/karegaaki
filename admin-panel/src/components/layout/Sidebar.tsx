import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Package, Coins, ArrowLeftRight, AlertTriangle,
    Truck, Settings, Radio, Shield, UserCheck,
} from 'lucide-react';

const menuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Produtos' },
    { to: '/stock', icon: Package, label: 'Stock' },
    { to: '/credits', icon: Coins, label: 'Créditos' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transações' },
    { to: '/customers', icon: UserCheck, label: 'Clientes' },
    { to: '/suppliers', icon: Truck, label: 'Fornecedores' },
    { to: '/gateway', icon: Radio, label: 'Gateway SMS' },
    { to: '/users', icon: Shield, label: 'Administração' },
    { to: '/settings', icon: Settings, label: 'Configurações' },
    { to: '/disputes', icon: AlertTriangle, label: 'Disputas' },
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
            <div className="p-5 border-b border-slate-800">
                <h1 className="text-xl font-bold text-white">KaregaAki</h1>
                <p className="text-sm text-slate-400">Painel Admin</p>
            </div>
            <nav className="flex-1 p-3 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={18} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}