'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PermitFilterBar } from '@/components/permits/PermitFilterBar';
import { PermitTable } from '@/components/permits/PermitTable';
import { usePermits } from '@/lib/hooks/use-permits';
import type { PermitStatus, PermitType, PermitListParams } from '@/lib/types/permit';

function PermitsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Build params from URL
  const params: PermitListParams = {
    search:          searchParams.get('search')          ?? undefined,
    status:          (searchParams.get('status')         ?? '') as PermitStatus | '',
    type:            (searchParams.get('type')           ?? '') as PermitType   | '',
    start_date_from: searchParams.get('start_date_from') ?? undefined,
    start_date_to:   searchParams.get('start_date_to')   ?? undefined,
    sort:            searchParams.get('sort')            ?? 'created_at',
    order:           (searchParams.get('order')          ?? 'desc') as 'asc' | 'desc',
    page:            Number(searchParams.get('page')     ?? 1),
    limit:           20,
  };

  // Skip invalid date range (per UX-Mockup: "not applied until valid pair")
  if (params.start_date_from && params.start_date_to && params.start_date_from > params.start_date_to) {
    params.start_date_from = undefined;
    params.start_date_to   = undefined;
  }

  const { data, isLoading, isError, refetch } = usePermits(params);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Permits</h1>
        <Link
          href="/permits/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Permit
        </Link>
      </div>

      {/* Filter Bar */}
      <PermitFilterBar />

      {/* Table */}
      <PermitTable
        permits={data?.items}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </div>
  );
}

export default function PermitsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-32 skeleton rounded" />
        <div className="h-24 bg-white rounded-xl border border-gray-200 skeleton" />
        <div className="h-96 bg-white rounded-xl border border-gray-200 skeleton" />
      </div>
    }>
      <PermitsContent />
    </Suspense>
  );
}
