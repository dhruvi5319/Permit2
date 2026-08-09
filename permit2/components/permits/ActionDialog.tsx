'use client';
import { useEffect, useRef, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

type DialogAction = 'approve' | 'reject' | 'revoke';

interface ActionDialogProps {
  action: DialogAction;
  permitTitle: string;
  isOpen: boolean;
  isLoading: boolean;
  error?: string | null;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

const DIALOG_CONFIG: Record<DialogAction, {
  title: string;
  body: (title: string) => string;
  confirmLabel: string;
  confirmClass: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}> = {
  approve: {
    title: 'Approve Permit?',
    body: (t) => `This will mark the permit "${t}" as Approved and activate it. This action cannot be undone.`,
    confirmLabel: '✓ Approve Permit',
    confirmClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    reasonLabel: 'Approval Notes (optional)',
    reasonPlaceholder: 'Add any notes about this approval…',
  },
  reject: {
    title: 'Reject Permit?',
    body: (t) => `This will mark the permit "${t}" as Rejected. The applicant will not be authorized.`,
    confirmLabel: '✗ Reject Permit',
    confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    reasonLabel: 'Rejection Reason (optional)',
    reasonPlaceholder: 'Provide a reason for rejection… (max 500 characters)',
  },
  revoke: {
    title: 'Revoke Permit?',
    body: (t) => `This will immediately deactivate the permit "${t}". The permit will no longer be valid.`,
    confirmLabel: '⊘ Revoke Permit',
    confirmClass: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
    reasonLabel: 'Revocation Reason (optional)',
    reasonPlaceholder: 'Provide a reason for revocation… (max 500 characters)',
  },
};

export function ActionDialog({
  action, permitTitle, isOpen, isLoading, error, onConfirm, onClose,
}: ActionDialogProps) {
  const [reason, setReason] = useState('');
  const config = DIALOG_CONFIG[action];
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Reset reason on open
  useEffect(() => {
    if (isOpen) {
      setReason('');
      // Focus cancel button on open (safer than confirm for destructive actions)
      setTimeout(() => cancelBtnRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Escape key to close (only when not loading)
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isLoading) onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  function handleBackdropClick() {
    if (!isLoading) onClose();
  }

  function handleConfirm() {
    onConfirm(reason || undefined);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-[480px] p-6"
        style={{ animation: 'dialog-open 150ms ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="dialog-title" className="text-lg font-semibold text-gray-900">
            {config.title}
          </h2>
          {!isLoading && (
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">{config.body(permitTitle)}</p>

        {/* Optional reason textarea */}
        {config.reasonLabel && (
          <div className="mb-5">
            <label htmlFor="action-reason" className="block text-sm font-medium text-gray-700 mb-1.5">
              {config.reasonLabel}
            </label>
            <textarea
              id="action-reason"
              rows={3}
              disabled={isLoading}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={config.reasonPlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 text-right mt-0.5">{reason.length}/500</p>
          </div>
        )}

        {/* Inline error */}
        {error && (
          <div role="alert" className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            ref={cancelBtnRef}
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 ${config.confirmClass}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </>
            ) : (
              config.confirmLabel
            )}
          </button>
        </div>
      </div>

      {/* Dialog open animation */}
      <style>{`
        @keyframes dialog-open {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
