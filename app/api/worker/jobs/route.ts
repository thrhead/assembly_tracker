import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {
      assignments: {
        some: {
          OR: [
            { userId: session.user.id }, // Doğrudan atananlar
            { team: { members: { some: { userId: session.user.id } } } } // Ekibine atananlar
          ]
        }
      }
    }

    if (status) {
      where.status = status
    }

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
        _count: {
          select: {
            steps: true
          }
        }
      }
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Worker jobs fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
