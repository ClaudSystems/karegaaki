// src/types.ts

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    category_id: string;
    category_name: string | null;
    image_url: string | null;
    credit_price: string;
    is_active: boolean;
    stock_available: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    display_order: number;
    is_active: boolean;
}

export interface CreditPackage {
    id: string;
    name: string;
    credit_amount: string;
    price_mzn: string;
    bonus_credit: string;
    is_active: boolean;
    display_order: number;
}

export interface User {
    id: string;
    phone_number: string;
    full_name: string;
    email?: string;
    user_type: string;
    is_active: boolean;
    is_verified: boolean;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Transaction {
    id: string;
    reference: string;
    total_credit: string;
    total_mzn?: string;
    payment_status: string;
    delivery_status: string;
    payment_method: string;
    items: TransactionItem[];
    created_at: string;
}

export interface TransactionItem {
    product_id: string;
    product_name?: string;
    quantity: number;
    unit_credit_price: string;
    code_delivered?: string;
}

export interface WalletBalance {
    user_id: string;
    balance_credit: string;
    total_purchased_credit: string;
    total_spent_credit: string;
}

export interface WalletMovement {
    id: string;
    amount: string;
    movement_type: string;
    reference?: string;
    balance_before?: string;
    balance_after?: string;
    description?: string;
    created_at: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    color: string;
    enabled: boolean;
    confirmation_name: string;
    number?: string;
    instructions: string[];
    reference_format: string;
    note: string;
}

export interface CreditPurchaseResponse {
    id: string;
    reference: string;
    amount_mzn: string;
    credit_received: string;
    status: string;
    payment_method: string;
    payment_name?: string;
    payment_number?: string;
    confirmation_name?: string;
    payment_instructions?: string;
}