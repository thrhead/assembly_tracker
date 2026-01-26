
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminOrManager } from '@/lib/auth-helper'
import { z } from 'zod'
import { jobCreationSchema } from '@/lib/validations-edge'
import { sendJobNotification } from '@/lib/notification-helper';
import { EventBus } from '@/lib/event-bus';
import { sanitizeHtml, stripHtml } from '@/lib/security';

// Helper function to build where clause for filtering
function buildJobFilter(searchParams: URLSearchParams) {
    const search = searchParams.get('search')?.trim()
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const teamId = searchParams.get('teamId')
    const customerId = searchParams.get('customerId')

    const where: any = {}

    if (search && search.length > 0) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { customer: { company: { contains: search, mode: 'insensitive' } } }
        ]
    }

    if (status && status !== 'all' && status !== 'ALL') where.status = status
    if (priority && priority !== 'all' && priority !== 'ALL') where.priority = priority
    if (customerId && customerId !== 'all') where.customerId = customerId

    if (teamId && teamId !== 'all') {
        where.assignments = { some: { teamId } }
    }

    return where
}

async function fetchJobs(where: any) {
    try {
        console.log("DEBUG: Prisma query start");
        const jobs = await prisma.job.findMany({
            where: where || {},
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                customer: {
                    select: {
                        id: true,
                        company: true,
                        user: { select: { name: true } }
                    }
                },
                assignments: {
                    select: {
                        id: true,
                        team: { select: { name: true } },
                        worker: { select: { name: true } }
                    }
                },
                _count: {
                    select: { steps: true }
                }
            }
        });
        console.log(`DEBUG: Prisma query success, found ${jobs.length} items`);
        return jobs;
    } catch (e: any) {
        console.error("DEBUG: Prisma fetchJobs failed:", e.message);
        // Fallback: minimal data without joins
        return await prisma.job.findMany({
            take: 20,
            select: { id: true, title: true, status: true, priority: true, createdAt: true }
        });
    }
}

export async function GET(req: Request) {
    try {
        const session = await verifyAdminOrManager(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const where = buildJobFilter(searchParams)

        const jobs = await fetchJobs(where)

        const formattedJobs = jobs.map((job: any) => ({
            id: job.id,
            title: job.title || '',
            status: job.status || 'PENDING',
            priority: job.priority || 'MEDIUM',
            location: job.location || '',
            scheduledDate: job.scheduledDate ? new Date(job.scheduledDate).toISOString() : null,
            createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
            customer: job.customer ? {
                id: job.customer.id,
                company: job.customer.company || '',
                user: job.customer.user ? { name: job.customer.user.name || '' } : null
            } : null,
            assignments: (job.assignments || []).map((a: any) => ({
                id: a.id,
                team: a.team ? { name: a.team.name || '' } : null,
                worker: a.worker ? { name: a.worker.name || '' } : null
            })),
            _count: { steps: job._count?.steps || 0 }
        }));

        return NextResponse.json(JSON.parse(JSON.stringify(formattedJobs)))
    } catch (error: any) {
        console.error('CRITICAL: API GET Crash:', error.message);
        return NextResponse.json([], { status: 200 }); // Return empty list instead of 500 for better UI experience
    }
}

export async function POST(req: Request) {
    try {
        const session = await verifyAdminOrManager(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const data = jobCreationSchema.parse(body)

        // Verify existence of foreign keys
        const customerExists = await prisma.customer.findUnique({ where: { id: data.customerId } })
        if (!customerExists) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 400 })
        }

        if (data.teamId) {
            const teamExists = await prisma.team.findUnique({ where: { id: data.teamId } })
            if (!teamExists) {
                return NextResponse.json({ error: 'Team not found' }, { status: 400 })
            }
        }

        const newJob = await prisma.job.create({
            data: {
                title: stripHtml(data.title),
                description: data.description ? sanitizeHtml(data.description) : null,
                customerId: data.customerId,
                creatorId: session.user.id,
                priority: data.priority,
                location: data.location ? stripHtml(data.location) : null,
                scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
                status: 'PENDING',
                steps: data.steps
                    ? {
                        create: data.steps.map((step, idx) => ({
                            title: stripHtml(step.title),
                            description: step.description ? sanitizeHtml(step.description) : null,
                            order: idx + 1,
                            subSteps: step.subSteps
                                ? {
                                    create: step.subSteps.map((sub, sIdx) => ({
                                        title: stripHtml(sub.title),
                                        description: sub.description ? sanitizeHtml(sub.description) : null,
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

        if (data.teamId || data.workerId) {
            await prisma.jobAssignment.create({
                data: {
                    jobId: newJob.id,
                    teamId: data.teamId,
                    workerId: data.workerId,
                    assignedAt: new Date()
                }
            })

            // Notify assigned team or worker
            await sendJobNotification(
                newJob.id,
                'Yeni İş Atandı',
                `"${newJob.title}" başlıklı yeni bir iş size atandı.`,
                'INFO',
                `/worker/jobs/${newJob.id}`
            );
        }

        // Trigger side effects
        await EventBus.emit('job.created', newJob);

        return NextResponse.json(newJob, { status: 201 })
    } catch (error) {
        console.error('Job creation error:', error)
        if (error instanceof z.ZodError) {
            const errorMessage = error.issues.map(issue => issue.message).join(', ')
            return NextResponse.json({ error: errorMessage, details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
