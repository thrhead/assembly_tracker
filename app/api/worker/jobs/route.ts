import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.join(process.cwd(), 'api_debug.log');

function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  try {
    fs.appendFileSync(LOG_FILE, `${timestamp} - ${message}\n`);
  } catch (e) {
    console.error('Failed to write to log file:', e);
  }
}

export async function GET(req: Request) {
  try {
    logToFile('Worker Jobs API: GET Request received');
    const session = await verifyAuth(req)
    if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
      logToFile('Worker Jobs API: Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logToFile(`Worker Jobs API: Session Found (User: ${session.user.email}, Role: ${session.user.role})`);

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}

    // If not ADMIN or MANAGER, filter by assignments
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      where.assignments = {
        some: {
          OR: [
            { workerId: session.user.id }, // Doğrudan atananlar
            { team: { members: { some: { userId: session.user.id } } } } // Ekibine atananlar
          ]
        }
      }
    }

    // Pagination
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : null;

    if (status) {
      where.status = status
    }

    logToFile(`Worker Jobs API: Querying DB for user ${session.user.id}`);

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

    logToFile(`Worker Jobs API: Found ${jobs.length} jobs`);

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
    logToFile(`Worker Jobs API Error: ${error}`);
    console.error('Worker jobs fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
