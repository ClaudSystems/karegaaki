import apiClient from './client';
import type { CreditPackage } from '../types/credit.types';

export const creditApi = {
    getPackages: async (): Promise<CreditPackage[]> => {
        const { data } = await apiClient.get('/credits/packages');
        return data;
    },

    createPackage: async (pkg: Omit<CreditPackage, 'id'>): Promise<CreditPackage> => {
        const { data } = await apiClient.post('/admin/credits/packages', pkg);
        return data;
    },

    updatePackage: async (id: string, pkg: Partial<CreditPackage>): Promise<CreditPackage> => {
        const { data } = await apiClient.put(`/admin/credits/packages/${id}`, pkg);
        return data;
    },

    deletePackage: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/credits/packages/${id}`);
    },

    getClientBalances: async (page = 1, pageSize = 20, search?: string) => {
        const { data } = await apiClient.get('/admin/wallets', {
            params: { page, page_size: pageSize, search },
        });
        return data;
    },
};