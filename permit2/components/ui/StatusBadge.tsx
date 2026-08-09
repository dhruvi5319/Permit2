'use client';

type PermitStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';

const STATUS_STYLES: Record<PermitStatus, { bg: string; text: string; label: string }> = {
  PENDING:  { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Pending'  },
  APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Approved' },
  REJECTED: { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Rejected' },
  REVOKED:  { bg: 'bg-gray-100',    text: 'text-gray-600',    label: 'Revoked'  },
};

interface StatusBadgeProps {
  status: PermitStatus;
  size?: 'sm' | 'lg';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const { bg, text, label } = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  const padding = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${bg} ${text} ${padding}`}>
      {label}
    </span>
  );
}
