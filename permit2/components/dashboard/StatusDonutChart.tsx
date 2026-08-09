'use client';

import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { PermitStats } from '@/lib/types/permit';

const STATUS_CONFIG = [
  { key: 'approved' as const, label: 'Approved', color: '#059669', status: 'APPROVED' },
  { key: 'pending'  as const, label: 'Pending',  color: '#D97706', status: 'PENDING'  },
  { key: 'rejected' as const, label: 'Rejected', color: '#DC2626', status: 'REJECTED' },
  { key: 'revoked'  as const, label: 'Revoked',  color: '#6B7280', status: 'REVOKED'  },
];

interface StatusDonutChartProps {
  stats?: PermitStats;
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: { total: number };
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const pct = item.payload.total > 0 ? Math.round((item.value / item.payload.total) * 100) : 0;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-gray-900">{item.name}</p>
      <p className="text-gray-500">{item.value} permits ({pct}%)</p>
    </div>
  );
};

export function StatusDonutChart({ stats }: StatusDonutChartProps) {
  const router = useRouter();
  const total  = stats?.total ?? 0;

  const data = STATUS_CONFIG.map((cfg) => ({
    name:   cfg.label,
    value:  stats?.[cfg.key] ?? 0,
    color:  cfg.color,
    status: cfg.status,
    total,
  })).filter((d) => d.value > 0);

  if (!stats || total === 0) {
    return (
      <div className="flex items-center justify-center h-60 text-sm text-gray-400">
        No permit data available
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-60 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              dataKey="value"
              onClick={(entry) => router.push(`/permits?status=${(entry as unknown as { status: string }).status}`)}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-gray-900">{total}</span>
          <span className="text-xs text-gray-500 mt-0.5">Permits</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
        {STATUS_CONFIG.map((cfg) => {
          const count = stats?.[cfg.key] ?? 0;
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={cfg.key}
              onClick={() => router.push(`/permits?status=${cfg.status}`)}
              className="flex items-center gap-2 text-left hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
              <span className="text-sm text-gray-700 flex-1">{cfg.label}</span>
              <span className="text-sm font-medium text-gray-900">{count}</span>
              <span className="text-xs text-gray-400 w-9 text-right">{pct}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
