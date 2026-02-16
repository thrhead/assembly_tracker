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
        const jobStatus = searchParams.get('jobStatus')
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const category = searchParams.get('category')
        const workerName = searchParams.get('workerName')

        const where: any = {}
        if (status && status !== 'all') where.status = status // Cost status (Approved/Pending etc)
        if (jobId && jobId !== 'all') where.jobId = jobId
        if (category && category !== 'all') where.category = category
        if (jobStatus && jobStatus !== 'all') {
            where.job = {
                status: jobStatus
            }
        }

        if (from || to) {
            where.date = {}
            if (from) where.date.gte = new Date(from)
            if (to) where.date.lte = new Date(to)
        }

        // Handling worker filter if needed (ReportFilters usually filters logic client side or params. Using direct name check for simplified approach if id not available)
        // If workerName is passed (ReportFilters usually passes as specific param?) - actually ReportFilters passes 'jobStatus', 'jobId', 'category'. 
        // We might need to extend filters later, for now stick to plan.

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
