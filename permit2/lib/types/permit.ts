export type PermitStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
export type PermitType   = 'WORK' | 'ACCESS' | 'ACTIVITY' | 'SAFETY' | 'OTHER';

export const PERMIT_TYPE_LABELS: Record<PermitType, string> = {
  WORK:     'Work Permit',
  ACCESS:   'Access Permit',
  ACTIVITY: 'Activity Authorization',
  SAFETY:   'Safety Permit',
  OTHER:    'Other',
};

export const PERMIT_STATUS_LABELS: Record<PermitStatus, string> = {
  PENDING:  'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVOKED:  'Revoked',
};

export interface PermitSummary {
  id: string;
  title: string;
  type: PermitType;
  applicant_name: string;
  status: PermitStatus;
  start_date: string;   // YYYY-MM-DD
  end_date: string;     // YYYY-MM-DD
  created_at: string;   // ISO
  updated_at: string;   // ISO
}

export interface StatusHistoryEntry {
  id: string;
  status: PermitStatus;
  event: string;
  actor_name: string;
  notes: string | null;
  created_at: string;
}

export interface PermitDetail extends PermitSummary {
  description: string;
  notes: string | null;
  rejection_reason: string | null;
  revocation_reason: string | null;
  created_by: string;
  status_history: StatusHistoryEntry[];
}

export interface PermitStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  revoked: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PermitListResponse {
  items: PermitSummary[];
  meta: PaginationMeta;
}

export interface PermitListParams {
  search?: string;
  status?: PermitStatus | '';
  type?: PermitType | '';
  start_date_from?: string;
  start_date_to?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
