'use client';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import type { PermitDetail } from '@/lib/api-client';

const TYPE_LABELS: Record<string, string> = {
  WORK: 'Work Permit', ACCESS: 'Access Permit', ACTIVITY: 'Activity Authorization',
  SAFETY: 'Safety Permit', OTHER: 'Other',
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</dt>
      <dd className="text-sm text-gray-800">{value || <span className="text-gray-400 italic">—</span>}</dd>
    </div>
  );
}

function formatDate(iso: string) {
  try { return format(new Date(iso), 'dd MMM yyyy'); } catch { return iso; }
}

function formatDateTime(iso: string) {
  try { return format(new Date(iso), 'dd MMM yyyy, HH:mm'); } catch { return iso; }
}

interface PermitDetailFieldsProps { permit: PermitDetail }

export function PermitDetailFields({ permit }: PermitDetailFieldsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Left column — Permit Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">Permit Information</h2>
        <dl className="space-y-5">
          <Field label="Applicant Name" value={permit.applicant_name} />
          <Field label="Permit Type" value={TYPE_LABELS[permit.type] ?? permit.type} />
          <Field
            label="Description / Purpose"
            value={<p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{permit.description}</p>}
          />
          {permit.notes && (
            <Field
              label="Additional Notes"
              value={<p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{permit.notes}</p>}
            />
          )}
        </dl>
      </div>

      {/* Right column — Dates & Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">Dates &amp; Status</h2>
        <dl className="space-y-5">
          <Field label="Start Date" value={formatDate(permit.start_date)} />
          <Field label="End Date" value={formatDate(permit.end_date)} />
          <Field label="Created" value={formatDateTime(permit.created_at)} />
          <Field label="Last Updated" value={formatDateTime(permit.updated_at)} />
        </dl>

        {/* Rejection Reason — red alert */}
        {permit.status === 'REJECTED' && permit.rejection_reason && (
          <div className="mt-5 rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Rejection Reason
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{permit.rejection_reason}</p>
          </div>
        )}

        {/* Revocation Reason — amber alert */}
        {permit.status === 'REVOKED' && permit.revocation_reason && (
          <div className="mt-5 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Revocation Reason
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{permit.revocation_reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
