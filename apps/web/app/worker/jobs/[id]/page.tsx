'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  ArrowLeftIcon, MapPinIcon, CalendarIcon, PhoneIcon, Building2Icon,
  CheckCircle2Icon, CircleIcon, ClockIcon, AlertCircleIcon, CameraIcon,
  ChevronDownIcon, ChevronUpIcon, ImageIcon, AlertTriangleIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { BlockTaskDialog } from '@/components/worker/block-task-dialog'
import { CostDialog } from '@/components/worker/cost-dialog'
import { toast } from 'sonner'
import { PhotoUploadDialog } from '@/components/worker/photo-upload-dialog'
import { apiClient } from '@/lib/api-client'
import { ChatPanel } from '@/components/chat/ChatPanel'

interface JobDetail {
  id: string
  title: string
  description: string
  status: string
  priority: string
  location: string
  scheduledDate: string
  customer: {
    company: string
    address: string
    user: {
      name: string
      phone: string
      email: string
    }
  }
  steps: {
    id: string
    title: string
    isCompleted: boolean
    order: number
    blockedReason?: string
    blockedNote?: string
    subSteps: {
      id: string
      title: string
      isCompleted: boolean
      blockedReason?: string
      blockedNote?: string
      order: number
    }[]
    photos: {
      id: string
      url: string
      uploadedAt: string
    }[]
  }[]
}

export default function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({})
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const [blockingTask, setBlockingTask] = useState<{ id: string, type: 'step' | 'substep', parentId?: string, title: string } | null>(null)
  const [showCostDialog, setShowCostDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchJob()
  }, [params.id])

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/worker/jobs/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch job')
      const data = await res.json()
      setJob(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStep = async (stepId: string, currentStatus: boolean) => {
    // Optimistic update logic is complex with validation, so we'll rely on server response or simple check first
    const step = job?.steps.find(s => s.id === stepId)
    if (!step) return

    // Client-side validation
    if (!currentStatus) {
      // Check previous steps
      if (step.order > 1) {
        const prevStep = job?.steps.find(s => s.order === step.order - 1)
        if (prevStep && !prevStep.isCompleted) {
          toast.warning('Önceki adımı tamamlamadan bu adıma geçemezsiniz.')
          return
        }
      }
      // Check substeps
      if (step.subSteps.some(s => !s.isCompleted)) {
        toast.warning('Tüm alt görevleri tamamlamadan bu adımı tamamlayamazsınız.')
        // Auto-expand to show incomplete substeps
        setExpandedSteps(prev => ({ ...prev, [stepId]: true }))
        return
      }
    }

    try {
      const res = await apiClient.post(`/api/worker/jobs/${params.id}/steps/${stepId}/toggle`, {})

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'İşlem başarısız')
        return
      }

      fetchJob()
    } catch (error) {
      console.error(error)
      toast.error('Bir hata oluştu')
    }
  }

  const toggleSubStep = async (stepId: string, subStepId: string) => {
    try {
      const res = await apiClient.post(`/api/worker/jobs/${params.id}/steps/${stepId}/substeps/${subStepId}/toggle`, {})

      if (res.ok) {
        fetchJob()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleBlockTask = async (reason: string, note: string) => {
    if (!blockingTask) return

    try {
      const url = blockingTask.type === 'step'
        ? `/api/worker/jobs/${params.id}/steps/${blockingTask.id}/block`
        : `/api/worker/jobs/${params.id}/steps/${blockingTask.parentId}/substeps/${blockingTask.id}/block`

      const res = await apiClient.post(url, { reason, note })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'İşlem başarısız')
        return
      }

      fetchJob()
    } catch (error) {
      console.error(error)
      toast.error('Bir hata oluştu')
    }
  }

  const handlePhotoUpload = async (stepId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    // ... same prompt logic
    const url = prompt("Lütfen fotoğraf URL'sini girin (veya boş bırakıp test için rastgele bir resim kullanın):")
    const finalUrl = url || `https://picsum.photos/seed/${Date.now()}/800/600`

    try {
      setUploadingPhoto(stepId)
      const res = await apiClient.post(`/api/worker/jobs/${params.id}/steps/${stepId}/photos`, { url: finalUrl })

      if (res.ok) {
        fetchJob()
      } else {
        toast.error('Fotoğraf yüklenemedi')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setUploadingPhoto(null)
    }
  }

  const completeJob = async () => {
    if (!confirm('İşi tamamlamak istediğinizden emin misiniz? Bu işlem onay için gönderilecektir.')) {
      return
    }

    try {
      const res = await apiClient.post(`/api/worker/jobs/${params.id}/complete`, {})

      if (res.ok) {
        toast.success('İş başarıyla tamamlandı ve onay için gönderildi!')
        router.push('/worker')
      } else {
        const data = await res.json()
        toast.error(data.error || 'İş tamamlanamadı')
      }
    } catch (error) {
      console.error(error)
      alert('Bir hata oluştu')
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await apiClient.patch(`/api/worker/jobs/${params.id}`, { status: newStatus })

      if (res.ok) {
        fetchJob()
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div className="p-6 text-center">Yükleniyor...</div>
  if (!job) return <div className="p-6 text-center">İş bulunamadı</div>

  const completedSteps = job.steps.filter(s => s.isCompleted).length
  const totalSteps = job.steps.length
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Badge variant="outline">{job.status}</Badge>
            <span>•</span>
            <span>{job.customer.company}</span>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">İlerleme Durumu</span>
            <span className="text-indigo-600 font-bold">%{Math.round(progress)}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">
            {totalSteps} adımdan {completedSteps} tanesi tamamlandı
          </p>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">İş Detayları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">Adres</p>
              <p className="text-sm text-gray-600">{job.location || job.customer.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">Tarih</p>
              <p className="text-sm text-gray-600">
                {job.scheduledDate
                  ? format(new Date(job.scheduledDate), 'd MMMM yyyy, HH:mm', { locale: tr })
                  : 'Belirtilmemiş'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">İletişim</p>
              <p className="text-sm text-gray-600">{job.customer.user.name}</p>
              <a href={`tel:${job.customer.user.phone}`} className="text-sm text-indigo-600 hover:underline">
                {job.customer.user.phone}
              </a>
            </div>
          </div>

          {job.description && (
            <div className="pt-2 border-t mt-2">
              <p className="font-medium text-sm text-gray-900 mb-1">Açıklama</p>
              <p className="text-sm text-gray-600">{job.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kontrol Listesi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {job.steps.map((step, index) => {
            const isLocked = index > 0 && !job.steps[index - 1].isCompleted
            const hasSubSteps = step.subSteps && step.subSteps.length > 0
            const isExpanded = expandedSteps[step.id] || false
            const isBlocked = !!step.blockedReason

            return (
              <div key={step.id} className={cn(
                "border rounded-lg overflow-hidden transition-all",
                step.isCompleted ? "bg-green-50 border-green-200" :
                  isBlocked ? "bg-red-50 border-red-200" : "bg-white border-gray-200",
                isLocked && "opacity-50 bg-gray-50"
              )}>
                {/* Main Step Header */}
                <div className="p-4 flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 h-8 w-8 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0",
                      step.isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isBlocked
                          ? "bg-red-100 border-red-300 text-red-600"
                          : isLocked
                            ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                            : "border-gray-300 bg-white hover:border-indigo-500"
                    )}
                    onClick={() => !isLocked && !isBlocked && toggleStep(step.id, step.isCompleted)}
                  >
                    {step.isCompleted && <CheckCircle2Icon className="h-5 w-5" />}
                    {isBlocked && <AlertTriangleIcon className="h-4 w-4" />}
                    {isLocked && !isBlocked && <AlertCircleIcon className="h-5 w-5 text-gray-400" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div
                        className="cursor-pointer flex-1"
                        onClick={() => setExpandedSteps(prev => ({ ...prev, [step.id]: !prev[step.id] }))}
                      >
                        <p className={cn(
                          "font-medium transition-colors",
                          step.isCompleted ? "text-green-900" :
                            isBlocked ? "text-red-900" : "text-gray-900"
                        )}>
                          {step.title}
                        </p>
                        {isLocked && !isBlocked && (
                          <p className="text-xs text-red-500 mt-1">
                            Önceki adımı tamamlayın
                          </p>
                        )}
                        {isBlocked && (
                          <div className="text-xs text-red-600 mt-1">
                            <span className="font-semibold">Bloklandı:</span> {step.blockedReason}
                            {step.blockedNote && <span className="block text-red-500">{step.blockedNote}</span>}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {!step.isCompleted && !isLocked && !isBlocked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              setBlockingTask({ id: step.id, type: 'step', title: step.title })
                            }}
                            title="Sorun Bildir / Blokla"
                          >
                            <AlertTriangleIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-2"
                          onClick={() => setExpandedSteps(prev => ({ ...prev, [step.id]: !prev[step.id] }))}
                        >
                          {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Photos Preview */}
                    {step.photos && step.photos.length > 0 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                        {step.photos.map(photo => (
                          <div key={photo.id} className="relative h-16 w-16 rounded-md overflow-hidden border">
                            <img src={photo.url} alt="Step photo" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Content (Substeps & Actions) */}
                {isExpanded && (
                  <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-4">
                    {/* Substeps */}
                    {hasSubSteps && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alt Görevler</p>
                        {step.subSteps.map(subStep => {
                          const isSubBlocked = !!subStep.blockedReason
                          return (
                            <div
                              key={subStep.id}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors",
                                isSubBlocked ? "bg-red-50 border-red-200" : "bg-white border-gray-200 hover:border-indigo-300"
                              )}
                              onClick={() => !step.isCompleted && !isSubBlocked && toggleSubStep(step.id, subStep.id)}
                            >
                              <div className={cn(
                                "h-4 w-4 rounded border flex items-center justify-center",
                                subStep.isCompleted
                                  ? "bg-indigo-500 border-indigo-500 text-white"
                                  : isSubBlocked
                                    ? "bg-red-100 border-red-300 text-red-600"
                                    : "border-gray-300"
                              )}>
                                {subStep.isCompleted && <CheckCircle2Icon className="h-3 w-3" />}
                                {isSubBlocked && <AlertTriangleIcon className="h-2.5 w-2.5" />}
                              </div>
                              <div className="flex-1">
                                <span className={cn(
                                  "text-sm block",
                                  subStep.isCompleted ? "text-gray-500 line-through" :
                                    isSubBlocked ? "text-red-700" : "text-gray-700"
                                )}>
                                  {subStep.title}
                                </span>
                                {isSubBlocked && (
                                  <span className="text-xs text-red-500 block mt-0.5">
                                    {subStep.blockedReason}
                                  </span>
                                )}
                              </div>
                              {!subStep.isCompleted && !step.isCompleted && !isSubBlocked && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setBlockingTask({ id: subStep.id, type: 'substep', parentId: step.id, title: subStep.title })
                                  }}
                                >
                                  <AlertTriangleIcon className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Photo Upload */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fotoğraf Ekle</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex gap-2"
                        onClick={() => handlePhotoUpload(step.id, { target: { files: [new File([], "dummy")] } } as any)}
                        disabled={uploadingPhoto === step.id}
                      >
                        {uploadingPhoto === step.id ? (
                          <span className="animate-spin">⌛</span>
                        ) : (
                          <CameraIcon className="h-4 w-4" />
                        )}
                        Fotoğraf Yükle (URL)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {job.steps.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Bu iş için checklist adımı bulunmuyor.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Chat Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900 px-1">İş Sohbeti</h2>
        <ChatPanel jobId={job.id} title={job.title} />
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t lg:static lg:border-0 lg:bg-transparent lg:p-0 pb-safe z-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => setShowCostDialog(true)}
          >
            💰 Masraf Ekle
          </Button>

          {job.status === 'PENDING' && (
            <Button
              className="w-full h-12 text-base"
              size="lg"
              onClick={() => updateStatus('IN_PROGRESS')}
            >
              İşe Başla
            </Button>
          )}

          {job.status === 'IN_PROGRESS' && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
              size="lg"
              onClick={completeJob}
              disabled={progress < 100}
            >
              İşi Tamamla
            </Button>
          )}

          {job.status === 'COMPLETED' && (
            <div className="w-full p-3 bg-green-100 text-green-800 rounded-lg text-center font-medium flex items-center justify-center gap-2 h-12">
              <CheckCircle2Icon className="h-5 w-5" />
              İş Tamamlandı
            </div>
          )}
        </div>
      </div>
      <BlockTaskDialog
        open={!!blockingTask}
        onOpenChange={(open) => !open && setBlockingTask(null)}
        onBlock={handleBlockTask}
        taskTitle={blockingTask?.title || ''}
        isSubStep={blockingTask?.type === 'substep'}
      />
      <CostDialog
        open={showCostDialog}
        onOpenChange={setShowCostDialog}
        jobId={job.id}
        onSuccess={() => {
          toast.success('Masraf başarıyla kaydedildi')
          // Optional: fetchJob() if we want to show costs
        }}
      />
    </div>
  )
}
