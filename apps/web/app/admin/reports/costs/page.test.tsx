import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CostReportPage from './page'
import * as reportData from '@/lib/data/reports'

// Mock the data fetching
vi.mock('@/lib/data/reports', () => ({
    getCostBreakdown: vi.fn(),
    getReportStats: vi.fn(),
    getJobsListForFilter: vi.fn(),
    getCategoriesForFilter: vi.fn(),
    getCostTrend: vi.fn(),
    getTotalCostTrend: vi.fn(),
    getPendingCostsList: vi.fn()
}))

// Mock UI components that might cause issues in test environment
vi.mock('@/components/admin/reports/charts/CostTrendChart', () => ({
    default: () => <div data-testid="cost-trend-chart">Chart</div>
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
    useSearchParams: () => ({ get: vi.fn(), toString: () => '' }),
}))

describe('CostReportPage', () => {
    it('should render page title', async () => {
        // Mock return value
        vi.mocked(reportData.getCostBreakdown).mockResolvedValue({ 'MATERIAL': 1000 })
        vi.mocked(reportData.getReportStats).mockResolvedValue({
            totalJobs: 10, pendingJobs: 2, inProgressJobs: 3, completedJobs: 5, totalCost: 1000, pendingApprovals: 1
        })
        vi.mocked(reportData.getJobsListForFilter).mockResolvedValue([])
        vi.mocked(reportData.getCategoriesForFilter).mockResolvedValue([])
        vi.mocked(reportData.getCostTrend).mockResolvedValue({ data: [], categories: [] })
        vi.mocked(reportData.getTotalCostTrend).mockResolvedValue([])
        vi.mocked(reportData.getPendingCostsList).mockResolvedValue([])

        const Page = await CostReportPage({ searchParams: Promise.resolve({}) });
        render(Page)

        expect(screen.getByText('Maliyet Raporu')).toBeInTheDocument()
    })
})
