import { describe, it, expect, vi } from 'vitest'
import { generateCostExcel } from './excel-generator'
import * as XLSX from 'xlsx'

// Mock XLSX
vi.mock('xlsx', () => ({
    utils: {
        book_new: vi.fn(),
        aoa_to_sheet: vi.fn().mockReturnValue({}),
        book_append_sheet: vi.fn()
    },
    writeFile: vi.fn()
}))

describe('generateCostExcel', () => {
    it('should generate excel file with correct data', () => {
        const mockCosts = [
            {
                id: '1',
                jobTitle: 'Job 1',
                category: 'Material',
                description: 'Desc',
                amount: 100,
                status: 'APPROVED',
                date: new Date('2025-01-01'),
                createdBy: 'User 1'
            }
        ]

        generateCostExcel(mockCosts)

        expect(XLSX.utils.book_new).toHaveBeenCalled()
        expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled()
        expect(XLSX.writeFile).toHaveBeenCalledWith(undefined, expect.stringContaining('Maliyet_Raporu_'))
    })
})
