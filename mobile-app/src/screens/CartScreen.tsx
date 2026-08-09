// src/screens/CartScreen.tsx
import React, { useState } from 'react';
import { formatCurrency } from '../utils/format';
import { useCartStore } from '../stores/cartStore';
import { transactionsAPI } from '../api/client';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CheckCircle, Gift, Share2 } from 'lucide-react';

interface CartScreenProps {
    onBack: () => void;
}

export default function CartScreen({ onBack }: CartScreenProps) {
    const { items, removeItem, updateQuantity, clearCart, total } = useCartStore();
    const [checkingOut, setCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderSuccess, setOrderSuccess] = useState<{
        product_name: string;
        code_delivered: string;
        reference: string;
        credit_price: string;
    } | null>(null);

    const handleCheckout = async () => {
        setCheckingOut(true);
        setError(null);

        try {
            const checkoutItems = items.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
            }));

            const res: any = await transactionsAPI.checkout(checkoutItems);

            // Extrai o código do primeiro item
            const firstItem = res?.items?.[0] || res?.data?.items?.[0] || {};
            const codeDelivered = firstItem.code_delivered || res?.reference || '#TX-OK';

            setOrderSuccess({
                product_name: items.length === 1 ? items[0].product.name : `${items.length} produtos`,
                code_delivered: codeDelivered,
                reference: res.reference || res.data?.reference || '#TX-OK',
                credit_price: formatCurrency(total()),
            });

            clearCart();
        } catch (err: any) {
            const msg = err?.detail || err?.message || 'Erro ao finalizar compra. Verifique seu saldo.';
            setError(msg);
        } finally {
            setCheckingOut(false);
        }
    };

    const handleWhatsAppShare = () => {
        if (!orderSuccess) return;
        const message = `🎁 Comprei na KaregaAki!\n\nProduto: ${orderSuccess.product_name}\nCódigo: ${orderSuccess.code_delivered}\nRef: ${orderSuccess.reference}\n\nBaixa a app: https://karegaaki.co.mz`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    // Ecrã de Sucesso
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center w-full max-w-sm">
                    <div className="w-16 h-16 bg-emerald-950 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Compra Realizada! 🎉</h2>
                    <p className="text-slate-400 text-sm mb-6">{orderSuccess.product_name}</p>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 space-y-2 text-left">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Referência</span>
                            <span className="text-white font-mono">{orderSuccess.reference}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Créditos gastos</span>
                            <span className="text-emerald-400 font-bold">{orderSuccess.credit_price} cr</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Código</span>
                            <span className="text-amber-400 font-mono font-bold">{orderSuccess.code_delivered}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleWhatsAppShare}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mb-3 transition"
                    >
                        <Share2 className="w-4 h-4" /> Partilhar no WhatsApp
                    </button>

                    <button
                        onClick={onBack}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition"
                    >
                        Voltar às Compras
                    </button>
                </div>
            </div>
        );
    }

    // Carrinho normal
    return (
        <div className="min-h-screen bg-slate-950 pb-24">
            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-4">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-white">Carrinho</h1>
                    <span className="text-sm text-slate-400">({items.length} itens)</span>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-10">
                        <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">Carrinho vazio</p>
                        <button onClick={onBack} className="mt-3 text-indigo-400 text-sm hover:text-indigo-300">
                            Ver produtos
                        </button>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.product.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex gap-3">
                            {item.product.image_url ? (
                                <img src={item.product.image_url} alt={item.product.name} className="w-13 h-13 rounded-lg object-cover bg-slate-800" />
                            ) : (
                                <div className="w-13 h-13 rounded-lg bg-slate-800 flex items-center justify-center">
                                    <Gift className="w-5 h-5 text-slate-600" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-bold text-white line-clamp-1">{item.product.name}</h3>
                                <p className="text-[10px] text-emerald-400 font-bold mt-0.5">{item.product.credit_price} cr cada</p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-white text-xs font-bold w-5 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white">{(parseFloat(item.product.credit_price) * item.quantity).toFixed(2)} cr</span>
                                        <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-300">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {error && (
                <div className="px-4 mb-4">
                    <p className="text-red-400 text-xs bg-red-950/50 p-3 rounded-lg">{error}</p>
                </div>
            )}

            {items.length > 0 && (
                <div className="fixed bottom-16 left-0 right-0 bg-slate-950 border-t border-slate-800 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-400 text-sm">Total</span>
                        <span className="text-lg font-bold text-white">{formatCurrency(total())} cr</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={checkingOut}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                        {checkingOut ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <ShoppingBag className="w-4 h-4" />
                                Finalizar Compra
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
