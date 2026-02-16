'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { CheckCircle2, Circle, Clock, User, Briefcase, Calendar, MapPin, ChevronDown, ChevronUp, ImageIcon, UserCog } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { formatTaskNumber } from "@/lib/utils/job-number"

interface JobDetailsProps {
    job: {
        id: string
        jobNo?: string | null
        title: string
        description: string | null
        status: string
        priority: string
        location: string | null
        createdAt: Date
        jobLead?: {
            id: string
            name: string | null
        } | null
        customer: {
            company: string
            user: {
                name: string | null
                email: string
                phone: string | null
            }
        }
        assignments: {
            team: {
                id: string
                name: string
                lead?: { id: string; name: string | null } | null
                members?: { user: { id: string; name: string | null } }[]
            } | null
            worker: { id: string; name: string | null } | null
        }[]
        steps: {
            id: string
            stepNo?: string | null
            title: string
            isCompleted: boolean
            completedAt: Date | null
            order: number
            completedBy: {
                name: string | null
            } | null
            subSteps?: {
                id: string
                subStepNo?: string | null
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
    const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({})

    const totalSteps = job.steps.length
    const completedSteps = job.steps.filter(s => s.isCompleted).length
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    const getProgressColor = (percent: number) => {
        if (percent === 100) return "bg-green-600"
        if (percent > 30) return "bg-blue-600"
        return "bg-orange-500"
    }

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
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded w-fit border border-orange-100 mb-1">
                                    PROJE NO: {job.jobNo || 'OTOMATİK'}
                                </div>
                                <h2 className="text-xl font-bold">{job.title}</h2>
                                <p className="text-xs text-gray-400">KAYIT ID: #{job.id.slice(-6).toUpperCase()}</p>
                                
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-medium text-gray-700">İş İlerlemesi</span>
                                        <span className="text-sm font-bold text-gray-900">{progressPercentage}%</span>
                                    </div>
                                    <Progress 
                                        value={progressPercentage} 
                                        className="h-2 w-full bg-gray-100"
                                        indicatorClassName={getProgressColor(progressPercentage)}
                                    />
                                    <p className="text-[10px] text-gray-500 text-right">
                                        {completedSteps}/{totalSteps} Adım Tamamlandı
                                    </p>
                                </div>
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
                            <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">Açıklama</p>
                                <p className="text-sm text-gray-600">{job.description || 'Açıklama yok'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="font-medium text-sm">Konum</p>
                                <p className="text-sm text-gray-600">{job.location || 'Belirtilmemiş'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="font-medium text-sm">Oluşturulma Tarihi</p>
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
                        {/* İş Sorumlusu / Lider Bölümü */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">İşten Sorumlu Lider</h3>
                            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200">
                                    <UserCog className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-amber-900">{job.jobLead?.name || 'Lider Atanmamış'}</p>
                                    <p className="text-[10px] text-amber-700 uppercase font-semibold">Ana Sorumlu</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Müşteri</h3>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{job.customer.company}</p>
                                    <p className="text-xs text-gray-500">{job.customer.user.name}</p>
                                    <p className="text-[10px] text-gray-400">{job.customer.user.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Atanan Ekip / Personel</h3>
                            {job.assignments.length > 0 ? (
                                <div className="space-y-4">
                                    {job.assignments.map((assignment, index) => (
                                        <div key={index} className="space-y-3">
                                            {assignment.team ? (
                                                <>
                                                    <div className="flex items-center gap-3 p-2 bg-indigo-50/50 rounded border border-indigo-100 text-sm">
                                                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                                        <span className="text-indigo-900">Ekip: <strong>{assignment.team.name}</strong></span>
                                                    </div>
                                                    
                                                    {/* Ekip Lideri Gösterimi */}
                                                    {assignment.team.lead && (
                                                        <div className="ml-4 space-y-1">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ekip Lideri</p>
                                                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-amber-50 p-2 rounded border border-amber-100">
                                                                <User className="h-4 w-4 text-amber-600" />
                                                                <span className="font-semibold">{assignment.team.lead.name}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Diğer Çalışanlar Gösterimi */}
                                                    {assignment.team.members && assignment.team.members.length > 0 && (
                                                        <div className="ml-4 space-y-1">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ekip Üyeleri</p>
                                                            <div className="grid grid-cols-1 gap-1">
                                                                {assignment.team.members
                                                                    .filter(m => m.user.id !== job.jobLead?.id)
                                                                    .map((member, mIdx) => (
                                                                        <div key={mIdx} className="flex items-center gap-2 text-sm text-gray-600 bg-white p-1.5 rounded border border-gray-100 shadow-sm">
                                                                            <User className="h-3.5 w-3.5 text-gray-400" />
                                                                            <span>{member.user.name}</span>
                                                                        </div>
                                                                    ))
                                                                }
                                                                {assignment.team.members.filter(m => m.user.id !== job.jobLead?.id).length === 0 && (
                                                                    <p className="text-xs text-gray-400 italic">Başka üye bulunmuyor.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-3 p-2 bg-blue-50/50 rounded border border-blue-100 text-sm">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                                    <span className="text-blue-900">Personel: <strong>{assignment.worker?.name}</strong></span>
                                                </div>
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
                        İş Emirleri ve Adımlar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {job.steps.map((step, index) => {
                            const stepNoDisplay = step.stepNo || formatTaskNumber(job.jobNo || 'JOB', index + 1)
                            const hasSubSteps = step.subSteps && step.subSteps.length > 0
                            const hasPhotos = step.photos && step.photos.length > 0
                            const isExpanded = expandedSteps[step.id] || false

                            return (
                                <div key={step.id} className={cn(
                                    "border rounded-lg overflow-hidden transition-all",
                                    step.isCompleted ? "bg-green-50 border-green-200" : "bg-white border-gray-200 shadow-sm"
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
                                                        <Circle className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="text-[10px] font-mono font-bold text-primary mb-0.5 tracking-tighter">
                                                            İŞ EMRİ NO: {stepNoDisplay}
                                                        </div>
                                                        <p className={`font-semibold ${step.isCompleted ? 'text-gray-900' : 'text-gray-600'}`}>
                                                            {step.title}
                                                        </p>
                                                        {(hasSubSteps || hasPhotos) && (
                                                            <div className="flex gap-3 mt-1 text-xs text-gray-500 font-medium">
                                                                {hasSubSteps && (
                                                                    <span className="bg-white px-1.5 py-0.5 rounded border border-gray-100">{step.subSteps!.length} alt görev</span>
                                                                )}
                                                                {hasPhotos && (
                                                                    <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-gray-100">
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
                                                                <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-white border border-green-100 px-2 py-0.5 rounded-full shadow-sm">
                                                                    <Clock className="h-2.5 w-2.5" />
                                                                    {format(new Date(step.completedAt), 'HH:mm', { locale: tr })}
                                                                </div>
                                                                {step.completedBy && (
                                                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 italic">
                                                                        <User className="h-2.5 w-2.5" />
                                                                        <span>{step.completedBy.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {(hasSubSteps || hasPhotos) && (
                                                            <button
                                                                onClick={() => setExpandedSteps(prev => ({ ...prev, [step.id]: !prev[step.id] }))}
                                                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronUp className="h-4 w-4 text-gray-500" />
                                                                ) : (
                                                                    <ChevronDown className="h-4 w-4 text-gray-500" />
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
                                        <div className="bg-gray-50/50 p-4 border-t border-gray-100 space-y-4">
                                            {/* Substeps */}
                                            {hasSubSteps && (
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <span className="h-px w-4 bg-gray-300" />
                                                        Alt İş Emirleri
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {step.subSteps!.map((subStep, subIndex) => (
                                                            <div key={subStep.id} className="space-y-2">
                                                                <div
                                                                    className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm"
                                                                >
                                                                    <div className={cn(
                                                                        "h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
                                                                        subStep.isCompleted ? "bg-green-500 border-green-500 text-white" : "border-gray-300"
                                                                    )}>
                                                                        {subStep.isCompleted && <CheckCircle2 className="h-3 w-3" />}
                                                                    </div>
                                                                    <div className="flex-1 flex flex-col">
                                                                        <span className="text-[9px] font-mono text-gray-400">
                                                                            {subStep.subStepNo || formatTaskNumber(job.jobNo || 'JOB', index + 1, subIndex + 1)}
                                                                        </span>
                                                                        <span className={cn(
                                                                            "text-sm font-medium",
                                                                            subStep.isCompleted ? "text-gray-400 line-through" : "text-gray-700"
                                                                        )}>
                                                                            {subStep.title}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Substep Photos */}
                                                                {subStep.photos && subStep.photos.length > 0 && (
                                                                    <div className="ml-8 grid grid-cols-4 md:grid-cols-6 gap-2">
                                                                        {subStep.photos.map(photo => (
                                                                            <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 shadow-sm hover:scale-105 transition-transform">
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
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <span className="h-px w-4 bg-gray-300" />
                                                        Genel Fotoğraflar
                                                    </h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                        {step.photos!.map(photo => (
                                                            <div key={photo.id} className="group relative">
                                                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
                                                                    <img
                                                                        src={photo.url}
                                                                        alt="İş fotoğrafı"
                                                                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                                                    />
                                                                </div>
                                                                <div className="mt-1.5 flex justify-between items-center px-1">
                                                                    <p className="text-[10px] font-semibold text-gray-600 truncate max-w-[60%]">{photo.uploadedBy.name}</p>
                                                                    <p className="text-[9px] text-gray-400 italic">{format(new Date(photo.uploadedAt), 'd MMM, HH:mm', { locale: tr })}</p>
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
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">Bu iş için tanımlanmış iş emri (checklist) bulunmuyor.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
