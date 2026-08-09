'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient, type PermitDetail } from '@/lib/api-client';

export function usePermit(id: string) {
  return useQuery<PermitDetail | null, Error>({
    queryKey: ['permit', id],
    queryFn: async () => {
      const res = await apiClient.permits.getById(id);
      if (res.error?.code === 'PERMIT_NOT_FOUND') return null; // triggers 404 state
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}
