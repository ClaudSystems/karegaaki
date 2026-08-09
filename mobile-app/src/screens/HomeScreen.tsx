// src/screens/HomeScreen.tsx

import React, { useState, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';
import { productsAPI } from '../api/client';
import { Product, Category } from '../types';
import { Search, ShoppingCart, ShoppingBag, X,Wallet } from 'lucide-react';
import { walletAPI } from '../api/client';
import { formatCredits, formatCurrency } from '../utils/format';


interface HomeScreenProps {
    onProductClick: (product: Product) => void;
    onCartClick: () => void;
    onWalletClick: () => void;
}

export default function HomeScreen({ onProductClick, onCartClick , onWalletClick}: HomeScreenProps) {
    // Função para formatar número
    const formatNumber = (value: number): string => {
        return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { addItem, count } = useCartStore();


    useEffect(() => {
        loadProducts();
        loadCategories();
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadProducts();
    };

    const filteredProducts = products.filter((p) => p.is_active);
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        loadBalance();
    }, []);

    // Adiciona state para forçar refresh
    const [refreshKey, setRefreshKey] = useState(0);

// Função loadBalance
    const loadBalance = async () => {
        try {
            const res: any = await walletAPI.balance();
            setBalance(res?.balance_credit || res?.balance || res?.data?.balance || 0);
        } catch (err) {
            console.error('Erro ao carregar saldo:', err);
        }
    };

// useEffect que roda sempre que o componente monta
    useEffect(() => {
        loadBalance();
    }, [refreshKey]);



    return (

        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Saldo + Status Bar (como no demo) */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-400">Saldo Disponível</span>
                </div>
                <span className="text-emerald-400 font-bold">{formatNumber(balance)} Créditos</span>
            </div>            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-4">
                {/* Header - dentro da div flex items-center justify-between */}
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-lg font-bold text-white">KaregaAki</h1>

                    <div className="flex items-center gap-2">

                        {/* Botão Wallet */}
                        <button
                            onClick={onWalletClick}
                            className="p-2 text-slate-400 hover:text-white transition"
                            title="Carteira"
                        >
                            <Wallet className="w-5 h-5" />
                        </button>
                        {/* Botão Carrinho */}
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

            {/* Products - Estilo do Demo */}
            <div className="space-y-2.5 px-4">
                {filteredProducts.map((product) => {
                    const isOutOfStock = product.stock_available <= 0;
                    return (
                        <div
                            key={product.id}
                            onClick={() => onProductClick(product)}
                            className={`bg-slate-900 border rounded-xl p-3 flex gap-3 cursor-pointer transition ${
                                isOutOfStock
                                    ? 'border-red-900/40 opacity-90 hover:border-red-700/60'
                                    : 'border-slate-800/90 hover:border-slate-700'
                            }`}
                        >
                            <div className="relative shrink-0">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-13 h-13 rounded-lg object-cover bg-slate-800" />
                                ) : (
                                    <div className="w-13 h-13 rounded-lg bg-slate-800 flex items-center justify-center">
                                        <ShoppingBag className="w-5 h-5 text-slate-600" />
                                    </div>
                                )}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter bg-red-950/90 px-1 py-0.5 rounded border border-red-800">
                      Esgotado
                    </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                    <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase truncate">
                      {product.category_name || 'Geral'}
                    </span>
                                        {isOutOfStock ? (
                                            <span className="text-[9px] font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800 shrink-0">
                        0 em Stock
                      </span>
                                        ) : (
                                            <span className="text-[10px] text-slate-500 shrink-0">Stock: {product.stock_available}</span>
                                        )}
                                    </div>
                                    <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5">{product.name}</h4>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-xs font-bold text-emerald-400">{formatCredits(product.credit_price)} cr</span>
                                    <div className="flex items-center gap-1.5">
                                        {!isOutOfStock && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addItem(product); }}
                                                className="px-2 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                                            >
                                                <ShoppingCart className="w-3 h-3 text-indigo-400" /> + Carrinho
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onProductClick(product); }}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                                                isOutOfStock ? 'bg-red-950/90 hover:bg-red-900 text-red-300 border border-red-800/80' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                            }`}
                                        >
                                            {isOutOfStock ? 'Esgotado' : 'Ver'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
