'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const PERMIT_TYPES = [
  { value: 'WORK',     label: 'Work Permit' },
  { value: 'ACCESS',   label: 'Access Permit' },
  { value: 'ACTIVITY', label: 'Activity Authorization' },
  { value: 'SAFETY',   label: 'Safety Permit' },
  { value: 'OTHER',    label: 'Other' },
] as const;

const permitFormSchema = z.object({
  title: z.string().min(1, 'Permit title is required.').max(255, 'Title must not exceed 255 characters.'),
  type:  z.enum(['WORK', 'ACCESS', 'ACTIVITY', 'SAFETY', 'OTHER'], {
    error: 'Please select a permit type.',
  }),
  applicant_name: z.string().min(1, 'Applicant name is required.').max(255, 'Name must not exceed 255 characters.'),
  start_date:     z.string().min(1, 'Start date is required.').regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format.'),
  end_date:       z.string().min(1, 'End date is required.').regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format.'),
  description:    z.string().min(1, 'Description is required.').max(2000, 'Description must not exceed 2000 characters.'),
  notes:          z.string().max(1000, 'Notes must not exceed 1000 characters.').optional(),
}).refine(
  (d) => !d.start_date || !d.end_date || new Date(d.end_date) >= new Date(d.start_date),
  { message: 'End date must be on or after the start date.', path: ['end_date'] }
);

export type PermitFormData = z.infer<typeof permitFormSchema>;

interface PermitFormProps {
  onSubmit: (data: PermitFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

// Helper: field wrapper with label, error, and success indicator
function Field({
  label, required, htmlFor, error, touched, children,
}: {
  label: string; required?: boolean; htmlFor: string;
  error?: string; touched?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        {children}
        {touched && !error && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" aria-hidden="true" />
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase = (error?: string, hasSuccess?: boolean) =>
  `w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed ${
    error ? 'border-red-500 bg-red-50' : hasSuccess ? 'border-emerald-500 pr-9' : 'border-gray-300'
  }`;

export function PermitForm({ onSubmit, onCancel, isSubmitting = false, submitError }: PermitFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setFocus,
  } = useForm<PermitFormData>({
    resolver: zodResolver(permitFormSchema),
    mode: 'onBlur',
  });

  async function handleFormSubmit(data: PermitFormData) {
    await onSubmit(data);
  }

  function handleInvalidSubmit() {
    // Scroll to and focus first error field
    const fieldOrder: (keyof PermitFormData)[] = ['title', 'type', 'applicant_name', 'start_date', 'end_date', 'description', 'notes'];
    for (const field of fieldOrder) {
      if (errors[field]) {
        setFocus(field);
        break;
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)} noValidate>
      {/* ── Basic Information ─────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 pb-2 border-b border-gray-100">
          Basic Information
        </h2>
        <div className="space-y-5">
          <Field label="Permit Title" required htmlFor="title" error={errors.title?.message} touched={touchedFields.title && !errors.title}>
            <input
              id="title"
              type="text"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.title}
              placeholder="e.g., Electrical Work — Building A"
              className={inputBase(errors.title?.message, touchedFields.title && !errors.title)}
              {...register('title')}
            />
          </Field>

          <Field label="Permit Type" required htmlFor="type" error={errors.type?.message} touched={touchedFields.type && !errors.type}>
            <select
              id="type"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.type}
              className={inputBase(errors.type?.message, touchedFields.type && !errors.type) + ' appearance-none'}
              {...register('type')}
            >
              <option value="">Select a permit type…</option>
              {PERMIT_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field label="Applicant / Requester Name" required htmlFor="applicant_name" error={errors.applicant_name?.message} touched={touchedFields.applicant_name && !errors.applicant_name}>
            <input
              id="applicant_name"
              type="text"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.applicant_name}
              placeholder="Full name of the permit requester"
              className={inputBase(errors.applicant_name?.message, touchedFields.applicant_name && !errors.applicant_name)}
              {...register('applicant_name')}
            />
          </Field>
        </div>
      </div>

      {/* ── Dates ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 pb-2 border-b border-gray-100">
          Dates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Start Date" required htmlFor="start_date" error={errors.start_date?.message} touched={touchedFields.start_date && !errors.start_date}>
            <input
              id="start_date"
              type="date"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.start_date}
              className={inputBase(errors.start_date?.message, touchedFields.start_date && !errors.start_date)}
              {...register('start_date')}
            />
          </Field>

          <Field label="End Date" required htmlFor="end_date" error={errors.end_date?.message} touched={touchedFields.end_date && !errors.end_date}>
            <input
              id="end_date"
              type="date"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.end_date}
              className={inputBase(errors.end_date?.message, touchedFields.end_date && !errors.end_date)}
              {...register('end_date')}
            />
          </Field>
        </div>
      </div>

      {/* ── Details ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 pb-2 border-b border-gray-100">
          Details
        </h2>
        <div className="space-y-5">
          <Field label="Description / Purpose" required htmlFor="description" error={errors.description?.message} touched={touchedFields.description && !errors.description}>
            <textarea
              id="description"
              rows={4}
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.description}
              placeholder="Describe the purpose of this permit…"
              className={inputBase(errors.description?.message, touchedFields.description && !errors.description) + ' resize-none'}
              {...register('description')}
            />
          </Field>

          <Field label="Additional Notes (optional)" htmlFor="notes" error={errors.notes?.message} touched={touchedFields.notes && !errors.notes}>
            <textarea
              id="notes"
              rows={3}
              disabled={isSubmitting}
              aria-invalid={!!errors.notes}
              placeholder="Any additional information…"
              className={inputBase(errors.notes?.message, touchedFields.notes && !errors.notes) + ' resize-none'}
              {...register('notes')}
            />
          </Field>
        </div>
      </div>

      {/* API error */}
      {submitError && (
        <div role="alert" className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting…
            </>
          ) : (
            'Submit Permit'
          )}
        </button>
      </div>
    </form>
  );
}
