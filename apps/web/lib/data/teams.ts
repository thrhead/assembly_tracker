"use server"

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export type TeamFilter = {
    search?: string;
    isActive?: boolean;
};

export async function getTeams({ search }: { search?: string } = {}) {
    const where: Prisma.TeamWhereInput = {};

    if (search) {
        where.name = { contains: search, mode: "insensitive" };
    }

    const teams = await prisma.team.findMany({
        where,
        include: {
            lead: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
            _count: {
                select: {
                    members: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return teams;
}

export async function getTeamStats() {
    const total = await prisma.team.count();
    const active = await prisma.team.count({ where: { isActive: true } });

    // Sum member counts using aggregation
    const teamsWithMembers = await prisma.team.findMany({
        select: {
            _count: {
                select: { members: true }
            }
        }
    });

    const members = teamsWithMembers.reduce((sum, t) => sum + t._count.members, 0);

    return { total, active, members };
}

export async function getTeam(id: string) {
    return await prisma.team.findUnique({
        where: { id },
        include: {
            lead: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { joinedAt: 'desc' }
            },
            _count: {
                select: {
                    members: true,
                    assignments: true
                }
            }
        }
    });
}

export async function getTeamPerformanceStats(teamId: string) {
    const assignments = await prisma.jobAssignment.findMany({
        where: { teamId },
        include: {
            job: {
                select: {
                    status: true,
                    completedDate: true,
                    scheduledDate: true
                }
            }
        }
    });

    const totalJobs = assignments.length;
    const completedJobs = assignments.filter(a => a.job.status === 'COMPLETED').length;
    const inProgressJobs = assignments.filter(a => a.job.status === 'IN_PROGRESS').length;

    // Simple performance metric: completion rate
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    return {
        totalJobs,
        completedJobs,
        inProgressJobs,
        completionRate
    };
}

export async function getTeamDetailedReports(teamId: string) {
    // 1. Get all jobs related to this team
    const assignments = await prisma.jobAssignment.findMany({
        where: { teamId },
        orderBy: { assignedAt: 'desc' },
        include: {
            job: {
                include: {
                    customer: { select: { company: true } },
                    steps: {
                        select: {
                            startedAt: true,
                            completedAt: true,
                            isCompleted: true,
                            completedById: true
                        }
                    },
                    costs: {
                        where: { status: 'APPROVED' },
                        select: {
                            amount: true,
                            category: true,
                            date: true
                        }
                    }
                }
            }
        },
    });

    const jobs = assignments.map(a => a.job);

    // 2. Fetch Team and Members for detailed stats
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            }
        }
    });

    // 3. Calculate Total Working Hours and Member Stats
    let totalWorkMinutes = 0;
    const memberStatsMap: Record<string, { completedSteps: number, workMinutes: number }> = {};

    // Initialize member stats
    team?.members.forEach(m => {
        memberStatsMap[m.userId] = { completedSteps: 0, workMinutes: 0 };
    });

    jobs.forEach(job => {
        job.steps.forEach(step => {
            if (step.startedAt && step.completedAt) {
                const diff = (step.completedAt.getTime() - step.startedAt.getTime()) / (1000 * 60);
                totalWorkMinutes += diff;

                if (step.completedById && memberStatsMap[step.completedById]) {
                    memberStatsMap[step.completedById].workMinutes += diff;
                    if (step.isCompleted) {
                        memberStatsMap[step.completedById].completedSteps += 1;
                    }
                }
            }
        });
    });
    const totalWorkingHours = Math.round(totalWorkMinutes / 60);

    // 4. Calculate Financials and Trends
    let totalExpenses = 0;
    const categoryBreakdown: Record<string, number> = {};
    const monthlyTrend: Record<string, { jobCount: number, workHours: number, expenses: number }> = {};

    // Initialize last 6 months trend
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = format(d, 'MMM yy', { locale: tr });
        monthlyTrend[monthKey] = { jobCount: 0, workHours: 0, expenses: 0 };
    }

    jobs.forEach(job => {
        const jobDate = job.scheduledDate || job.createdAt;
        const monthKey = format(jobDate, 'MMM yy', { locale: tr });

        if (monthlyTrend[monthKey]) {
            monthlyTrend[monthKey].jobCount += 1;
        }

        job.steps.forEach(step => {
            if (step.startedAt && step.completedAt) {
                const diff = (step.completedAt.getTime() - step.startedAt.getTime()) / (1000 * 60 * 60);
                if (monthlyTrend[monthKey]) {
                    monthlyTrend[monthKey].workHours += diff;
                }
            }
        });

        job.costs.forEach(cost => {
            totalExpenses += cost.amount;
            const cat = cost.category || 'Diğer';
            categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + cost.amount;

            const costMonthKey = format(cost.date || jobDate, 'MMM yy', { locale: tr });
            if (monthlyTrend[costMonthKey]) {
                monthlyTrend[costMonthKey].expenses += cost.amount;
            }
        });
    });

    // 5. Calculate Performance
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length;
    const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

    // Efficiency Score (Roughly: successRate weighted with step completion)
    const totalStepsCompleted = Object.values(memberStatsMap).reduce((sum, s) => sum + s.completedSteps, 0);
    const efficiencyScore = Math.min(100, Math.round((successRate * 0.7) + (Math.min(30, totalStepsCompleted / (team?.members.length || 1)))));

    return {
        jobs,
        stats: {
            totalJobs,
            completedJobs,
            totalWorkingHours,
            totalExpenses,
            successRate,
            efficiencyScore,
            categoryBreakdown: Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value })),
            monthlyTrend: Object.entries(monthlyTrend).map(([month, data]) => ({
                month,
                ...data,
                workHours: Math.round(data.workHours)
            })),
            memberStats: team?.members.map(m => ({
                userId: m.userId,
                name: m.user.name,
                completedSteps: memberStatsMap[m.userId]?.completedSteps || 0,
                workHours: Math.round((memberStatsMap[m.userId]?.workMinutes || 0) / 60)
            })) || []
        }
    };
}

export async function getAllTeamsReports() {
    const teams = await prisma.team.findMany({
        where: { isActive: true },
        select: { id: true, name: true, lead: { select: { name: true } }, _count: { select: { members: true } } }
    });

    const reports = await Promise.all(teams.map(async (team) => {
        const details = await getTeamDetailedReports(team.id);
        return {
            id: team.id,
            name: team.name,
            leadName: team.lead?.name || 'Atanmamış',
            memberCount: team._count.members,
            stats: details.stats
        };
    }));

    // Calculate Global Stats
    const globalStats = {
        totalTeams: teams.length,
        totalEmployees: reports.reduce((sum, r) => sum + r.memberCount, 0),
        totalJobsCompleted: reports.reduce((sum, r) => sum + r.stats.completedJobs, 0),
        totalExpenses: reports.reduce((sum, r) => sum + r.stats.totalExpenses, 0),
        avgEfficiency: reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + r.stats.efficiencyScore, 0) / reports.length) : 0
    };

    return { reports, globalStats };
}
