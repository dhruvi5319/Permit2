import type { PermitStatus } from '@/lib/types/permit';
import { PERMIT_STATUS_LABELS } from '@/lib/types/permit';

const STATUS_STYLES: Record<PermitStatus, string> = {
  PENDING:  'bg-amber-100 text-amber-700 border border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 border border-red-200',
  REVOKED:  'bg-gray-100 text-gray-500 border border-gray-200',
};

interface StatusBadgeProps {
  status: PermitStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium leading-none ${STATUS_STYLES[status]} ${className}`}
    >
      {PERMIT_STATUS_LABELS[status]}
    </span>
  );
}
