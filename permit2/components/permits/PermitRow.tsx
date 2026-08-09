import Link from 'next/link';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { PermitSummary } from '@/lib/types/permit';
import { PERMIT_TYPE_LABELS } from '@/lib/types/permit';

interface PermitRowProps {
  permit: PermitSummary;
}

function ActionLinks({ permit }: { permit: PermitSummary }) {
  return (
    <div className="flex items-center gap-2 text-sm border-l border-gray-100 pl-2">
      <Link href={`/permits/${permit.id}`} className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
        View
      </Link>
      {permit.status === 'PENDING' && (
        <>
          <span className="text-gray-200">·</span>
          <Link href={`/permits/${permit.id}?action=approve`} className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
            Approve
          </Link>
          <span className="text-gray-200">·</span>
          <Link href={`/permits/${permit.id}?action=reject`} className="text-red-600 hover:text-red-700 font-medium transition-colors">
            Reject
          </Link>
        </>
      )}
      {permit.status === 'APPROVED' && (
        <>
          <span className="text-gray-200">·</span>
          <Link href={`/permits/${permit.id}?action=revoke`} className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
            Revoke
          </Link>
        </>
      )}
    </div>
  );
}

export function PermitRow({ permit }: PermitRowProps) {
  const formatDate = (dateStr: string) => {
    try { return format(new Date(dateStr), 'dd MMM yyyy'); }
    catch { return '—'; }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer group">
      {/* Reference */}
      <td className="px-4 py-3 w-20">
        <span className="text-xs font-mono text-gray-400">{permit.id.slice(0, 8)}</span>
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <Link
          href={`/permits/${permit.id}`}
          className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors truncate block max-w-xs"
          title={permit.title}
          onClick={(e) => e.stopPropagation()}
        >
          {permit.title.length > 50 ? `${permit.title.slice(0, 50)}…` : permit.title}
        </Link>
      </td>

      {/* Type */}
      <td className="px-4 py-3 w-36">
        <span className="text-sm text-gray-600">{PERMIT_TYPE_LABELS[permit.type]}</span>
      </td>

      {/* Applicant */}
      <td className="px-4 py-3 w-36">
        <span className="text-sm text-gray-700">{permit.applicant_name}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 w-32">
        <StatusBadge status={permit.status} />
      </td>

      {/* Start Date */}
      <td className="px-4 py-3 w-28">
        <span className="text-sm text-gray-500">{formatDate(permit.start_date)}</span>
      </td>

      {/* End Date */}
      <td className="px-4 py-3 w-28">
        <span className="text-sm text-gray-500">{formatDate(permit.end_date)}</span>
      </td>

      {/* Created */}
      <td className="px-4 py-3 w-28">
        <span className="text-sm text-gray-500">{formatDate(permit.created_at)}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 w-44" onClick={(e) => e.stopPropagation()}>
        <ActionLinks permit={permit} />
      </td>
    </tr>
  );
}
