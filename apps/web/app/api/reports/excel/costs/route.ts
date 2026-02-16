import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrManager } from '@/lib/auth-helper'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const session = await verifyAdminOrManager(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)

        const where: any = {}

        const status = searchParams.get('status')
        if (status && status !== 'all') where.status = status

        const category = searchParams.get('category')
        if (category && category !== 'all') where.category = category

        const jobId = searchParams.get('jobId')
        if (jobId) where.jobId = jobId

        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        if (startDate || endDate) {
            where.date = {}
            if (startDate) where.date.gte = new Date(startDate)
            if (endDate) where.date.lte = new Date(endDate)
        }

        const costs = await prisma.costTracking.findMany({
            where,
            include: {
                job: true,
                createdBy: true,
            },
            orderBy: {
                date: 'desc',
            },
        })

        const excelData = costs.map((cost) => ({
            id: cost.id,
            jobTitle: cost.job.title,
            category: cost.category,
            description: cost.description || '',
            amount: cost.amount,
            status: cost.status,
            date: cost.date,
            createdBy: cost.createdBy.name,
        }))

        return NextResponse.json(excelData)
    } catch (error) {
        console.error('Excel costs error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
