import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PerformanceReportPage from './page'
import * as reportData from '@/lib/data/reports'

vi.mock('@/lib/data/reports', () => ({
    getJobStatusDistribution: vi.fn(),
    getTeamPerformance: vi.fn(),
    getReportStats: vi.fn(),
    getJobsListForFilter: vi.fn(),
    getCategoriesForFilter: vi.fn()
}))

vi.mock('@/components/admin/reports/charts/JobDistributionChart', () => ({ default: () => <div>Job Chart</div> }))
vi.mock('@/components/admin/reports/charts/TeamPerformanceChart', () => ({ default: () => <div>Team Chart</div> }))

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
    useSearchParams: () => ({ get: vi.fn(), toString: () => '' }),
}))

describe('PerformanceReportPage', () => {
    it('should render page title', async () => {
        vi.mocked(reportData.getJobStatusDistribution).mockResolvedValue({ 'COMPLETED': 10 })
        vi.mocked(reportData.getTeamPerformance).mockResolvedValue([{ teamName: 'A', totalJobs: 5, avgCompletionTimeMinutes: 100 }])
        vi.mocked(reportData.getReportStats).mockResolvedValue({
            totalJobs: 10, pendingJobs: 2, inProgressJobs: 3, completedJobs: 5, totalCost: 1000, pendingApprovals: 1
        })
        vi.mocked(reportData.getJobsListForFilter).mockResolvedValue([])
        vi.mocked(reportData.getCategoriesForFilter).mockResolvedValue([])

        const Page = await PerformanceReportPage({ searchParams: Promise.resolve({}) });
        render(Page)

        expect(screen.getByText('Performans Raporu')).toBeInTheDocument()
    })
})
