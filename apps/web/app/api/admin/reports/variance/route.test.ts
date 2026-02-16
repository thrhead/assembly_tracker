import { vi, describe, it, expect, afterEach } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/db';
import { verifyAdminOrManager } from '@/lib/auth-helper';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db', () => ({
    prisma: {
        job: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock('@/lib/auth-helper', () => ({
    verifyAdminOrManager: vi.fn(),
}));

describe('GET /api/admin/reports/variance', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if unauthorized', async () => {
        (verifyAdminOrManager as any).mockResolvedValue(null);

        const req = new Request('http://localhost/api/admin/reports/variance');
        const res = await GET(req);

        expect(res.status).toBe(401);
    });

    it('should calculate variance correctly (Issue #32)', async () => {
        (verifyAdminOrManager as any).mockResolvedValue({ user: { id: 'admin' } });

        const mockJobs = [
            {
                id: '1',
                jobNo: 'JOB-001',
                title: 'Test Job',
                status: 'COMPLETED',
                budget: 1000,
                estimatedDuration: 120, // 2 hours
                startedAt: new Date('2026-01-01T10:00:00Z'),
                completedDate: new Date('2026-01-01T13:00:00Z'), // 3 hours took
                scheduledDate: null,
                scheduledEndDate: null,
                costs: [
                    { amount: 1200 } // Over budget
                ],
                customer: { company: 'Test Corp' }
            },
            {
                id: '2',
                jobNo: 'JOB-002',
                title: 'Efficient Job',
                status: 'COMPLETED',
                budget: 2000,
                estimatedDuration: null, // No explicit estimate
                // Scheduled for 4 hours
                scheduledDate: new Date('2026-01-02T09:00:00Z'),
                scheduledEndDate: new Date('2026-01-02T13:00:00Z'),
                startedAt: new Date('2026-01-02T09:00:00Z'),
                completedDate: new Date('2026-01-02T12:00:00Z'), // 3 hours took
                costs: [
                    { amount: 1500 } // Under budget
                ],
                customer: { company: 'Good Corp' }
            }
        ];

        (prisma.job.findMany as any).mockResolvedValue(mockJobs);

        const req = new Request('http://localhost/api/admin/reports/variance');
        const res = await GET(req);

        expect(res.status).toBe(200);
        const data = await res.json();

        expect(data).toHaveLength(2);

        // Job 1 Checks (Over Budget, Over Time)
        const job1 = data.find((j: any) => j.id === '1');
        expect(job1.plannedCost).toBe(1000);
        expect(job1.actualCost).toBe(1200);
        expect(job1.costVariance).toBe(200); // +200 Over
        expect(job1.actualDuration).toBe(180); // 3 hours * 60
        expect(job1.plannedDuration).toBe(120);
        expect(job1.timeVariance).toBe(60); // +60 Over

        // Job 2 Checks (Under Budget, Under Time, Fallback Duration)
        const job2 = data.find((j: any) => j.id === '2');
        expect(job2.plannedCost).toBe(2000);
        expect(job2.actualCost).toBe(1500);
        expect(job2.costVariance).toBe(-500); // -500 Under
        expect(job2.plannedDuration).toBe(240); // 4 hours from schedule
        expect(job2.actualDuration).toBe(180); // 3 hours
        expect(job2.timeVariance).toBe(-60); // -60 Under
    });
});
