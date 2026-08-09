'use client';

import { FileText, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { StatCard } from './StatCard';
import type { PermitStats } from '@/lib/types/permit';

interface StatsRowProps {
  stats?: PermitStats;
  isLoading?: boolean;
  isError?: boolean;
}

export function StatsRow({ stats, isLoading, isError }: StatsRowProps) {
  const cards = [
    {
      label:       'Total Permits',
      count:       stats?.total,
      icon:        FileText,
      href:        '/permits',
      accentColor: 'border-l-indigo-500',
      bgColor:     'bg-indigo-50',
      textColor:   'text-indigo-600',
    },
    {
      label:       'Pending',
      count:       stats?.pending,
      icon:        Clock,
      href:        '/permits?status=PENDING',
      accentColor: 'border-l-amber-500',
      bgColor:     'bg-amber-50',
      textColor:   'text-amber-600',
    },
    {
      label:       'Approved',
      count:       stats?.approved,
      icon:        CheckCircle,
      href:        '/permits?status=APPROVED',
      accentColor: 'border-l-emerald-500',
      bgColor:     'bg-emerald-50',
      textColor:   'text-emerald-600',
    },
    {
      label:       'Rejected',
      count:       stats?.rejected,
      icon:        XCircle,
      href:        '/permits?status=REJECTED',
      accentColor: 'border-l-red-500',
      bgColor:     'bg-red-50',
      textColor:   'text-red-600',
    },
    {
      label:       'Revoked',
      count:       stats?.revoked,
      icon:        Ban,
      href:        '/permits?status=REVOKED',
      accentColor: 'border-l-gray-400',
      bgColor:     'bg-gray-50',
      textColor:   'text-gray-500',
    },
  ];

  return (
    <div className="flex gap-4 flex-wrap lg:flex-nowrap">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} isLoading={isLoading} isError={isError} />
      ))}
    </div>
  );
}
