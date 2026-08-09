import { z } from 'zod';

const permitStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'] as const;
const permitTypes   = ['WORK', 'ACCESS', 'ACTIVITY', 'SAFETY', 'OTHER'] as const;
const sortColumns   = ['title', 'type', 'applicant_name', 'status', 'start_date', 'end_date', 'created_at'] as const;

export const createPermitSchema = z.object({
  title: z
    .string()
    .min(1, "Field 'title' is required.")
    .max(255, "'title' must not exceed 255 characters."),
  type: z.enum(permitTypes, { error: 'Invalid permit type.' }),
  applicant_name: z
    .string()
    .min(1, "Field 'applicant_name' is required.")
    .max(255, "'applicant_name' must not exceed 255 characters."),
  description: z
    .string()
    .min(1, "Field 'description' is required.")
    .max(2000, "'description' must not exceed 2000 characters."),
  start_date: z
    .string()
    .min(1, "Field 'start_date' is required.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be in YYYY-MM-DD format."),
  end_date: z
    .string()
    .min(1, "Field 'end_date' is required.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "end_date must be in YYYY-MM-DD format."),
  notes: z.string().max(1000, "'notes' must not exceed 1000 characters.").optional().nullable(),
}).refine(
  (d) => new Date(d.end_date) >= new Date(d.start_date),
  { message: 'End date must be on or after the start date.', path: ['end_date'] }
);

export const approveSchema = z.object({
  notes: z.string().max(500).optional().nullable(),
});

export const rejectSchema = z.object({
  reason: z.string().max(500).optional().nullable(),
});

export const revokeSchema = z.object({
  reason: z.string().max(500).optional().nullable(),
});

export const listQuerySchema = z.object({
  search: z.string().max(100).optional(),
  status: z.enum(permitStatuses).optional(),
  type:   z.enum(permitTypes).optional(),
  start_date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_date_to:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sort:  z.enum(sortColumns).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreatePermitInput  = z.infer<typeof createPermitSchema>;
export type ApproveInput       = z.infer<typeof approveSchema>;
export type RejectInput        = z.infer<typeof rejectSchema>;
export type RevokeInput        = z.infer<typeof revokeSchema>;
export type ListQueryInput     = z.infer<typeof listQuerySchema>;
