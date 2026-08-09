'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { usePermit } from '@/lib/hooks/use-permit';
import { useApprovePermit, useRejectPermit, useRevokePermit } from '@/lib/hooks/use-permit-mutations';
import { useToast } from '@/components/ui/Toast';
import { PermitDetailHeader } from '@/components/permits/PermitDetailHeader';
import { PermitDetailFields } from '@/components/permits/PermitDetailFields';
import { PermitStatusTimeline } from '@/components/permits/PermitStatusTimeline';
import { ActionDialog } from '@/components/permits/ActionDialog';
import { Skeleton } from '@/components/ui/Skeleton';

type DialogAction = 'approve' | 'reject' | 'revoke' | null;

// Valid transitions per status
const VALID_ACTIONS: Record<string, DialogAction[]> = {
  PENDING:  ['approve', 'reject'],
  APPROVED: ['revoke'],
  REJECTED: [],
  REVOKED:  [],
};

export default function PermitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const { data: permit, isLoading, error, refetch } = usePermit(id);
  const approveMutation  = useApprovePermit(id);
  const rejectMutation   = useRejectPermit(id);
  const revokeMutation   = useRevokePermit(id);

  const [openDialog, setOpenDialog] = useState<DialogAction>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Auto-open dialog from ?action= param
  useEffect(() => {
    if (!permit) return;
    const action = searchParams.get('action') as DialogAction;
    if (!action) return;
    const valid = VALID_ACTIONS[permit.status] ?? [];
    if (valid.includes(action)) {
      setOpenDialog(action);
    } else {
      toast.info('This action is not available for the current permit status.');
    }
    // Remove action param from URL without re-navigation
    const url = new URL(window.location.href);
    url.searchParams.delete('action');
    window.history.replaceState({}, '', url.toString());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permit, searchParams]);

  function handleOpenDialog(action: DialogAction) {
    setDialogError(null);
    setOpenDialog(action);
  }

  function handleCloseDialog() {
    if (
      (openDialog === 'approve' && approveMutation.isPending) ||
      (openDialog === 'reject'  && rejectMutation.isPending)  ||
      (openDialog === 'revoke'  && revokeMutation.isPending)
    ) {
      return; // Non-dismissible during loading
    }
    setOpenDialog(null);
    setDialogError(null);
  }

  async function handleConfirm(reason?: string) {
    if (!openDialog || !permit) return;
    setDialogError(null);

    try {
      let res;
      if (openDialog === 'approve') {
        res = await approveMutation.mutateAsync({ notes: reason ?? null });
      } else if (openDialog === 'reject') {
        res = await rejectMutation.mutateAsync({ reason: reason ?? null });
      } else if (openDialog === 'revoke') {
        res = await revokeMutation.mutateAsync({ reason: reason ?? null });
      } else {
        return;
      }

      if (res?.error) {
        setDialogError(res.error.message ?? 'Action failed. Please try again.');
        return;
      }

      setOpenDialog(null);
      setDialogError(null);

      // Toast messages per UX-Mockup Pattern 02 copy reference
      const toastMessages: Record<string, string> = {
        approve: 'Permit approved successfully.',
        reject:  'Permit rejected.',
        revoke:  'Permit revoked.',
      };
      toast.success(toastMessages[openDialog] ?? 'Action completed.');
    } catch {
      setDialogError('Action failed. Please try again.');
    }
  }

  const isDialogLoading =
    approveMutation.isPending || rejectMutation.isPending || revokeMutation.isPending;

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Loading permit details…">
        {/* Breadcrumb skeleton */}
        <Skeleton className="h-4 w-64 mb-6 rounded" />
        {/* Header card skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <Skeleton className="h-8 w-3/4 mb-3 rounded" />
          <Skeleton className="h-4 w-48 mb-5 rounded" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
        {/* Details grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j}>
                  <Skeleton className="h-3 w-24 mb-1.5 rounded" />
                  <Skeleton className="h-5 w-48 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Timeline skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-3.5 w-3.5 rounded-full flex-shrink-0 mt-1" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-3 w-40 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 404 state ────────────────────────────────────────────────────────────
  if (permit === null) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-300 mb-4" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Permit Not Found</h1>
        <p className="text-sm text-gray-500 mb-6">The permit you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
        <Link
          href="/permits"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Permits
        </Link>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error && !permit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-red-300 mb-4" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Could not load permit details.</h1>
        <button
          onClick={() => refetch()}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!permit) return null;

  const titleTruncated = permit.title.length > 40 ? permit.title.slice(0, 40) + '…' : permit.title;

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 mb-2">
        <Link href="/dashboard" className="hover:text-gray-700 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <Link href="/permits" className="hover:text-gray-700 transition-colors">Permits</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <span className="text-gray-400 truncate" aria-current="page" title={permit.title}>{titleTruncated}</span>
      </nav>

      {/* Back link */}
      <Link
        href="/permits"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Permits
      </Link>

      {/* Permit header */}
      <PermitDetailHeader
        permit={permit}
        onApprove={() => handleOpenDialog('approve')}
        onReject={() => handleOpenDialog('reject')}
        onRevoke={() => handleOpenDialog('revoke')}
      />

      {/* Details grid */}
      <PermitDetailFields permit={permit} />

      {/* Status history timeline */}
      <PermitStatusTimeline history={permit.status_history} />

      {/* Action dialogs */}
      {openDialog && (
        <ActionDialog
          action={openDialog}
          permitTitle={permit.title}
          isOpen={true}
          isLoading={isDialogLoading}
          error={dialogError}
          onConfirm={handleConfirm}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
