import { create } from 'zustand';

interface AuthState {
    token: string | null;
    login: (phone: string, pin: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('admin_token'),

    login: async (phone: string, pin: string) => {
        const axios = (await import('axios')).default;
        const { data } = await axios.post('/api/v1/auth/login', {
            phone_number: phone,
            pin: pin,
        });
        localStorage.setItem('admin_token', data.access_token);
        set({ token: data.access_token });
    },

    logout: () => {
        localStorage.removeItem('admin_token');
        set({ token: null });
    },
}));