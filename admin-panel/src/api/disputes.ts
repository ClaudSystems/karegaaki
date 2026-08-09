import apiClient from './client';

export interface Dispute {
    id: string;
    reference: string;
    user_id: string;
    transaction_id: string | null;
    dispute_type: string;
    status: string;
    description: string;
    admin_response: string | null;
    priority: string;
    created_at: string;
    resolved_at: string | null;
}

export interface DisputeListResponse {
    items: Dispute[];
    total: number;
}

export const disputeApi = {
    getAll: async (page = 1, pageSize = 20, status?: string): Promise<DisputeListResponse> => {
        const { data } = await apiClient.get('/admin/disputes/all', {
            params: { page, page_size: pageSize, status },
        });
        return data;
    },

    resolve: async (disputeId: string, action: string, response: string, refundAmount?: number) => {
        const { data } = await apiClient.post(`/admin/disputes/${disputeId}/resolve`, {
            action,
            response,
            refund_amount: refundAmount,
        });
        return data;
    },
};