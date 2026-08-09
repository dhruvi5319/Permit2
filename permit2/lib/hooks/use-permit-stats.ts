import { useQuery } from '@tanstack/react-query';
import type { PermitStats } from '@/lib/types/permit';

async function fetchPermitStats(): Promise<PermitStats> {
  const res = await fetch('/api/permits/stats', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch permit stats');
  const json = await res.json();
  return json.data as PermitStats;
}

export function usePermitStats() {
  return useQuery<PermitStats, Error>({
    queryKey: ['permit-stats'],
    queryFn: fetchPermitStats,
    refetchOnWindowFocus: true,
  });
}
