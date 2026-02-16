
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminOrManager } from '@/lib/auth-helper'

export async function GET(req: Request) {
    try {
        const session = await verifyAdminOrManager(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch completed jobs to calculate averages
        const completedJobs = await prisma.job.findMany({
            where: {
                status: 'COMPLETED',
                startedAt: { not: null },
                completedDate: { not: null }
            },
            select: {
                title: true,
                startedAt: true,
                completedDate: true
            }
        });

        const stats: Record<string, { totalDuration: number, count: number }> = {};

        completedJobs.forEach(job => {
            const start = new Date(job.startedAt!).getTime();
            const end = new Date(job.completedDate!).getTime();
            const duration = (end - start) / (1000 * 60 * 60); // In hours

            if (!stats[job.title]) {
                stats[job.title] = { totalDuration: 0, count: 0 };
            }
            stats[job.title].totalDuration += duration;
            stats[job.title].count += 1;
        });

        const forecast = Object.entries(stats).map(([title, data]) => ({
            title,
            averageDurationHours: Math.round((data.totalDuration / data.count) * 10) / 10,
            sampleSize: data.count
        }));

        return NextResponse.json(forecast);
    } catch (error) {
        console.error('Forecast calculation error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
