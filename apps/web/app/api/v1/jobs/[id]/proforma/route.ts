
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getApiKeyFromRequest } from '@/lib/api-key-helper'
// Note: We'll use a server-side PDF library or a template approach.
// Since we have jsPDF, we can't easily use it on the server if it relies on browser globals (like window).
// For server-side, we'll return the JSON data and the mobile app will handle it, 
// OR we move proforma logic to a shared helper.

/**
 * @openapi
 * /api/v1/jobs/{id}/proforma:
 *   get:
 *     summary: [TR] İş Proforması Getir [EN] Get Job Proforma
 *     description: [TR] Belirli bir iş için proforma detaylarını JSON olarak getirir. [EN] Gets proforma details for a specific job as JSON.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: [TR] İş ID'si [EN] Job ID
 *     responses:
 *       200:
 *         description: [TR] Başarılı [EN] Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: 'string' }
 *                 title: { type: 'string' }
 *                 customer:
 *                   type: 'object'
 *                   properties:
 *                     company: { type: 'string' }
 *                     address: { type: 'string' }
 *                 items:
 *                   type: 'array'
 *                   items:
 *                     type: 'object'
 *                     properties:
 *                       description: { type: 'string' }
 *                       price: { type: 'integer' }
 *       404:
 *         description: [TR] İş bulunamadı [EN] Job not found
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const apiKeyData = await getApiKeyFromRequest(req)
        // If no API Key, check for session (admin/manager)
        // For simplicity, we'll require API Key for public v1 access
        if (!apiKeyData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                customer: true,
                steps: true
            }
        })

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        // Return proforma-ready JSON data
        return NextResponse.json({
            id: job.id,
            title: job.title,
            customer: {
                company: job.customer.company,
                address: job.customer.address,
                taxId: (job.customer as any).taxId
            },
            items: job.steps.map(step => ({
                description: step.title,
                quantity: 1,
                price: 2500 // Consistent with web logic
            })),
            completedDate: job.completedDate
        })
    } catch (error) {
        console.error('Proforma API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
