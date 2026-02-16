'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Clock, Play, CheckCircle, XCircle, Loader2, AlertCircle, Image, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface StepPhoto {
    id: string
    url: string
    uploadedAt: Date
    uploadedBy?: { name: string | null }
}

interface TimelineStep {
    id: string
    title: string
    isCompleted: boolean
    startedAt: Date | null
    completedAt: Date | null
    blockedAt: Date | null
    latitude?: number | null
    longitude?: number | null
    blockedReason: string | null
    order: number
    photos?: StepPhoto[]
    subSteps?: {
        id: string
        title: string
        isCompleted: boolean
        startedAt: Date | null
        completedAt: Date | null
        blockedAt: Date | null
        approvalStatus?: string
        rejectionReason?: string | null
        photos?: StepPhoto[]
    }[]
}

interface JobTimelineProps {
    steps: TimelineStep[]
    scheduledDate?: Date | null
    completedDate?: Date | null
    jobId: string
}

const BLOCKED_REASONS: Record<string, string> = {
    POWER_OUTAGE: 'Elektrik Kesintisi',
    MATERIAL_SHORTAGE: 'Malzeme Eksikliği',
    BAD_WEATHER: 'Hava Koşulları',
    EQUIPMENT_FAILURE: 'Ekipman Arızası',
    WAITING_APPROVAL: 'Onay Bekleniyor',
    CUSTOMER_REQUEST: 'Müşteri Talebi',
    SAFETY_ISSUE: 'Güvenlik Sorunu',
    OTHER: 'Diğer'
}

export function JobTimeline({ steps, scheduledDate, completedDate, jobId }: JobTimelineProps) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [selectedPhoto, setSelectedPhoto] = useState<StepPhoto | null>(null)

    const handleApprove = async (subStepId: string) => {
        setLoadingId(subStepId)
        try {
            const res = await fetch(`/api/manager/substeps/${subStepId}/approve`, {
                method: 'POST'
            })
            if (res.ok) {
                toast.success('Alt adım onaylandı')
                router.refresh()
            } else {
                toast.error('Onaylama başarısız')
            }
        } catch {
            toast.error('Bir hata oluştu')
        } finally {
            setLoadingId(null)
        }
    }

    const handleReject = async (subStepId: string) => {
        const reason = prompt('Red nedeni girin:')
        if (!reason) return

        setLoadingId(subStepId)
        try {
            const res = await fetch(`/api/manager/substeps/${subStepId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            })
            if (res.ok) {
                toast.success('Alt adım reddedildi')
                router.refresh()
            } else {
                toast.error('Reddetme başarısız')
            }
        } catch {
            toast.error('Bir hata oluştu')
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        İş Zaman Çizelgesi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Başlangıç Tarihi */}
                        {scheduledDate && (
                            <div className="flex items-start gap-4 pb-4 border-b">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Play className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Planlanan Başlangıç</p>
                                    <p className="text-sm text-gray-500" suppressHydrationWarning>
                                        {format(new Date(scheduledDate), 'd MMMM yyyy, HH:mm', { locale: tr })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Adımlar */}
                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <div key={step.id} className="relative">
                                    {index < steps.length - 1 && (
                                        <div className={cn(
                                            "absolute left-5 top-12 bottom-0 w-0.5",
                                            step.isCompleted ? "bg-green-200" : step.blockedAt ? "bg-red-200" : "bg-gray-200"
                                        )} />
                                    )}

                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                                            step.isCompleted ? "bg-green-100" : step.blockedAt ? "bg-red-100" : "bg-gray-100"
                                        )}>
                                            {step.isCompleted ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : step.blockedAt ? (
                                                <XCircle className="h-5 w-5 text-red-600" />
                                            ) : (
                                                <div className="h-3 w-3 rounded-full bg-gray-400" />
                                            )}
                                        </div>

                                        <div className="flex-1 pb-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium">{step.title}</p>
                                                    {step.blockedAt && step.blockedReason && (
                                                        <Badge variant="destructive" className="mt-1">
                                                            {BLOCKED_REASONS[step.blockedReason] || step.blockedReason}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-sm text-gray-600">
                                                {step.startedAt && (
                                                    <div className="flex items-center gap-2" suppressHydrationWarning>
                                                        <Play className="h-3 w-3" />
                                                        <span>Başladı: {format(new Date(step.startedAt), 'd MMM, HH:mm', { locale: tr })}</span>
                                                    </div>
                                                )}
                                                {step.completedAt && (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2" suppressHydrationWarning>
                                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                                            <span>Tamamlandı: {format(new Date(step.completedAt), 'd MMM, HH:mm', { locale: tr })}</span>
                                                        </div>
                                                        {(step.latitude && step.longitude) && (
                                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 ml-5 bg-gray-50 w-fit px-1 rounded border border-gray-100">
                                                                <MapPin className="h-2 w-2" />
                                                                <span>{step.latitude.toFixed(4)}, {step.longitude.toFixed(4)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {step.blockedAt && (
                                                    <div className="flex items-center gap-2" suppressHydrationWarning>
                                                        <XCircle className="h-3 w-3 text-red-600" />
                                                        <span>Bloklandı: {format(new Date(step.blockedAt), 'd MMM, HH:mm', { locale: tr })}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Alt Görevler */}
                                            {step.subSteps && step.subSteps.length > 0 && (
                                                <div className="mt-3 ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                                                    {step.subSteps.map(subStep => (
                                                        <div key={subStep.id} className="text-sm">
                                                            <div className="flex items-start gap-2">
                                                                <div className={cn(
                                                                    "h-4 w-4 rounded-full mt-0.5 flex items-center justify-center",
                                                                    subStep.approvalStatus === 'APPROVED' ? "bg-green-500" :
                                                                        subStep.approvalStatus === 'REJECTED' ? "bg-red-500" :
                                                                            subStep.isCompleted ? "bg-yellow-500" :
                                                                                subStep.blockedAt ? "bg-red-500" : "bg-gray-300"
                                                                )}>
                                                                    {subStep.approvalStatus === 'APPROVED' && <CheckCircle className="h-3 w-3 text-white" />}
                                                                    {subStep.approvalStatus === 'REJECTED' && <XCircle className="h-3 w-3 text-white" />}
                                                                    {subStep.isCompleted && subStep.approvalStatus === 'PENDING' && <AlertCircle className="h-3 w-3 text-white" />}
                                                                    {subStep.blockedAt && !subStep.isCompleted && <XCircle className="h-3 w-3 text-white" />}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className={cn(subStep.approvalStatus === 'APPROVED' && "line-through text-gray-500")}>
                                                                        {subStep.title}
                                                                    </p>
                                                                    {subStep.completedAt && (
                                                                        <p className="text-xs text-gray-500" suppressHydrationWarning>
                                                                            {format(new Date(subStep.completedAt), 'd MMM, HH:mm', { locale: tr })}
                                                                        </p>
                                                                    )}
                                                                    {/* Approval Status Badge */}
                                                                    {subStep.isCompleted && subStep.approvalStatus === 'PENDING' && (
                                                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                                            <div className="flex items-center gap-2 text-yellow-800 text-xs mb-2">
                                                                                <AlertCircle className="h-3 w-3" />
                                                                                <span className="font-medium">Onay Bekliyor</span>
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-7 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                                                                    onClick={() => handleApprove(subStep.id)}
                                                                                    disabled={loadingId === subStep.id}
                                                                                >
                                                                                    {loadingId === subStep.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                                                                    Onayla
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-7 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                                                                    onClick={() => handleReject(subStep.id)}
                                                                                    disabled={loadingId === subStep.id}
                                                                                >
                                                                                    <XCircle className="h-3 w-3 mr-1" />
                                                                                    Reddet
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {/* Rejection Reason */}
                                                                    {subStep.approvalStatus === 'REJECTED' && subStep.rejectionReason && (
                                                                        <div className="mt-1 text-xs text-red-600">
                                                                            Red nedeni: {subStep.rejectionReason}
                                                                        </div>
                                                                    )}
                                                                    {/* Approved Badge */}
                                                                    {subStep.approvalStatus === 'APPROVED' && (
                                                                        <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700 border-green-200">
                                                                            ✓ Onaylandı
                                                                        </Badge>
                                                                    )}
                                                                    {/* Photos Gallery */}
                                                                    {subStep.photos && subStep.photos.length > 0 && (
                                                                        <div className="mt-2">
                                                                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                                                <Image className="h-3 w-3" />
                                                                                <span>Fotoğraflar ({subStep.photos.length})</span>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {subStep.photos.map(photo => (
                                                                                    <button
                                                                                        key={photo.id}
                                                                                        onClick={() => setSelectedPhoto(photo)}
                                                                                        className="w-12 h-12 rounded border overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                                                                                    >
                                                                                        <img
                                                                                            src={photo.url}
                                                                                            alt=""
                                                                                            className="w-full h-full object-cover"
                                                                                        />
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tamamlanma Tarihi */}
                        {completedDate && (
                            <div className="flex items-start gap-4 pt-4 border-t">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-green-700">İş Tamamlandı</p>
                                    <p className="text-sm text-gray-500" suppressHydrationWarning>
                                        {format(new Date(completedDate), 'd MMMM yyyy, HH:mm', { locale: tr })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Photo Modal */}
            {
                selectedPhoto && (
                    <div
                        className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh]">
                            <img
                                src={selectedPhoto.url}
                                alt=""
                                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            />
                            {selectedPhoto.uploadedBy?.name && (
                                <div className="absolute bottom-4 left-4 bg-muted/90 text-white px-3 py-1 rounded text-sm">
                                    📷 {selectedPhoto.uploadedBy.name} • {format(new Date(selectedPhoto.uploadedAt), 'd MMM, HH:mm', { locale: tr })}
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )
            }
        </>
    )
}
