'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { StatusDonutChart } from '@/components/dashboard/StatusDonutChart';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { usePermitStats } from '@/lib/hooks/use-permit-stats';
import { usePermits } from '@/lib/hooks/use-permits';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = usePermitStats();
  const { data: recentData, isLoading: recentLoading, isError: recentError } = usePermits({
    sort: 'created_at',
    order: 'desc',
    limit: 10,
    page: 1,
  });

  useEffect(() => {
    if (statsError) toast.error('Could not load dashboard stats.');
  }, [statsError]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back. Here&apos;s your permit overview.</p>
        </div>
        <Link
          href="/permits/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Permit
        </Link>
      </div>

      {/* Stat Cards Row */}
      <StatsRow stats={stats} isLoading={statsLoading} isError={statsError} />

      {/* Middle Section: Chart (60%) + Activity (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Status Breakdown Chart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Permits by Status</h2>
          {statsLoading ? (
            <div className="flex items-center justify-center h-60">
              <div className="skeleton w-48 h-48 rounded-full" />
            </div>
          ) : (
            <StatusDonutChart stats={stats} />
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <RecentActivityFeed
            permits={recentData?.items}
            isLoading={recentLoading}
            isError={recentError}
          />
        </div>
      </div>
    </div>
  );
}
