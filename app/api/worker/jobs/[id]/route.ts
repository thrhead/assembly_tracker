import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await verifyAuth(req)
    if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            company: true,
            address: true,
            user: {
              select: { name: true, phone: true, email: true }
            }
          }
        },
        steps: {
          orderBy: { order: 'asc' },
          include: {
            subSteps: {
              orderBy: { order: 'asc' },
              include: {
                photos: true
              }
            },
            photos: {
              orderBy: { uploadedAt: 'desc' }
            }
          }
        },
        assignments: {
          include: {
            team: {
              include: {
                members: true
              }
            },
            worker: {
              select: { name: true }
            }
          }
        },
        costs: {
          orderBy: { date: 'desc' }
        }
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check access
    // Check access (skip for ADMIN/MANAGER)
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      const hasAccess = job.assignments.some(
        a => a.workerId === session.user.id ||
          (a.team && a.team.members?.some((m: any) => m.userId === session.user.id))
      )

      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Job detail fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await verifyAuth(req)
    if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const job = await prisma.job.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error('Job status update error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
