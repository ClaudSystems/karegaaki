import { useEffect, useState } from 'react';
import { useProductStore } from '../stores/productStore';
import { Package, Edit, Trash2, AlertTriangle, X } from 'lucide-react';
import { getStatusColor } from '../utils/formatters';
import ProductSlideover from '../components/products/ProductSlideover';
import { Toaster, toast } from 'react-hot-toast';
import type { Product } from '../types/product.types';


export default function ProductsPage() {
    const { products, total, loading, fetchProducts, openSlideover, deleteProduct } = useProductStore();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleEdit = (product: Product) => {
        openSlideover(product);
    };

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        setDeleting(true);
        try {
            await deleteProduct(productToDelete.id);
            toast.success('Produto eliminado!');
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch {
            toast.error('Erro ao eliminar produto');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />
            <ProductSlideover />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Produtos</h2>
                    <p className="text-slate-400 text-sm mt-1">{total} produtos encontrados</p>
                </div>
                <button
                    onClick={() => openSlideover()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                    <Package size={16} />
                    Novo Produto
                </button>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-slate-700">
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Nome</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Categoria</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Preço (Créditos)</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Stock</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-400">Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                        <Package size={18} className="text-slate-400" />
                                    </div>
                                    <span className="text-white text-sm font-medium">{product.name}</span>
                                </div>
                            </td>
                            <td className="p-4 text-slate-400 text-sm">{product.category_name || '-'}</td>
                            <td className="p-4 text-white text-sm">{product.credit_price} créditos</td>
                            <td className="p-4">
                                <span className={`text-sm font-medium ${
                                    product.stock_available <= 2 ? 'text-red-400' :
                                        product.stock_available <= 5 ? 'text-yellow-400' : 'text-green-400'
                                }`}>
                                    {product.stock_available}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.is_active ? 'available' : 'expired')}`}>
                                    {product.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(product)}
                                        className="p-2 bg-red-950/50 hover:bg-red-900/50 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Nenhum produto encontrado.
                    </div>
                )}
            </div>

            {/* Modal de Confirmação de Delete */}
            {showDeleteModal && productToDelete && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl animate-scale-in">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-950 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Eliminar Produto</h3>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-slate-400 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <p className="text-sm text-slate-400 mb-2">
                            Tem certeza que deseja eliminar:
                        </p>
                        <p className="text-white font-bold text-base mb-4 bg-slate-900 rounded-lg p-3">
                            {productToDelete.name}
                        </p>
                        <p className="text-xs text-red-400 flex items-center gap-1.5 mb-6">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Esta ação não pode ser desfeita.
                        </p>

                        {/* Actions */}
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
                                className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white font-bold py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Eliminando...
                                    </>
                                ) : (
                                    'Eliminar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}