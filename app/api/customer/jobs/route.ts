import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    // Get customer profile
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    // Build where clause
    const where: any = {
      customerId: customer.id
    }

    if (status) {
      where.status = status
    }

    // Get jobs with details
    const jobs = await prisma.job.findMany({
      where,
      include: {
        steps: {
          select: {
            id: true,
            title: true,
            isCompleted: true,
            order: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        assignments: {
          include: {
            worker: {
              select: {
                name: true,
                phone: true
              }
            },
            team: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats
    const stats = {
      totalJobs: jobs.length,
      pendingJobs: jobs.filter(j => j.status === 'PENDING').length,
      inProgressJobs: jobs.filter(j => j.status === 'IN_PROGRESS').length,
      completedJobs: jobs.filter(j => j.status === 'COMPLETED').length,
      completionRate: jobs.length > 0 
        ? Math.round((jobs.filter(j => j.status === 'COMPLETED').length / jobs.length) * 100)
        : 0
    }

    // Calculate job progress
    const jobsWithProgress = jobs.map(job => {
      const totalSteps = job.steps.length
      const completedSteps = job.steps.filter(s => s.isCompleted).length
      const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

      return {
        ...job,
        progress,
        completedSteps,
        totalSteps
      }
    })

    return NextResponse.json({ jobs: jobsWithProgress, stats })
  } catch (error) {
    console.error('Get customer jobs error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
