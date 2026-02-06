import { auth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { redirect, Link } from "@/lib/navigation"
import Image from "next/image"
import {
  BriefcaseIcon,
  ReceiptIcon,
  TrendingUpIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  ActivityIcon
} from 'lucide-react'
import { getAdminDashboardData } from "@/lib/data/admin-dashboard"
import { PerformanceChart } from "@/components/charts/performance-chart"

export default async function AdminDashboard() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const {
    activeWorkers,
    totalCostToday,
    budgetPercentage,
    pendingApprovalsCount,
    totalPendingCost,
    totalApprovedCost,
    weeklyStats
  } = await getAdminDashboardData()

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage src={session?.user?.image || undefined} alt="Avatar" className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Tekrar Hoşgeldiniz,</p>
            <h1 className="text-2xl font-bold text-foreground">{session?.user?.name || 'Admin Kullanıcı'}</h1>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Haftalık Tamamlanan Adımlar</h2>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-[400px]">
          <PerformanceChart data={weeklyStats} />
        </div>
      </div>

      {/* Quick Actions (Hızlı İşlemler) */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/jobs" className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
            <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
              <BriefcaseIcon className="w-8 h-8 text-primary" />
            </div>
            <span className="text-foreground font-semibold group-hover:text-primary transition-colors">İşleri Yönet</span>
          </Link>
          <Link href="/admin/jobs/gantt" className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
            <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
              <CalendarIcon className="w-8 h-8 text-primary" />
            </div>
            <span className="text-foreground font-semibold group-hover:text-primary transition-colors">Gelişmiş Planlama</span>
          </Link>
          <Link href="/admin/costs" className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
            <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
              <ReceiptIcon className="w-8 h-8 text-primary" />
            </div>
            <span className="text-foreground font-semibold group-hover:text-primary transition-colors">Maliyetler</span>
          </Link>
          <Link href="/admin/logs" className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
            <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
              <ActivityIcon className="w-8 h-8 text-primary" />
            </div>
            <span className="text-foreground font-semibold group-hover:text-primary transition-colors">Sistem Logları</span>
          </Link>
        </div>
      </div>

      {/* Team Status (Ekip Durumu) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Ekip Durumu</h2>
          <Link href="/admin/teams" className="text-primary text-sm font-medium hover:underline">Tümünü Gör</Link>
        </div>
        <div className="space-y-3">
          {activeWorkers.length > 0 ? (
            activeWorkers.map((worker) => (
              <div key={worker.id} className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src={worker.avatarUrl || `https://ui-avatars.com/api/?name=${worker.name}&background=random`}
                      alt={worker.name || 'Worker'}
                      fill
                      className="rounded-full border border-border object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{worker.name}</p>
                    <p className="text-muted-foreground text-xs">Sahada / Müsait</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-600 text-sm font-medium">Aktif</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border p-8 rounded-xl text-center">
              <p className="text-muted-foreground text-sm">Aktif çalışan bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Costs (Son Masraflar) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Son Masraflar</h2>
          <Link href="/admin/costs" className="text-primary text-sm font-medium hover:underline">Tümünü Gör</Link>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Bugün Harcanan</p>
              <p className="text-3xl font-bold text-foreground">₺{totalCostToday.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <TrendingUpIcon className="w-4 h-4" />
              <span className="text-sm font-medium">%15</span>
            </div>
          </div>

          <div className="w-full bg-secondary h-3 rounded-full mb-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${budgetPercentage}%` }}
            ></div>
          </div>
          <p className="text-muted-foreground text-xs">Günlük bütçenin <span className="font-medium text-foreground">%{budgetPercentage}</span>&apos;i kullanıldı</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Toplam Bekleyen</p>
                <h3 className="text-2xl font-bold text-foreground">₺{totalPendingCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</h3>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Onay bekleyen masraflar</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Toplam Onaylanan</p>
                <h3 className="text-2xl font-bold text-foreground">₺{totalApprovedCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Toplam onaylanan masraflar</p>
          </div>
        </div>
      </div>
    </div>
  )
}