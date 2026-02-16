import { prisma } from "@/lib/db"

export async function getWorkerJobs(userId: string) {
  return await prisma.job.findMany({
    where: {
      assignments: {
        some: {
          OR: [
            { workerId: userId },
            { team: { members: { some: { userId: userId } } } }
          ]
        }
      },
      status: {
        in: ['PENDING', 'IN_PROGRESS']
      }
    },
    orderBy: [
      { priority: 'desc' },
      { scheduledDate: 'asc' }
    ],
    include: {
      customer: {
        select: {
          company: true,
          address: true
        }
      },
      _count: {
        select: {
          steps: true
        }
      }
    }
  })
}
