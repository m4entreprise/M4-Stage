import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth';

export const useTenant = () => {
  const tenant = useAuthStore((state) => state.tenant);
  return useMemo(() => tenant, [tenant]);
};
