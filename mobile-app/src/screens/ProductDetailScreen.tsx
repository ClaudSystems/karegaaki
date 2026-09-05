// src/screens/ProductDetailScreen.tsx
import React, { useState } from 'react';
import { Product } from '../types';
import { formatCredits } from '../utils/format';
import { useCartStore } from '../stores/cartStore';
import {
    ArrowLeft, ShoppingCart, ChevronLeft, AlertTriangle,
    CheckCircle2, CheckCircle, Ban, AlertCircle, Zap, Shield, Clock,
    TrendingUp, Star, Share2
} from 'lucide-react';

interface ProductDetailScreenProps {
    product: Product;
    onBack: () => void;
    onCartClick: () => void;
}

export default function ProductDetailScreen({ product, onBack, onCartClick }: ProductDetailScreenProps) {
    const { addItem, count } = useCartStore();
    const [added, setAdded] = useState(false);
    const isOutOfStock = product.stock_available <= 0;
    const isLowStock = product.stock_available <= 3 && product.stock_available > 0;
    const isPopular = product.stock_available > 5;

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const handleBuyNow = () => {
        if (isOutOfStock) return;
        addItem(product);
        onCartClick();
    };

    const handleShare = () => {
        const message = `🛍️ *${product.name}*\n\n` +
            `💰 Preço: ${formatCredits(product.credit_price)} créditos\n` +
            `📦 Stock: ${product.stock_available} unidades\n\n` +
            `Compre agora no KaregaAki! 🇲🇿`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-4">
                <div className="flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold text-xs">
                        <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>
                    <button onClick={onCartClick} className="relative p-1 text-slate-400 hover:text-white">
                        <ShoppingCart className="w-5 h-5" />
                        {count() > 0 && (
                            <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {count()}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Card do Produto */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    {/* Imagem */}
                    <div className="relative aspect-video bg-slate-800">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                <ShoppingCart className="w-16 h-16 text-slate-600" />
                            </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            {isPopular && !isOutOfStock && (
                                <span className="px-2.5 py-1 bg-amber-500 text-black text-[10px] font-black uppercase rounded-full flex items-center gap-1 shadow-lg">
                                    <TrendingUp className="w-3 h-3" />
                                    Popular
                                </span>
                            )}
                            {isLowStock && !isOutOfStock && (
                                <span className="px-2.5 py-1 bg-orange-500 text-white text-[10px] font-black uppercase rounded-full flex items-center gap-1 shadow-lg">
                                    <Clock className="w-3 h-3" />
                                    Últimas unidades
                                </span>
                            )}
                        </div>

                        {/* Status */}
                        <div className="absolute top-3 right-3">
                            {isOutOfStock ? (
                                <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold uppercase rounded-full flex items-center gap-1 shadow-lg">
                                    <Ban className="w-3 h-3" />
                                    Esgotado
                                </span>
                            ) : (
                                <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-full flex items-center gap-1 shadow-lg">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {product.stock_available} em stock
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3">
                        {/* Categoria e Rating */}
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-950/50 px-2 py-1 rounded-full">
                                {product.category_name || 'Geral'}
                            </span>
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-bold text-white">4.8</span>
                                <span className="text-[10px] text-slate-500">(120+)</span>
                            </div>
                        </div>

                        {/* Nome */}
                        <h1 className="text-xl font-black text-white leading-tight">
                            {product.name}
                        </h1>

                        {/* Descrição */}
                        {product.description && (
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                                {product.description}
                            </p>
                        )}

                        {/* Preço */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] text-slate-400 block">Preço em Créditos</span>
                                <span className="text-2xl font-black text-emerald-400">
                                    {formatCredits(product.credit_price)} cr
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-400 block">Equivalente</span>
                                <span className="text-sm font-bold text-slate-300">
                                    ≈ {formatCredits(parseFloat(product.credit_price) * 10)} MZN
                                </span>
                            </div>
                        </div>

                        {/* Info Adicional */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-slate-950/60 rounded-lg p-2">
                                <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                                <p className="text-[9px] text-slate-400">Entrega</p>
                                <p className="text-[10px] font-bold text-white">Instantânea</p>
                            </div>
                            <div className="bg-slate-950/60 rounded-lg p-2">
                                <Shield className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                                <p className="text-[9px] text-slate-400">Garantia</p>
                                <p className="text-[10px] font-bold text-white">100%</p>
                            </div>
                            <div className="bg-slate-950/60 rounded-lg p-2">
                                <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                                <p className="text-[9px] text-slate-400">Suporte</p>
                                <p className="text-[10px] font-bold text-white">24/7</p>
                            </div>
                        </div>

                        {/* Alertas */}
                        {isOutOfStock ? (
                            <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl flex items-start gap-2 text-red-200 text-xs leading-relaxed">
                                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block font-bold text-red-300">Produto Indisponível</strong>
                                    O stock deste produto esgotou. Volte mais tarde.
                                </div>
                            </div>
                        ) : isLowStock ? (
                            <div className="p-3 bg-orange-950/80 border border-orange-800/80 rounded-xl flex items-start gap-2 text-orange-200 text-xs leading-relaxed">
                                <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block font-bold text-orange-300">Stock Limitado!</strong>
                                    Apenas {product.stock_available} unidades disponíveis.
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Stock disponível para entrega digital imediata!</span>
                            </div>
                        )}

                        {/* Botões */}
                        <div className="space-y-2 pt-2">
                            <button
                                disabled={isOutOfStock}
                                onClick={handleBuyNow}
                                className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm shadow-lg ${
                                    isOutOfStock
                                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                                }`}
                            >
                                <Zap className="w-4 h-4" />
                                {isOutOfStock ? 'Indisponível' : 'Comprar Agora'}
                            </button>

                            {!isOutOfStock && (
                                <button
                                    onClick={handleAddToCart}
                                    className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm ${
                                        added
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                    }`}
                                >
                                    {added ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Adicionado!
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-4 h-4" />
                                            Adicionar ao Carrinho
                                        </>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={handleShare}
                                className="w-full py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                Partilhar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}