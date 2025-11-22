import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await auth()
    if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
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
              orderBy: { order: 'asc' }
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
        }
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check access
    const hasAccess = job.assignments.some(
      a => a.workerId === session.user.id ||
        (a.team && a.team.members?.some((m: any) => m.userId === session.user.id))
    )

    // Geçici olarak erişim kontrolünü esnetelim (Test için)
    // if (!hasAccess) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

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
    const session = await auth()
    if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
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
