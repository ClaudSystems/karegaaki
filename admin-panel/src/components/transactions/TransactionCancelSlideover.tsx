import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    transaction: any;
    onClose: () => void;
    onConfirm: (refundCredits: boolean, releaseStock: boolean) => Promise<void>;
}

export default function TransactionCancelSlideover({ isOpen, transaction, onClose, onConfirm }: Props) {
    const [refundCredits, setRefundCredits] = useState(true);
    const [releaseStock, setReleaseStock] = useState(true);
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);

    if (!isOpen || !transaction) return null;

    const wasPaidWithCredits = transaction.payment_method === 'credit' && transaction.payment_status === 'confirmed';
    const wasDelivered = transaction.delivery_status === 'delivered';

    const handleSubmit = async () => {
        setSaving(true);
        await onConfirm(refundCredits, releaseStock);
        setSaving(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-[450px] bg-slate-800 border-l border-slate-700 z-50 shadow-2xl flex flex-col">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-5 border-b border-slate-700 shrink-0">
                    <h3 className="text-lg font-bold text-white">Cancelar Transação</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>

                {/* Corpo com scroll */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Info da Transação */}
                    <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Transação</h4>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Referência</span>
                            <span className="text-white font-mono">{transaction.reference}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Método</span>
                            <span className="text-white capitalize">{transaction.payment_method}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total</span>
                            <span className="text-white font-bold text-lg">{transaction.total_credit} créditos</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Status Atual</span>
                            <span className="text-yellow-400 capitalize">{transaction.payment_status}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Data</span>
                            <span className="text-white text-xs">{new Date(transaction.created_at).toLocaleString('pt-MZ')}</span>
                        </div>
                    </div>

                    {/* Itens */}
                    {transaction.items?.length > 0 && (
                        <div className="bg-slate-900 rounded-lg p-4">
                            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Itens</h4>
                            {transaction.items.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm py-1">
                                    <span className="text-slate-400">{item.product_name || 'Produto'}</span>
                                    <span className="text-white">x{item.quantity}</span>
                                </div>
                            ))}
                            {transaction.items[0]?.code_delivered && (
                                <div className="mt-2 p-2 bg-slate-800 rounded text-center">
                                    <span className="text-xs text-slate-500 block">CÓDIGO</span>
                                    <span className="text-green-400 font-mono text-sm">{transaction.items[0].code_delivered}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Opções */}
                    <div className="bg-slate-900 rounded-lg p-4 space-y-4">
                        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Opções</h4>

                        {wasPaidWithCredits && (
                            <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                                <div>
                                    <span className="text-white text-sm font-medium">💰 Devolver créditos</span>
                                    <p className="text-slate-400 text-xs mt-0.5">{transaction.total_credit} créditos → cliente</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setRefundCredits(!refundCredits)}
                                    className={`w-10 h-5 rounded-full transition-colors shrink-0 ${refundCredits ? 'bg-green-600' : 'bg-slate-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${refundCredits ? 'ml-5' : 'ml-0.5'}`} />
                                </button>
                            </label>
                        )}

                        {wasDelivered && (
                            <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                                <div>
                                    <span className="text-white text-sm font-medium">📦 Libertar stock</span>
                                    <p className="text-slate-400 text-xs mt-0.5">Código volta ao inventário</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setReleaseStock(!releaseStock)}
                                    className={`w-10 h-5 rounded-full transition-colors shrink-0 ${releaseStock ? 'bg-green-600' : 'bg-slate-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${releaseStock ? 'ml-5' : 'ml-0.5'}`} />
                                </button>
                            </label>
                        )}

                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Motivo (opcional)</label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                rows={3}
                                placeholder="Ex: Cliente desistiu, erro no pagamento..."
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                    </div>

                    {/* Resumo */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <h4 className="text-red-400 font-medium text-sm mb-2">⚠️ Resumo</h4>
                        <ul className="text-sm space-y-1 text-slate-300">
                            <li>• Status final: <span className="text-red-400 font-medium">Cancelado</span></li>
                            {refundCredits && wasPaidWithCredits && (
                                <li>• 💰 <span className="text-green-400 font-medium">{transaction.total_credit} créditos</span> devolvidos</li>
                            )}
                            {!refundCredits && wasPaidWithCredits && (
                                <li>• ⚠️ Créditos <span className="text-red-400 font-medium">NÃO</span> devolvidos</li>
                            )}
                            {releaseStock && wasDelivered && (
                                <li>• 📦 Stock libertado</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Rodapé fixo */}
                <div className="flex gap-3 p-5 border-t border-slate-700 shrink-0">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                        Voltar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Cancelando...' : 'Confirmar Cancelamento'}
                    </button>
                </div>
            </div>
        </>
    );
}