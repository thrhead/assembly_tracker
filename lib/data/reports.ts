import { prisma } from "@/lib/db";

export async function getJobsForReport() {
    return await prisma.job.findMany({
        include: {
            assignments: {
                include: {
                    team: true
                },
                take: 1
            },
            customer: true,
            steps: {
                select: {
                    id: true,
                    isCompleted: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getReportStats() {
    const jobsByStatus = await prisma.job.groupBy({
        by: ['status'],
        _count: true
    });

    const pendingJobs = jobsByStatus.find(g => g.status === 'PENDING')?._count || 0;
    const inProgressJobs = jobsByStatus.find(g => g.status === 'IN_PROGRESS')?._count || 0;
    const completedJobs = jobsByStatus.find(g => g.status === 'COMPLETED')?._count || 0;
    const totalJobs = pendingJobs + inProgressJobs + completedJobs;

    return {
        totalJobs,
        pendingJobs,
        inProgressJobs,
        completedJobs
    };
}
