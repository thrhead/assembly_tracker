import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // logToFile('Worker Jobs API: GET Request received');
    const session = await verifyAuth(req)
    if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
      console.warn('Worker Jobs API: Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // logToFile(`Worker Jobs API: Session Found (User: ${session.user.email}, Role: ${session.user.role})`);

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

    // logToFile(`Worker Jobs API: Querying DB for user ${session.user.id}`);

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
        },
        costs: true
      }
    })

    // logToFile(`Worker Jobs API: Found ${jobs.length} jobs`);

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Worker jobs fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
