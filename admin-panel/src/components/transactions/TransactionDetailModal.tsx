import { X, Printer } from 'lucide-react';

interface Props {
    isOpen: boolean;
    transaction: any;
    onClose: () => void;
}

export default function TransactionDetailModal({ isOpen, transaction, onClose }: Props) {
    if (!isOpen || !transaction) return null;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo - ${transaction.reference}</title>
        <style>
          body { font-family: 'Courier New', monospace; max-width: 400px; margin: 40px auto; padding: 20px; color: #1e293b; }
          h1 { text-align: center; font-size: 18px; margin-bottom: 5px; }
          .subtitle { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 20px; }
          .line { border-top: 1px dashed #cbd5e1; margin: 10px 0; }
          table { width: 100%; font-size: 12px; }
          td { padding: 4px 0; }
          .label { color: #64748b; }
          .value { text-align: right; font-weight: bold; }
          .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; }
          .code { background: #f1f5f9; padding: 10px; text-align: center; font-size: 16px; letter-spacing: 2px; margin: 15px 0; border-radius: 6px; }
        </style>
      </head>
      <body>
        <h1>KaregaAki</h1>
        <p class="subtitle">Recibo de Transação</p>
        <div class="line"></div>
        <table>
          <tr><td class="label">Referência</td><td class="value">${transaction.reference}</td></tr>
          <tr><td class="label">Data</td><td class="value">${new Date(transaction.created_at).toLocaleString('pt-MZ')}</td></tr>
          <tr><td class="label">Método</td><td class="value">${transaction.payment_method}</td></tr>
          <tr><td class="label">Total</td><td class="value">${transaction.total_credit} créditos</td></tr>
          <tr><td class="label">Pagamento</td><td class="value">${transaction.payment_status}</td></tr>
          <tr><td class="label">Entrega</td><td class="value">${transaction.delivery_status}</td></tr>
        </table>
        ${transaction.items?.map((item: any) => `
          <div class="line"></div>
          <table>
            <tr><td class="label">Produto</td><td class="value">${item.product_name || 'Produto'}</td></tr>
            <tr><td class="label">Quantidade</td><td class="value">${item.quantity}</td></tr>
            ${item.code_delivered ? `<tr><td colspan="2"><div class="code">${item.code_delivered}</div></td></tr>` : ''}
          </table>
        `).join('')}
        <div class="line"></div>
        <p class="footer">Obrigado por usar KaregaAki!<br>${new Date().toLocaleDateString('pt-MZ')}</p>
      </body>
      </html>
    `;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-xl border border-slate-700 z-50 w-[500px] shadow-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-700 sticky top-0 bg-slate-800">
                    <h3 className="text-lg font-bold text-white">Detalhes da Transação</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="text-slate-400 hover:text-white p-1">
                            <Printer size={18} />
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Referência</span>
                            <span className="text-white font-mono">{transaction.reference}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Data</span>
                            <span className="text-white">{new Date(transaction.created_at).toLocaleString('pt-MZ')}</span>
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
                            <span className="text-slate-400">Pagamento</span>
                            <span className="text-yellow-400">{transaction.payment_status}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Entrega</span>
                            <span className="text-blue-400">{transaction.delivery_status}</span>
                        </div>
                    </div>

                    {transaction.items?.map((item: any, i: number) => (
                        <div key={i} className="bg-slate-900 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-slate-400 mb-2">Item #{i + 1}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Produto</span>
                                    <span className="text-white">{item.product_name || 'Produto'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Quantidade</span>
                                    <span className="text-white">{item.quantity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Preço Unitário</span>
                                    <span className="text-white">{item.unit_credit_price} créditos</span>
                                </div>
                                {item.code_delivered && (
                                    <div className="mt-2 p-2 bg-slate-800 rounded text-center">
                                        <span className="text-xs text-slate-400 block mb-1">CÓDIGO</span>
                                        <span className="text-green-400 font-mono font-bold text-lg">{item.code_delivered}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {transaction.payment_status === 'cancelled' && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                            <span className="text-red-400 font-medium">🚫 Transação Cancelada</span>
                            <p className="text-slate-400 text-xs mt-1">
                                Cancelada em {new Date(transaction.cancelled_at || transaction.updated_at).toLocaleString('pt-MZ')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}