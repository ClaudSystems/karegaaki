// src/screens/HomeScreen.tsx

import React, { useState, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';
import { productsAPI } from '../api/client';
import { Product, Category } from '../types';
import { Search, ShoppingCart, ShoppingBag, X, Wallet, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { walletAPI } from '../api/client';
import { formatCredits } from '../utils/format';
import KaregaCard from '../components/KaregaCard';

interface HomeScreenProps {
    onProductClick: (product: Product) => void;
    onCartClick: () => void;
    onWalletClick: () => void;
}

export default function HomeScreen({ onProductClick, onCartClick, onWalletClick }: HomeScreenProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<number>(0);

    const { addItem, count } = useCartStore();

    useEffect(() => {
        loadProducts();
        loadCategories();
        loadBalance();
    }, [selectedCategory]);

    const loadProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (selectedCategory) params.category_id = selectedCategory;

            const res: any = await productsAPI.list(params);
            const data = res.items || res.data || res.products || res || [];
            setProducts(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError('Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res: any = await productsAPI.categories();
            const data = res.items || res.data || res || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erro ao carregar categorias:', err);
        }
    };

    const loadBalance = async () => {
        try {
            const res: any = await walletAPI.balance();
            setBalance(res?.balance_credit || res?.balance || res?.data?.balance || 0);
        } catch (err) {
            console.error('Erro ao carregar saldo:', err);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadProducts();
    };

    const filteredProducts = products.filter((p) => p.is_active);

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* KaregaCard Digital */}
            <div className="px-4 pt-4">
                <KaregaCard balance={balance} onRecharge={onWalletClick} />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-lg font-bold text-white">KaregaAki</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onWalletClick}
                            className="p-2 text-slate-400 hover:text-white transition"
                            title="Carteira"
                        >
                            <Wallet className="w-5 h-5" />
                        </button>
                        <button onClick={onCartClick} className="relative p-2 text-slate-400 hover:text-white transition">
                            <ShoppingCart className="w-5 h-5" />
                            {count() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {count()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar produtos..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-10 text-white text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    {search && (
                        <button type="button" onClick={() => { setSearch(''); loadProducts(); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="w-4 h-4 text-slate-500" />
                        </button>
                    )}
                </form>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto px-4 py-3">
                <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                        !selectedCategory ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                    Todos
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                            selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-10">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm mt-3">Carregando...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-center py-10">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button onClick={loadProducts} className="mt-3 text-indigo-400 text-sm hover:text-indigo-300">
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && filteredProducts.length === 0 && (
                <div className="text-center py-10">
                    <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Nenhum produto encontrado</p>
                </div>
            )}

            {/* Products - Grid de 2 Colunas */}
            <div className="grid grid-cols-2 gap-3 px-4">
                {filteredProducts.map((product) => {
                    const isOutOfStock = product.stock_available <= 0;
                    const isPopular = product.stock_available > 5;
                    const isLowStock = product.stock_available <= 3 && product.stock_available > 0;

                    return (
                        <div
                            key={product.id}
                            onClick={() => onProductClick(product)}
                            className={`relative bg-slate-900 border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group ${
                                isOutOfStock
                                    ? 'border-red-900/40 opacity-80'
                                    : 'border-slate-800 hover:border-slate-600'
                            }`}
                        >
                            {/* Badges */}
                            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                                {isPopular && !isOutOfStock && (
                                    <span className="px-2 py-0.5 bg-amber-500 text-black text-[8px] font-black uppercase rounded-full flex items-center gap-1">
                                        <TrendingUp className="w-2.5 h-2.5" />
                                        Popular
                                    </span>
                                )}
                                {isLowStock && !isOutOfStock && (
                                    <span className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black uppercase rounded-full flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        Últimas unidades
                                    </span>
                                )}
                                {isOutOfStock && (
                                    <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase rounded-full flex items-center gap-1">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        Esgotado
                                    </span>
                                )}
                            </div>

                            {/* Image */}
                            <div className="relative aspect-square bg-slate-800 overflow-hidden max-h-28">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                        <ShoppingBag className="w-8 h-8 text-slate-600 group-hover:text-slate-500 transition" />
                                    </div>
                                )}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-[10px] font-black text-red-400 uppercase">Indisponível</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[8px] font-bold text-indigo-400 uppercase truncate">
                                        {product.category_name || 'Geral'}
                                    </span>
                                    {!isOutOfStock && (
                                        <span className="text-[8px] text-slate-500 shrink-0 ml-1">
                                            {product.stock_available} un.
                                        </span>
                                    )}
                                </div>

                                <h4 className="text-[10px] font-bold text-white line-clamp-2 mb-1 min-h-[1.5rem]">
                                    {product.name}
                                </h4>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-emerald-400">
                                        {formatCredits(product.credit_price)} cr
                                    </span>
                                    {!isOutOfStock && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addItem(product);
                                            }}
                                            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-lg shadow-indigo-600/30 active:scale-90"
                                            title="Adicionar ao carrinho"
                                        >
                                            <ShoppingCart className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}