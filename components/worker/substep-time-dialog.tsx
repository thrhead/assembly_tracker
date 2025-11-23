'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface SubStepTimeDialogProps {
    open: boolean
    onClose: () => void
    subStepTitle: string
    currentStartTime?: Date | null
    currentEndTime?: Date | null
    onSave: (startTime: Date, endTime: Date) => Promise<void>
}

export function SubStepTimeDialog({
    open,
    onClose,
    subStepTitle,
    currentStartTime,
    currentEndTime,
    onSave
}: SubStepTimeDialogProps) {
    const now = new Date()
    const [startTime, setStartTime] = useState<string>(
        currentStartTime
            ? format(currentStartTime, "yyyy-MM-dd'T'HH:mm")
            : format(now, "yyyy-MM-dd'T'HH:mm")
    )
    const [endTime, setEndTime] = useState<string>(
        currentEndTime
            ? format(currentEndTime, "yyyy-MM-dd'T'HH:mm")
            : format(now, "yyyy-MM-dd'T'HH:mm")
    )
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        const start = new Date(startTime)
        const end = new Date(endTime)

        // Validation
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            toast.error('Geçersiz tarih formatı')
            return
        }

        if (end <= start) {
            toast.error('Bitiş zamanı başlama zamanından sonra olmalıdır')
            return
        }

        if (end > new Date()) {
            toast.error('Bitiş zamanı gelecekte olamaz')
            return
        }

        try {
            setLoading(true)
            await onSave(start, end)
            toast.success('Alt görev tamamlandı')
            onClose()
        } catch (error) {
            toast.error('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Alt Görev Zamanları</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {subStepTitle}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startTime">Başlama Zamanı</Label>
                        <Input
                            id="startTime"
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            max={format(now, "yyyy-MM-dd'T'HH:mm")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endTime">Bitiş Zamanı</Label>
                        <Input
                            id="endTime"
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            max={format(now, "yyyy-MM-dd'T'HH:mm")}
                        />
                    </div>

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        💡 Alt görevin ne zaman başladığını ve bittiğini seçin.
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Kaydediliyor...' : 'Tamamla'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
