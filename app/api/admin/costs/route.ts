import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminOrManager } from '@/lib/auth-helper'
import { z } from 'zod'

export async function GET(req: Request) {
    try {
        const session = await verifyAdminOrManager(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const jobId = searchParams.get('jobId')

        const where: any = {}
        if (status) where.status = status
        if (jobId) where.jobId = jobId

        const costs = await prisma.costTracking.findMany({
            where,
            include: {
                job: { select: { title: true, customer: { select: { company: true } } } },
                createdBy: { select: { name: true, email: true } },
                approvedBy: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        })

        return NextResponse.json(costs)
    } catch (error) {
        console.error('List costs error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
