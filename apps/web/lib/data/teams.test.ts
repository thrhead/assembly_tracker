import { vi, describe, it, expect, afterEach } from 'vitest';
import { getAllTeamsReports, getTeamDetailedReports } from './teams';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
    prisma: {
        team: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
        },
        jobAssignment: {
            findMany: vi.fn(),
        }
    },
}));

describe('Teams Data', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllTeamsReports', () => {
        it('should aggregate reports from active teams', async () => {
            // Mock teams
            const mockTeams = [
                { id: '1', name: 'Alpha', isActive: true, lead: { name: 'Leader A' }, _count: { members: 5 } },
                { id: '2', name: 'Beta', isActive: true, lead: { name: 'Leader B' }, _count: { members: 3 } }
            ];

            (prisma.team.findMany as any).mockResolvedValue(mockTeams);

            // Mock detail calls
            // Since getAllTeamsReports calls getTeamDetailedReports internally, 
            // and getTeamDetailedReports queries DB, we need to mock DB responses deeper
            // OR we can mock getTeamDetailedReports if we export it correctly, but here we test integration logic with Prisma mock.

            // Mock responses for getTeamDetailedReports queries
            // 1. jobAssignment.findMany (for jobs)
            // 2. team.findUnique (for members)

            (prisma.jobAssignment.findMany as any).mockResolvedValue([]); // No jobs for simplicity
            (prisma.team.findUnique as any).mockResolvedValue({ members: [] });

            const result = await getAllTeamsReports();

            expect(prisma.team.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { isActive: true }
            }));

            expect(result.globalStats.totalTeams).toBe(2);
            expect(result.globalStats.totalEmployees).toBe(8); // 5 + 3
            expect(result.reports).toHaveLength(2);
            expect(result.reports[0].name).toBe('Alpha');
        });
    });

    describe('getTeamDetailedReports', () => {
        it('should calculate efficiency and financial stats correctly', async () => {
            const teamId = 'team-1';

            const mockJobAssignments = [
                {
                    job: {
                        id: 'j1',
                        status: 'COMPLETED',
                        scheduledDate: new Date('2026-01-15'),
                        customer: { company: 'Acme' },
                        steps: [
                            {
                                startedAt: new Date('2026-01-15T10:00:00'),
                                completedAt: new Date('2026-01-15T12:00:00'),
                                isCompleted: true,
                                completedById: 'u1'
                            }
                        ],
                        costs: [
                            { amount: 500, category: 'Material', date: new Date('2026-01-15'), status: 'APPROVED' }
                        ]
                    }
                }
            ];

            const mockTeam = {
                id: teamId,
                members: [
                    { userId: 'u1', user: { name: 'Worker 1', email: 'w1@test.com' } }
                ]
            };

            (prisma.jobAssignment.findMany as any).mockResolvedValue(mockJobAssignments);
            (prisma.team.findUnique as any).mockResolvedValue(mockTeam);

            const result = await getTeamDetailedReports(teamId);

            expect(result.stats.totalJobs).toBe(1);
            expect(result.stats.completedJobs).toBe(1);
            expect(result.stats.successRate).toBe(100);

            // 2 hours work
            expect(result.stats.totalWorkingHours).toBe(2);

            // 500 expense
            expect(result.stats.totalExpenses).toBe(500);

            // Check Member Stat
            const workerStat = result.stats.memberStats.find((m: any) => m.userId === 'u1');
            expect(workerStat.completedSteps).toBe(1);
            expect(workerStat.workHours).toBe(2);
        });
    });
});
