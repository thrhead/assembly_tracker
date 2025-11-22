'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Clock, Play, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineStep {
    id: string
    title: string
    isCompleted: boolean
    startedAt: Date | null
    completedAt: Date | null
    blockedAt: Date | null
    blockedReason: string | null
    order: number
    subSteps?: {
        id: string
        title: string
        isCompleted: boolean
        startedAt: Date | null
        completedAt: Date | null
        blockedAt: Date | null
    }[]
}

interface JobTimelineProps {
    steps: TimelineStep[]
    scheduledDate?: Date | null
    completedDate?: Date | null
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

export function JobTimeline({ steps, scheduledDate, completedDate }: JobTimelineProps) {
    return (
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
                                <p className="text-sm text-gray-500">
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
                                                <div className="flex items-center gap-2">
                                                    <Play className="h-3 w-3" />
                                                    <span>Başladı: {format(new Date(step.startedAt), 'd MMM, HH:mm', { locale: tr })}</span>
                                                </div>
                                            )}
                                            {step.completedAt && (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                    <span>Tamamlandı: {format(new Date(step.completedAt), 'd MMM, HH:mm', { locale: tr })}</span>
                                                </div>
                                            )}
                                            {step.blockedAt && (
                                                <div className="flex items-center gap-2">
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
                                                                subStep.isCompleted ? "bg-green-500" : subStep.blockedAt ? "bg-red-500" : "bg-gray-300"
                                                            )}>
                                                                {subStep.isCompleted && <CheckCircle className="h-3 w-3 text-white" />}
                                                                {subStep.blockedAt && <XCircle className="h-3 w-3 text-white" />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={cn(subStep.isCompleted && "line-through text-gray-500")}>
                                                                    {subStep.title}
                                                                </p>
                                                                {subStep.completedAt && (
                                                                    <p className="text-xs text-gray-500">
                                                                        {format(new Date(subStep.completedAt), 'd MMM, HH:mm', { locale: tr })}
                                                                    </p>
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
                                <p className="text-sm text-gray-500">
                                    {format(new Date(completedDate), 'd MMMM yyyy, HH:mm', { locale: tr })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
