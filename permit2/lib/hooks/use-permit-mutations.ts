'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useApprovePermit(permitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ notes }: { notes?: string | null }) => apiClient.permits.approve(permitId, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permit', permitId] });
      qc.invalidateQueries({ queryKey: ['permits'] });
      qc.invalidateQueries({ queryKey: ['permits', 'stats'] });
    },
  });
}

export function useRejectPermit(permitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reason }: { reason?: string | null }) => apiClient.permits.reject(permitId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permit', permitId] });
      qc.invalidateQueries({ queryKey: ['permits'] });
      qc.invalidateQueries({ queryKey: ['permits', 'stats'] });
    },
  });
}

export function useRevokePermit(permitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reason }: { reason?: string | null }) => apiClient.permits.revoke(permitId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permit', permitId] });
      qc.invalidateQueries({ queryKey: ['permits'] });
      qc.invalidateQueries({ queryKey: ['permits', 'stats'] });
    },
  });
}

export function useCreatePermit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof apiClient.permits.create>[0]) => apiClient.permits.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permits'] });
      qc.invalidateQueries({ queryKey: ['permits', 'stats'] });
    },
  });
}
