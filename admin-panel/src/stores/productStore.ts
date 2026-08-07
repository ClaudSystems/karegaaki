import { create } from 'zustand';
import type { Product } from '../types/product.types';
import { productApi, type CreateProductData } from '../api/products';
import toast from 'react-hot-toast';

interface ProductStore {
    products: Product[];
    total: number;
    loading: boolean;
    search: string;
    slideoverOpen: boolean;
    editingProduct: Product | null;
    setSearch: (search: string) => void;
    openSlideover: (product?: Product) => void;
    closeSlideover: () => void;
    fetchProducts: (page?: number, pageSize?: number) => Promise<void>;
    saveProduct: (data: CreateProductData) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
    products: [],
    total: 0,
    loading: false,
    search: '',
    slideoverOpen: false,
    editingProduct: null,


    setSearch: (search: string) => {
        set({ search });
        get().fetchProducts(1);
    },

    openSlideover: (product?: Product) => {
        set({ slideoverOpen: true, editingProduct: product || null });
    },

    closeSlideover: () => {
        set({ slideoverOpen: false, editingProduct: null });
    },

    fetchProducts: async (page = 1, pageSize = 20) => {
        set({ loading: true });
        try {
            const { search } = get();
            const data = await productApi.getAll(page, pageSize, search || undefined);
            set({ products: data.items, total: data.total, loading: false });
        } catch {
            set({ loading: false });
        }
    },

    saveProduct: async (data: CreateProductData) => {
        const { editingProduct, fetchProducts, closeSlideover } = get();
        try {
            if (editingProduct) {
                await productApi.update(editingProduct.id, data);
                toast.success('Produto atualizado!');
            } else {
                await productApi.create(data);
                toast.success('Produto criado!');
            }
            closeSlideover();
            fetchProducts();
        } catch {
            toast.error('Erro ao salvar produto');
        }
    },
    deleteProduct: async (id: string) => {
        try {
            await productApi.delete(id);
            toast.success('Produto eliminado!');
            get().fetchProducts();
        } catch {
            toast.error('Erro ao eliminar produto');
        }
    },
}));