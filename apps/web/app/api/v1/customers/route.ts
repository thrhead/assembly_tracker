
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getApiKeyFromRequest } from '@/lib/api-key-helper'

/**
 * @openapi
 * /api/v1/customers:
 *   get:
 *     summary: [TR] Müşterileri Listele [EN] List Customers
 *     description: [TR] Sistemdeki tüm müşterileri listeler. [EN] Lists all customers in the system.
 *     responses:
 *       200:
 *         description: [TR] Başarılı [EN] Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 */
export async function GET(req: Request) {
    try {
        const apiKeyData = await getApiKeyFromRequest(req)
        if (!apiKeyData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const customers = await prisma.customer.findMany({
            orderBy: { company: 'asc' }
        })

        return NextResponse.json(customers)
    } catch (error) {
        console.error('Public API Customers fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
