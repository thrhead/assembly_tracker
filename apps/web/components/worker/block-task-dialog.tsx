'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const BLOCK_REASONS = [
    { value: 'POWER_OUTAGE', label: 'Elektrik Kesintisi' },
    { value: 'MATERIAL_SHORTAGE', label: 'Malzeme Eksikliği' },
    { value: 'BAD_WEATHER', label: 'Hava Koşulları' },
    { value: 'EQUIPMENT_FAILURE', label: 'Ekipman Arızası' },
    { value: 'WAITING_APPROVAL', label: 'Onay Bekleniyor' },
    { value: 'CUSTOMER_REQUEST', label: 'Müşteri Talebi' },
    { value: 'SAFETY_ISSUE', label: 'Güvenlik Sorunu' },
    { value: 'OTHER', label: 'Diğer' }
]

interface BlockTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onBlock: (reason: string, note: string) => Promise<void>
    taskTitle: string
    isSubStep?: boolean
}

export function BlockTaskDialog({ open, onOpenChange, onBlock, taskTitle, isSubStep = false }: BlockTaskDialogProps) {
    const [reason, setReason] = useState<string>('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!reason) {
            toast.warning('Lütfen bir neden seçin')
            return
        }

        setLoading(true)
        try {
            await onBlock(reason, note)
            onOpenChange(false)
            setReason('')
            setNote('')
        } catch (error) {
            console.error(error)
            toast.error('Bloklama işlemi başarısız oldu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isSubStep ? 'Alt Görevi' : 'Görevi'} Blokla</DialogTitle>
                    <DialogDescription>
                        &quot;{taskTitle}&quot; {isSubStep ? 'alt görevini' : 'görevini'} tamamlayamama nedeninizi belirtin.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Bloklama Nedeni *</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger id="reason">
                                <SelectValue placeholder="Neden seçin..." />
                            </SelectTrigger>
                            <SelectContent>
                                {BLOCK_REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Ek Açıklama (Opsiyonel)</Label>
                        <Textarea
                            id="note"
                            placeholder="Durumla ilgili detaylı açıklama..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        İptal
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !reason} variant="destructive">
                        {loading ? 'Bloklanıyor...' : 'Blokla'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
