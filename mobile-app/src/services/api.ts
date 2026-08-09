// src/services/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
    private api: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
        });

        // Carregar token do localStorage
        this.token = localStorage.getItem('auth_token');

        // Interceptor de Request - Adiciona JWT
        this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
            if (this.token) {
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
            return config;
        });

        // Interceptor de Response - Trata erros
        this.api.interceptors.response.use(
            (response) => response.data,
            (error) => {
                if (error.response?.status === 401) {
                    this.clearToken();
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                }
                console.error('❌ API Error:', error.response?.data || error.message);
                return Promise.reject(error.response?.data || error);
            }
        );
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    getToken() {
        return this.token;
    }

    // 🔐 Autenticação
    auth = {
        register: (data: { phone: string; full_name: string; password: string }) =>
            this.api.post('/auth/register', data),

        login: (data: { phone: string; password: string }) =>
            this.api.post('/auth/login', data),

        getProfile: () =>
            this.api.get('/auth/me'),
    };

    // 📦 Produtos
    products = {
        list: (params?: { search?: string; category_id?: string; sort_by?: string; page?: number }) =>
            this.api.get('/products', { params }),

        getById: (id: string) =>
            this.api.get(`/products/${id}`),

        getCategories: () =>
            this.api.get('/products/categories'),
    };

    // 💰 Créditos
    credits = {
        getPackages: () =>
            this.api.get('/credits/packages'),

        purchase: (packageId: string) =>
            this.api.post('/credits/purchase', { package_id: packageId }),

        getPurchaseStatus: (reference: string) =>
            this.api.get(`/credits/purchase/${reference}/status`),
    };

    // 👛 Carteira
    wallet = {
        getBalance: () =>
            this.api.get('/wallet/balance'),

        getHistory: (params?: { page?: number; page_size?: number }) =>
            this.api.get('/wallet/history', { params }),
    };

    // 🛒 Transações
    transactions = {
        checkout: (items: { product_id: string; quantity: number }[]) =>
            this.api.post('/transactions/checkout', { items }),

        list: (params?: { page?: number; page_size?: number }) =>
            this.api.get('/transactions', { params }),

        getById: (id: string) =>
            this.api.get(`/transactions/${id}`),
    };

    // 🛡️ KYC
    kyc = {
        getStatus: () =>
            this.api.get('/kyc/status'),

        submit: (data: { document_type: string; document_number: string }) =>
            this.api.post('/kyc/submit', data),

        uploadDocument: (file: File, documentType: string) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('document_type', documentType);
            return this.api.post('/kyc/upload-document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
    };

    // 📋 Disputas
    disputes = {
        create: (data: { dispute_type: string; description: string; transaction_id?: string }) =>
            this.api.post('/disputes', data),

        getMy: () =>
            this.api.get('/disputes/my'),
    };
}

export const api = new ApiClient();