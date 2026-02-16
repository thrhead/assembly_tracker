import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PerformanceReportPage from './page'

// Mock the navigation module to capture the redirect
vi.mock('@/lib/navigation', () => ({
    redirect: vi.fn(),
}))

describe('PerformanceReportPage', () => {
    it('should redirect to main reports page', async () => {
        const { redirect } = await import('@/lib/navigation')

        // Render the page component
        PerformanceReportPage()

        // Check if redirect was called with correct path
        expect(redirect).toHaveBeenCalledWith('/admin/reports?tab=performance')
    })
})
