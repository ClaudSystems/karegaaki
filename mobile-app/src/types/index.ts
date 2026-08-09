// src/types/index.ts

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    category_id: string;
    category_name: string;
    image_url: string;
    credit_price: string;
    is_active: boolean;
    stock_available: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface CreditPackage {
    id: string;
    name: string;
    amount_mzn: number;
    credit_received: number;
    bonus_credit: number;
    is_popular?: boolean;
}

export interface User {
    id: string;
    phone: string;
    full_name: string;
    kyc_level: string;
    is_verified: boolean;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Transaction {
    id: string;
    reference: string;
    total_credit: number;
    payment_status: string;
    delivery_status: string;
    created_at: string;
}