import { useEffect, useState } from 'react';
import {  Plus, Trash2, X, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { stockApi } from '../api/stock';
import type { StockItem } from '../api/stock';
import { productApi } from '../api/products';
import type { Product } from '../types/product.types';
import { Toaster, toast } from 'react-hot-toast';

export default function StockPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [codesText, setCodesText] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [adding, setAdding] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        loadStock();
    }, [selectedProduct, filterStatus]);

    const loadProducts = async () => {
        try {
            const data = await productApi.getAll(1, 100);
            setProducts(data.items || []);
        } catch {
            console.error('Erro ao carregar produtos');
        }
    };

    const loadStock = async () => {
        setLoading(true);
        try {
            const data = await stockApi.getItems(
                selectedProduct || undefined,
                filterStatus || undefined,
                1,
                100
            );
            setStockItems(data.items || []);
            setTotal(data.total || 0);
        } catch {
            console.error('Erro ao carregar stock');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAdd = async () => {
        if (!selectedProduct) {
            toast.error('Selecione um produto primeiro');
            return;
        }

        const codes = codesText
            .split('\n')
            .map(c => c.trim())
            .filter(c => c.length > 0);

        if (codes.length === 0) {
            toast.error('Insira pelo menos um código');
            return;
        }

        setAdding(true);
        try {
            const result = await stockApi.bulkAdd(
                selectedProduct,
                codes,
                expiryDate || undefined
            );
            toast.success(result.message || `${result.count} códigos adicionados`);
            setCodesText('');
            setExpiryDate('');
            setShowAddModal(false);
            loadStock();
        } catch {
            toast.error('Erro ao adicionar códigos');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteClick = (item: StockItem) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setDeleting(true);
        try {
            await stockApi.deleteItem(itemToDelete.id);
            toast.success('Código eliminado');
            setShowDeleteModal(false);
            setItemToDelete(null);
            loadStock();
        } catch {
            toast.error('Erro ao eliminar código');
        } finally {
            setDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" />
                        Disponível
                    </span>
                );
            case 'sold':
                return (
                    <span className="flex items-center gap-1 text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" />
                        Vendido
                    </span>
                );
            case 'reserved':
                return (
                    <span className="flex items-center gap-1 text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Loader className="w-3 h-3" />
                        Reservado
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Gestão de Stock</h2>
                    <p className="text-slate-400 text-sm mt-1">{total} códigos encontrados</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                    <Plus size={16} />
                    Adicionar Códigos
                </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-3 mb-4">
                <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                    <option value="">Todos os produtos</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                    <option value="">Todos os status</option>
                    <option value="available">Disponível</option>
                    <option value="sold">Vendido</option>
                    <option value="reserved">Reservado</option>
                </select>
            </div>

            {/* Tabela */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-slate-700">
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Código</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Expiração</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Criado em</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {stockItems.map(item => (
                        <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="p-4">
                                <span className="text-white text-sm font-mono">{item.code}</span>
                            </td>
                            <td className="p-4">{getStatusBadge(item.status)}</td>
                            <td className="p-4 text-slate-400 text-sm">
                                {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('pt-PT') : '-'}
                            </td>
                            <td className="p-4 text-slate-400 text-sm">
                                {new Date(item.created_at).toLocaleDateString('pt-PT')}
                            </td>
                            <td className="p-4">
                                {item.status === 'available' && (
                                    <button
                                        onClick={() => handleDeleteClick(item)}
                                        className="p-2 bg-red-950/50 hover:bg-red-900/50 rounded-lg text-red-400 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {stockItems.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-500">
                        Nenhum código encontrado.
                    </div>
                )}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                )}
            </div>

            {/* Modal Adicionar Códigos */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Adicionar Códigos</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Produto</label>
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                >
                                    <option value="">Selecione...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-slate-400 block mb-1">
                                    Códigos (um por linha)
                                </label>
                                <textarea
                                    value={codesText}
                                    onChange={(e) => setCodesText(e.target.value)}
                                    rows={6}
                                    placeholder={"CODIGO-1\nCODIGO-2\nCODIGO-3"}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {codesText.split('\n').filter(c => c.trim()).length} código(s) inserido(s)
                                </p>
                            </div>

                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Data de Expiração (opcional)</label>
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-lg transition text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleBulkAdd}
                                    disabled={adding || !selectedProduct}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2"
                                >
                                    {adding ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Adicionando...
                                        </>
                                    ) : (
                                        'Adicionar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Delete */}
            {showDeleteModal && itemToDelete && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-950 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Eliminar Código</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            Tem certeza que deseja eliminar:
                        </p>
                        <p className="text-white font-mono text-sm bg-slate-900 rounded-lg p-3 mb-4">
                            {itemToDelete.code}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-lg transition text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg transition text-sm"
                            >
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}