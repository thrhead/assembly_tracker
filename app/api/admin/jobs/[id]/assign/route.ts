import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'

const assignSchema = z.object({
    workerId: z.string().cuid()
})

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { workerId } = assignSchema.parse(body)

        const jobId = params.id

        // Check if job exists
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: { assignments: true }
        })

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        // Check if worker exists
        const worker = await prisma.user.findUnique({
            where: { id: workerId }
        })

        if (!worker) {
            return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
        }

        // Find existing assignment or create new one
        let assignment = job.assignments[0]

        if (assignment) {
            // Update existing assignment
            assignment = await prisma.jobAssignment.update({
                where: { id: assignment.id },
                data: {
                    workerId,
                    assignedAt: new Date()
                }
            })
        } else {
            // Create new assignment
            assignment = await prisma.jobAssignment.create({
                data: {
                    jobId,
                    workerId,
                    assignedAt: new Date()
                }
            })
        }

        // Update job status to IN_PROGRESS if it was PENDING
        if (job.status === 'PENDING') {
            await prisma.job.update({
                where: { id: jobId },
                data: { status: 'IN_PROGRESS' }
            })
        }

        return NextResponse.json(assignment)
    } catch (error) {
        console.error('Job assignment error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
