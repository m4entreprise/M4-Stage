import type { PropsWithChildren } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User } from '@/types/api';
import { useAuthStore } from '@/store/auth';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const updateTenant = useAuthStore((state) => state.updateTenant);

  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>('/auth/me');
      updateUser(data.user);
      updateTenant(data.user.tenant ?? null);
      return data.user;
    },
    enabled: Boolean(token && !user),
    staleTime: 1000 * 60 * 5,
  });

  return children;
};
