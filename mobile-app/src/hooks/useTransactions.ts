// src/hooks/useTransactions.ts
import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function useTransactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await api.transactions.list();
            setTransactions(response.data || response || []);
        } catch (err) {
            console.error('Erro ao carregar transações:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const checkout = async (items: { product_id: string; quantity: number }[]) => {
        try {
            const response: any = await api.transactions.checkout(items);
            return response;
        } catch (err) {
            console.error('Erro no checkout:', err);
            throw err;
        }
    };

    return { transactions, loading, fetchTransactions, checkout };
}