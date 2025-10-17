import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tenant, User } from '@/types/api';

interface AuthState {
  token: string | null;
  user: User | null;
  tenant: Tenant | null;
  setAuth: (payload: { token: string; user: User; tenant?: Tenant | null }) => void;
  updateUser: (user: User) => void;
  updateTenant: (tenant: Tenant | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      tenant: null,
      setAuth: ({ token, user, tenant }) =>
        set({ token, user, tenant: tenant ?? user.tenant ?? null }),
      updateUser: (user) => set((state) => ({ ...state, user })),
      updateTenant: (tenant) => set((state) => ({ ...state, tenant })),
      clear: () => set({ token: null, user: null, tenant: null }),
    }),
    {
      name: 'm4stage-auth',
      partialize: (state) => ({ token: state.token, user: state.user, tenant: state.tenant }),
    },
  ),
);
