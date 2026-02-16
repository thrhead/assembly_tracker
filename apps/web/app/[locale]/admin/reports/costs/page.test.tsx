import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CostReportPage from './page'

// Mock everything since we just want to test that the component redirects
vi.mock('@/lib/navigation', () => ({
    redirect: vi.fn(),
}))

describe('CostReportPage', () => {
    it('should redirect to main reports page', async () => {
        const { redirect } = await import('@/lib/navigation')

        // Render the page component
        CostReportPage()

        // Check if redirect was called with correct path
        expect(redirect).toHaveBeenCalledWith('/admin/reports?tab=costs')
    })
})
