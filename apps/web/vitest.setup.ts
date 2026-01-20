import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    job: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    costTracking: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))
