export interface CreditPackage {
    id: string;
    name: string;
    credit_amount: number;
    price_mzn: number;
    bonus_credit: number;
    is_active: boolean;
    display_order: number;
}

export interface CreditPurchase {
    id: string;
    reference: string;
    amount_mzn: number;
    credit_received: number;
    status: 'pending' | 'confirmed' | 'failed' | 'expired';
}

export interface WalletBalance {
    user_id: string;
    balance_credit: number;
    total_purchased_credit: number;
    total_spent_credit: number;
}

export interface WalletMovement {
    id: string;
    amount: number;
    movement_type: string;
    reference: string | null;
    created_at: string;
}