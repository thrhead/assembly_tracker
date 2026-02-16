'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'

interface DeleteJobButtonProps {
    jobId: string
    jobTitle: string
    variant?: "ghost" | "outline" | "destructive" | "default" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    showText?: boolean
}

export function DeleteJobButton({ 
    jobId, 
    jobTitle, 
    variant = "ghost", 
    size = "sm",
    showText = false
}: DeleteJobButtonProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`"${jobTitle}" işini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
            return
        }

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/jobs/${jobId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                toast.success('İş başarıyla silindi')
                router.refresh()
                if (showText) {
                    router.push('/admin/jobs')
                }
            } else {
                const data = await res.json()
                toast.error(data.error || 'İş silinemedi')
            }
        } catch (error) {
            toast.error('Silme işlemi sırasında bir hata oluştu')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleDelete}
            disabled={isDeleting}
            title="İşi Sil"
            className={variant === 'destructive' ? '' : 'text-red-600'}
        >
            <Trash2 className={`h-4 w-4 ${showText ? 'mr-2' : ''} ${isDeleting ? 'text-gray-400' : ''}`} />
            {showText && (isDeleting ? 'Siliniyor...' : 'İşi Sil')}
        </Button>
    )
}
