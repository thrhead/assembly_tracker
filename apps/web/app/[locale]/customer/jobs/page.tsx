'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/lib/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2Icon, BriefcaseIcon } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Job {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  scheduledDate: string | null
  completedDate: string | null
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

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'pending', label: 'Bekleyen' },
  { value: 'in_progress', label: 'Devam Eden' },
  { value: 'completed', label: 'Tamamlanan' }
]

export default function CustomerJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchJobs()
  }, [activeFilter])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const url = activeFilter === 'all' 
        ? '/api/customer/jobs'
        : `/api/customer/jobs?status=${activeFilter.toUpperCase()}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">İşlerim</h1>
        <p className="text-gray-600 mt-1">Tüm işlerinizi görüntüleyin ve takip edin</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={activeFilter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2Icon className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">İş bulunamadı</h3>
            <p className="text-gray-500 mt-1">Bu kategoride henüz iş bulunmuyor</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2">{job.title}</CardTitle>
                  <Badge className={`${STATUS_COLORS[job.status]} shrink-0`}>
                    {STATUS_LABELS[job.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                )}

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>İlerleme</span>
                    <span>{job.completedSteps}/{job.totalSteps} adım</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                  <p className="text-xs text-gray-500 text-right">{job.progress}%</p>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-600 space-y-1">
                  {job.scheduledDate && (
                    <p>
                      <span className="font-medium">Tarih:</span>{' '}
                      {format(new Date(job.scheduledDate), 'd MMM yyyy', { locale: tr })}
                    </p>
                  )}
                  {job.completedDate && (
                    <p>
                      <span className="font-medium">Tamamlanma:</span>{' '}
                      {format(new Date(job.completedDate), 'd MMM yyyy', { locale: tr })}
                    </p>
                  )}
                </div>

                {/* Action */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/customer/jobs/${job.id}`)}
                >
                  Detayları Gör
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
