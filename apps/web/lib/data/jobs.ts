import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type JobFilter = {
  search?: string;
  status?: string | string[]; // Allow array for multi-select
  priority?: string;
  customerId?: string;
  teams?: string[]; // New filter for teams
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
  try {
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {};

    if (filter?.search) {
      where.OR = [
        { id: { contains: filter.search, mode: "insensitive" } },
        { title: { contains: filter.search, mode: "insensitive" } },
        { jobNo: { contains: filter.search, mode: "insensitive" } },
        { customer: { company: { contains: filter.search, mode: "insensitive" } } },
        { customer: { user: { name: { contains: filter.search, mode: "insensitive" } } } }
      ];
    }

    // Handle status (single or multiple)
    if (filter?.status) {
      if (Array.isArray(filter.status) && filter.status.length > 0) {
        where.status = { in: filter.status };
      } else if (typeof filter.status === 'string' && filter.status !== 'ALL') {
        where.status = filter.status;
      }
    }

    // Handle teams
    if (filter?.teams && filter.teams.length > 0) {
      where.assignments = {
        some: {
          teamId: { in: filter.teams }
        }
      };
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
              team: {
                include: {
                  lead: { select: { id: true, name: true } },
                  members: {
                    include: {
                      user: { select: { id: true, name: true } }
                    }
                  }
                }
              },
              worker: { select: { id: true, name: true } }
            }
          },
          steps: {
            select: {
              id: true,
              isCompleted: true,
              subSteps: {
                select: { approvalStatus: true }
              }
            }
          },
          costs: {
            select: {
              id: true,
              amount: true,
              status: true
            }
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
  } catch (error: any) {
    console.error("ERROR: getJobs failed:", error.message);
    return {
      jobs: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 }
    };
  }
}

export async function getJobStats() {
  try {
    const total = await prisma.job.count();
    const pending = await prisma.job.count({ where: { status: 'PENDING' } });
    const inProgress = await prisma.job.count({ where: { status: 'IN_PROGRESS' } });
    const completed = await prisma.job.count({ where: { status: 'COMPLETED' } });

    return { total, pending, inProgress, completed };
  } catch (error: any) {
    console.error("ERROR: getJobStats failed:", error.message);
    return { total: 0, pending: 0, inProgress: 0, completed: 0 };
  }
}

export async function getJob(id: string) {
  try {
    return await prisma.job.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        jobLead: {
          select: {
            id: true,
            name: true
          }
        },
        assignments: {
          include: {
            team: {
              include: {
                lead: true,
                members: {
                  include: {
                    user: true
                  }
                }
              }
            },
            worker: true
          }
        },
        approvals: {
          where: {
            status: 'PENDING'
          },
          include: {
            requester: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        steps: {
          orderBy: {
            order: 'asc'
          },
          include: {
            completedBy: {
              select: {
                name: true
              }
            },
            subSteps: {
              orderBy: {
                order: 'asc'
              },
              include: {
                photos: true
              }
            },
            photos: {
              orderBy: {
                uploadedAt: 'desc'
              },
              include: {
                uploadedBy: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        costs: {
          orderBy: {
            date: 'desc'
          },
          include: {
            createdBy: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
  } catch (error: any) {
    console.error(`ERROR: getJob ${id} failed:`, error.message);
    return null;
  }
}
