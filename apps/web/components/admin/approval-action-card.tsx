'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2Icon, CheckCircle2Icon, XCircleIcon, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ApprovalActionCardProps {
    approval: {
        id: string
        status: string
        requester: {
            name: string | null
            email: string
        }
        createdAt: Date
    }
}

export function ApprovalActionCard({ approval }: ApprovalActionCardProps) {
    const router = useRouter()
    const [action, setAction] = useState<'APPROVED' | 'REJECTED' | null>(null)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!action) return

        setLoading(true)
        try {
            const response = await fetch(`/api/approvals/${approval.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: action,
                    notes: notes || undefined
                })
            })

            if (response.ok) {
                toast.success(action === 'APPROVED' ? 'İş onaylandı' : 'İş reddedildi')
                router.refresh()
                router.push('/admin/approvals') // Return to list after action
            } else {
                const data = await response.json()
                toast.error(data.error || 'İşlem başarısız oldu')
            }
        } catch (error) {
            toast.error('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    if (approval.status !== 'PENDING') return null

    return (
        <Card className="border-yellow-400 bg-yellow-50 mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-5 w-5" />
                    <CardTitle className="text-lg">Onay Bekliyor</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert className="bg-white border-yellow-200">
                    <AlertTitle>Talep Eden: {approval.requester?.name || approval.requester?.email || 'Bilinmiyor'}</AlertTitle>
                    <AlertDescription className="text-gray-600">
                        Bu iş tamamlandı olarak işaretlendi ve onayınızı bekliyor.
                        İşin detaylarını aşağıdan inceleyebilir, uygunsa onaylayabilir veya reddedebilirsiniz.
                    </AlertDescription>
                </Alert>

                <div className="space-y-3">
                    {action && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                {action === 'APPROVED' ? 'Onay Notu (Opsiyonel)' : 'Red Nedeni (Zorunlu)'}
                            </label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={
                                    action === 'APPROVED'
                                        ? 'Onay notu ekleyebilirsiniz...'
                                        : 'Lütfen red nedenini belirtin...'
                                }
                                rows={3}
                                className="mb-3"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setAction(null)} disabled={loading}>
                                    İptal
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={loading || (action === 'REJECTED' && !notes.trim())}
                                    variant={action === 'APPROVED' ? 'default' : 'destructive'}
                                    className={action === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                                            İşleniyor...
                                        </>
                                    ) : (
                                        <>
                                            {action === 'APPROVED' ? 'Onayla ve Tamamla' : 'Reddet ve Geri Gönder'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {!action && (
                        <div className="flex gap-3">
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => setAction('APPROVED')}
                            >
                                <CheckCircle2Icon className="h-4 w-4 mr-2" />
                                Onayla
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => setAction('REJECTED')}
                            >
                                <XCircleIcon className="h-4 w-4 mr-2" />
                                Reddet
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
