import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type UserFilter = {
  search?: string;
  role?: string;
};

export type GetUsersParams = {
  page?: number;
  limit?: number;
  filter?: UserFilter;
};

export async function getUsers({ page = 1, limit = 10, filter }: GetUsersParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (filter?.search) {
    where.OR = [
      { name: { contains: filter.search, mode: "insensitive" } },
      { email: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  if (filter?.role && filter.role !== "ALL") {
    where.role = filter.role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserStats() {
  const total = await prisma.user.count();
  const active = await prisma.user.count({ where: { isActive: true } });
  const newUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }
  });

  return { total, active, newUsers };
}

export async function getUser(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      assignedJobs: {
        take: 5,
        orderBy: { assignedAt: 'desc' },
        include: {
          job: true
        }
      },
      managedTeams: true,
      teamMember: {
        include: {
          team: true
        }
      },
      createdJobs: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}
