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

export async function getReportStats(startDate: Date, endDate: Date, jobStatus?: string, jobId?: string, category?: string) {
    const jobWhere: any = {
        createdAt: { gte: startDate, lte: endDate }
    };
    if (jobStatus && jobStatus !== 'all') jobWhere.status = jobStatus;
    if (jobId && jobId !== 'all') jobWhere.id = jobId;

    const jobsByStatus = await prisma.job.groupBy({
        by: ['status'],
        _count: true,
        where: jobWhere
    });

    const pendingJobs = jobsByStatus.find(g => g.status === 'PENDING')?._count || 0;
    const inProgressJobs = jobsByStatus.find(g => g.status === 'IN_PROGRESS')?._count || 0;
    const completedJobs = jobsByStatus.find(g => g.status === 'COMPLETED')?._count || 0;
    const totalJobs = pendingJobs + inProgressJobs + completedJobs;

    const costWhere: any = {
        date: { gte: startDate, lte: endDate }
    };
    if (jobStatus && jobStatus !== 'all') costWhere.job = { status: jobStatus };
    if (jobId && jobId !== 'all') costWhere.jobId = jobId;
    if (category && category !== 'all') costWhere.category = category;

    // Total APPROVED costs for the specific filters
    const approvedCosts = await prisma.costTracking.aggregate({
        _sum: { amount: true },
        where: { ...costWhere, status: 'APPROVED' }
    });

    const pendingCostsCount = await prisma.costTracking.count({
        where: { ...costWhere, status: 'PENDING' }
    });

    return {
        totalJobs,
        pendingJobs,
        inProgressJobs,
        completedJobs,
        totalCost: approvedCosts._sum.amount || 0,
        pendingApprovals: pendingCostsCount
    };
}

export async function getCostBreakdown(startDate: Date, endDate: Date, status?: string, jobStatus?: string, jobId?: string, category?: string) {
    const where: any = {
        date: {
            gte: startDate,
            lte: endDate
        }
    };

    if (status && status !== 'all') {
        where.status = status;
    } else {
        where.status = { not: 'REJECTED' };
    }

    if (jobStatus && jobStatus !== 'all') {
        where.job = { ...where.job, status: jobStatus };
    }

    if (jobId && jobId !== 'all') {
        where.jobId = jobId;
    }

    if (category && category !== 'all') {
        where.category = category;
    }

    const costs = await prisma.costTracking.groupBy({
        by: ['category'],
        _sum: { amount: true },
        where
    });

    const breakdown: Record<string, number> = {};
    costs.forEach(cost => {
        if (cost.category && cost._sum.amount) {
            breakdown[cost.category] = cost._sum.amount;
        }
    });

    return breakdown;
}

export async function getCostTrend(startDate: Date, endDate: Date, status?: string, jobStatus?: string, jobId?: string, category?: string) {
    const where: any = {
        date: { gte: startDate, lte: endDate }
    };

    if (status && status !== 'all') where.status = status;
    else where.status = { not: 'REJECTED' };

    if (jobStatus && jobStatus !== 'all') where.job = { ...where.job, status: jobStatus };
    if (jobId && jobId !== 'all') where.jobId = jobId;
    if (category && category !== 'all') where.category = category;

    const costs = await prisma.costTracking.findMany({
        where,
        select: { date: true, amount: true, category: true },
        orderBy: { date: 'asc' }
    });

    const trendMap: Record<string, Record<string, number>> = {};
    const categoriesSet = new Set<string>();

    costs.forEach(cost => {
        const dateStr = cost.date.toISOString().split('T')[0];
        const cat = cost.category || 'Diğer';
        categoriesSet.add(cat);

        if (!trendMap[dateStr]) trendMap[dateStr] = {};
        trendMap[dateStr][cat] = (trendMap[dateStr][cat] || 0) + cost.amount;
    });

    const categories = Array.from(categoriesSet);
    const data = Object.entries(trendMap).map(([date, values]) => ({
        date,
        ...values
    }));

    return { data, categories };
}

export async function getTotalCostTrend(startDate: Date, endDate: Date, status?: string, jobStatus?: string, jobId?: string, category?: string) {
    const where: any = {
        date: { gte: startDate, lte: endDate }
    };

    if (status && status !== 'all') where.status = status;
    else where.status = { not: 'REJECTED' };

    if (jobStatus && jobStatus !== 'all') where.job = { ...where.job, status: jobStatus };
    if (jobId && jobId !== 'all') where.jobId = jobId;
    if (category && category !== 'all') where.category = category;

    const costs = await prisma.costTracking.findMany({
        where,
        select: { date: true, amount: true },
        orderBy: { date: 'asc' }
    });

    const trendMap: Record<string, number> = {};
    costs.forEach(cost => {
        const dateStr = cost.date.toISOString().split('T')[0];
        trendMap[dateStr] = (trendMap[dateStr] || 0) + cost.amount;
    });

    return Object.entries(trendMap).map(([date, amount]) => ({
        date,
        amount
    }));
}

export async function getPendingCostsList(startDate: Date, endDate: Date, jobStatus?: string, jobId?: string, category?: string) {
    const where: any = {
        date: { gte: startDate, lte: endDate },
        status: 'PENDING'
    };

    if (jobStatus && jobStatus !== 'all') where.job = { status: jobStatus };
    if (jobId && jobId !== 'all') where.jobId = jobId;
    if (category && category !== 'all') where.category = category;

    return await prisma.costTracking.findMany({
        where,
        include: {
            job: true,
            createdBy: true
        },
        orderBy: { date: 'desc' }
    });
}

export async function getJobsListForFilter(jobStatus?: string) {
    const where: any = {};
    if (jobStatus && jobStatus !== 'all') {
        where.status = jobStatus;
    }

    return await prisma.job.findMany({
        where,
        select: { id: true, title: true },
        orderBy: { title: 'asc' }
    });
}

export async function getCategoriesForFilter() {
    const categories = await prisma.costTracking.groupBy({
        by: ['category'],
        where: { category: { not: null } }
    });
    return categories.map(c => c.category as string);
}

export async function getJobStatusDistribution(startDate: Date, endDate: Date, jobStatus?: string, jobId?: string) {
    const where: any = {
        createdAt: {
            gte: startDate,
            lte: endDate
        }
    };

    if (jobStatus && jobStatus !== 'all') {
        where.status = jobStatus;
    }

    if (jobId && jobId !== 'all') {
        where.id = jobId;
    }

    const jobs = await prisma.job.groupBy({
        by: ['status'],
        _count: true,
        where
    });

    const distribution: Record<string, number> = {};
    jobs.forEach(job => {
        distribution[job.status] = job._count;
    });

    return distribution;
}

export async function getTeamPerformance(startDate: Date, endDate: Date, jobStatus?: string, jobId?: string) {
    const where: any = {
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
    };

    if (jobStatus && jobStatus !== 'all') {
        where.status = jobStatus;
    }

    if (jobId && jobId !== 'all') {
        where.id = jobId;
    }

    const jobs = await prisma.job.findMany({
        where,
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

export async function getWeeklyCompletedSteps() {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);
    last7Days.setHours(0, 0, 0, 0);

    const prev7Days = new Date(last7Days);
    prev7Days.setDate(last7Days.getDate() - 7);
    prev7Days.setHours(0, 0, 0, 0);

    // Fetch steps completed in the last 14 days
    const steps = await prisma.jobStep.findMany({
        where: {
            isCompleted: true,
            completedAt: { gte: prev7Days, lte: today }
        },
        include: {
            job: {
                select: { title: true }
            }
        },
        orderBy: { completedAt: 'asc' }
    });

    const categories = ['Hazırlık', 'Montaj', 'Test', 'Paketleme', 'Diğer'];
    
    const formatData = (startDate: Date, endDate: Date) => {
        const days: Record<string, any> = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i + 1);
            const dateStr = d.toISOString().split('T')[0];
            days[dateStr] = { date: dateStr, total: 0 };
            categories.forEach(cat => days[dateStr][cat] = 0);
            days[dateStr].jobs = [];
        }

        steps.filter(s => s.completedAt! >= startDate && s.completedAt! <= endDate).forEach(step => {
            const dateStr = step.completedAt!.toISOString().split('T')[0];
            if (days[dateStr]) {
                const cat = categories.find(c => step.title.toLowerCase().includes(c.toLowerCase())) || 'Diğer';
                days[dateStr][cat]++;
                days[dateStr].total++;
                if (!days[dateStr].jobs.find((j: any) => j.id === step.jobId)) {
                    days[dateStr].jobs.push({ id: step.jobId, title: step.job.title });
                }
            }
        });

        return Object.values(days);
    };

    const currentWeek = formatData(last7Days, today);
    const previousWeek = formatData(prev7Days, last7Days);

    return {
        currentWeek,
        previousWeek,
        categories
    };
}

export async function getCostList(startDate: Date, endDate: Date, status?: string, jobStatus?: string, jobId?: string, category?: string) {
    const where: any = {
        date: { gte: startDate, lte: endDate }
    };

    if (status && status !== 'all') where.status = status;
    else where.status = { not: 'REJECTED' };

    if (jobStatus && jobStatus !== 'all') where.job = { ...where.job, status: jobStatus };
    if (jobId && jobId !== 'all') where.jobId = jobId;
    if (category && category !== 'all') where.category = category;

    return await prisma.costTracking.findMany({
        where,
        include: {
            job: {
                select: { title: true }
            },
            createdBy: {
                select: { name: true }
            }
        },
        orderBy: { date: 'desc' }
    });
}
