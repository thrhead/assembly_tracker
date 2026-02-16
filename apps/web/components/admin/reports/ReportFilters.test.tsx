import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ReportFilters from './ReportFilters'

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn(),
        toString: () => '',
    }),
}))

describe('ReportFilters', () => {
    it('should render date picker and job selection', () => {
        render(<ReportFilters jobs={[]} categories={[]} onFilterChange={vi.fn()} />)
        expect(screen.getByText(/Tüm Zamanlar/i)).toBeInTheDocument()
        expect(screen.getByText(/Tüm Montajlar/i)).toBeInTheDocument()
    })
})
