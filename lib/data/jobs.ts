import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type JobFilter = {
  search?: string;
  status?: string;
  priority?: string;
  customerId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
};

export type GetJobsParams = {
  page?: number;
  limit?: number;
  filter?: JobFilter;
};

export async function getJobs({ page = 1, limit = 20, filter }: GetJobsParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.JobWhereInput = {};

  if (filter?.search) {
    where.OR = [
      { title: { contains: filter.search, mode: "insensitive" } },
      { customer: { company: { contains: filter.search, mode: "insensitive" } } },
      { customer: { user: { name: { contains: filter.search, mode: "insensitive" } } } }
    ];
  }

  if (filter?.status && filter.status !== 'ALL') {
    where.status = filter.status;
  }

  if (filter?.priority && filter.priority !== 'ALL') {
    where.priority = filter.priority;
  }

  if (filter?.customerId) {
    where.customerId = filter.customerId;
  }

  if (filter?.dateRange) {
    where.scheduledDate = {
      gte: filter.dateRange.start,
      lte: filter.dateRange.end
    };
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        assignments: {
          include: {
            team: true
          }
        },
        steps: {
          where: {
            subSteps: {
              some: {
                approvalStatus: 'PENDING'
              }
            }
          },
          select: { id: true }
        },
        costs: {
          where: { status: 'PENDING' },
          select: { id: true }
        },
        _count: {
          select: {
            steps: true
          }
        }
      }
    }),
    prisma.job.count({ where })
  ]);

  return {
    jobs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getJobStats() {
    const total = await prisma.job.count();
    const pending = await prisma.job.count({ where: { status: 'PENDING' } });
    const inProgress = await prisma.job.count({ where: { status: 'IN_PROGRESS' } });
    const completed = await prisma.job.count({ where: { status: 'COMPLETED' } });

    // Pending approvals (jobs with pending costs or pending sub-steps)
    // Note: This is a simplified count, a precise one would require a complex join or raw query
    // similar to how `jobs` query does it but for counting.
    // For now returning basic status stats.

    return { total, pending, inProgress, completed };
}
