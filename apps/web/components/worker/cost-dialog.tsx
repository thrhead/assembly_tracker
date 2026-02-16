'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CameraIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface CostDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    jobId: string
    onSuccess: () => void
}

const CATEGORIES = [
    { value: 'MATERIAL', label: 'Malzeme' },
    { value: 'LABOR', label: 'İşçilik' },
    { value: 'TRANSPORT', label: 'Yol / Yakıt' },
    { value: 'FOOD', label: 'Yemek' },
    { value: 'ACCOMMODATION', label: 'Konaklama' },
    { value: 'OTHER', label: 'Diğer' }
]

export function CostDialog({ open, onOpenChange, jobId, onSuccess }: CostDialogProps) {
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [receiptUrl, setReceiptUrl] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await apiClient.post('/api/worker/costs', {
                jobId,
                amount: parseFloat(amount),
                category,
                description,
                receiptUrl: receiptUrl || undefined
            })

            if (!res.ok) {
                throw new Error('Failed to submit cost')
            }

            onSuccess()
            onOpenChange(false)
            // Reset form
            setAmount('')
            setCategory('')
            setDescription('')
            setReceiptUrl('')
        } catch (error) {
            console.error(error)
            toast.error('Masraf kaydedilemedi')
        } finally {
            setLoading(false)
        }
    }

    const handlePhotoUpload = () => {
        // Mock photo upload for now
        const url = prompt("Fiş fotoğrafı URL'si girin (veya boş bırakın):")
        if (url !== null) {
            setReceiptUrl(url || `https://picsum.photos/seed/${Date.now()}/400/600`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Masraf Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Tutar (TL)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Select value={category} onValueChange={setCategory} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Kategori seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <Textarea
                            id="description"
                            placeholder="Masraf detayı..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Fiş / Fatura Fotoğrafı</Label>
                        <div className="flex items-center gap-4">
                            <Button type="button" variant="outline" onClick={handlePhotoUpload} className="w-full">
                                <CameraIcon className="mr-2 h-4 w-4" />
                                {receiptUrl ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}
                            </Button>
                        </div>
                        {receiptUrl && (
                            <div className="mt-2 relative h-32 w-full rounded-md overflow-hidden border">
                                <div className="relative h-full w-full">
                                    <Image 
                                        src={receiptUrl} 
                                        alt="Receipt" 
                                        fill
                                        className="object-cover" 
                                        unoptimized
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kaydet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
