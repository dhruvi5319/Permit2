'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { PermitRow } from './PermitRow';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Pagination } from '@/components/shared/Pagination';
import type { PermitSummary, PaginationMeta } from '@/lib/types/permit';

interface PermitTableProps {
  permits?: PermitSummary[];
  meta?: PaginationMeta;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

type SortColumn = 'title' | 'type' | 'applicant_name' | 'status' | 'start_date' | 'end_date' | 'created_at';

const COLUMNS: Array<{ key: SortColumn | null; label: string; width?: string }> = [
  { key: null,            label: '#',        width: 'w-20'  },
  { key: 'title',         label: 'Title'                     },
  { key: 'type',          label: 'Type',     width: 'w-36'  },
  { key: 'applicant_name',label: 'Applicant',width: 'w-36'  },
  { key: 'status',        label: 'Status',   width: 'w-32'  },
  { key: 'start_date',    label: 'Start',    width: 'w-28'  },
  { key: 'end_date',      label: 'End',      width: 'w-28'  },
  { key: 'created_at',    label: 'Created',  width: 'w-28'  },
  { key: null,            label: 'Actions',  width: 'w-44'  },
];

export function PermitTable({ permits, meta, isLoading, isError, onRetry }: PermitTableProps) {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const currentSort  = searchParams.get('sort')  ?? 'created_at';
  const currentOrder = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc';
  const currentPage  = Number(searchParams.get('page') ?? 1);

  const updateURL = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    router.push(`/permits?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  function handleSort(col: SortColumn) {
    if (col === currentSort) {
      updateURL({ sort: col, order: currentOrder === 'asc' ? 'desc' : 'asc', page: undefined });
    } else {
      updateURL({ sort: col, order: 'asc', page: undefined });
    }
  }

  function handlePageChange(page: number) {
    updateURL({ page: String(page) });
  }

  function hasActiveFilters() {
    return ['search','status','type','start_date_from','start_date_to'].some(k => searchParams.has(k));
  }

  function clearFilters() {
    router.push('/permits', { scroll: false });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {COLUMNS.map((col, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide ${col.width ?? ''} ${col.key ? 'cursor-pointer hover:bg-gray-100 select-none transition-colors' : ''}`}
                  onClick={() => col.key && handleSort(col.key)}
                >
                  {col.key ? (
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.key === currentSort ? (
                        currentOrder === 'asc'
                          ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                          : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />
                      )}
                    </div>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="p-0">
                  <SkeletonTable rows={5} cols={COLUMNS.length} />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={COLUMNS.length}>
                  <ErrorState message="Could not load permits." onRetry={onRetry} />
                </td>
              </tr>
            ) : !permits?.length ? (
              <tr>
                <td colSpan={COLUMNS.length}>
                  <EmptyState
                    type={hasActiveFilters() ? 'no-results' : 'no-permits'}
                    onClearFilters={hasActiveFilters() ? clearFilters : undefined}
                    onCreatePermit={hasActiveFilters() ? undefined : () => router.push('/permits/new')}
                  />
                </td>
              </tr>
            ) : (
              permits.map((permit) => <PermitRow key={permit.id} permit={permit} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          page={currentPage}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
