import { vi, describe, it, expect, afterEach } from 'vitest';
import { getJobs } from './jobs';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
    prisma: {
        job: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
    },
}));

describe('getJobs Data Fetching', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should filter jobs by search term (Issue #22)', async () => {
        // Mock the response
        (prisma.job.findMany as any).mockResolvedValue([]);
        (prisma.job.count as any).mockResolvedValue(0);

        const filter = { search: 'TEST-123' };
        await getJobs({ page: 1, limit: 10, filter });

        expect(prisma.job.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                OR: expect.arrayContaining([
                    { title: { contains: 'TEST-123', mode: 'insensitive' } },
                    { jobNo: { contains: 'TEST-123', mode: 'insensitive' } }, // Issue #22: Search by jobNo
                    { customer: { company: { contains: 'TEST-123', mode: 'insensitive' } } },
                ])
            })
        }));
    });

    it('should filter jobs by team', async () => {
        (prisma.job.findMany as any).mockResolvedValue([]);
        (prisma.job.count as any).mockResolvedValue(0);

        const filter = { teams: ['team-1', 'team-2'] };
        await getJobs({ filter });

        expect(prisma.job.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                assignments: {
                    some: {
                        teamId: { in: ['team-1', 'team-2'] }
                    }
                }
            })
        }));
    });

    it('should filter jobs by status array', async () => {
        (prisma.job.findMany as any).mockResolvedValue([]);
        (prisma.job.count as any).mockResolvedValue(0);

        const filter = { status: ['PENDING', 'IN_PROGRESS'] };
        await getJobs({ filter });

        expect(prisma.job.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                status: { in: ['PENDING', 'IN_PROGRESS'] }
            })
        }));
    });
});
