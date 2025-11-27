import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'
import { broadcast, emitToUser } from '@/lib/socket'
import { CostSubmittedPayload } from '@/lib/socket-events'
import { sendCostApprovalEmail } from '@/lib/email'

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

        const body = await req.json()
        console.log('Create Cost Request Body:', body)
        const data = createCostSchema.parse(body)

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

        // Create cost record
        const cost = await prisma.costTracking.create({
            data: {
                jobId: data.jobId,
                amount: data.amount,
                currency: data.currency,
                category: data.category,
                description: data.description,
                receiptUrl: data.receiptUrl,
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

        // Send email notification to admins (async, don't block)
        // Send email notification to admins (async, don't block)
        /*
        const admins = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'MANAGER'] },
                isActive: true
            },
            take: 1 // Just notify one admin
        })

        if (admins[0]?.email) {
            sendCostApprovalEmail(admins[0].email, {
                id: cost.id,
                amount: data.amount,
                category: data.category,
                description: data.description,
                jobTitle: job.title,
                submittedBy: session.user.name || session.user.email || 'Unknown',
                date: data.date
            }).catch(err => console.error('Email send failed:', err))
        }
        */

        return NextResponse.json(cost, { status: 201 })
    } catch (error) {
        console.error('Create cost error:', error)
        if (error instanceof z.ZodError) {
            console.error('Create Cost Validation Error:', JSON.stringify(error.issues, null, 2))
            return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
