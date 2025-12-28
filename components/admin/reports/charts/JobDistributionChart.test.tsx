import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import JobDistributionChart from './JobDistributionChart'

beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
})

describe('JobDistributionChart', () => {
    const mockData = [
        { name: 'Tamamlandı', value: 10 },
        { name: 'Devam Ediyor', value: 5 }
    ]

    it('should render chart title', () => {
        render(<JobDistributionChart data={mockData} />)
        expect(screen.getByText('İş Dağılımı')).toBeInTheDocument()
    })
})
