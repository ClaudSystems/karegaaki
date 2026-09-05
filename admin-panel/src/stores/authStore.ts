import { create } from 'zustand';
import axios from 'axios';

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
}

interface AdminAuthState {
    admin: AdminUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    loadAdmin: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AdminAuthState>((set) => ({
    admin: JSON.parse(localStorage.getItem('admin_info') || 'null'),
    token: localStorage.getItem('admin_token'),
    isAuthenticated: !!localStorage.getItem('admin_token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v1/admin/auth/login', {
                email,
                password,
            });

            const data = response.data;
            localStorage.setItem('admin_token', data.access_token);
            localStorage.setItem('admin_info', JSON.stringify(data.admin));

            set({
                admin: data.admin,
                token: data.access_token,
                isAuthenticated: true,
                isLoading: false,
            });

            return true;
        } catch (error: any) {
            const msg = error.response?.data?.detail || 'Erro ao fazer login';
            set({ error: msg, isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
        set({ admin: null, token: null, isAuthenticated: false });
    },

    loadAdmin: async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const response = await axios.get('http://127.0.0.1:8000/api/v1/admin/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            set({ admin: response.data });
        } catch (error) {
            console.error('Erro ao carregar admin:', error);
        }
    },

    clearError: () => set({ error: null }),
}));