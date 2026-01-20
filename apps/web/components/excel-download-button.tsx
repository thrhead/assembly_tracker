'use client'

import { FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

interface ExcelDownloadButtonProps {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    jobId?: string
    type: 'job' | 'jobs' | 'costs'
    filters?: Record<string, any>
}

export function ExcelDownloadButton({
    variant = 'outline',
    size = 'default',
    jobId,
    type,
    filters = {},
}: ExcelDownloadButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = async () => {
        try {
            setIsGenerating(true)

            let url = ''
            const params = new URLSearchParams(filters)

            if (type === 'job' && jobId) {
                url = `/api/reports/excel/job/${jobId}`
            } else if (type === 'jobs') {
                url = `/api/reports/excel/jobs?${params.toString()}`
            } else if (type === 'costs') {
                url = `/api/reports/excel/costs?${params.toString()}`
            }

            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Failed to generate Excel')
            }

            const data = await response.json()

            // Dynamic import to avoid SSR issues
            const { generateJobExcel, generateJobsListExcel, generateCostExcel } = await import('@/lib/excel-generator')

            if (type === 'job') {
                generateJobExcel(data)
            } else if (type === 'jobs') {
                generateJobsListExcel(data)
            } else if (type === 'costs') {
                generateCostExcel(data)
            }

            toast.success('Excel raporu oluşturuldu', {
                description: 'Dosya başarıyla indirildi.',
            })
        } catch (error) {
            console.error('Excel generation error:', error)
            toast.error('Excel oluşturulamadı', {
                description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
            })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Button variant={variant} size={size} onClick={handleDownload} disabled={isGenerating}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {isGenerating ? 'Oluşturuluyor...' : 'Excel İndir'}
        </Button>
    )
}
