const BASE = '';  // Same origin — Next.js handles routing

type ApiEnvelope<T> = { data: T; error: null; meta: Record<string, unknown> } | { data: null; error: { code: string; message: string; details?: Array<{ field: string; message: string }> }; meta: Record<string, unknown> };

async function request<T>(path: string, options?: RequestInit): Promise<ApiEnvelope<T>> {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  return res.json() as Promise<ApiEnvelope<T>>;
}

export interface UserProfile { id: string; email: string; name: string }

export interface PermitSummary {
  id: string; title: string; type: string; applicant_name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
  start_date: string; end_date: string; created_at: string; updated_at: string;
}

export interface HistoryEntry {
  id: string; status: string; event: string; actor_name: string; notes: string | null; created_at: string;
}

export interface PermitDetail extends PermitSummary {
  description: string; notes: string | null;
  rejection_reason: string | null; revocation_reason: string | null;
  created_by: string;
  status_history: HistoryEntry[];
}

export interface PermitStats { total: number; pending: number; approved: number; rejected: number; revoked: number }

export interface CreatePermitInput {
  title: string; type: string; applicant_name: string;
  description: string; notes?: string | null;
  start_date: string; end_date: string;
}

export interface ListMeta { total: number; page: number; limit: number; totalPages: number }

export const apiClient = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: UserProfile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: () => request<{ message: string }>('/api/auth/logout', { method: 'POST' }),
    me: () => request<UserProfile>('/api/auth/me'),
  },
  permits: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ items: PermitSummary[] }>(`/api/permits${qs}`);
    },
    getById: (id: string) => request<PermitDetail>(`/api/permits/${id}`),
    create: (data: CreatePermitInput) =>
      request<PermitDetail>('/api/permits', { method: 'POST', body: JSON.stringify(data) }),
    approve: (id: string, notes?: string | null) =>
      request<PermitDetail>(`/api/permits/${id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ notes: notes ?? null }),
      }),
    reject: (id: string, reason?: string | null) =>
      request<PermitDetail>(`/api/permits/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: reason ?? null }),
      }),
    revoke: (id: string, reason?: string | null) =>
      request<PermitDetail>(`/api/permits/${id}/revoke`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: reason ?? null }),
      }),
    stats: () => request<PermitStats>('/api/permits/stats'),
  },
};
