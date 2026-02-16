
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminOrManager } from '@/lib/auth-helper'

export async function GET(req: Request) {
    try {
        const session = await verifyAdminOrManager(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch all jobs that are relevant for analysis (e.g., exclude PENDING if desired, or keep all)
        // For variance, we usually care about jobs that are at least started or have a budget/estimate.
        const jobs = await prisma.job.findMany({
            where: {
                OR: [
                    { status: 'COMPLETED' },
                    { status: 'IN_PROGRESS' },
                    // Also include planned jobs if they have budget/estimate set, to show "Planned" state
                    { budget: { not: null } },
                    { estimatedDuration: { not: null } }
                ]
            },
            select: {
                id: true,
                jobNo: true,
                title: true,
                status: true,
                budget: true,
                estimatedDuration: true, // in minutes
                startedAt: true,
                completedDate: true,
                scheduledDate: true,
                scheduledEndDate: true,
                costs: {
                    where: { status: 'APPROVED' }, // Only approved costs count towards actual
                    select: { amount: true }
                },
                customer: {
                    select: { company: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100 // Limit for performance, maybe paginate later
        })

        const specializedReports = jobs.map(job => {
            // 1. Cost Calculations
            const plannedCost = job.budget || 0;
            const actualCost = job.costs.reduce((sum, c) => sum + c.amount, 0);
            const costVariance = actualCost - plannedCost; // Positive = Over budget

            // 2. Time Calculations (Minutes)
            let plannedDuration = job.estimatedDuration || 0;

            // Fallback: If no estimated duration, try scheduled dates
            if (plannedDuration === 0 && job.scheduledDate && job.scheduledEndDate) {
                const start = new Date(job.scheduledDate).getTime();
                const end = new Date(job.scheduledEndDate).getTime();
                plannedDuration = Math.round((end - start) / (1000 * 60));
            }

            let actualDuration = 0;
            if (job.startedAt && job.completedDate) {
                const start = new Date(job.startedAt).getTime();
                const end = new Date(job.completedDate).getTime();
                actualDuration = Math.round((end - start) / (1000 * 60));
            } else if (job.startedAt) {
                // Job in progress: duration so far
                const start = new Date(job.startedAt).getTime();
                const now = new Date().getTime();
                actualDuration = Math.round((now - start) / (1000 * 60));
            }

            const timeVariance = actualDuration - plannedDuration;

            return {
                id: job.id,
                jobNo: job.jobNo,
                title: job.title,
                customerName: job.customer.company,
                status: job.status,

                // Cost Data
                plannedCost,
                actualCost,
                costVariance,
                costVarianceColor: costVariance > 0 ? 'red' : 'green', // Simple frontend helper

                // Time Data
                plannedDuration, // minutes
                actualDuration, // minutes
                timeVariance,
                timeVarianceColor: timeVariance > 0 ? 'red' : 'green'
            }
        });

        return NextResponse.json(specializedReports)

    } catch (error: any) {
        console.error('Variance Report Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
