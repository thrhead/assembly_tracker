import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CostReportPage from './page'
import * as reportData from '@/lib/data/reports'

// Mock the data fetching
vi.mock('@/lib/data/reports', () => ({
    getCostBreakdown: vi.fn(),
    getReportStats: vi.fn()
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
            totalJobs: 10, pendingJobs: 2, inProgressJobs: 3, completedJobs: 5
        })

        const Page = await CostReportPage({ searchParams: Promise.resolve({}) });
        render(Page)

        expect(screen.getByText('Maliyet Raporu')).toBeInTheDocument()
    })
})
