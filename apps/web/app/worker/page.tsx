'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
import Link from "next/link"
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

export default function WorkerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (session.user.role !== "WORKER" && session.user.role !== "TEAM_LEAD") {
        router.push('/login') // Or unauthorized page
      } else {
        fetchJobs()
      }
    }
  }, [status, session])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      // Try to fetch from API
      const res = await apiClient.get('/api/worker/jobs')
      
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
        setIsOffline(false)
        // Update cache
        localStorage.setItem(CACHE_KEY_JOBS, JSON.stringify(data))
      } else {
        throw new Error('API Error')
      }
    } catch (error) {
      console.log('Fetch error, falling back to cache', error)
      setIsOffline(true)
      // Fallback to cache
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

  if (status === 'loading' || (loading && jobs.length === 0)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İşlerim</h1>
          <p className="text-gray-500">Size atanan aktif işler ({jobs.length})</p>
        </div>
        {isOffline && (
          <Badge variant="outline" className="gap-1 border-orange-200 bg-orange-50 text-orange-700">
            <WifiOffIcon className="h-3 w-3" />
            Çevrimdışı
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
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

        {jobs.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed">
            <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Aktif işiniz bulunmuyor</h3>
            <p className="text-gray-500 mt-1">Yeni iş atandığında burada göreceksiniz.</p>
            {isOffline && (
              <p className="text-orange-600 text-sm mt-2">
                Çevrimdışı modda olduğunuz için yeni işler yüklenemiyor olabilir.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}