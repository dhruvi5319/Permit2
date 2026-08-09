import { useQuery } from '@tanstack/react-query';
import type { PermitListParams, PermitSummary, PaginationMeta } from '@/lib/types/permit';

interface PermitListResult {
  items: PermitSummary[];
  meta: PaginationMeta;
}

async function fetchPermits(params: PermitListParams): Promise<PermitListResult> {
  const searchParams = new URLSearchParams();
  if (params.search)          searchParams.set('search', params.search);
  if (params.status)          searchParams.set('status', params.status);
  if (params.type)            searchParams.set('type', params.type);
  if (params.start_date_from) searchParams.set('start_date_from', params.start_date_from);
  if (params.start_date_to)   searchParams.set('start_date_to', params.start_date_to);
  if (params.sort)            searchParams.set('sort', params.sort);
  if (params.order)           searchParams.set('order', params.order);
  if (params.page)            searchParams.set('page', String(params.page));
  if (params.limit)           searchParams.set('limit', String(params.limit));

  const res = await fetch(`/api/permits?${searchParams.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch permits');
  const json = await res.json();
  return { items: json.data.items as PermitSummary[], meta: json.meta as PaginationMeta };
}

export function usePermits(params: PermitListParams = {}) {
  return useQuery<PermitListResult, Error>({
    queryKey: ['permits', params],
    queryFn: () => fetchPermits(params),
    placeholderData: (prev) => prev,  // keepPreviousData behavior in v5
  });
}
