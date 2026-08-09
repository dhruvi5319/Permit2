'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type UserProfile } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading } = useQuery<UserProfile | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await apiClient.auth.me();
      if (res.error) return null;
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  async function logout() {
    try { await apiClient.auth.logout(); } catch { /* ignore */ }
    queryClient.clear();
    router.push('/login');
  }

  return { user: user ?? null, isLoading, logout };
}
