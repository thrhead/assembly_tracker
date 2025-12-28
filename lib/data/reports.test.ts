import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCostBreakdown, getJobStatusDistribution, getTeamPerformance } from './reports'
import { prisma } from '@/lib/db'

describe('Report Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getCostBreakdown', () => {
        it('should aggregate costs by category', async () => {
            const mockCosts = [
                { category: 'MATERIAL', _sum: { amount: 1000 } },
                { category: 'TRAVEL', _sum: { amount: 500 } }
            ]
            vi.mocked(prisma.cost.groupBy).mockResolvedValue(mockCosts as any)

            const startDate = new Date('2025-01-01')
            const endDate = new Date('2025-01-31')

            const result = await getCostBreakdown(startDate, endDate)

            expect(prisma.cost.groupBy).toHaveBeenCalledWith({
                by: ['category'],
                _sum: { amount: true },
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: 'APPROVED'
                }
            })

            expect(result).toEqual({
                MATERIAL: 1000,
                TRAVEL: 500
            })
        })

        it('should return empty object if no costs found', async () => {
            vi.mocked(prisma.cost.groupBy).mockResolvedValue([])
            const result = await getCostBreakdown(new Date(), new Date())
            expect(result).toEqual({})
        })
    })

    describe('getJobStatusDistribution', () => {
        it('should count jobs by status', async () => {
            const mockDistribution = [
                { status: 'COMPLETED', _count: 10 },
                { status: 'IN_PROGRESS', _count: 5 },
                { status: 'PENDING', _count: 2 }
            ]
            vi.mocked(prisma.job.groupBy).mockResolvedValue(mockDistribution as any)

            const startDate = new Date('2025-01-01')
            const endDate = new Date('2025-01-31')

            const result = await getJobStatusDistribution(startDate, endDate)

            expect(prisma.job.groupBy).toHaveBeenCalledWith({
                by: ['status'],
                _count: true,
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            })

            expect(result).toEqual({
                COMPLETED: 10,
                IN_PROGRESS: 5,
                PENDING: 2
            })
        })
    })

    describe('getTeamPerformance', () => {
        it('should return team performance metrics', async () => {
            // Mocking a raw query result for team performance
            // Assuming we calculate average completion time and total jobs
            const mockPerformance = [
                { teamId: 1, teamName: 'Team A', totalJobs: 10, avgCompletionTime: 120 }, // 120 minutes
                { teamId: 2, teamName: 'Team B', totalJobs: 8, avgCompletionTime: 90 }
            ]
            
            // We might use findMany with aggregation or queryRaw. 
            // Let's assume we implement it using findMany and processing in JS for simplicity first, 
            // or use groupBy if possible. But average time usually requires calculation.
            // Let's assume we use prisma.job.findMany and calculate in memory for MVP, 
            // or queryRaw. Let's mock findMany for now to keep it simple and test logic.
            
            // Actually, let's assume we use a specialized query. 
            // For TDD, let's expect it to use findMany to fetch completed jobs and calculate.
            
            const mockJobs = [
                { 
                    teamId: '1', 
                    team: { name: 'Team A' }, 
                    status: 'COMPLETED',
                    startedAt: new Date('2025-01-01T10:00:00'),
                    completedDate: new Date('2025-01-01T12:00:00'), // 2 hours
                    assignments: [{ teamId: '1', team: { id: '1', name: 'Team A' } }]
                },
                { 
                    teamId: '1', 
                    team: { name: 'Team A' }, 
                    status: 'COMPLETED',
                    startedAt: new Date('2025-01-02T10:00:00'),
                    completedDate: new Date('2025-01-02T11:00:00'), // 1 hour
                    assignments: [{ teamId: '1', team: { id: '1', name: 'Team A' } }]
                }
            ]
            vi.mocked(prisma.job.findMany).mockResolvedValue(mockJobs as any)

            const result = await getTeamPerformance(new Date(), new Date())

            expect(result).toEqual([
                {
                    teamName: 'Team A',
                    totalJobs: 2,
                    avgCompletionTimeMinutes: 90 // (120 + 60) / 2
                }
            ])
        })
    })
})
