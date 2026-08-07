export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category_id: string | null;
    category_name: string | null;
    image_url: string | null;
    credit_price: number;
    is_active: boolean;
    stock_available: number;
}

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    display_order: number;
    is_active: boolean;
}

export interface ProductListResponse {
    items: Product[];
    total: number;
    page: number;
    page_size: number;
}