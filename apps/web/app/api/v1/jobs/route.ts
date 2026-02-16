
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getApiKeyFromRequest } from '@/lib/api-key-helper'

/**
 * @openapi
 * /api/v1/jobs:
 *   get:
 *     summary: [TR] Tüm İşleri Listele [EN] List All Jobs
 *     description: [TR] Sistemdeki tüm işleri filtreleyerek listeler. [EN] Lists all jobs in the system with optional filtering.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: [TR] Filtrelemek için iş durumu [EN] Job status to filter by
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: [TR] Belirli bir müşteri için işler [EN] Jobs for a specific customer
 *     responses:
 *       200:
 *         description: [TR] Başarılı [EN] Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: 'integer' }
 *                 jobs:
 *                   type: 'array'
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 */
export async function GET(req: Request) {
    try {
        const apiKeyData = await getApiKeyFromRequest(req)
        if (!apiKeyData) {
            return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const customerId = searchParams.get('customerId')

        const where: any = {}
        if (status && status !== 'all') where.status = status
        if (customerId) where.customerId = customerId

        const jobs = await prisma.job.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: {
                    select: { company: true }
                },
                _count: {
                    select: { steps: true }
                }
            }
        })

        return NextResponse.json({
            count: jobs.length,
            jobs: jobs.map(j => ({
                id: j.id,
                title: j.title,
                status: j.status,
                priority: j.priority,
                location: j.location,
                customer: j.customer.company,
                stepsCount: j._count.steps,
                scheduledDate: j.scheduledDate,
                createdAt: j.createdAt
            }))
        })
    } catch (error) {
        console.error('Public API Jobs fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
