'use client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckCircle2, XCircle, Ban } from 'lucide-react';
import type { PermitDetail } from '@/lib/api-client';

interface PermitDetailHeaderProps {
  permit: PermitDetail;
  onApprove: () => void;
  onReject: () => void;
  onRevoke: () => void;
}

export function PermitDetailHeader({ permit, onApprove, onReject, onRevoke }: PermitDetailHeaderProps) {
  const { status, title, type, id } = permit;
  const isTerminal = status === 'REJECTED' || status === 'REVOKED';

  const TYPE_LABELS: Record<string, string> = {
    WORK: 'Work Permit', ACCESS: 'Access Permit', ACTIVITY: 'Activity Authorization',
    SAFETY: 'Safety Permit', OTHER: 'Other',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight flex-1">{title}</h1>
        <StatusBadge status={status} size="lg" />
      </div>

      {/* Subtitle */}
      <p className="text-sm text-gray-500 mb-5">
        {TYPE_LABELS[type] ?? type}
        <span className="mx-2 text-gray-300">·</span>
        Ref: {id.slice(0, 8).toUpperCase()}
      </p>

      {/* Action buttons */}
      {status === 'PENDING' && (
        <div className="flex items-center gap-3">
          <button
            onClick={onApprove}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Approve
          </button>
          <button
            onClick={onReject}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
            Reject
          </button>
        </div>
      )}

      {status === 'APPROVED' && (
        <div>
          <button
            onClick={onRevoke}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
          >
            <Ban className="w-4 h-4" aria-hidden="true" />
            Revoke
          </button>
        </div>
      )}

      {isTerminal && (
        <p className="text-sm text-gray-400 italic">
          This permit is in a terminal state and cannot be modified.
        </p>
      )}
    </div>
  );
}
