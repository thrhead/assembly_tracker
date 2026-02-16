import { describe, it, expect, vi } from 'vitest'
import { generateCostReportPDF } from './pdf-generator'

// Mock jsPDF
const mockSave = vi.fn()
const mockGetNumberOfPages = vi.fn().mockReturnValue(1)
const mockSetFont = vi.fn()
const mockSetFontSize = vi.fn()
const mockSetTextColor = vi.fn()
const mockText = vi.fn()
const mockSetPage = vi.fn()
const mockAddPage = vi.fn()

vi.mock('jspdf', () => {
    return {
        default: class {
            constructor() {
                return {
                    setFont: mockSetFont,
                    setFontSize: mockSetFontSize,
                    setTextColor: mockSetTextColor,
                    text: mockText,
                    save: mockSave,
                    internal: {
                        pageSize: { height: 297 },
                        getNumberOfPages: mockGetNumberOfPages
                    },
                    setPage: mockSetPage,
                    addPage: mockAddPage
                }
            }
        }
    }
})

// Mock jspdf-autotable
vi.mock('jspdf-autotable', () => ({
    default: vi.fn()
}))

describe('generateCostReportPDF', () => {
    it('should generate pdf file with correct data', () => {
        const mockCosts = [
            {
                date: new Date('2025-01-01'),
                jobTitle: 'Job 1',
                category: 'Material',
                description: 'Desc',
                amount: 100,
                status: 'APPROVED',
                createdBy: 'User 1'
            }
        ]

        generateCostReportPDF(mockCosts)

        expect(mockSave).toHaveBeenCalledWith(expect.stringContaining('Maliyet_Raporu_'))
    })
})
