import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import CostTrendChart from './CostTrendChart'

// Mock ResizeObserver
beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
})

describe('CostTrendChart', () => {
    const mockData = [
        { date: '2025-01-01', amount: 100 },
        { date: '2025-01-02', amount: 200 }
    ]

    it('should render chart title', () => {
        render(<CostTrendChart data={mockData} categories={['amount']} />)
        expect(screen.getByText(/Maliyet Trendi/i)).toBeInTheDocument()
    })

    // It's hard to test SVG internals of Recharts with jsdom, 
    // but we can check if the component renders without crashing and shows basic elements.
})
