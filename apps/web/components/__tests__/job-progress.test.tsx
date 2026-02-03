import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { JobDetailsView } from '../job-details-view'

// Mock job data
const mockJob = {
  id: 'test-id',
  title: 'Test Montajı',
  description: 'Test açıklaması',
  status: 'IN_PROGRESS',
  priority: 'MEDIUM',
  location: 'İstanbul',
  createdAt: new Date(),
  customer: {
    company: 'Test Co',
    user: { name: 'Müşteri', email: 'test@test.com', phone: '123' }
  },
  assignments: [],
  steps: [
    { id: '1', title: 'Adım 1', isCompleted: true, order: 1, completedAt: new Date(), completedBy: { name: 'Ali' } },
    { id: '2', title: 'Adım 2', isCompleted: false, order: 2, completedAt: null, completedBy: null },
    { id: '3', title: 'Adım 3', isCompleted: false, order: 3, completedAt: null, completedBy: null },
    { id: '4', title: 'Adım 4', isCompleted: false, order: 4, completedAt: null, completedBy: null },
  ]
}

describe.skip('JobDetailsView Progress Calculation', () => {
  it('should correctly calculate and display the progress percentage', () => {
    render(<JobDetailsView job={mockJob as any} />)

    // 1 step completed out of 4 = 25%
    const progressText = screen.getByText(/25%/i)
    expect(progressText).toBeDefined()

    const stepsText = screen.getByText(/1\/4 Adım Tamamlandı/i)
    expect(stepsText).toBeDefined()
  })

  it('should display 0% when no steps are completed', () => {
    const noProgressJob = {
      ...mockJob,
      steps: mockJob.steps.map(s => ({ ...s, isCompleted: false }))
    }
    render(<JobDetailsView job={noProgressJob as any} />)
    expect(screen.getByText(/0%/i)).toBeDefined()
  })

  it('should display 100% when all steps are completed', () => {
    const completedJob = {
      ...mockJob,
      steps: mockJob.steps.map(s => ({ ...s, isCompleted: true }))
    }
    render(<JobDetailsView job={completedJob as any} />)
    expect(screen.getByText(/100%/i)).toBeDefined()
  })
})
