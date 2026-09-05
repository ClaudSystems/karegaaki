// src/screens/CartScreen.tsx
import React, { useState } from 'react';
import { useCartStore } from '../stores/cartStore';
import { transactionsAPI, walletAPI } from '../api/client';
import {
    ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CheckCircle,
    AlertCircle, Shield, Zap
} from 'lucide-react';
import { formatCredits } from '../utils/format';
import VoucherCard from '../components/VoucherCard';

interface CartScreenProps {
    onBack: () => void;
    onNavigateToWallet?: () => void;
}

interface OrderSuccess {
    product_name: string;
    code_delivered: string;
    reference: string;
    credit_price: string;
    items?: any[];
}

export default function CartScreen({ onBack, onNavigateToWallet }: CartScreenProps) {
    const { items, removeItem, updateQuantity, clearCart, total } = useCartStore();
    const [checkingOut, setCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderSuccess, setOrderSuccess] = useState<OrderSuccess | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const [insufficientFunds, setInsufficientFunds] = useState(false);

    const totalCredits = total();
    const hasInsufficientFunds = balance < totalCredits;

    const loadBalance = async () => {
        try {
            const res: any = await walletAPI.balance();
            setBalance(parseFloat(res?.balance_credit || res?.balance || 0));
        } catch (err) {
            console.error('Erro ao carregar saldo:', err);
        }
    };

    React.useEffect(() => {
        loadBalance();
    }, []);

    const handleCheckout = async () => {
        setCheckingOut(true);
        setError(null);

        try {
            const checkoutItems = items.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
            }));

            const res: any = await transactionsAPI.checkout(checkoutItems);

            // Extrair itens e códigos
            const itemsResponse = res?.items || res?.data?.items || [];
            const firstItem = itemsResponse[0] || {};

            setOrderSuccess({
                product_name: items.length === 1 ? items[0].product.name : `${items.length} produtos`,
                code_delivered: firstItem.code_delivered || res?.reference || '#TX-OK',
                reference: res.reference || res.data?.reference || '#TX-OK',
                credit_price: totalCredits.toString(),
                items: itemsResponse,
            });

            clearCart();
            loadBalance();
        } catch (err: any) {
            const msg = err?.detail || err?.message || 'Erro ao finalizar compra. Verifique seu saldo.';
            setError(msg);
            setInsufficientFunds(msg.includes('Saldo insuficiente'));
        } finally {
            setCheckingOut(false);
        }
    };

    // Tela de sucesso
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-slate-950 pb-20">
                <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setOrderSuccess(null)} className="text-slate-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-white">Compra Concluída</h1>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Sucesso Header */}
                    <div className="text-center py-6 animate-slide-up">
                        <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-600/30">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white">Pagamento Aprovado!</h2>
                        <p className="text-sm text-slate-400 mt-2">
                            Seu voucher digital está pronto para uso
                        </p>
                    </div>

                    {/* Vouchers */}
                    {orderSuccess.items && orderSuccess.items.length > 0 ? (
                        <div className="space-y-3">
                            {orderSuccess.items.map((item: any, index: number) => (
                                <VoucherCard
                                    key={index}
                                    code={item.code_delivered || `#ITEM-${index + 1}`}
                                    productName={item.product_name || orderSuccess.product_name}
                                    reference={orderSuccess.reference}
                                    totalCredits={item.unit_credit_price?.toString()}
                                />
                            ))}
                        </div>
                    ) : (
                        <VoucherCard
                            code={orderSuccess.code_delivered}
                            productName={orderSuccess.product_name}
                            reference={orderSuccess.reference}
                            totalCredits={orderSuccess.credit_price}
                        />
                    )}

                    {/* Ações */}
                    <div className="space-y-2 pt-4">
                        <button
                            onClick={onBack}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-sm shadow-lg shadow-indigo-600/30"
                        >
                            Voltar à Loja
                        </button>
                        <button
                            onClick={() => setOrderSuccess(null)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition text-sm"
                        >
                            Ver Outras Compras
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Tela normal do carrinho
    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-4">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-white">Carrinho</h1>
                    {items.length > 0 && (
                        <span className="text-xs text-slate-400 ml-auto">
                            {items.length} {items.length === 1 ? 'item' : 'itens'}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4">
                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm mb-4">Seu carrinho está vazio</p>
                        <button
                            onClick={onBack}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition text-sm"
                        >
                            Explorar Produtos
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Saldo */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <span className="text-xs text-slate-400">Saldo Disponível</span>
                            </div>
                            <span className={`font-bold ${hasInsufficientFunds ? 'text-red-400' : 'text-emerald-400'}`}>
                                {formatCredits(balance)} cr
                            </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.product.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex gap-3">
                                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                        {item.product.image_url ? (
                                            <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <ShoppingBag className="w-5 h-5 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white line-clamp-1">{item.product.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            {formatCredits(item.product.credit_price)} cr cada
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-xs font-bold text-white w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => removeItem(item.product.id)}
                                                className="ml-auto p-1 bg-red-950/50 hover:bg-red-900/50 rounded text-red-400"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-emerald-400">
                                            {formatCredits(parseFloat(item.product.credit_price) * item.quantity)} cr
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Total</span>
                                <span className="text-white font-bold">{formatCredits(totalCredits)} cr</span>
                            </div>
                            {hasInsufficientFunds && (
                                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/50 p-2.5 rounded-lg">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>Saldo insuficiente. Faltam {formatCredits(totalCredits - balance)} cr</span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Botões */}
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={handleCheckout}
                                disabled={checkingOut || hasInsufficientFunds || items.length === 0}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:shadow-none"
                            >
                                {checkingOut ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4" />
                                        Finalizar Compra
                                    </>
                                )}
                            </button>

                            {hasInsufficientFunds && onNavigateToWallet && (
                                <button
                                    onClick={onNavigateToWallet}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-sm"
                                >
                                    Recarregar Créditos
                                </button>
                            )}

                            <button
                                onClick={clearCart}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium py-2.5 rounded-xl transition text-xs"
                            >
                                Limpar Carrinho
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}