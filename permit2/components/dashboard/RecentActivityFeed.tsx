'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { PermitSummary } from '@/lib/types/permit';

interface RecentActivityFeedProps {
  permits?: PermitSummary[];
  isLoading?: boolean;
  isError?: boolean;
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50">
      <div className="skeleton h-6 w-20 rounded-full flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="skeleton h-4 w-48 rounded mb-1.5" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    </div>
  );
}

export function RecentActivityFeed({ permits, isLoading, isError }: RecentActivityFeedProps) {
  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-gray-500 py-4">Could not load recent activity.</p>
    );
  }

  if (!permits?.length) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">No permits yet.</p>
    );
  }

  return (
    <div>
      <div className="divide-y divide-gray-50">
        {permits.map((permit) => (
          <Link
            key={permit.id}
            href={`/permits/${permit.id}`}
            className="flex items-start gap-3 py-3 hover:bg-gray-50 -mx-1 px-1 rounded-lg transition-colors group"
          >
            <StatusBadge status={permit.status} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {permit.title.length > 40 ? `${permit.title.slice(0, 40)}…` : permit.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {permit.applicant_name} · {formatDistanceToNow(new Date(permit.updated_at), { addSuffix: true })}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-3 mt-1 border-t border-gray-100">
        <Link
          href="/permits"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View all permits
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
