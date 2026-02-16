
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileTextIcon, Loader2Icon } from 'lucide-react'
import { generateProformaPDF } from '@/lib/proforma-generator'

interface ProformaDownloadButtonProps {
    job: any
}

export function ProformaDownloadButton({ job }: ProformaDownloadButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        setLoading(true)
        try {
            // Transform job data to proforma format
            const proformaData = {
                id: job.id,
                title: job.title,
                currency: 'TRY',
                customer: {
                    company: job.customer.company,
                    address: job.customer.address,
                    taxId: job.customer.taxId
                },
                items: job.steps.map((step: any) => ({
                    description: step.title,
                    quantity: 1,
                    price: 2500 // Example: Her adım için sabit bir birim fiyat (Gerçekte DB'den gelmeli)
                })),
                completedDate: job.completedDate ? new Date(job.completedDate) : null
            }

            generateProformaPDF(proformaData)
        } catch (error) {
            console.error('PDF generation error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={loading}
            className="bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40 text-primary transition-all font-semibold"
        >
            {loading ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <FileTextIcon className="w-4 h-4 mr-2" />}
            Proforma Export
        </Button>
    )
}
