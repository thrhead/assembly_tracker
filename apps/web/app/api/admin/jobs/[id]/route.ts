import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'
import { EventBus } from '@/lib/event-bus'
import { checkConflict } from '@/lib/conflict-check'
import { logger } from '@/lib/logger'

const updateJobSchema = z.object({
    startedAt: z.string().optional().nullable(),
    completedDate: z.string().optional().nullable(),
    scheduledDate: z.string().optional().nullable(),
    scheduledEndDate: z.string().optional().nullable(),
})

const fullUpdateJobSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    customerId: z.string().min(1),
    teamId: z.string().optional().nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    acceptanceStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
    location: z.string().optional().nullable(),
    scheduledDate: z.string(),
    scheduledEndDate: z.string(),
    startedAt: z.string().optional().nullable(),
    completedDate: z.string().optional().nullable(),
    steps: z.array(z.any()).optional().nullable() // Basic validation for steps, detailed handling inside
})

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const params = await props.params
        const body = await req.json()

        // Parse body with full schema
        const data = fullUpdateJobSchema.parse(body)

        // Seviye 3: Çatışma Kontrolü
        const currentJob = await prisma.job.findUnique({
            where: { id: params.id },
            select: { updatedAt: true }
        })
        const conflict = await checkConflict(req, currentJob?.updatedAt)
        if (conflict) return conflict

        // Handle Steps Logic if provided (Simplistic approach: Transactional replace or upsert)
        // For now, focusing on core fields as requested. 
        // Note: steps handling is complex, assuming basic update for now. 
        // Ideally we should differentiate between creating new steps vs updating existing.

        const updatedJob = await prisma.job.update({
            where: { id: params.id },
            data: {
                title: data.title,
                description: data.description,
                customerId: data.customerId,
                // teamId is not on Job model, it's a relation via JobAssignment
                assignments: data.teamId && data.teamId !== 'none' ? {
                    deleteMany: {}, // Clear previous assignments (assuming single team for now)
                    create: { teamId: data.teamId }
                } : undefined,
                priority: data.priority,
                status: data.status,
                acceptanceStatus: data.acceptanceStatus,
                location: data.location,
                scheduledDate: new Date(data.scheduledDate),
                scheduledEndDate: new Date(data.scheduledEndDate),
                startedAt: data.startedAt ? new Date(data.startedAt) : null,
                completedDate: data.completedDate ? new Date(data.completedDate) : null,
            }
        })

        // Trigger side effects
        await EventBus.emit('job.updated', updatedJob);

        logger.audit(`Job updated (PUT): ${updatedJob.title}`, {
            jobId: updatedJob.id,
            updaterId: session.user.id,
            updates: Object.keys(data)
        });

        return NextResponse.json({ success: true, job: updatedJob })
    } catch (error) {
        console.error('Update job (PUT) error:', error)
        logger.error('Failed to update job (PUT)', { error: (error as Error).message });
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const params = await props.params
        const body = await req.json()
        const { startedAt, completedDate, scheduledDate, scheduledEndDate } = updateJobSchema.parse(body)

        // Seviye 3: Çatışma Kontrolü
        const currentJob = await prisma.job.findUnique({
            where: { id: params.id },
            select: { updatedAt: true }
        })
        const conflict = await checkConflict(req, currentJob?.updatedAt)
        if (conflict) return conflict

        const updatedJob = await prisma.job.update({
            where: { id: params.id },
            data: {
                startedAt: startedAt ? new Date(startedAt) : (startedAt === null ? null : undefined),
                completedDate: completedDate ? new Date(completedDate) : (completedDate === null ? null : undefined),
                scheduledDate: scheduledDate ? new Date(scheduledDate) : (scheduledDate === null ? null : undefined),
                scheduledEndDate: scheduledEndDate ? new Date(scheduledEndDate) : (scheduledEndDate === null ? null : undefined),
                status: completedDate ? 'COMPLETED' : undefined // Auto update status if completed date is set
            }
        })

        // Trigger side effects
        await EventBus.emit('job.updated', updatedJob);

        logger.audit(`Job updated (PATCH): ${updatedJob.title}`, {
            jobId: updatedJob.id,
            updaterId: session.user.id,
            updates: Object.keys(body)
        });

        return NextResponse.json({ success: true, job: updatedJob })
    } catch (error) {
        console.error('Update job error:', error)
        logger.error('Failed to update job (PATCH)', { error: (error as Error).message });
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifyAuth(req)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const params = await props.params

        // Check if job exists
        const job = await prisma.job.findUnique({
            where: { id: params.id }
        })

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        await prisma.job.delete({
            where: { id: params.id }
        })

        // Trigger side effects
        await EventBus.emit('job.deleted', { id: params.id });

        logger.audit(`Job deleted: ${job.title}`, {
            jobId: params.id,
            deleterId: session.user.id
        });

        return NextResponse.json({ success: true, message: 'Job deleted successfully' })
    } catch (error) {
        console.error('Delete job error:', error)
        logger.error('Failed to delete job', { error: (error as Error).message });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}