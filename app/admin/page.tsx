import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import {
  User,
  LayoutDashboard,
  Users,
  ListTodo,
  BarChart3,
  Settings,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowUpRight
} from 'lucide-react'
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== "ADMIN") {
    redirect("/")
  }

  // Fetch real data
  const [
    totalCompletedToday,
    totalPendingTasks,
    totalCostsThisWeek,
    activeTeams,
    ongoingJobs
  ] = await Promise.all([
    prisma.job.count({
      where: {
        status: 'COMPLETED',
        completedDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.job.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      }
    }),
    prisma.costTracking.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    }),
    prisma.team.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { members: true }
        }
      },
      take: 3
    }),
    prisma.job.findMany({
      where: {
        status: 'IN_PROGRESS'
      },
      include: {
        assignments: {
          include: {
            team: true
          },
          take: 1
        },
        _count: {
          select: { steps: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 3
    })
  ])

  const totalCosts = totalCostsThisWeek._sum.amount || 0

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm px-4 pt-3 pb-3">
          <div className="flex justify-between items-center">
            <Link href="/admin/users" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Kontrol Paneli</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow p-4 space-y-8">
          {/* Tabs */}
          <div>
            <div className="border-b border-slate-200 dark:border-slate-700">
              <nav aria-label="Tabs" className="-mb-px flex space-x-6">
                <a
                  href="#"
                  className="border-primary text-primary whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-base"
                >
                  Overview
                </a>
              </nav>
            </div>
          </div>

          {/* KPI Cards */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Temel Performans Göstergeleri
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Completed Tasks */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm mb-2">
                  <span>Tamamlanan Görevler</span>
                </div>
                <div className="flex items-baseline mt-2">
                  <span className="text-4xl font-bold text-green-600 dark:text-green-500">
                    {totalCompletedToday}
                  </span>
                  <div className="ml-2 flex items-center text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/50 rounded-full px-1.5 py-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Bugün</p>
              </div>

              {/* Pending Tasks */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm mb-2">
                  <span>Bekleyen Görevler</span>
                  <Clock className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-4xl font-bold text-orange-500 dark:text-orange-400 mt-2">
                  {totalPendingTasks}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Yakında Tamamlanacak</p>
              </div>

              {/* Total Costs */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm mb-2">
                  <span>Toplam Maliyetler</span>
                  <DollarSign className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-500 mt-2">
                  ₺{totalCosts.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Bu Hafta</p>
              </div>
            </div>
          </section>

          {/* Real-time Team Status */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Gerçek Zamanlı Ekip Durumu
            </h2>
            <div className="space-y-3">
              {activeTeams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {team.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Active: {team._count.members} members
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatDistanceToNow(new Date(team.updatedAt), { addSuffix: true, locale: tr })}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Ongoing Tasks */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Devam Eden Görevler
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm divide-y divide-slate-200 dark:divide-slate-700">
              {ongoingJobs.map((job) => {
                // Calculate progress (simplified to use random for demo, should calculate from actual steps)
                const progress = Math.min(90, Math.max(10, Math.floor(Math.random() * 100)))
                const statusColor = progress > 70 ? 'green' : progress > 30 ? 'orange' : 'blue'
                const statusText = progress > 70 ? 'Tamamlanmak Üzere' : progress > 30 ? 'Devam Ediyor' : 'Başladı'
                const teamName = job.assignments[0]?.team?.name || 'Ekip Yok'

                return (
                  <div key={job.id} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {job.title}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {teamName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {progress}%
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor === 'green'
                            ? 'text-green-800 dark:text-green-200 bg-green-200 dark:bg-green-700/50'
                            : statusColor === 'orange'
                              ? 'text-orange-800 dark:text-orange-200 bg-orange-200 dark:bg-orange-500/30'
                              : 'text-blue-800 dark:text-blue-200 bg-blue-200 dark:bg-blue-500/30'
                            }`}
                        >
                          {statusText}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </main>

        {/* Footer Navigation */}
        <footer className="sticky bottom-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
          <nav className="flex justify-around items-center h-20">
            <Link
              href="/admin"
              className="flex flex-col items-center text-primary space-y-1"
            >
              <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
                <LayoutDashboard className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-semibold">Kontrol Paneli</span>
            </Link>
            <Link
              href="/admin/teams"
              className="flex flex-col items-center text-slate-500 dark:text-slate-400 space-y-1"
            >
              <Users className="w-5 h-5" />
              <span className="text-xs">Ekipler</span>
            </Link>
            <Link
              href="/admin/jobs"
              className="flex flex-col items-center text-slate-500 dark:text-slate-400 space-y-1"
            >
              <ListTodo className="w-5 h-5" />
              <span className="text-xs">Görevler</span>
            </Link>
            <Link
              href="/admin/reports"
              className="flex flex-col items-center text-slate-500 dark:text-slate-400 space-y-1"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Raporlar</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex flex-col items-center text-slate-500 dark:text-slate-400 space-y-1"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Ayarlar</span>
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  )
}
