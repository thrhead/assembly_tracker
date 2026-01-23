import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

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
        include: {
            job: {
                include: {
                    customer: { select: { company: true } },
                    steps: {
                        select: {
                            startedAt: true,
                            completedAt: true,
                            isCompleted: true
                        }
                    },
                    costs: {
                        where: { status: 'APPROVED' },
                        select: {
                            amount: true,
                            category: true
                        }
                    }
                }
            }
        },
        orderBy: { assignedAt: 'desc' }
    });

    const jobs = assignments.map(a => a.job);

    // 2. Calculate Total Working Hours
    let totalWorkMinutes = 0;
    jobs.forEach(job => {
        job.steps.forEach(step => {
            if (step.startedAt && step.completedAt) {
                const diff = (step.completedAt.getTime() - step.startedAt.getTime()) / (1000 * 60);
                totalWorkMinutes += diff;
            }
        });
    });
    const totalWorkingHours = Math.round(totalWorkMinutes / 60);

    // 3. Calculate Financials
    let totalExpenses = 0;
    const categoryBreakdown: Record<string, number> = {};

    jobs.forEach(job => {
        job.costs.forEach(cost => {
            totalExpenses += cost.amount;
            const cat = cost.category || 'Diğer';
            categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + cost.amount;
        });
    });

    // 4. Calculate Performance
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length;
    const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

    return {
        jobs,
        stats: {
            totalJobs,
            completedJobs,
            totalWorkingHours,
            totalExpenses,
            successRate,
            categoryBreakdown: Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value }))
        }
    };
}
