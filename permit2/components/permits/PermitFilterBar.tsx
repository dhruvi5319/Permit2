'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X, ChevronDown, Calendar } from 'lucide-react';
import type { PermitStatus, PermitType } from '@/lib/types/permit';
import { PERMIT_STATUS_LABELS, PERMIT_TYPE_LABELS } from '@/lib/types/permit';

const STATUS_PILL_STYLES: Record<PermitStatus, string> = {
  PENDING:  'bg-amber-100 text-amber-700 border-amber-300',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  REJECTED: 'bg-red-100 text-red-700 border-red-300',
  REVOKED:  'bg-gray-100 text-gray-600 border-gray-300',
};

export function PermitFilterBar() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const debounceRef  = useRef<ReturnType<typeof setTimeout>>(null);

  const currentSearch = searchParams.get('search') ?? '';
  const currentStatus = (searchParams.get('status') ?? '') as PermitStatus | '';
  const currentType   = (searchParams.get('type')   ?? '') as PermitType   | '';
  const currentFrom   = searchParams.get('start_date_from') ?? '';
  const currentTo     = searchParams.get('start_date_to')   ?? '';

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Sync input if URL changes externally
  useEffect(() => { setSearchInput(currentSearch); }, [currentSearch]);

  const updateURL = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    // Reset to page 1 on any filter change
    params.delete('page');
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    const qs = params.toString();
    router.push(qs ? `/permits?${qs}` : '/permits', { scroll: false });
  }, [searchParams, router]);

  // Debounced search
  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateURL({ search: value || undefined });
    }, 300);
  }

  function clearSearch() {
    setSearchInput('');
    updateURL({ search: undefined });
  }

  function handleStatusClick(status: PermitStatus | '') {
    updateURL({ status: status === currentStatus ? undefined : (status || undefined) });
  }

  function handleTypeChange(type: PermitType | '') {
    updateURL({ type: type || undefined });
  }

  function handleDateChange(field: 'start_date_from' | 'start_date_to', value: string) {
    updateURL({ [field]: value || undefined });
  }

  const dateRangeInvalid = currentFrom && currentTo && currentFrom > currentTo;

  const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
  if (currentStatus) activeFilters.push({ label: `Status: ${PERMIT_STATUS_LABELS[currentStatus]}`, onRemove: () => updateURL({ status: undefined }) });
  if (currentType)   activeFilters.push({ label: `Type: ${PERMIT_TYPE_LABELS[currentType]}`,       onRemove: () => updateURL({ type: undefined }) });
  if (currentFrom)   activeFilters.push({ label: `From: ${currentFrom}`,                           onRemove: () => updateURL({ start_date_from: undefined }) });
  if (currentTo)     activeFilters.push({ label: `To: ${currentTo}`,                               onRemove: () => updateURL({ start_date_to: undefined }) });

  const hasFilters = activeFilters.length > 0 || !!searchInput;

  const statuses: Array<{ value: PermitStatus | ''; label: string }> = [
    { value: '',          label: 'All'      },
    { value: 'PENDING',   label: 'Pending'  },
    { value: 'APPROVED',  label: 'Approved' },
    { value: 'REJECTED',  label: 'Rejected' },
    { value: 'REVOKED',   label: 'Revoked'  },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      {/* Row 1: Search + Status pills + Type + Dates */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search permits by title, applicant, or description…"
            maxLength={100}
            className="w-full pl-9 pr-8 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1">
          {statuses.map(({ value, label }) => {
            const isActive = value === currentStatus;
            const pillStyle = value && isActive ? STATUS_PILL_STYLES[value as PermitStatus] : '';
            return (
              <button
                key={value}
                onClick={() => handleStatusClick(value as PermitStatus | '')}
                className={`px-3 h-9 text-sm font-medium rounded-lg border transition-colors ${
                  isActive && value
                    ? `${pillStyle} border`
                    : isActive && !value
                    ? 'bg-gray-100 text-gray-900 border-gray-300'
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Type Dropdown */}
        <div className="relative">
          <select
            value={currentType}
            onChange={(e) => handleTypeChange(e.target.value as PermitType | '')}
            className="appearance-none pl-3 pr-7 h-9 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Types</option>
            {(Object.entries(PERMIT_TYPE_LABELS) as [PermitType, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="date"
              value={currentFrom}
              onChange={(e) => handleDateChange('start_date_from', e.target.value)}
              className="pl-8 pr-2 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-gray-400">to</span>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="date"
              value={currentTo}
              onChange={(e) => handleDateChange('start_date_to', e.target.value)}
              className={`pl-8 pr-2 h-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${dateRangeInvalid ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
          </div>
        </div>
      </div>

      {/* Date range warning */}
      {dateRangeInvalid && (
        <p className="text-xs text-red-600">End date must be on or after the start date. Date filters not applied.</p>
      )}

      {/* Row 2: Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex items-center flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full"
            >
              {filter.label}
              <button
                onClick={filter.onRemove}
                className="text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {hasFilters && (
            <button
              onClick={() => router.push('/permits', { scroll: false })}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 underline transition-colors ml-auto"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
