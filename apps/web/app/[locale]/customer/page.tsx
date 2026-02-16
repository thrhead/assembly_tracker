import { auth } from '@/lib/auth'
import { redirect } from '@/lib/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatsCard } from '@/components/customer/stats-card'
import { JobStatusChart } from '@/components/charts/job-status-chart'
import {
  BriefcaseIcon,
  ClockIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  DownloadIcon
} from 'lucide-react'
import { Link } from '@/lib/navigation'
// Keep next/link for internal links inside server components for now or switch to @/lib/navigation Link
import { getTranslations } from 'next-intl/server'

async function getCustomerDashboardData(userId: string) {
  // ...
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/customer/jobs`, {
    headers: {
      cookie: `next-auth.session-token=${userId}` // This won't work, we need to use server-side fetch
    },
    cache: 'no-store'
  })

  // Since we can't easily pass auth in server component, let's use prisma directly
  const { prisma } = await import('@/lib/db')

  const customer = await prisma.customer.findUnique({
    where: { userId }
  })

  if (!customer) {
    return { jobs: [], stats: { totalJobs: 0, pendingJobs: 0, inProgressJobs: 0, completedJobs: 0, completionRate: 0 } }
  }

  const jobs = await prisma.job.findMany({
    where: { customerId: customer.id },
    include: {
      steps: {
        select: {
          isCompleted: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  })

  const allJobs = await prisma.job.findMany({
    where: { customerId: customer.id },
    select: { status: true }
  })

  const stats = {
    totalJobs: allJobs.length,
    pendingJobs: allJobs.filter(j => j.status === 'PENDING').length,
    inProgressJobs: allJobs.filter(j => j.status === 'IN_PROGRESS').length,
    completedJobs: allJobs.filter(j => j.status === 'COMPLETED').length,
    completionRate: allJobs.length > 0
      ? Math.round((allJobs.filter(j => j.status === 'COMPLETED').length / allJobs.length) * 100)
      : 0
  }

  const statusDistribution = [
    { status: 'PENDING', count: stats.pendingJobs },
    { status: 'IN_PROGRESS', count: stats.inProgressJobs },
    { status: 'COMPLETED', count: stats.completedJobs }
  ].filter(item => item.count > 0)

  const jobsWithProgress = jobs.map(job => {
    const totalSteps = job.steps.length
    const completedSteps = job.steps.filter(s => s.isCompleted).length
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    return { ...job, progress }
  })

  return { jobs: jobsWithProgress, stats, statusDistribution }
}

export default async function CustomerDashboard() {
  const session = await auth()
  const t = await getTranslations('CustomerDashboard')

  if (!session || session.user.role !== 'CUSTOMER') {
    redirect('/login')
  }

  const { jobs, stats, statusDistribution } = await getCustomerDashboardData(session?.user?.id || '')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title={t('stats.totalJobs')}
          value={stats.totalJobs}
          icon={BriefcaseIcon}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatsCard
          title="Bekleyen"
          value={stats.pendingJobs}
          icon={AlertCircleIcon}
          iconColor="text-gray-600"
          bgColor="bg-gray-100"
        />
        <StatsCard
          title="Devam Eden"
          value={stats.inProgressJobs}
          icon={ClockIcon}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatsCard
          title="Tamamlanan"
          value={stats.completedJobs}
          icon={CheckCircle2Icon}
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Job Status Chart */}
        {statusDistribution && statusDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>İş Durumu Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <JobStatusChart data={statusDistribution} />
            </CardContent>
          </Card>
        )}

        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Son İşler</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/customer/jobs">Tümünü Gör</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Henüz iş bulunmuyor</p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/customer/jobs/${job.id}`}
                    className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm">{job.title}</h4>
                      <Badge variant="outline" className="shrink-0">
                        {job.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>İlerleme</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-1.5" />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] relative z-10"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={`/api/v1/jobs/${job.id}/report`} download>
                          <DownloadIcon className="w-3 h-3 mr-1" />
                          PDF İndir
                        </a>
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
