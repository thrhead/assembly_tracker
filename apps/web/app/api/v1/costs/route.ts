
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getApiKeyFromRequest } from '@/lib/api-key-helper'

/**
 * @openapi
 * /api/v1/costs:
 *   get:
 *     summary: [TR] Maliyetleri Listele [EN] List Costs
 *     description: [TR] Sistemdeki tüm ek maliyetleri listeler. [EN] Lists all extra costs in the system.
 *     responses:
 *       200:
 *         description: [TR] Başarılı [EN] Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: 'string' }
 *                   title: { type: 'string' }
 *                   amount: { type: 'number' }
 *                   date: { type: 'string', format: 'date-time' }
 */
export async function GET(req: Request) {
    try {
        const apiKeyData = await getApiKeyFromRequest(req)
        if (!apiKeyData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const costs = await prisma.costTracking.findMany({
            orderBy: { date: 'desc' },
            include: { job: { select: { title: true } } }
        })

        return NextResponse.json(costs)
    } catch (error) {
        console.error('Public API Costs fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
