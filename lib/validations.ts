import { z } from 'zod'

// Error Messages
const ERROR_MESSAGES = {
  EMAIL_INVALID: 'Geçerli bir e-posta adresi giriniz',
  PASSWORD_MIN: 'Şifre en az 6 karakter olmalıdır',
  NAME_MIN: 'İsim en az 2 karakter olmalıdır',
  TITLE_MIN_3: 'Başlık en az 3 karakter olmalıdır',
  TITLE_MAX_100: 'Başlık en fazla 100 karakter olabilir',
  CUSTOMER_REQUIRED: 'Geçerli bir müşteri seçiniz',
  CUSTOMER_NAME_MIN: 'Müşteri adı en az 2 karakter olmalıdır',
  TEAM_NAME_MIN: 'Takım adı en az 2 karakter olmalıdır',
  TEAM_LEAD_REQUIRED: 'Geçerli bir takım lideri seçiniz',
  TITLE_REQUIRED: 'Başlık gereklidir',
  SCHEDULED_DATE_REQUIRED: 'Planlanan tarih gereklidir',
  STEP_TITLE_REQUIRED: 'Adım başlığı gereklidir',
  SUBSTEP_TITLE_REQUIRED: 'Alt adım başlığı gereklidir',
  TITLE_MIN_2: 'Başlık en az 2 karakter olmalıdır',
};

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.EMAIL_INVALID),
  password: z.string().min(6, ERROR_MESSAGES.PASSWORD_MIN),
})

export const registerSchema = z.object({
  name: z.string().min(2, ERROR_MESSAGES.NAME_MIN),
  email: z.string().email(ERROR_MESSAGES.EMAIL_INVALID),
  password: z.string().min(6, ERROR_MESSAGES.PASSWORD_MIN),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'TEAM_LEAD', 'WORKER', 'CUSTOMER']),
})

// Job Schemas
const baseJobSchema = z.object({
  title: z.string().min(3, ERROR_MESSAGES.TITLE_MIN_3).max(100, ERROR_MESSAGES.TITLE_MAX_100),
  description: z.string().optional(),
  customerId: z.string().cuid(ERROR_MESSAGES.CUSTOMER_REQUIRED),
  teamId: z.string().cuid().optional(),
})

export const jobSchema = baseJobSchema.extend({
  estimatedHours: z.number().int().positive().optional(),
  startDate: z.date().optional(),
})

export const jobStepSchema = z.object({
  title: z.string().min(2, ERROR_MESSAGES.TITLE_MIN_2),
  description: z.string().optional(),
  stepOrder: z.number().int().positive(),
})

export const updateJobStepSchema = z.object({
  isCompleted: z.boolean(),
  notes: z.string().optional(),
})

// User Schemas
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
})

// Team Schemas
export const createTeamSchema = z.object({
  name: z.string().min(2, ERROR_MESSAGES.TEAM_NAME_MIN),
  leadId: z.string().cuid(ERROR_MESSAGES.TEAM_LEAD_REQUIRED),
  description: z.string().optional(),
})

// Customer Schemas
export const createCustomerSchema = z.object({
  name: z.string().min(2, ERROR_MESSAGES.CUSTOMER_NAME_MIN),
  email: z.string().email(ERROR_MESSAGES.EMAIL_INVALID),
  password: z.string().min(6, ERROR_MESSAGES.PASSWORD_MIN),
  company: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
})

// Notification Schema
export const createNotificationSchema = z.object({
  userId: z.string().cuid(),
  jobId: z.string().cuid().optional(),
  title: z.string().min(1),
  message: z.string().min(1),
})

// Approval Schema
export const createApprovalSchema = z.object({
  jobId: z.string().cuid(),
  requesterId: z.string().cuid(),
  approverId: z.string().cuid(),
  notes: z.string().optional(),
})

export const updateApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
})

// Cost Tracking Schema
export const createCostTrackingSchema = z.object({
  jobId: z.string().cuid(),
  teamId: z.string().cuid(),
  hoursWorked: z.number().positive(),
  cost: z.number().positive(),
  notes: z.string().optional(),
})

// Job Creation Schema
export const jobCreationSchema = baseJobSchema.extend({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  location: z.string().optional(),
  scheduledDate: z.string().min(1, ERROR_MESSAGES.SCHEDULED_DATE_REQUIRED),
  steps: z.array(z.object({
    title: z.string().min(1, ERROR_MESSAGES.STEP_TITLE_REQUIRED),
    description: z.string().optional(),
    order: z.number().optional(),
    subSteps: z.array(z.object({
      title: z.string().min(1, ERROR_MESSAGES.SUBSTEP_TITLE_REQUIRED),
      description: z.string().optional(),
      order: z.number().optional()
    })).optional()
  })).optional().nullable()
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type JobInput = z.infer<typeof jobSchema>
export type JobStepInput = z.infer<typeof jobStepSchema>
export type UpdateJobStepInput = z.infer<typeof updateJobStepSchema>
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>
