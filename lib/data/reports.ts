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

export async function getCostBreakdown(startDate: Date, endDate: Date) {
    const costs = await prisma.costTracking.groupBy({
        by: ['category'],
        _sum: { amount: true },
        where: {
            date: {
                gte: startDate,
                lte: endDate
            },
            status: 'APPROVED'
        }
    });

    const breakdown: Record<string, number> = {};
    costs.forEach(cost => {
        if (cost.category && cost._sum.amount) {
            breakdown[cost.category] = cost._sum.amount;
        }
    });

    return breakdown;
}

export async function getJobStatusDistribution(startDate: Date, endDate: Date) {
    const jobs = await prisma.job.groupBy({
        by: ['status'],
        _count: true,
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        }
    });

    const distribution: Record<string, number> = {};
    jobs.forEach(job => {
        distribution[job.status] = job._count;
    });

    return distribution;
}

export async function getTeamPerformance(startDate: Date, endDate: Date) {
    // Fetch completed jobs with team assignments within the date range
    const jobs = await prisma.job.findMany({
        where: {
            status: 'COMPLETED',
            completedDate: {
                gte: startDate,
                lte: endDate
            },
            startedAt: {
                not: null
            },
            assignments: {
                some: {
                    teamId: {
                        not: null
                    }
                }
            }
        },
        include: {
            assignments: {
                include: {
                    team: true
                }
            }
        }
    });

    const teamStats: Record<string, { totalJobs: number; totalTime: number; teamName: string }> = {};

    jobs.forEach(job => {
        const teamAssignment = job.assignments.find(a => a.teamId);
        if (teamAssignment && teamAssignment.team) {
            const teamId = teamAssignment.team.id;
            const teamName = teamAssignment.team.name;
            
            if (!teamStats[teamId]) {
                teamStats[teamId] = { totalJobs: 0, totalTime: 0, teamName };
            }

            if (job.startedAt && job.completedDate) {
                const durationMinutes = (job.completedDate.getTime() - job.startedAt.getTime()) / (1000 * 60);
                teamStats[teamId].totalJobs += 1;
                teamStats[teamId].totalTime += durationMinutes;
            }
        }
    });

    return Object.values(teamStats).map(stat => ({
        teamName: stat.teamName,
        totalJobs: stat.totalJobs,
        avgCompletionTimeMinutes: stat.totalJobs > 0 ? stat.totalTime / stat.totalJobs : 0
    }));
}
