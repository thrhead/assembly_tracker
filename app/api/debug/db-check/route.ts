import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const workerCount = await prisma.user.count({
            where: { role: 'WORKER', isActive: true }
        })

        const teamCount = await prisma.team.count({
            where: { isActive: true }
        })

        const workers = await prisma.user.findMany({
            where: { role: 'WORKER', isActive: true },
            select: { id: true, name: true }
        })

        return NextResponse.json({
            status: 'ok',
            counts: {
                workers: workerCount,
                teams: teamCount
            },
            sampleWorkers: workers
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
