import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
    editingPackage: any;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export default function CreditSlideover({ editingPackage, onClose, onSave }: Props) {
    const [name, setName] = useState('');
    const [creditAmount, setCreditAmount] = useState(0);
    const [priceMzn, setPriceMzn] = useState(0);
    const [bonusCredit, setBonusCredit] = useState(0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (editingPackage) {
            setName(editingPackage.name);
            setCreditAmount(editingPackage.credit_amount);
            setPriceMzn(editingPackage.price_mzn);
            setBonusCredit(editingPackage.bonus_credit);
        } else {
            setName('');
            setCreditAmount(0);
            setPriceMzn(0);
            setBonusCredit(0);
        }
    }, [editingPackage]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ name, credit_amount: creditAmount, price_mzn: priceMzn, bonus_credit: bonusCredit, is_active: true });
        setSaving(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-96 bg-slate-800 border-l border-slate-700 z-50 shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">{editingPackage ? 'Editar Pacote' : 'Novo Pacote'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="text-sm text-slate-400 block mb-1">Nome</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                               className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 block mb-1">Créditos</label>
                        <input type="number" value={creditAmount} onChange={e => setCreditAmount(Number(e.target.value))}
                               className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 block mb-1">Preço (MZN)</label>
                        <input type="number" value={priceMzn} onChange={e => setPriceMzn(Number(e.target.value))}
                               className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 block mb-1">Bónus</label>
                        <input type="number" value={bonusCredit} onChange={e => setBonusCredit(Number(e.target.value))}
                               className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
                        {saving ? 'Salvando...' : editingPackage ? 'Atualizar' : 'Criar Pacote'}
                    </button>
                </form>
            </div>
        </>
    );
}