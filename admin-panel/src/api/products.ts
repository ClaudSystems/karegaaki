import apiClient from './client';
import type { Product, ProductListResponse } from '../types/product.types';

export interface CreateProductData {
    name: string;
    slug: string;
    description?: string;
    category_id?: string;
    credit_price: number;
    is_active: boolean;
}

export const productApi = {
    getAll: async (page = 1, pageSize = 20, search?: string): Promise<ProductListResponse> => {
        const { data } = await apiClient.get('/admin/products', {
            params: { page, page_size: pageSize, search },
        });
        return data;
    },

    getById: async (id: string): Promise<Product> => {
        const { data } = await apiClient.get(`/admin/products/${id}`);
        return data;
    },

    create: async (product: CreateProductData): Promise<Product> => {
        const { data } = await apiClient.post('/admin/products', product);
        return data;
    },

    update: async (id: string, product: Partial<CreateProductData>): Promise<Product> => {
        const { data } = await apiClient.put(`/admin/products/${id}`, product);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/products/${id}`);
    },
};