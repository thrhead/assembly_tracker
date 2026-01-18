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
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    subSteps: z.array(z.object({
      id: z.string().optional(),
      title: z.string()
    })).optional()
  })).optional().nullable()
})

const updateJobSchema = jobSchema.extend({
  id: z.string()
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

export async function updateJobAction(data: z.infer<typeof updateJobSchema>) {
  const session = await auth()

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    throw new Error('Yetkisiz işlem')
  }

  const validated = updateJobSchema.safeParse(data)

  if (!validated.success) {
    throw new Error('Geçersiz veri: ' + JSON.stringify(validated.error.flatten()))
  }

  const {
    id,
    title,
    description,
    customerId,
    teamId,
    workerId,
    priority,
    location,
    scheduledDate,
    scheduledEndDate,
    steps
  } = validated.data

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update Job Basic Info
      await tx.job.update({
        where: { id },
        data: {
          title,
          description,
          customerId,
          priority,
          location,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          scheduledEndDate: scheduledEndDate ? new Date(scheduledEndDate) : null,
        }
      })

      // 2. Update Assignment
      // Delete existing assignments first for simplicity or update?
      // Let's check existing assignment.
      await tx.jobAssignment.deleteMany({ where: { jobId: id } })

      if ((teamId && teamId !== 'none') || (workerId && workerId !== 'none')) {
        await tx.jobAssignment.create({
          data: {
            jobId: id,
            teamId: teamId === 'none' ? undefined : teamId,
            workerId: workerId === 'none' ? undefined : workerId
          }
        })
      }

      // 3. Update Steps
      // We need to handle deletions, updates, and creations.
      // Fetch existing step IDs
      const existingSteps = await tx.jobStep.findMany({
        where: { jobId: id },
        select: { id: true }
      })
      const existingStepIds = existingSteps.map(s => s.id)

      const incomingStepIds = steps?.filter(s => s.id).map(s => s.id!) || []
      const stepsToDelete = existingStepIds.filter(id => !incomingStepIds.includes(id))

      // Delete removed steps
      if (stepsToDelete.length > 0) {
        await tx.jobStep.deleteMany({
          where: { id: { in: stepsToDelete } }
        })
      }

      if (steps && steps.length > 0) {
        for (let i = 0; i < steps.length; i++) {
          const stepData = steps[i]

          let stepId = stepData.id

          if (stepId) {
            // Update existing step
            await tx.jobStep.update({
              where: { id: stepId },
              data: {
                title: stepData.title,
                description: stepData.description,
                order: i + 1
              }
            })
          } else {
            // Create new step
            const newStep = await tx.jobStep.create({
              data: {
                jobId: id,
                title: stepData.title,
                description: stepData.description,
                order: i + 1
              }
            })
            stepId = newStep.id
          }

          // Handle SubSteps
          if (stepData.subSteps) {
            // For sub-steps, simpler to delete all and recreate or handle similarily?
            // Since sub-steps also have completion status, we should try to preserve IDs if possible.
            // But existing schema for substeps in validation allows ID.

            // Fetch existing substeps for THIS step
            const existingSubSteps = await tx.jobSubStep.findMany({
              where: { stepId: stepId },
              select: { id: true }
            })
            const existingSubStepIds = existingSubSteps.map(s => s.id)
            const incomingSubStepIds = stepData.subSteps.filter(s => s.id).map(s => s.id!)
            const subStepsToDelete = existingSubStepIds.filter(sid => !incomingSubStepIds.includes(sid))

            if (subStepsToDelete.length > 0) {
              await tx.jobSubStep.deleteMany({ where: { id: { in: subStepsToDelete } } })
            }

            for (let j = 0; j < stepData.subSteps.length; j++) {
              const subData = stepData.subSteps[j]
              if (subData.id) {
                await tx.jobSubStep.update({
                  where: { id: subData.id },
                  data: { title: subData.title, order: j + 1 }
                })
              } else {
                await tx.jobSubStep.create({
                  data: {
                    stepId: stepId!, // Asserted because we created it or it existed
                    title: subData.title,
                    order: j + 1
                  }
                })
              }
            }
          } else {
            // If no substeps provided, delete all? 
            // Or assumes empty array means delete all.
            await tx.jobSubStep.deleteMany({ where: { stepId: stepId } })
          }
        }
      } else {
        // If steps is empty array or null, delete all steps?
        // But we already handled deletions via ID diff. 
        // If steps is empty, incomingStepIds is empty, so all existingStepIds are deleted. Correct.
      }
    })

    revalidatePath('/admin/jobs')
    revalidatePath(`/admin/jobs/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Job update error:', error)
    throw new Error('İş güncellenirken bir hata oluştu')
  }
}
