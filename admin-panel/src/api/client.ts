// src/api/client.ts
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


api.interceptors.response.use(
    (res) => res.data,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(err.response?.data || err);
    }
);

export const authAPI = {
    login: (phone_number: string, pin: string) =>
        api.post('/auth/login', { phone_number, pin }),
    register: (data: { phone_number: string; full_name: string; pin: string }) =>
        api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
};

export const productsAPI = {
    list: (params?: any) => api.get('/products', { params }),
    getById: (id: string) => api.get(`/products/${id}`),
    categories: () => api.get('/products/categories'),
};

export const creditsAPI = {
    packages: () => api.get('/credits/packages'),
    purchase: (package_id: string, payment_method: string = 'mpesa') =>
        api.post('/credits/purchase', { package_id, payment_method }),
};

export const walletAPI = {
    balance: () => api.get('/wallet/balance'),
    history: () => api.get('/wallet/history'),
};

export const transactionsAPI = {
    checkout: (items: { product_id: string; quantity: number }[]) =>
        api.post('/transactions/checkout', { items }),
    list: () => api.get('/transactions'),
    getById: (id: string) => api.get(`/transactions/${id}`),
};

export const kycAPI = {
    status: () => api.get('/kyc/status'),
    submit: (data: any) => api.post('/kyc/submit', data),
    uploadDocument: (formData: FormData) =>
        api.post('/kyc/upload-document', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};

export const disputesAPI = {
    create: (data: any) => api.post('/disputes', data),
    my: () => api.get('/disputes/my'),
};

export const paymentsAPI = {
    getMethods: () => api.get('/payments/methods'),
    confirmPurchase: (reference: string) =>
        api.post('/credits/purchase/confirm', { reference }),
};


export default api;