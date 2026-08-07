export interface User {
    id: string;
    phone_number: string;
    full_name: string;
    email: string | null;
    user_type: 'customer' | 'admin' | 'super_admin';
    is_active: boolean;
    is_verified: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}