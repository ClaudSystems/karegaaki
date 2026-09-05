import apiClient from './client';

export interface StockItem {
    id: string;
    product_id: string;
    code: string;
    status: string;
    expiry_date: string | null;
    sold_at: string | null;
    created_at: string;
}

export interface StockListResponse {
    items: StockItem[];
    total: number;
    page: number;
    page_size: number;
}

export const stockApi = {
    getItems: async (productId?: string, status?: string, page = 1, pageSize = 50): Promise<StockListResponse> => {
        const { data } = await apiClient.get('/admin/stock/items', {
            params: { product_id: productId, status, page, page_size: pageSize },
        });
        return data;
    },

    bulkAdd: async (productId: string, codes: string[], expiryDate?: string) => {
        const { data } = await apiClient.post('/admin/stock/bulk-add', {
            product_id: productId,
            codes,
            expiry_date: expiryDate,
        });
        return data;
    },

    deleteItem: async (itemId: string) => {
        const { data } = await apiClient.delete(`/admin/stock/items/${itemId}`);
        return data;
    },
};