import { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import apiClient from '../../api/client';

export default function ProductSlideover() {
    const { slideoverOpen, editingProduct, closeSlideover, saveProduct } = useProductStore();

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [creditPrice, setCreditPrice] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [imageUrl, setImageUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name);
            setSlug(editingProduct.slug);
            setDescription(editingProduct.description || '');
            setCreditPrice(editingProduct.credit_price);
            setIsActive(editingProduct.is_active);
            setImageUrl(editingProduct.image_url || '');
        } else {
            setName('');
            setSlug('');
            setDescription('');
            setCreditPrice(0);
            setIsActive(true);
            setImageUrl('');
        }
    }, [editingProduct, slideoverOpen]);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleNameChange = (value: string) => {
        setName(value);
        if (!editingProduct) {
            setSlug(generateSlug(value));
        }
    };

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('admin_token');
            const response = await apiClient.post('/admin/uploads/product-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = response.data;
            setImageUrl(data.image_url);
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await saveProduct({
            name,
            slug,
            description: description || undefined,
            credit_price: creditPrice,
            is_active: isActive,
            image_url: imageUrl || undefined,
        });
        setSaving(false);
    };

    if (!slideoverOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={closeSlideover} />
            <div className="fixed right-0 top-0 h-full w-96 bg-slate-800 border-l border-slate-700 z-50 shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">
                        {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <button onClick={closeSlideover} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto h-[calc(100%-73px)]">
                    {/* Upload de Imagem */}
                    <div>
                        <label className="text-sm text-slate-400 block mb-1">Imagem do Produto</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {imageUrl ? (
                            <div className="relative">
                                <img
                                    src={imageUrl.startsWith('http') ? imageUrl : `http://127.0.0.1:8000${imageUrl}`}
                                    alt="Preview"
                                    className="w-full h-40 object-cover rounded-lg border border-slate-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-lg text-xs"
                                >
                                    Trocar
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full h-40 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
                            >
                                {uploading ? (
                                    <>
                                        <Loader className="w-8 h-8 animate-spin" />
                                        <span className="text-xs">Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8" />
                                        <span className="text-xs">Clique para enviar imagem</span>
                                        <span className="text-[10px] text-slate-500">JPEG, PNG, WEBP até 5MB</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 block mb-1">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 block mb-1">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 block mb-1">Descrição</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 block mb-1">Preço (Créditos)</label>
                        <input
                            type="number"
                            value={creditPrice}
                            onChange={(e) => setCreditPrice(Number(e.target.value))}
                            step="0.5"
                            min="0"
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-sm text-slate-400">Ativo</label>
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-slate-600'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${isActive ? 'ml-5' : 'ml-0.5'}`} />
                        </button>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Criar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}