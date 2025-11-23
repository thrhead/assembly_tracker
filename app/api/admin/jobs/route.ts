import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from 'zod'

const createJobSchema = z.object({
    title: z.string().min(1, 'İş başlığı en az 1 karakter olmalı'),
    description: z.string().optional(),
    customerId: z.string(),
    teamId: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    location: z.string().optional(),
    scheduledDate: z.string().optional().transform(val => (val ? new Date(val) : null)),
    scheduledEndDate: z.string().optional().transform(val => (val ? new Date(val) : null)),
    steps: z.array(
        z.object({
            title: z.string().min(1),
            description: z.string().optional(),
            subSteps: z.array(
                z.object({
                    title: z.string().min(1)
                })
            ).optional()
        })
    ).optional()
})

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const data = createJobSchema.parse(body)

        // Verify existence of foreign keys
        const customerExists = await prisma.customer.findUnique({ where: { id: data.customerId } })
        if (!customerExists) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 400 })
        }

        const creatorExists = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (!creatorExists) {
            return NextResponse.json({ error: 'Creator user not found' }, { status: 400 })
        }

        if (data.teamId) {
            const teamExists = await prisma.team.findUnique({ where: { id: data.teamId } })
            if (!teamExists) {
                return NextResponse.json({ error: 'Team not found' }, { status: 400 })
            }
        }

        const newJob = await prisma.job.create({
            data: {
                title: data.title,
                description: data.description,
                customerId: data.customerId,
                creatorId: session.user.id,
                priority: data.priority,
                location: data.location,
                scheduledDate: data.scheduledDate,
                scheduledEndDate: data.scheduledEndDate,
                status: 'PENDING',
                steps: data.steps
                    ? {
                        create: data.steps.map((step, idx) => ({
                            title: step.title,
                            description: step.description,
                            order: idx + 1,
                            subSteps: step.subSteps
                                ? {
                                    create: step.subSteps.map((sub, sIdx) => ({
                                        title: sub.title,
                                        order: sIdx + 1
                                    }))
                                }
                                : undefined
                        }))
                    }
                    : undefined
            },
            include: {
                customer: { include: { user: true } },
                steps: { include: { subSteps: true } }
            }
        })

        if (data.teamId) {
            await prisma.jobAssignment.create({
                data: {
                    jobId: newJob.id,
                    teamId: data.teamId
                }
            })
        }

        return NextResponse.json(newJob, { status: 201 })
    } catch (error) {
        console.error('Job creation error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 })
    }
}
