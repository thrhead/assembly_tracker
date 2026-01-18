import { prisma } from "@/lib/db"

export async function getAdminDashboardData() {
  const [
    activeWorkers,
    todaysCosts,
    pendingApprovalsCount,
    pendingCostsAgg,
    approvedCostsAgg
  ] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'WORKER',
        isActive: true,
        assignedJobs: {
          some: {
            job: {
              status: 'IN_PROGRESS'
            }
          }
        }
      },
      take: 5,
      select: {
        id: true,
        name: true,
        avatarUrl: true
      }
    }),
    prisma.costTracking.findMany({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      select: {
        amount: true
      }
    }),
    prisma.approval.count({
      where: {
        status: 'PENDING'
      }
    }),
    prisma.costTracking.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true }
    }),
    prisma.costTracking.aggregate({
      where: { status: 'APPROVED' },
      _sum: { amount: true }
    })
  ])

  const totalCostToday = todaysCosts.reduce((sum, cost) => sum + cost.amount, 0)
  const dailyBudget = 2000
  const budgetPercentage = Math.min(Math.round((totalCostToday / dailyBudget) * 100), 100)

  return {
    activeWorkers,
    totalCostToday,
    budgetPercentage,
    pendingApprovalsCount,
    totalPendingCost: pendingCostsAgg._sum.amount || 0,
    totalApprovedCost: approvedCostsAgg._sum.amount || 0
  }
}
