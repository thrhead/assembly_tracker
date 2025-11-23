import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const jobSchema = z.object({
  title: z.string().min(3, 'İş başlığı en az 3 karakter olmalıdır'),
  description: z.string().optional(),
  customerId: z.string().min(1, 'Müşteri seçilmelidir'),
  teamId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  location: z.string().optional(),
  scheduledDate: z.string().optional().transform(val => val ? new Date(val) : null),
  steps: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  })).optional()
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { customer: { company: { contains: search } } },
        { customer: { user: { name: { contains: search } } } }
      ]
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        assignments: {
          include: {
            team: true,
            worker: {
              select: { name: true }
            }
          }
        },
        _count: {
          select: {
            steps: true
          }
        }
      }
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Jobs fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title, description, customerId, teamId,
      priority, location, scheduledDate, steps
    } = jobSchema.parse(body)

    // Transaction ile iş ve atama oluştur
    const job = await prisma.$transaction(async (tx: any) => {
      // 1. Create Job with Steps
      const newJob = await tx.job.create({
        data: {
          title,
          description,
          customerId,
          creatorId: session.user.id,
          priority,
          location,
          scheduledDate,
          status: 'PENDING',
          steps: steps ? {
            create: steps.map((step: any, index: number) => ({
              title: step.title,
              description: step.description,
              order: index + 1,
              isCompleted: false
            }))
          } : undefined
        }
      })

      // 2. Assign Team (if selected)
      if (teamId) {
        await tx.jobAssignment.create({
          data: {
            jobId: newJob.id,
            teamId
          }
        })

        // 3. Send notifications to team members
        // Note: We need to do this outside the transaction or handle it carefully
        // For simplicity in this setup, we'll fetch members here
        const team = await tx.team.findUnique({
          where: { id: teamId },
          include: { members: true }
        })

        if (team && team.members.length > 0) {
          const workerIds = team.members.map((m: any) => m.userId)
          // We can't await this inside transaction easily without importing outside
          // So we'll return the workerIds to handle after transaction
          return { job: newJob, workerIds }
        }
      }

      return { job: newJob, workerIds: [] }
    })

    // Send notifications after transaction
    if (job.workerIds.length > 0) {
      const { notifyJobAssignment } = await import('@/lib/notifications')
      // Don't await to not block response
      notifyJobAssignment(job.job.id, job.workerIds).catch(console.error)
    }

    return NextResponse.json(job.job, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    console.error('Job create error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
