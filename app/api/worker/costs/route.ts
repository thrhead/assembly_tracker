import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'
import { broadcast, emitToUser } from '@/lib/socket'
import { CostSubmittedPayload } from '@/lib/socket-events'
import { sendCostApprovalEmail } from '@/lib/email'
import { logger } from '@/lib/logger';

const createCostSchema = z.object({
    jobId: z.string().min(1),
    amount: z.number().min(0),
    currency: z.string().default('TRY'),
    category: z.string().min(1),
    description: z.string().min(1),
    receiptUrl: z.string().optional(),
    date: z.string().optional().transform(val => (val ? new Date(val) : new Date()))
})

export async function POST(req: Request) {
    try {
        const session = await verifyAuth(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let data: any = {}
        let file: File | null = null

        const contentType = req.headers.get('content-type') || ''

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData()
            file = formData.get('receipt') as File

            data = {
                jobId: formData.get('jobId'),
                amount: parseFloat(formData.get('amount') as string),
                currency: formData.get('currency') || 'TRY',
                category: formData.get('category'),
                description: formData.get('description'),
                date: formData.get('date') ? new Date(formData.get('date') as string) : new Date()
            }
        } else {
            const body = await req.json()
            data = createCostSchema.parse(body)
        }

        logger.info(`[API] Cost Create Request (Multipart: ${contentType.includes('multipart/form-data')}): ${JSON.stringify(data)}`);

        // Verify job exists
        const job = await prisma.job.findUnique({
            where: { id: data.jobId },
            include: {
                creator: true
            }
        })

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        let receiptUrl = data.receiptUrl

        // Handle file upload if present
        if (file) {
            try {
                const fs = require('fs').promises
                const path = require('path')

                let buffer: Buffer
                if (typeof file.arrayBuffer === 'function') {
                    const bytes = await file.arrayBuffer()
                    buffer = Buffer.from(bytes)
                } else {
                    const bytes = await new Response(file).arrayBuffer()
                    buffer = Buffer.from(bytes)
                }

                const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'costs', data.jobId)
                await fs.mkdir(uploadDir, { recursive: true })

                const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
                const filepath = path.join(uploadDir, filename)

                await fs.writeFile(filepath, buffer)
                receiptUrl = `/uploads/costs/${data.jobId}/${filename}`
            } catch (err) {
                logger.error(`File upload error: ${err}`)
                return NextResponse.json({ error: 'Failed to upload receipt image' }, { status: 500 })
            }
        }

        // Create cost record
        const cost = await prisma.costTracking.create({
            data: {
                jobId: data.jobId,
                amount: data.amount,
                currency: data.currency,
                category: data.category,
                description: data.description,
                receiptUrl: receiptUrl,
                date: data.date,
                createdById: session.user.id,
                status: 'PENDING'
            },
            include: {
                createdBy: true
            }
        })

        // Emit Socket.IO event for real-time notification
        const socketPayload: CostSubmittedPayload = {
            costId: cost.id,
            jobId: data.jobId,
            amount: data.amount,
            category: data.category,
            submittedBy: session.user.name || session.user.email || 'Unknown'
        }

        // Notify job creator
        if (job.creator?.id) {
            emitToUser(job.creator.id, 'cost:submitted', socketPayload)
        }

        // Broadcast to all admins/managers
        broadcast('cost:submitted', socketPayload)

        return NextResponse.json(cost, { status: 201 })
    } catch (error) {
        logger.error(`Create cost error: ${error}`)
        if (error instanceof z.ZodError) {
            const issues = JSON.stringify(error.issues, null, 2);
            logger.error(`Create Cost Validation Error: ${issues}`)
            return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await verifyAuth(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const costs = await prisma.costTracking.findMany({
            where: {
                createdById: session.user.id
            },
            include: {
                job: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        })

        return NextResponse.json(costs)
    } catch (error) {
        logger.error(`Fetch costs error: ${error instanceof Error ? error.message : String(error)}`)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
