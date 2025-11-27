import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'

export async function GET(req: Request) {
  try {
    const session = await verifyAuth(req)
    if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}

    // If not ADMIN or MANAGER, filter by assignments
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      where.assignments = {
        some: {
          OR: [
            { workerId: session.user.id }, // Doğrudan atananlar
            { team: { members: { some: { userId: session.user.id } } } } // Ekibine atananlar
          ]
        }
      }
    }

    if (status) {
      where.status = status
    }

    console.log('Worker Jobs Debug:', {
      userId: session.user.id,
      role: session.user.role,
      where: JSON.stringify(where, null, 2)
    })

    const jobs = await prisma.job.findMany({
      where,
      orderBy: [
        { priority: 'desc' }, // Acil işler önce
        { scheduledDate: 'asc' }, // Tarihi yakın olanlar önce
        { createdAt: 'desc' }
      ],
      include: {
        customer: {
          select: {
            company: true,
            user: {
              select: { name: true, phone: true }
            }
          }
        },
        steps: {
          select: {
            id: true,
            isCompleted: true
          }
        }
      }
    })

    console.log('🚀 Worker Jobs API Response:', {
      count: jobs.length,
      jobs: jobs.map(j => ({ id: j.id, title: j.title, status: j.status }))
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Worker jobs fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
