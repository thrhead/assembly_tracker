'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { sendJobNotification } from '@/lib/notification-helper'
import { EventBus } from '@/lib/event-bus'
import { sanitizeHtml, stripHtml } from '@/lib/security'
import { generateJobNumber, generateStepNumber, generateSubStepNumber } from '@/lib/utils/job-number'

const jobSchema = z.object({
  title: z.string().min(3, 'İş başlığı en az 3 karakter olmalıdır'),
  projectNo: z.string().optional().nullable(),
  description: z.string().optional(),
  customerId: z.string().min(1, 'Müşteri seçilmelidir'),
  teamId: z.string().optional().nullable(),
  workerId: z.string().optional().nullable(),
  jobLeadId: z.string().optional().nullable(), // Yeni alan
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  location: z.string().optional(),
  scheduledDate: z.string().optional(), // ISO date string
  scheduledEndDate: z.string().optional(), // ISO date string
  budget: z.number().optional().nullable(), // Yeni alan
  estimatedDuration: z.number().optional().nullable(), // Yeni alan
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
  id: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  acceptanceStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
  startedAt: z.string().optional(),
  completedDate: z.string().optional(),
})

export type CreateJobState = {
  success?: boolean
  error?: string
  errors?: Record<string, string[]>
}

export async function createJobAction(prevState: CreateJobState, formData: FormData): Promise<CreateJobState> {
  const session = await auth()

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return { error: 'Yetkisiz işlem' }
  }

  const rawData = {
    title: formData.get('title'),
    projectNo: formData.get('projectNo'),
    description: formData.get('description'),
    customerId: formData.get('customerId'),
    teamId: formData.get('teamId'),
    workerId: formData.get('workerId'),
    jobLeadId: formData.get('jobLeadId'), // Yeni alan
    priority: formData.get('priority'),
    location: formData.get('location'),
    scheduledDate: formData.get('scheduledDate'),
    scheduledEndDate: formData.get('scheduledEndDate'),
    budget: formData.get('budget') ? parseFloat(formData.get('budget') as string) : null,
    estimatedDuration: formData.get('estimatedDuration') ? parseInt(formData.get('estimatedDuration') as string) : null,
    steps: JSON.parse(formData.get('steps') as string || '[]')
  }

  const validated = jobSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as any
    }
  }

  try {
    // Benzersiz iş numarasını üretelim
    const jobNo = await generateJobNumber();

    const job = await prisma.$transaction(async (tx) => {
      // 1. Create Job
      const newJob = await tx.job.create({
        data: {
          jobNo: jobNo,
          projectNo: (validated.data.projectNo && validated.data.projectNo.trim() !== '') 
            ? stripHtml(validated.data.projectNo) 
            : jobNo,
          title: stripHtml(validated.data.title),
          description: validated.data.description ? sanitizeHtml(validated.data.description) : null,
          customerId: validated.data.customerId,
          jobLeadId: validated.data.jobLeadId || null, // Atama
          priority: validated.data.priority,
          location: validated.data.location ? stripHtml(validated.data.location) : null,
          scheduledDate: validated.data.scheduledDate ? new Date(validated.data.scheduledDate) : null,
          scheduledEndDate: validated.data.scheduledEndDate ? new Date(validated.data.scheduledEndDate) : null,
          budget: validated.data.budget,
          estimatedDuration: validated.data.estimatedDuration,
          creatorId: session.user.id,
        }
      })

      // 2. Create Assignment
      if ((validated.data.teamId && validated.data.teamId !== 'none') || (validated.data.workerId && validated.data.workerId !== 'none')) {
        await tx.jobAssignment.create({
          data: {
            jobId: newJob.id,
            teamId: validated.data.teamId === 'none' ? undefined : validated.data.teamId,
            workerId: validated.data.workerId === 'none' ? undefined : validated.data.workerId
          }
        })
      }

      // 3. Create Steps & Substeps
      if (validated.data.steps && validated.data.steps.length > 0) {
        for (let i = 0; i < validated.data.steps.length; i++) {
          const stepOrder = i + 1;
          const stepData = validated.data.steps[i]
          const stepNo = generateStepNumber(jobNo, stepOrder);

          const newStep = await tx.jobStep.create({
            data: {
              jobId: newJob.id,
              stepNo: stepNo,
              title: stripHtml(stepData.title),
              description: stepData.description ? sanitizeHtml(stepData.description) : null,
              order: stepOrder
            }
          })

          if (stepData.subSteps && stepData.subSteps.length > 0) {
            for (let j = 0; j < stepData.subSteps.length; j++) {
              const subStepOrder = j + 1;
              const subStepData = stepData.subSteps[j];
              const subStepNo = generateSubStepNumber(stepNo, subStepOrder);

              await tx.jobSubStep.create({
                data: {
                  stepId: newStep.id,
                  subStepNo: subStepNo,
                  title: stripHtml(subStepData.title),
                  order: subStepOrder
                }
              })
            }
          }
        }
      }

      return newJob
    })

    await EventBus.emit('job.created', job);

    revalidatePath('/admin/jobs')
    return { success: true }
  } catch (error) {
    console.error('Job creation error:', error)
    return { error: 'İş oluşturulurken bir hata oluştu' }
  }
}

export async function updateJobAction(data: z.infer<typeof updateJobSchema>) {
  console.log('updateJobAction called with:', JSON.stringify(data, null, 2))
  const session = await auth()

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    console.log('Unauthorized access attempt:', session?.user?.role)
    throw new Error('Yetkisiz işlem')
  }

  const validated = updateJobSchema.safeParse(data)

  if (!validated.success) {
    console.log('Validation failed:', JSON.stringify(validated.error.flatten(), null, 2))
    throw new Error('Geçersiz veri: ' + JSON.stringify(validated.error.flatten()))
  }

  const {
    id,
    title,
    description,
    customerId,
    teamId,
    workerId,
    jobLeadId, // Yeni alan
    priority,
    projectNo,
    status,
    acceptanceStatus,
    location,
    scheduledDate,
    scheduledEndDate,
    startedAt,
    completedDate,
    budget,
    estimatedDuration,
    steps
  } = validated.data

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update Job Basic Info
      const parseDate = (d: string | undefined | null) => {
        if (!d || d.trim() === '') return null;
        const date = new Date(d);
        return isNaN(date.getTime()) ? null : date;
      };

      await tx.job.update({
        where: { id },
        data: {
          title: title ? stripHtml(title) : undefined,
          description: (description !== undefined) ? (description ? sanitizeHtml(description) : null) : undefined,
          customerId: customerId,
          projectNo: projectNo ? stripHtml(projectNo) : null,
          jobLeadId: jobLeadId || null, // Atama
          priority: priority,
          status: status || undefined,
          acceptanceStatus: acceptanceStatus || undefined,
          location: (location !== undefined) ? (location ? stripHtml(location) : null) : undefined,
          scheduledDate: parseDate(scheduledDate),
          scheduledEndDate: parseDate(scheduledEndDate),
          startedAt: parseDate(startedAt),
          completedDate: parseDate(completedDate),
          budget: budget,
          estimatedDuration: estimatedDuration,
        }
      })

      // 2. Update Assignment
      await tx.jobAssignment.deleteMany({ where: { jobId: id } })

      const effectiveTeamId = (teamId && teamId !== 'none') ? teamId : null;
      const effectiveWorkerId = (workerId && workerId !== 'none') ? workerId : null;

      if (effectiveTeamId || effectiveWorkerId) {
        await tx.jobAssignment.create({
          data: {
            jobId: id,
            teamId: effectiveTeamId,
            workerId: effectiveWorkerId
          }
        })
      }

      // 3. Update Steps
      if (steps !== undefined && steps !== null) {
        const existingSteps = await tx.jobStep.findMany({
          where: { jobId: id },
          select: { id: true }
        })
        const existingStepIds = existingSteps.map(s => s.id)
        const incomingStepIds = steps.filter(s => s.id).map(s => s.id!)

        for (let i = 0; i < steps.length; i++) {
          const stepData = steps[i]
          let stepId = stepData.id

          if (stepId) {
            await tx.jobStep.update({
              where: { id: stepId },
              data: {
                title: stepData.title ? stripHtml(stepData.title) : undefined,
                description: stepData.description ? sanitizeHtml(stepData.description) : (stepData.description === null ? null : undefined),
                order: i + 1
              }
            })
          } else {
            const newStep = await tx.jobStep.create({
              data: {
                jobId: id,
                title: stripHtml(stepData.title),
                description: stepData.description ? sanitizeHtml(stepData.description) : null,
                order: i + 1
              }
            })
            stepId = newStep.id
          }

          if (stepData.subSteps) {
            for (let j = 0; j < stepData.subSteps.length; j++) {
              const subData = stepData.subSteps[j]
              if (subData.id) {
                await tx.jobSubStep.update({
                  where: { id: subData.id },
                  data: { title: stripHtml(subData.title), order: j + 1 }
                })
              } else {
                await tx.jobSubStep.create({
                  data: {
                    stepId: stepId!,
                    title: stripHtml(subData.title),
                    order: j + 1
                  }
                })
              }
            }
          }
        }
      }
    })

    await EventBus.emit('job.updated', { id, status, acceptanceStatus });
    if (status === 'COMPLETED') {
      await EventBus.emit('job.completed', { id });
    }

    revalidatePath('/admin/jobs')
    revalidatePath(`/admin/jobs/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Job update error:', error)
    throw error
  }
}

export async function deleteJobAction(id: string) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Yetkisiz işlem: Sadece yöneticiler iş silebilir.')
  }
  try {
    await prisma.job.delete({ where: { id } })
    await EventBus.emit('job.deleted', { id })
    revalidatePath('/admin/jobs')
    return { success: true }
  } catch (error) {
    console.error('Job deletion error:', error)
    throw new Error('İş silinirken bir hata oluştu')
  }
}
