
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'
import { jobCreationSchema } from '@/lib/validations'
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.join(process.cwd(), 'api_debug.log');

function logToFile(message: string) {
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(LOG_FILE, `${timestamp} - ${message}\n`);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
}

export async function GET(req: Request) {
    try {
        logToFile('Admin Jobs API: GET Request received');
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            logToFile('Admin Jobs API: Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        logToFile(`Admin Jobs API: Session Found (User: ${session.user.email})`);

        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search')
        const status = searchParams.get('status')
        const priority = searchParams.get('priority')
        const teamId = searchParams.get('teamId')
        const customerId = searchParams.get('customerId')

        const where: any = {}

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { customer: { company: { contains: search, mode: 'insensitive' } } },
                { customer: { user: { name: { contains: search, mode: 'insensitive' } } } }
            ]
        }

        if (status && status !== 'all') where.status = status
        if (priority && priority !== 'all') where.priority = priority
        if (customerId && customerId !== 'all') where.customerId = customerId

        if (teamId && teamId !== 'all') {
            where.assignments = { some: { teamId } }
        }

        const jobs = await prisma.job.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                assignments: {
                    include: {
                        team: true,
                        worker: {
                            select: { name: true }
                        }
                    }
                },
                _count: {
                    select: {
                        steps: true
                    }
                }
            }
        })

        logToFile(`Admin Jobs API: Returning ${jobs.length} jobs`);

        return NextResponse.json(jobs)
    } catch (error) {
        logToFile(`Admin Jobs API Error: ${error}`);
        console.error('Jobs fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
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
                title: data.title,
                description: data.description,
                customerId: data.customerId,
                creatorId: session.user.id,
                priority: data.priority,
                location: data.location,
                scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
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
                                        description: sub.description,
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
                    teamId: data.teamId,
                    assignedAt: new Date()
                }
            })
        }

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

