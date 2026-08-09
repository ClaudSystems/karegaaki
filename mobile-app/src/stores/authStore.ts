// src/stores/authStore.ts
import { create } from 'zustand';
import { authAPI } from '../api/client';

interface User {
    id: string;
    phone: string;
    full_name: string;
    kyc_level: string;
    is_verified: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (phone_number: string, pin: string) => Promise<boolean>;
    register: (data: { phone_number: string; full_name: string; pin: string }) => Promise<boolean>;
    logout: () => void;
    loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (phone_number, pin) => {
        set({ isLoading: true, error: null });
        try {
            const response: any = await authAPI.login(phone_number, pin);
            const token = response.access_token || response.token;
            localStorage.setItem('token', token);
            set({ isAuthenticated: true, isLoading: false });
            return true;
        } catch (error: any) {
            const msg = error.detail || error.message || 'Erro ao fazer login';
            set({ error: msg, isLoading: false });
            return false;
        }
    },

    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response: any = await authAPI.register(data);
            const token = response.access_token || response.token;
            localStorage.setItem('token', token);
            set({ isAuthenticated: true, isLoading: false });
            return true;
        } catch (error: any) {
            const msg = error.detail || error.message || 'Erro ao registar';
            set({ error: msg, isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
    },

    loadUser: async () => {
        try {
            const response: any = await authAPI.me();
            set({ user: response });
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
        }
    },
}));