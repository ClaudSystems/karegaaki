import { create } from 'zustand';
import { authAPI } from '../api/client';

interface User {
    id: string;
    phone_number: string;
    full_name: string;
    email?: string;
    user_type: string;
    is_active: boolean;
    is_verified: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (phone_number: string, pin: string) => Promise<boolean>;
    register: (data: { phone_number: string; full_name: string; pin: string }) => Promise<boolean>;
    logout: () => void;
    loadUser: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (phone_number, pin) => {
        set({ isLoading: true, error: null });
        try {
            const response: any = await authAPI.login(phone_number, pin);
            const token = response.access_token || response.token;
            localStorage.setItem('token', token);
            set({ token, isAuthenticated: true, isLoading: false });

            await get().loadUser();

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
            set({ token, isAuthenticated: true, isLoading: false });

            await get().loadUser();

            return true;
        } catch (error: any) {
            const msg = error.detail || error.message || 'Erro ao registar';
            set({ error: msg, isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    loadUser: async () => {
        try {
            const response: any = await authAPI.me();

            const user: User = {
                id: response.id,
                phone_number: response.phone_number,
                full_name: response.full_name,
                email: response.email,
                user_type: response.user_type,
                is_active: response.is_active,
                is_verified: response.is_verified,
            };

            set({ user });
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
        }
    },

    clearError: () => set({ error: null }),
}));