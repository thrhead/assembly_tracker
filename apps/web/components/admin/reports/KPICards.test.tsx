import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import KPICards from './KPICards'

describe('KPICards', () => {
    const mockStats = {
        totalJobs: 100,
        completedJobs: 75,
        totalCost: 50000,
        pendingApprovals: 5
    }

    it('should display total jobs correctly', () => {
        render(<KPICards stats={mockStats} />)
        expect(screen.getByText('Toplam İş')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should display completed jobs correctly', () => {
        render(<KPICards stats={mockStats} />)
        expect(screen.getByText('Tamamlanan')).toBeInTheDocument()
        expect(screen.getByText('75')).toBeInTheDocument()
    })

    it('should display total cost formatted as currency', () => {
        render(<KPICards stats={mockStats} />)
        expect(screen.getByText('Toplam Maliyet')).toBeInTheDocument()
        // Check for currency formatting (e.g., ₺50.000 or similar, allow partial match for currency symbol)
        expect(screen.getByText(/50[.,]000/)).toBeInTheDocument()
    })

    it('should display pending approvals', () => {
        render(<KPICards stats={mockStats} />)
        expect(screen.getByText('Bekleyen Onaylar')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
    })
})
