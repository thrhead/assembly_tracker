'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Camera, Clock, User, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface JobApprovalsViewProps {
    job: any
}

export function JobApprovalsView({ job }: JobApprovalsViewProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const [rejectionModal, setRejectionModal] = useState<{ id: string; type: 'STEP' | 'SUBSTEP'; title: string } | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    // Get all steps that are COMPLETED but not yet APPROVED/REJECTED (or just pending)
    const pendingSteps = (job?.steps || []).filter((s: any) => s.isCompleted && s.approvalStatus === 'PENDING')

    // Also get pending substeps of steps that might not be fully completed yet
    const pendingSubSteps: any[] = []
    if (job?.steps) {
        job.steps.forEach((step: any) => {
            step.subSteps?.forEach((ss: any) => {
                if (ss.isCompleted && ss.approvalStatus === 'PENDING') {
                    pendingSubSteps.push({ ...ss, parentStepTitle: step.title })
                }
            })
        })
    }

    const handleApprove = async (id: string, type: 'STEP' | 'SUBSTEP') => {
        setLoading(id)
        try {
            const endpoint = type === 'STEP'
                ? `/api/manager/steps/${id}/approve`
                : `/api/manager/substeps/${id}/approve`

            const res = await fetch(endpoint, { method: 'POST' })
            if (res.ok) {
                toast.success('Onaylandı')
                window.location.reload()
            } else {
                const err = await res.json()
                toast.error(err.error || 'İşlem başarısız')
            }
        } catch (error) {
            toast.error('Bağlantı hatası')
        } finally {
            setLoading(null)
        }
    }

    const handleReject = async () => {
        if (!rejectionModal || !rejectionReason.trim()) return

        const { id, type } = rejectionModal
        setLoading(id)
        try {
            const endpoint = type === 'STEP'
                ? `/api/manager/steps/${id}/reject`
                : `/api/manager/substeps/${id}/reject`

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason })
            })

            if (res.ok) {
                toast.success('Reddedildi ve iş emri geri gönderildi')
                setRejectionModal(null)
                setRejectionReason('')
                window.location.reload()
            } else {
                const err = await res.json()
                toast.error(err.error || 'İşlem başarısız')
            }
        } catch (error) {
            toast.error('Bağlantı hatası')
        } finally {
            setLoading(null)
        }
    }

    if (pendingSteps.length === 0 && pendingSubSteps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-gray-50">
                <div className="p-4 mb-4 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Onay Bekleyen İş Yok</h3>
                <p className="max-w-xs mt-2 text-sm text-gray-500">
                    Tüm tamamlanan adımlar onaylanmış veya henüz tamamlanan bir adım yok.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <AlertTriangle className="inline-block w-4 h-4 mr-2 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-700">
                Lütfen tamamlanan adımları ve kanıt fotoğraflarını dikkatlice inceleyin.
            </span>

            {/* Sub-steps first as they are more granular */}
            {pendingSubSteps.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-700 flex items-center gap-2">
                        <Badge variant="outline">Alt Adımlar</Badge>
                        Onay Bekleyen Alt İş Emirleri
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {pendingSubSteps.map((ss: any) => (
                            <ApprovalCard
                                key={ss.id}
                                item={ss}
                                type="SUBSTEP"
                                onApprove={() => handleApprove(ss.id, 'SUBSTEP')}
                                onReject={() => setRejectionModal({ id: ss.id, type: 'SUBSTEP', title: ss.title })}
                                loading={loading === ss.id}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Main steps */}
            {pendingSteps.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-700 flex items-center gap-2">
                        <Badge variant="secondary">Ana Adımlar</Badge>
                        Onay Bekleyen Ana Adımlar
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {pendingSteps.map((step: any) => (
                            <ApprovalCard
                                key={step.id}
                                item={step}
                                type="STEP"
                                onApprove={() => handleApprove(step.id, 'STEP')}
                                onReject={() => setRejectionModal({ id: step.id, type: 'STEP', title: step.title })}
                                loading={loading === step.id}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            <Dialog open={!!rejectionModal} onOpenChange={() => !loading && setRejectionModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>İşi Reddet</DialogTitle>
                        <DialogDescription>
                            {rejectionModal?.title} seçeneğini reddetmek üzeresiniz. Lütfen çalışanın düzeltebilmesi için geçerli bir sebep belirtin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Örn: Kablo döşemesi standartlara uygun değil, fotoğraf bulanık..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRejectionModal(null)} disabled={!!loading}>İptal</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!!loading || !rejectionReason.trim()}>
                            {loading ? "Reddediliyor..." : "Reddet ve Geri Gönder"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ApprovalCard({ item, type, onApprove, onReject, loading }: any) {
    return (
        <Card className="overflow-hidden border-2 border-yellow-100 bg-yellow-50/30">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        {type === 'SUBSTEP' && (
                            <CardDescription className="text-xs text-blue-600 font-medium italic">
                                Ana Adım: {item.parentStepTitle}
                            </CardDescription>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2">
                            <div className="flex items-center text-[10px] text-gray-500">
                                <User className="w-3 h-3 mr-1" />
                                {item.completedBy?.name || 'Bilinmiyor'}
                            </div>
                            <div className="flex items-center text-[10px] text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {(() => {
                                    if (!item.completedAt) return '-'
                                    try {
                                        return format(new Date(item.completedAt), 'PPp', { locale: tr })
                                    } catch (e) {
                                        return '-'
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                    <Badge variant="warning" className="text-[10px] h-5">ONAY BEKLİYOR</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                {/* Photos Section */}
                <div className="mt-2 text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                    <Camera className="w-3 h-3" />
                    Yüklenen Kanıt Fotoğrafları ({item.photos?.length || 0})
                </div>

                {item.photos && item.photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {item.photos.map((photo: any) => (
                            <a
                                key={photo.id}
                                href={photo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative aspect-square rounded-md overflow-hidden border bg-gray-200 group"
                            >
                                <img
                                    src={photo.url}
                                    alt="İşlem fotoğrafı"
                                    className="object-cover w-full h-full transition-opacity group-hover:opacity-90"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="p-3 mb-4 text-xs italic text-gray-500 border border-dashed rounded-md bg-white/50">
                        {item.notes}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={onReject}
                        disabled={loading}
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reddet
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={onApprove}
                        disabled={loading}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {loading ? "Onaylanıyor..." : "Onayla"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
