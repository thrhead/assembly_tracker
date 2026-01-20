'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  PhoneIcon,
  UserIcon,
  CheckCircle2Icon,
  Loader2Icon
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface JobDetail {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  location: string | null
  scheduledDate: string | null
  completedDate: string | null
  customer: {
    company: string
    address: string | null
  }
  steps: {
    id: string
    title: string
    description: string | null
    isCompleted: boolean
    completedAt: string | null
    order: number
  }[]
  assignments: {
    worker: {
      name: string
      phone: string | null
      email: string
    } | null
    team: {
      name: string
      lead: {
        name: string
        phone: string | null
      } | null
    } | null
  }[]
  approvals: {
    status: string
    createdAt: string
    updatedAt: string
    notes: string | null
  }[]
  progress: number
  completedSteps: number
  totalSteps: number
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  IN_PROGRESS: 'Devam Ediyor',
  COMPLETED: 'Tamamlandı',
  ON_HOLD: 'Beklemede',
  CANCELLED: 'İptal'
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default function CustomerJobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJob()
  }, [params.id])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/customer/jobs/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data)
      } else {
        console.error('Failed to fetch job')
      }
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">İş bulunamadı</h2>
        <Button onClick={() => router.back()} className="mt-4">
          Geri Dön
        </Button>
      </div>
    )
  }

  const assignedWorker = job.assignments.find(a => a.worker)?.worker
  const assignedTeam = job.assignments.find(a => a.team)?.team

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={STATUS_COLORS[job.status]}>
              {STATUS_LABELS[job.status]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">İlerleme Durumu</span>
            <span className="text-indigo-600 font-bold">{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">
            {job.totalSteps} adımdan {job.completedSteps} tanesi tamamlandı
          </p>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">İş Detayları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {job.location && (
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-900">Adres</p>
                <p className="text-sm text-gray-600">{job.location}</p>
              </div>
            </div>
          )}

          {job.scheduledDate && (
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-900">Planlanan Tarih</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(job.scheduledDate), 'd MMMM yyyy, HH:mm', { locale: tr })}
                </p>
              </div>
            </div>
          )}

          {job.completedDate && (
            <div className="flex items-start gap-3">
              <CheckCircle2Icon className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-900">Tamamlanma Tarihi</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(job.completedDate), 'd MMMM yyyy, HH:mm', { locale: tr })}
                </p>
              </div>
            </div>
          )}

          {job.description && (
            <div className="pt-2 border-t">
              <p className="font-medium text-sm text-gray-900 mb-1">Açıklama</p>
              <p className="text-sm text-gray-600">{job.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Team/Worker */}
      {(assignedWorker || assignedTeam) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atanan Ekip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignedWorker && (
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-gray-900">{assignedWorker.name}</p>
                  {assignedWorker.phone && (
                    <a
                      href={`tel:${assignedWorker.phone}`}
                      className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <PhoneIcon className="h-3 w-3" />
                      {assignedWorker.phone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {assignedTeam && (
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-gray-900">Ekip: {assignedTeam.name}</p>
                  {assignedTeam.lead && (
                    <div className="text-sm text-gray-600">
                      <p>Ekip Lideri: {assignedTeam.lead.name}</p>
                      {assignedTeam.lead.phone && (
                        <a
                          href={`tel:${assignedTeam.lead.phone}`}
                          className="text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <PhoneIcon className="h-3 w-3" />
                          {assignedTeam.lead.phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kontrol Listesi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {job.steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg",
                step.isCompleted ? "bg-green-50" : "bg-gray-50"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 h-5 w-5 rounded border flex items-center justify-center",
                  step.isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 bg-white"
                )}
              >
                {step.isCompleted && <CheckCircle2Icon className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.isCompleted ? "text-green-900 line-through opacity-70" : "text-gray-900"
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          ))}
          {job.steps.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Bu iş için checklist adımı bulunmuyor.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Approval Status */}
      {job.approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Onay Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            {job.approvals.map((approval, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      approval.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : approval.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {approval.status === 'APPROVED'
                      ? 'Onaylandı'
                      : approval.status === 'REJECTED'
                      ? 'Reddedildi'
                      : 'Bekliyor'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(approval.updatedAt), 'd MMM yyyy', { locale: tr })}
                  </span>
                </div>
                {approval.notes && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Not:</span> {approval.notes}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
