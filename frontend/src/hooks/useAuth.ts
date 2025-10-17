import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { Tenant, User } from '@/types/api';

interface LoginPayload {
  email: string;
  password: string;
  tenantSlug?: string;
  remember?: boolean;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { token, user, tenant, setAuth, clear, updateTenant } = useAuthStore();

  const loginMutation = useMutation<unknown, Error, LoginPayload, unknown>({
    mutationFn: async ({ tenantSlug, remember, ...payload }) => {
      const headers: Record<string, string> = {};
      if (tenantSlug) {
        headers['X-Tenant'] = tenantSlug;
      }

      const { data } = await api.post<LoginResponse>(
        '/auth/login',
        { ...payload, remember_me: remember },
        { headers },
      );

      setAuth({ token: data.token, user: data.user, tenant: data.user.tenant ?? null });
      updateTenant(data.user.tenant ?? null);
      await queryClient.invalidateQueries({ queryKey: ['me'] });

      return data;
    },
    throwOnError: false,
  });

  const logout = () => {
    clear();
    queryClient.clear();
  };

  return {
    token,
    user,
    tenant,
    isAuthenticated: Boolean(token),
    login: loginMutation.mutateAsync,
    loginStatus: loginMutation.status,
    logout,
    loginError: loginMutation.failureReason,
  };
};

export const useStripeStatus = () => {
  const tenant = useAuthStore((state) => state.tenant);
  if (!tenant) {
    return { status: 'not_connected' } as { status: Tenant['stripe_status'] };
  }
  return { status: tenant.stripe_status };
};
