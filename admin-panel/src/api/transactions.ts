import apiClient from './client';

export const transactionApi = {
    getAll: async (page = 1, pageSize = 20, status?: string) => {
        const { data } = await apiClient.get('/admin/transactions', {
            params: { page, page_size: pageSize, status },
        });
        return data;
    },
};