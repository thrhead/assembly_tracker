import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  MapPinIcon,
  CheckCircle2Icon,
  BriefcaseIcon,
  Building2Icon
} from 'lucide-react'
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"

async function getCompletedJobs(userId: string) {
  return await prisma.job.findMany({
    where: {
      status: 'COMPLETED',
      assignments: {
        some: {
          OR: [
            { workerId: userId },
            { team: { members: { some: { userId: userId } } } }
          ]
        }
      }
    },
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
    },
    orderBy: {
      completedDate: 'desc'
    }
  })
}

export default async function CompletedJobsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
    redirect('/login')
  }

  const jobs = await getCompletedJobs(session.user.id)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tamamlanmış İşler</h1>
        <p className="text-gray-600 mt-1">Tamamladığınız işlerin listesi</p>
      </div>

      {/* Stats Card */}
      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2Icon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Tamamlanan İş</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed">
            <CheckCircle2Icon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Henüz tamamlanmış işiniz bulunmuyor</h3>
            <p className="text-gray-500 mt-1">Tamamladığınız işler burada görünecek.</p>
          </div>
        )}

        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 shrink-0">
                  Tamamlandı
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{job.customer.company}</span>
              </div>
              {job.customer.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{job.customer.address}</span>
                </div>
              )}
              {job.completedDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 shrink-0" />
                  <span>{format(new Date(job.completedDate), "d MMMM yyyy", { locale: tr })}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle2Icon className="h-4 w-4 shrink-0" />
                <span>{job._count.steps} adım tamamlandı</span>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 p-3">
              <Button asChild className="w-full" variant="default">
                <Link href={`/worker/jobs/${job.id}`}>
                  Detayları Gör
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
