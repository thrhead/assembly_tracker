'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/lib/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  MapPinIcon,
  ChevronRightIcon,
  Building2Icon,
  BriefcaseIcon,
  WifiOffIcon,
  Loader2Icon
} from 'lucide-react'
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Link } from "@/lib/navigation"
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

// Local storage key for caching jobs
const CACHE_KEY_JOBS = 'worker_dashboard_jobs_cache'

const priorityColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "destructive",
  URGENT: "destructive"
}

const priorityLabels: Record<string, string> = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
  URGENT: "Acil"
}

const statusLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal"
}

import { WorkerStats } from '@/components/worker/worker-stats'

export default function WorkerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'PENDING'>('ALL')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (session.user.role !== "WORKER" && session.user.role !== "TEAM_LEAD") {
        router.push('/login')
      } else {
        fetchJobs()
      }
    }
  }, [status, session])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/api/worker/jobs')

      if (res.ok) {
        const data = await res.json()
        setJobs(data)
        setIsOffline(false)
        localStorage.setItem(CACHE_KEY_JOBS, JSON.stringify(data))
      } else {
        throw new Error('API Error')
      }
    } catch (error) {
      console.log('Fetch error, falling back to cache', error)
      setIsOffline(true)
      const cached = localStorage.getItem(CACHE_KEY_JOBS)
      if (cached) {
        setJobs(JSON.parse(cached))
        toast.info('Çevrimdışı mod: Önbellekten veriler gösteriliyor.')
      } else {
        toast.error('Bağlantı yok ve önbellek boş.')
      }
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    activeJobs: jobs.filter(j => ['PENDING', 'IN_PROGRESS'].includes(j.status)).length,
    completedJobs: jobs.filter(j => j.status === 'COMPLETED').length,
    totalEarnings: jobs.reduce((sum, j) => sum + (j.costs?.reduce((s: number, c: any) => s + (c.amount || 0), 0) || 0), 0)
  }

  const filteredJobs = jobs.filter(j => {
    if (filter === 'ALL') return j.status !== 'COMPLETED' // Don't show completed by default if it's "Jobs" view
    if (filter === 'IN_PROGRESS') return j.status === 'IN_PROGRESS'
    if (filter === 'PENDING') return j.status === 'PENDING'
    return true
  })

  if (status === 'loading' || (loading && jobs.length === 0)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Hoş geldiniz, {session?.user?.name}</p>
        </div>
        {isOffline && (
          <Badge variant="outline" className="gap-1 border-orange-200 bg-orange-50 text-orange-700">
            <WifiOffIcon className="h-3 w-3" />
            Çevrimdışı
          </Badge>
        )}
      </div>

      <WorkerStats stats={stats} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Görevlerim</h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['ALL', 'IN_PROGRESS', 'PENDING'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-sm rounded-md transition-all ${filter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {f === 'ALL' ? 'Tümü' : f === 'IN_PROGRESS' ? 'Devam Eden' : 'Bekleyen'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold leading-tight">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Building2Icon className="h-3 w-3" />
                      {job.customer.company}
                    </div>
                  </div>
                  <Badge variant={priorityColors[job.priority] || "default"}>
                    {priorityLabels[job.priority] || job.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3 space-y-3">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                  <span className="line-clamp-2">{job.location || job.customer.address || "Adres belirtilmemiş"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>
                    {job.scheduledDate
                      ? format(new Date(job.scheduledDate), 'd MMM yyyy, HH:mm', { locale: tr })
                      : "Tarih belirtilmemiş"
                    }
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-normal">
                    {statusLabels[job.status] || job.status}
                  </Badge>
                  {job._count?.steps > 0 && (
                    <span className="text-xs text-gray-500">
                      {job._count.steps} Adım
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-3">
                <Button asChild className="w-full" variant="default">
                  <Link href={`/worker/jobs/${job.id}`}>
                    Detayları Gör
                    <ChevronRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}

          {filteredJobs.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed">
              <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Görev bulunamadı</h3>
              <p className="text-gray-500 mt-1">Filtreye uygun aktif işiniz bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
