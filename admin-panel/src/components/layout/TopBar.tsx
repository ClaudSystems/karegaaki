import { useProductStore } from '../../stores/productStore';
import { useLocation } from 'react-router-dom';

export default function TopBar() {
    const location = useLocation();
    const search = useProductStore((s) => s.search);
    const setSearch = useProductStore((s) => s.setSearch);
    const isProductsPage = location.pathname === '/products';

    return (
        <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
            <div>
                {isProductsPage && (
                    <input
                        type="text"
                        placeholder="Pesquisar produtos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm w-64 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                )}
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">Admin</span>
                <button className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors">
                    Sair
                </button>
            </div>
        </header>
    );
}