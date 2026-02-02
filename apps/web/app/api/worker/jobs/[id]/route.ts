import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { emitToUser } from '@/lib/socket'
import { sendAdminNotification } from '@/lib/notification-helper'
import { checkConflict } from '@/lib/conflict-check'

export const dynamic = 'force-dynamic'

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
                members: {
                  include: {
                    user: {
                      select: { name: true }
                    }
                  }
                }
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

    // Seviye 3: Çatışma Kontrolü
    const currentJob = await prisma.job.findUnique({
      where: { id: params.id },
      select: { updatedAt: true }
    })

    const conflict = await checkConflict(req, currentJob?.updatedAt)
    if (conflict) return conflict

    const body = await req.json()
    const { status } = body

    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const job = await prisma.job.update({
      where: { id: params.id },
      data: { status }
    })

    // Notify the user about status change (Self-Notification)
    let message = ''
    let type = 'info'

    console.log('🔄 Status Update Debug:', { status, jobId: params.id, userId: session.user.id })

    if (status === 'IN_PROGRESS') {
      message = `${job.title} işi tekrar başlatıldı.`
      type = 'info'
    } else if (status === 'PENDING') {
      message = `${job.title} işi beklemeye alındı.`
      type = 'warning'
    } else if (status === 'COMPLETED') {
      // Notify Admins via Push
      await sendAdminNotification(
        'İş Tamamlandı',
        `${session.user.name} tarafından "${job.title}" işi tamamlandı olarak işaretlendi.`,
        'SUCCESS',
        `/admin/jobs/${job.id}`,
        session.user.id
      )
    }

    console.log('🔔 Notification Message:', message)

    if (message) {
      console.log('📤 Emitting notification to user:', session.user.id)
      emitToUser(session.user.id, 'notification:new', {
        id: crypto.randomUUID(),
        title: 'İş Durumu Güncellendi',
        message,
        type,
        userId: session.user.id
      })
    }


    return NextResponse.json(job)
  } catch (error) {
    console.error('Job status update error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}