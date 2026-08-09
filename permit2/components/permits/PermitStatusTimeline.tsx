'use client';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { HistoryEntry } from '@/lib/api-client';

const EVENT_LABELS: Record<string, string> = {
  CREATED: 'Created', APPROVED: 'Approved', REJECTED: 'Rejected', REVOKED: 'Revoked',
};

const DOT_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-400', APPROVED: 'bg-emerald-500', REJECTED: 'bg-red-500', REVOKED: 'bg-gray-400',
};

interface PermitStatusTimelineProps { history: HistoryEntry[] }

export function PermitStatusTimeline({ history }: PermitStatusTimelineProps) {
  const sorted = [...history].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-6">Status History</h2>

      {sorted.length === 0 && (
        <p className="text-sm text-gray-400 italic">No history available.</p>
      )}

      <ol className="relative">
        {sorted.map((event, idx) => {
          const isLast = idx === sorted.length - 1;
          const dotColor = DOT_COLORS[event.status] ?? 'bg-gray-300';
          let timestamp = event.created_at;
          try { timestamp = format(new Date(event.created_at), 'dd MMM yyyy, HH:mm'); } catch { /* use raw */ }

          return (
            <li key={event.id} className="relative pl-7 pb-6 last:pb-0">
              {/* Vertical connector line */}
              {!isLast && (
                <span className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-gray-200" aria-hidden="true" />
              )}
              {/* Dot */}
              <span
                className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full ${dotColor} ring-2 ring-white`}
                aria-hidden="true"
              />

              <div className="flex flex-wrap items-center gap-2 mb-1">
                <StatusBadge status={event.status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED'} />
                <span className="text-sm font-medium text-gray-700">
                  {EVENT_LABELS[event.event] ?? event.event}
                </span>
              </div>
              <p className="text-xs text-gray-500">by {event.actor_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{timestamp}</p>
              {event.notes && (
                <p className="text-xs text-gray-500 mt-1.5 italic">&ldquo;{event.notes}&rdquo;</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
