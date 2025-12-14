'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { sendJobNotification } from '@/lib/notification-helper'

const jobSchema = z.object({
  title: z.string().min(3, 'İş başlığı en az 3 karakter olmalıdır'),
  description: z.string().optional(),
  customerId: z.string().min(1, 'Müşteri seçilmelidir'),
  teamId: z.string().optional().nullable(),
  workerId: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  location: z.string().optional(),
  scheduledDate: z.string().optional(), // ISO date string
  scheduledEndDate: z.string().optional(), // ISO date string
  steps: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    subSteps: z.array(z.object({
      title: z.string()
    })).optional()
  })).optional().nullable()
})

export type CreateJobState = {
  success?: boolean
  error?: string
  errors?: Record<string, string[]>
}

export async function createJob(prevState: CreateJobState, formData: FormData): Promise<CreateJobState> {
  // This is a placeholder for form action if needed, but we use createJobAction directly
  return { error: 'Not implemented for direct form action' }
}

// Redefining to be called directly from Client Component (RHF submit handler)
export async function createJobAction(data: z.infer<typeof jobSchema>) {
  const session = await auth()

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    throw new Error('Yetkisiz işlem')
  }

  const validated = jobSchema.safeParse(data)

  if (!validated.success) {
    throw new Error('Geçersiz veri: ' + JSON.stringify(validated.error.flatten()))
  }

  const {
    title,
    description,
    customerId,
    teamId,
    priority,
    location,
    scheduledDate,
    scheduledEndDate,
    steps,
    workerId
  } = validated.data

  try {
    const job = await prisma.$transaction(async (tx) => {
      const createdJob = await tx.job.create({
        data: {
          title,
          description,
          customerId,
          creatorId: session.user.id,
          priority,
          location,
          status: 'PENDING',
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          scheduledEndDate: scheduledEndDate ? new Date(scheduledEndDate) : null,
        }
      })

      // Assign Team or Worker
      if ((teamId && teamId !== 'none') || (workerId && workerId !== 'none')) {
        await tx.jobAssignment.create({
          data: {
            jobId: createdJob.id,
            teamId: teamId === 'none' ? undefined : teamId,
            workerId: workerId === 'none' ? undefined : workerId
          }
        })
      }

      // Create Steps
      if (steps && steps.length > 0) {
        for (let i = 0; i < steps.length; i++) {
          const stepData = steps[i]
          const step = await tx.jobStep.create({
            data: {
              jobId: createdJob.id,
              title: stepData.title,
              description: stepData.description,
              order: i + 1,
            }
          })

          if (stepData.subSteps && stepData.subSteps.length > 0) {
            await tx.jobSubStep.createMany({
              data: stepData.subSteps.map((sub, j) => ({
                stepId: step.id,
                title: sub.title,
                order: j + 1
              }))
            })
          }
        }
      }
      return createdJob
    })

    // Send Notification after transaction commits
    if ((teamId && teamId !== 'none') || (workerId && workerId !== 'none')) {
      await sendJobNotification(
        job.id,
        'Yeni İş Atandı',
        `"${job.title}" başlıklı yeni bir iş size atandı.`,
        'INFO',
        `/worker/jobs/${job.id}`
      );
    }

    revalidatePath('/admin/jobs')
    return { success: true }
  } catch (error) {
    console.error('Job creation error:', error)
    throw new Error('İş oluşturulurken bir hata oluştu')
  }
}
