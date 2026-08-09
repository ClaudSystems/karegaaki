// src/hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Product, Category } from '../types';

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async (params?: {
        search?: string;
        category_id?: string;
        sort_by?: string;
        page?: number;
    }) => {
        setLoading(true);
        setError(null);
        try {
            const response: any = await api.products.list(params);
            setProducts(response.data || response.products || []);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar produtos');
            console.error('Erro ao carregar produtos:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response: any = await api.products.getCategories();
            setCategories(response.data || response.categories || []);
        } catch (err) {
            console.error('Erro ao carregar categorias:', err);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    return { products, categories, loading, error, fetchProducts, refetch: fetchProducts };
}