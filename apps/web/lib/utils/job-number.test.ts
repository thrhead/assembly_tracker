import { vi, describe, it, expect, afterEach } from 'vitest';
import { generateJobNumber, formatTaskNumber } from './job-number';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
    prisma: {
        job: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
        },
    },
}));

describe('Job Number Utils', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('generateJobNumber', () => {
        // The implementation completely ignores projectNo argument, so we test accordingly
        it('should generate global AS- number ignoring projectNo', async () => {
            const currentYear = new Date().getFullYear();
            const yearPrefix = `AS-${currentYear}-`;

            // Mock finding last job
            (prisma.job.findFirst as any).mockResolvedValue({
                jobNo: `AS-${currentYear}-0003`,
            });

            const result = await generateJobNumber('PRJ-123'); // Argument is ignored in current impl

            expect(prisma.job.findFirst).toHaveBeenCalledWith({
                where: {
                    jobNo: {
                        startsWith: yearPrefix,
                    },
                },
                orderBy: {
                    jobNo: 'desc',
                },
                select: {
                    jobNo: true,
                },
            });
            expect(result).toBe(`AS-${currentYear}-0004`);
        });

        it('should generate first sequence if no jobs exist for year', async () => {
            const currentYear = new Date().getFullYear();
            (prisma.job.findFirst as any).mockResolvedValue(null);

            const result = await generateJobNumber(undefined);

            expect(result).toBe(`AS-${currentYear}-0001`);
        });
    });

    describe('formatTaskNumber', () => {
        // Current implementation: formatTaskNumber(jobNo, stepOrder) -> jobNo-stepOrder (padded)
        // No 'SUB' string in the code read
        it('should format task number correctly', () => {
            const result = formatTaskNumber('JOB-100', 1);
            expect(result).toBe('JOB-100-01');
        });

        it('should format sub-task number correctly', () => {
            const result = formatTaskNumber('JOB-100', 2, 3);
            expect(result).toBe('JOB-100-02-03');
        });

        it('should pad single digits with zero', () => {
            const result = formatTaskNumber('JOB-100', 5, 9);
            expect(result).toBe('JOB-100-05-09');
        });
    });
});
