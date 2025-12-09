import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { logger } from '@/lib/logger';


interface WorkerJobFilterParams {
  status: string | null;
}

function buildWorkerJobFilter(user: any, params: WorkerJobFilterParams) {
  const { status } = params;
  const where: any = {}

  // If not ADMIN or MANAGER, filter by assignments
  if (!['ADMIN', 'MANAGER'].includes(user.role)) {
    where.assignments = {
      some: {
        OR: [
          { workerId: user.id }, // Doğrudan atananlar
          { team: { members: { some: { userId: user.id } } } } // Ekibine atananlar
        ]
      }
    }
  }

  if (status) {
    where.status = status
  }

  return where
}

export async function GET(req: Request) {
  try {
    logger.info('Worker Jobs API: GET Request received');
    const session = await verifyAuth(req)
    if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
      logger.warn('Worker Jobs API: Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info(`Worker Jobs API: Session Found (User: ${session.user.email}, Role: ${session.user.role})`);

    const { searchParams } = new URL(req.url)

    const filterParams: WorkerJobFilterParams = {
      status: searchParams.get('status')
    };

    const where = buildWorkerJobFilter(session.user, filterParams)

    // Pagination
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : null;

    logger.info(`Worker Jobs API: Querying DB for user ${session.user.id}`);

    const queryOptions: any = {
      where,
      orderBy: [
        { priority: 'desc' }, // Acil işler önce
        { scheduledDate: 'asc' }, // Tarihi yakın olanlar önce
        { createdAt: 'desc' }
      ],
      include: {
        customer: {
          select: {
            company: true,
            user: {
              select: { name: true, phone: true }
            }
          }
        },
        steps: {
          select: {
            id: true,
            isCompleted: true
          }
        }
      }
    };

    if (limit) {
      queryOptions.take = limit;
      if (page) {
        queryOptions.skip = (page - 1) * limit;
      }
    }

    const jobs = await prisma.job.findMany(queryOptions);

    logger.info(`Worker Jobs API: Found ${jobs.length} jobs`);

    if (page && limit) {
      const total = await prisma.job.count({ where });
      return NextResponse.json({
        data: jobs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    return NextResponse.json(jobs)
  } catch (error) {
    logger.error(`Worker Jobs API Error: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

