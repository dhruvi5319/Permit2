'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { PermitForm, type PermitFormData } from '@/components/permits/PermitForm';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api-client';

export default function NewPermitPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(data: PermitFormData) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiClient.permits.create({
        title:          data.title,
        type:           data.type,
        applicant_name: data.applicant_name,
        description:    data.description,
        notes:          data.notes || null,
        start_date:     data.start_date,
        end_date:       data.end_date,
      });
      if (res.error) {
        const fieldErrors = res.error.details?.map((d) => d.message).join(', ');
        setSubmitError(fieldErrors ? `Permit could not be created: ${fieldErrors}` : (res.error.message ?? 'An unexpected error occurred.'));
        return;
      }
      toast.success('Permit created successfully.');
      // Navigate to new permit's detail page
      router.push(`/permits/${res.data.id}`);
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <Link href="/permits" className="hover:text-gray-700 transition-colors">Permits</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <span className="text-gray-400" aria-current="page">New Permit</span>
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Permit</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to submit a new permit request.</p>
      </div>

      {/* Form card */}
      <div className="max-w-[720px] bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <PermitForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </div>
    </div>
  );
}
