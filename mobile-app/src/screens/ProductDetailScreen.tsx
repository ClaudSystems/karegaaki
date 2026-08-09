// src/screens/ProductDetailScreen.tsx
import React from 'react';
import { Product } from '../types';
import { useCartStore } from '../stores/cartStore';
import { ArrowLeft, ShoppingCart, ChevronLeft, AlertTriangle, CheckCircle2, Ban, AlertCircle, CheckCircle } from 'lucide-react';

interface ProductDetailScreenProps {
    product: Product;
    onBack: () => void;
    onCartClick: () => void;
}

export default function ProductDetailScreen({ product, onBack, onCartClick }: ProductDetailScreenProps) {
    const { addItem, count } = useCartStore();
    const isOutOfStock = product.stock_available <= 0;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-4">
                <div className="flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold text-[11px]">
                        <ChevronLeft className="w-4 h-4" /> Voltar ao Catálogo
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
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    {/* Imagem */}
                    <div className="relative">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-36 rounded-xl object-cover bg-slate-800" />
                        ) : (
                            <div className="w-full h-36 rounded-xl bg-slate-800 flex items-center justify-center">
                                <ShoppingCart className="w-10 h-10 text-slate-600" />
                            </div>
                        )}
                        {isOutOfStock ? (
                            <span className="absolute top-2 right-2 px-2.5 py-1 bg-red-950/95 text-red-300 border border-red-500/80 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Esgotado
              </span>
                        ) : (
                            <span className="absolute top-2 right-2 px-2.5 py-1 bg-emerald-950/95 text-emerald-300 border border-emerald-500/80 rounded-lg text-[10px] font-bold shadow-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {product.stock_available} em stock
              </span>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                {product.category_name || 'Geral'}
              </span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {product.id.substring(0, 8)}...</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-0.5">{product.name}</h3>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                            {product.description}
                        </p>
                    </div>

                    {/* Preço */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Preço em Créditos</span>
                        <span className="text-base font-bold text-emerald-400">{product.credit_price} cr</span>
                    </div>

                    {/* Banner Stock */}
                    {isOutOfStock ? (
                        <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl flex items-start gap-2 text-red-200 text-[11px] leading-relaxed">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <strong className="block font-bold text-red-300 text-xs">Produto Indisponível (Esgotado)</strong>
                                O stock disponível para este produto é zero (0 unidades).
                            </div>
                        </div>
                    ) : (
                        <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-emerald-300 text-[11px]">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Stock disponível para entrega digital imediata!</span>
                        </div>
                    )}

                    {/* Botão Comprar */}
                    <button
                        disabled={isOutOfStock}
                        onClick={() => {
                            if (!isOutOfStock) {
                                addItem(product);
                                onCartClick();
                            }
                        }}
                        className={`w-full py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 text-xs ${
                            isOutOfStock
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-90'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-600/30'
                        }`}
                    >
                        {isOutOfStock ? (
                            <>
                                <Ban className="w-4 h-4 text-red-400" /> Indisponível (Esgotado)
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4" /> Comprar com Créditos
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}