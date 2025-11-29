import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BriefcaseIcon,
  UsersIcon,
  CheckCircle2Icon,
  ClockIcon,
  TrendingUpIcon,
  AlertCircleIcon
} from 'lucide-react'
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export default async function AdminDashboard() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // Fetch real data
  const [
    totalJobs,
    activeTeams,
    completedJobsThisMonth,
    pendingApprovalsCount,
    recentJobs,
    pendingJobs
  ] = await Promise.all([
    prisma.job.count(),
    prisma.team.count({ where: { isActive: true } }),
    prisma.job.count({
      where: {
        status: 'COMPLETED',
        completedDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.approval.count({ where: { status: 'PENDING' } }),
    // Standard recent jobs
    prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: true,
        customer: true,
        steps: {
          where: {
            subSteps: {
              some: {
                approvalStatus: 'PENDING'
              }
            }
          },
          select: { id: true }
        },
        costs: {
          where: { status: 'PENDING' },
          select: { id: true }
        }
      }
    }),
    // Jobs with pending approvals
    prisma.job.findMany({
      where: {
        OR: [
          {
            steps: {
              some: {
                subSteps: {
                  some: {
                    approvalStatus: 'PENDING'
                  }
                }
              }
            }
          },
          {
            costs: {
              some: {
                status: 'PENDING'
              }
            }
          }
        ]
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: true,
        customer: true,
        steps: {
          where: {
            subSteps: {
              some: {
                approvalStatus: 'PENDING'
              }
            }
          },
          select: { id: true }
        },
        costs: {
          where: { status: 'PENDING' },
          select: { id: true }
        }
      }
    })
  ])

  const stats = [
    {
      title: 'Toplam İş',
      value: totalJobs.toString(),
      change: 'Tüm zamanlar',
      icon: BriefcaseIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Aktif Ekipler',
      value: activeTeams.toString(),
      change: 'Aktif',
      icon: UsersIcon,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Tamamlanan',
      value: completedJobsThisMonth.toString(),
      change: 'Bu ay',
      icon: CheckCircle2Icon,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      title: 'Bekleyen Onay',
      value: pendingApprovalsCount.toString(),
      change: 'Acil',
      icon: ClockIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ]

  // Merge and deduplicate jobs (prioritize pending)
  const displayJobs = [...pendingJobs, ...recentJobs]
    .filter((job, index, self) => index === self.findIndex((t) => t.id === job.id))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Hoş geldiniz, sistem genel durumunu buradan takip edebilirsiniz.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const cardContent = (
            <Card className={`border-none shadow-sm hover:shadow-md transition-shadow ${stat.title === 'Bekleyen Onay' ? 'cursor-pointer' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          )

          return stat.title === 'Bekleyen Onay' ? (
            <Link key={index} href="/admin/approvals">
              {cardContent}
            </Link>
          ) : (
            <div key={index}>
              {cardContent}
            </div>
          )
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-gray-500" />
              Son İşler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {displayJobs.length === 0 ? (
                <p className="text-sm text-gray-500">Henüz kayıtlı iş bulunmuyor.</p>
              ) : (
                displayJobs.map((job) => (
                  <div key={job.id} className="flex items-start gap-4">
                    <div className="mt-1 p-2 rounded-full bg-blue-100 text-blue-600">
                      <BriefcaseIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {job.creator.name} <span className="text-gray-500 font-normal">yeni bir iş oluşturdu</span>
                      </p>
                      <p className="text-sm text-gray-600">{job.title} - {job.customer.company}</p>
                      {(job.steps.length > 0 || job.costs.length > 0) && (
                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚠️ Onay Bekliyor
                        </div>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: tr })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-none shadow-sm bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-900">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/jobs" className="block w-full bg-white p-4 rounded-lg shadow-sm text-left hover:bg-indigo-100 transition-colors flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                <BriefcaseIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-indigo-900">Yeni İş Oluştur</h3>
                <p className="text-sm text-indigo-600/80">Müşteri için yeni bir servis kaydı aç</p>
              </div>
            </Link>

            <Link href="/admin/users/new" className="block w-full bg-white p-4 rounded-lg shadow-sm text-left hover:bg-indigo-100 transition-colors flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-indigo-900">Yeni Kullanıcı Ekle</h3>
                <p className="text-sm text-indigo-600/80">Sisteme yeni personel veya müşteri ekle</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
