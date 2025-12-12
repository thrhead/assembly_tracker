import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type CustomerFilter = {
  search?: string;
  isActive?: boolean;
};

export type GetCustomersParams = {
  page?: number;
  limit?: number;
  filter?: CustomerFilter;
};

export async function getCustomers({ page = 1, limit = 20, filter }: GetCustomersParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = {};

  if (filter?.search) {
    where.OR = [
      { company: { contains: filter.search, mode: "insensitive" } },
      { user: { name: { contains: filter.search, mode: "insensitive" } } },
      { user: { email: { contains: filter.search, mode: "insensitive" } } }
    ];
  }

  if (filter?.isActive !== undefined) {
    where.user = {
      isActive: filter.isActive
    };
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            jobs: true
          }
        }
      }
    }),
    prisma.customer.count({ where })
  ]);

  return {
    customers,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCustomerStats() {
    const total = await prisma.customer.count();
    const active = await prisma.customer.count({
        where: { user: { isActive: true } }
    });

    // Most active customers (by job count) - would be good to have, but keeping it simple for now

    return { total, active };
}

export async function getCustomer(id: string) {
    return await prisma.customer.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    isActive: true,
                    createdAt: true
                }
            },
            jobs: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    assignments: {
                        include: {
                            team: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    jobs: true
                }
            }
        }
    });
}
