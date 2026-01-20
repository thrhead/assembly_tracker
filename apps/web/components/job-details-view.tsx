'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { CheckCircle2, Circle, Clock, User, Briefcase, Calendar, MapPin, ChevronDown, ChevronUp, ImageIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface JobDetailsProps {
    job: {
        id: string
        title: string
        description: string | null
        status: string
        priority: string
        location: string | null
        createdAt: Date
        customer: {
            company: string
            user: {
                name: string | null
                email: string
                phone: string | null
            }
        }
        assignments: {
            team: { name: string } | null
            worker: { name: string | null } | null
        }[]
        steps: {
            id: string
            title: string
            isCompleted: boolean
            completedAt: Date | null
            order: number
            completedBy: {
                name: string | null
            } | null
            subSteps?: {
                id: string
                title: string
                isCompleted: boolean
                order: number
                photos?: {
                    id: string
                    url: string
                }[]
            }[]
            photos?: {
                id: string
                url: string
                uploadedAt: Date
                uploadedBy: {
                    name: string | null
                }
            }[]
        }[]
    }
}

export function JobDetailsView({ job }: JobDetailsProps) {
    console.log('JobDetailsView received job:', JSON.stringify(job, null, 2))
    const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({})

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-500'
            case 'IN_PROGRESS': return 'bg-blue-500'
            case 'PENDING': return 'bg-yellow-500'
            case 'CANCELLED': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'text-red-600 bg-red-50 border-red-200'
            case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200'
            case 'MEDIUM': return 'text-blue-600 bg-blue-50 border-blue-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    return (
        <div className="space-y-6">
            {/* Üst Bilgi Kartı */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">{job.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">#{job.id.slice(-6)}</p>
                            </div>
                            <Badge className={getStatusColor(job.status)}>
                                {job.status === 'IN_PROGRESS' ? 'Devam Ediyor' :
                                    job.status === 'COMPLETED' ? 'Tamamlandı' :
                                        job.status === 'PENDING' ? 'Bekliyor' : job.status}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="font-medium">Açıklama</p>
                                <p className="text-sm text-gray-600">{job.description || 'Açıklama yok'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="font-medium">Konum</p>
                                <p className="text-sm text-gray-600">{job.location || 'Belirtilmemiş'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="font-medium">Oluşturulma Tarihi</p>
                                <p className="text-sm text-gray-600">
                                    {format(new Date(job.createdAt), 'd MMMM yyyy HH:mm', { locale: tr })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Müşteri ve Ekip Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Müşteri</h3>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <User className="h-8 w-8 text-gray-400" />
                                <div>
                                    <p className="font-medium">{job.customer.company}</p>
                                    <p className="text-sm text-gray-500">{job.customer.user.name}</p>
                                    <p className="text-xs text-gray-400">{job.customer.user.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Atanan Ekip/Personel</h3>
                            {job.assignments.length > 0 ? (
                                <div className="space-y-2">
                                    {job.assignments.map((assignment, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                            {assignment.team ? (
                                                <span>Ekip: <strong>{assignment.team.name}</strong></span>
                                            ) : (
                                                <span>Personel: <strong>{assignment.worker?.name}</strong></span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Henüz atama yapılmamış</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Checklist İlerlemesi */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        İşlem Adımları (Checklist)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {job.steps.map((step, index) => {
                            const isLast = index === job.steps.length - 1
                            const hasSubSteps = step.subSteps && step.subSteps.length > 0
                            const hasPhotos = step.photos && step.photos.length > 0
                            const isExpanded = expandedSteps[step.id] || false

                            return (
                                <div key={step.id} className={cn(
                                    "border rounded-lg overflow-hidden transition-all",
                                    step.isCompleted ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                                )}>
                                    {/* Main Step */}
                                    <div className="p-4">
                                        <div className="flex gap-4">
                                            <div className="relative z-10 pt-0.5">
                                                {step.isCompleted ? (
                                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    </div>
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <Circle className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className={`font-medium ${step.isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                                            {step.title}
                                                        </p>
                                                        {(hasSubSteps || hasPhotos) && (
                                                            <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                                                {hasSubSteps && (
                                                                    <span>{step.subSteps!.length} alt görev</span>
                                                                )}
                                                                {hasPhotos && (
                                                                    <span className="flex items-center gap-1">
                                                                        <ImageIcon className="h-3 w-3" />
                                                                        {step.photos!.length} fotoğraf
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {step.isCompleted && step.completedAt && (
                                                            <div className="flex flex-col items-end gap-1">
                                                                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                                                    <Clock className="h-3 w-3" />
                                                                    {format(new Date(step.completedAt), 'HH:mm', { locale: tr })}
                                                                </div>
                                                                {step.completedBy && (
                                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                        <User className="h-3 w-3" />
                                                                        <span>{step.completedBy.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {(hasSubSteps || hasPhotos) && (
                                                            <button
                                                                onClick={() => setExpandedSteps(prev => ({ ...prev, [step.id]: !prev[step.id] }))}
                                                                className="p-1 hover:bg-gray-100 rounded"
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                                                ) : (
                                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (hasSubSteps || hasPhotos) && (
                                        <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-4">
                                            {/* Substeps */}
                                            {hasSubSteps && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                        Alt Görevler
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {step.subSteps!.map(subStep => (
                                                            <div key={subStep.id} className="space-y-2">
                                                                <div
                                                                    className="flex items-center gap-3 bg-white p-2 rounded border border-gray-200"
                                                                >
                                                                    <div className={cn(
                                                                        "h-4 w-4 rounded border flex items-center justify-center",
                                                                        subStep.isCompleted ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-300"
                                                                    )}>
                                                                        {subStep.isCompleted && <CheckCircle2 className="h-3 w-3" />}
                                                                    </div>
                                                                    <span className={cn(
                                                                        "text-sm",
                                                                        subStep.isCompleted ? "text-gray-500 line-through" : "text-gray-700"
                                                                    )}>
                                                                        {subStep.title}
                                                                    </span>
                                                                </div>

                                                                {/* Substep Photos */}
                                                                {subStep.photos && subStep.photos.length > 0 && (
                                                                    <div className="ml-8 grid grid-cols-4 gap-2">
                                                                        {subStep.photos.map(photo => (
                                                                            <div key={photo.id} className="relative aspect-square rounded overflow-hidden border border-gray-200">
                                                                                <img
                                                                                    src={photo.url}
                                                                                    alt="Alt görev fotoğrafı"
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Photos */}
                                            {hasPhotos && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                        Fotoğraflar
                                                    </h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                        {step.photos!.map(photo => (
                                                            <div key={photo.id} className="group relative">
                                                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                                    <img
                                                                        src={photo.url}
                                                                        alt="İş fotoğrafı"
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                    />
                                                                </div>
                                                                <div className="mt-1 text-xs text-gray-500">
                                                                    <p className="truncate">{photo.uploadedBy.name}</p>
                                                                    <p>{format(new Date(photo.uploadedAt), 'd MMM, HH:mm', { locale: tr })}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {job.steps.length === 0 && (
                            <p className="text-center text-gray-500 py-4">Bu iş için tanımlanmış adım bulunmuyor.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
