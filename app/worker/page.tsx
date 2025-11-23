import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
  Building2Icon,
  CheckCircle2Icon,
  BriefcaseIcon,
  AlertCircleIcon
} from 'lucide-react'
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"

async function getWorkerJobs(userId: string) {
  return await prisma.job.findMany({
    where: {
      assignments: {
        some: {
          OR: [
            { workerId: userId },
            { team: { members: { some: { userId: userId } } } }
          ]
        }
      },
      status: {
        in: ['PENDING', 'IN_PROGRESS']
      }
    },
    orderBy: [
      { priority: 'desc' },
      { scheduledDate: 'asc' }
    ],
    include: {
      customer: {
        select: {
          company: true,
          address: true
        }
      },
      _count: {
        select: {
          steps: true
        }
      }
    }
  })
}

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

export default async function WorkerDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "WORKER" && session.user.role !== "TEAM_LEAD")) {
    redirect("/login")
  }

  const jobs = await getWorkerJobs(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">İşlerim</h1>
        <p className="text-gray-500">Size atanan aktif işler ({jobs.length})</p>
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
                <Badge variant={priorityColors[job.priority]}>
                  {priorityLabels[job.priority]}
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
                  {statusLabels[job.status]}
                </Badge>
                {job._count.steps > 0 && (
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

        {jobs.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed">
            <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Aktif işiniz bulunmuyor</h3>
            <p className="text-gray-500 mt-1">Yeni iş atandığında burada göreceksiniz.</p>
          </div>
        )}
      </div>
    </div>
  )
}
