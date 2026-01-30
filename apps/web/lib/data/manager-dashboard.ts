import { prisma } from "@/lib/db"

export async function getManagerDashboardData() {
    const [
        totalJobs,
        activeTeams,
        completedJobsThisMonth,
        pendingApprovals,
        recentJobs
    ] = await Promise.all([
        prisma.job.count(),
        prisma.team.count({ where: { isActive: true } }),
        prisma.job.count({
            where: {
                status: 'COMPLETED',
                completedDate: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        }),
        prisma.approval.count({ where: { status: 'PENDING' } }),
        prisma.job.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: true,
                customer: true
            }
        })
    ])

    const efficiencyScore = totalJobs > 0
        ? Math.min(Math.round((completedJobsThisMonth / totalJobs) * 100), 100)
        : 0

    return {
        totalJobs,
        activeTeams,
        completedJobsThisMonth,
        pendingApprovals,
        recentJobs,
        efficiencyScore
    }
}
