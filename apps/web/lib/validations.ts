import { z } from 'zod'
import { sanitizeHtml } from './security'
import * as edge from './validations-edge'

// Re-export everything from edge
export * from './validations-edge'

// Job Schemas with Sanitization
export const jobSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır').max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: z.string().optional().transform(val => val ? sanitizeHtml(val) : val),
  customerId: z.string().cuid('Geçerli bir müşteri seçiniz'),
  teamId: z.string().cuid().optional(),
  estimatedHours: z.number().int().positive().optional(),
  startDate: z.date().optional(),
})

export const jobStepSchema = z.object({
  title: z.string().min(2, 'Başlık en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  stepOrder: z.number().int().positive(),
})

export const updateJobStepSchema = z.object({
  isCompleted: z.boolean(),
  notes: z.string().optional().transform(val => val ? sanitizeHtml(val) : val),
})

// Job Creation Schema
export const jobCreationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().transform(val => val ? sanitizeHtml(val) : val),
  customerId: z.string().min(1, 'Customer is required'),
  teamId: z.string().optional(),
  workerId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  location: z.string().optional(),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  steps: z.array(z.object({
    title: z.string().min(1, 'Step title is required'),
    description: z.string().optional().transform(val => val ? sanitizeHtml(val) : val),
    order: z.number().optional(),
    subSteps: z.array(z.object({
      title: z.string().min(1, 'Sub-step title is required'),
      description: z.string().optional().transform(val => val ? sanitizeHtml(val) : val),
      order: z.number().optional()
    })).optional()
  })).optional().nullable()
})

export type JobInput = z.infer<typeof jobSchema>
export type JobStepInput = z.infer<typeof jobStepSchema>
export type UpdateJobStepInput = z.infer<typeof updateJobStepSchema>