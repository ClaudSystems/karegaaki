import { create } from 'zustand';
import type { CreditPackage, WalletBalance } from '../types/credit.types';
import { creditApi } from '../api/credits';
import toast from 'react-hot-toast';

interface CreditStore {
    packages: CreditPackage[];
    balances: WalletBalance[];
    totalBalances: number;
    loading: boolean;
    slideoverOpen: boolean;
    editingPackage: CreditPackage | null;
    activeTab: 'packages' | 'balances';
    setActiveTab: (tab: 'packages' | 'balances') => void;
    openSlideover: (pkg?: CreditPackage) => void;
    closeSlideover: () => void;
    fetchPackages: () => Promise<void>;
    fetchBalances: (page?: number, search?: string) => Promise<void>;
    savePackage: (data: Partial<CreditPackage>) => Promise<void>;
    deletePackage: (id: string) => Promise<void>;
}

export const useCreditStore = create<CreditStore>((set, get) => ({
    packages: [],
    balances: [],
    totalBalances: 0,
    loading: false,
    slideoverOpen: false,
    editingPackage: null,
    activeTab: 'packages',

    setActiveTab: (tab) => set({ activeTab: tab }),

    openSlideover: (pkg) => set({ slideoverOpen: true, editingPackage: pkg || null }),
    closeSlideover: () => set({ slideoverOpen: false, editingPackage: null }),

    fetchPackages: async () => {
        set({ loading: true });
        try {
            const data = await creditApi.getPackages();
            set({ packages: data, loading: false });
        } catch {
            set({ loading: false });
        }
    },

    fetchBalances: async (page = 1, search?: string) => {
        set({ loading: true });
        try {
            const data = await creditApi.getClientBalances(page, 20, search);
            set({ balances: data.items, totalBalances: data.total, loading: false });
        } catch {
            set({ loading: false });
        }
    },

    savePackage: async (data) => {
        const { editingPackage, fetchPackages, closeSlideover } = get();
        try {
            if (editingPackage) {
                await creditApi.updatePackage(editingPackage.id, data);
                toast.success('Pacote atualizado!');
            } else {
                await creditApi.createPackage(data as any);
                toast.success('Pacote criado!');
            }
            closeSlideover();
            fetchPackages();
        } catch {
            toast.error('Erro ao salvar pacote');
        }
    },

    deletePackage: async (id) => {
        try {
            await creditApi.deletePackage(id);
            toast.success('Pacote eliminado!');
            get().fetchPackages();
        } catch {
            toast.error('Erro ao eliminar pacote');
        }
    },
}));