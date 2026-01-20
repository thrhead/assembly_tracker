'use client'

import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'
import { generateJobPDF, JobReportData } from '@/lib/pdf-generator'

interface PDFDownloadButtonProps {
    jobId?: string
    type?: 'job' | 'costs'
    filters?: Record<string, any>
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function PDFDownloadButton({ 
    jobId, 
    type = 'job',
    filters = {},
    variant = 'outline', 
    size = 'default' 
}: PDFDownloadButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = async () => {
        try {
            setIsGenerating(true)

            let url = ''
            const params = new URLSearchParams(filters)

            if (type === 'job' && jobId) {
                url = `/api/reports/job/${jobId}`
            } else if (type === 'costs') {
                url = `/api/reports/excel/costs?${params.toString()}` // Reusing the same API as excel for raw data
            }

            if (!url) throw new Error('Invalid download parameters')

            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Failed to fetch data')
            }

            const data = await response.json()

            // Dynamic import to avoid SSR issues
            const { generateJobPDF, generateCostReportPDF } = await import('@/lib/pdf-generator')

            if (type === 'job') {
                generateJobPDF(data)
            } else if (type === 'costs') {
                generateCostReportPDF(data)
            }

            toast.success('PDF raporu oluşturuldu', {
                description: 'Rapor başarıyla indirildi.'
            })
        } catch (error) {
            console.error('PDF generation error:', error)
            toast.error('PDF oluşturulamadı', {
                description: 'Bir hata oluştu. Lütfen tekrar deneyin.'
            })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleDownload}
            disabled={isGenerating}
        >
            <FileDown className="h-4 w-4 mr-2" />
            {isGenerating ? 'Oluşturuluyor...' : 'PDF İndir'}
        </Button>
    )
}
