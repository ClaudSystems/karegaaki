export interface Transaction {
    id: string;
    reference: string;
    total_credit: number;
    total_mzn: number | null;
    payment_status: string;
    delivery_status: string;
    payment_method: string;
    created_at: string;
}

export interface TransactionItem {
    product_id: string;
    product_name: string | null;
    quantity: number;
    unit_credit_price: number;
    code_delivered: string | null;
}