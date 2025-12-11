import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  BriefcaseIcon,
  ReceiptIcon,
  TrendingUpIcon,
  BellIcon
} from 'lucide-react'
import { getAdminDashboardData } from "@/lib/data/admin-dashboard"

export default async function AdminDashboard() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const {
    activeWorkers,
    totalCostToday,
    budgetPercentage,
    pendingApprovalsCount
  } = await getAdminDashboardData()

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <img
            src={session.user.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuDmgIPsi3bPD34q9YUmIJBghzDzdjJ1rgdx1tBy10ynTsLKppEU00n7doTCFEiJdlPmoV_1BkGez8XvuImrIDFnxuqU91lP4ldNTWXjv8i-HqXYQEbOCatNc0kgwrtg5_Qm9w28VRd3Mszc19FPohh87hQImoPk0OPOj9_4PnMcxA8og88y5Uf3GyDt6qLEsXq8LHL_V3hdFx5i2I3UZqsoRVnXw8sDaQIBRNOjOJCQEVxvFwKvsLg_SvV-dnsZe7gFaAK-JaS1DM5y"}
            alt="Avatar"
            className="w-14 h-14 rounded-full border-2 border-primary/20"
          />
          <div>
            <p className="text-muted-foreground text-sm font-medium">Tekrar Hoşgeldiniz,</p>
            <h1 className="text-2xl font-bold text-foreground">{session.user.name || 'Admin Kullanıcı'}</h1>
          </div>
        </div>
        <Link href="/admin/notifications" className="p-3 bg-secondary rounded-full relative hover:bg-secondary/80 transition-colors">
          <BellIcon className="w-6 h-6 text-foreground" />
          {pendingApprovalsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold">
              {pendingApprovalsCount}
            </span>
          )}
        </Link>
      </div>

      {/* Quick Actions (Hızlı İşlemler) */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/admin/jobs/new" className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:shadow-md transition-all group">
            <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
              <BriefcaseIcon className="w-8 h-8 text-primary" />
            </div>
            <span className="text-foreground font-semibold group-hover:text-primary transition-colors">Yeni Görev</span>
          </Link>
          <Link href="/admin/costs" className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:shadow-md transition-all group">
            <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
              <ReceiptIcon className="w-8 h-8 text-primary" />
            </div>
            <span className="text-foreground font-semibold group-hover:text-primary transition-colors">Masraf Ekle</span>
          </Link>
        </div>
      </div>

      {/* Team Status (Ekip Durumu) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Ekip Durumu</h2>
          <Link href="/admin/teams" className="text-primary text-sm font-medium hover:underline">Haritada Gör</Link>
        </div>
        <div className="space-y-3">
          {activeWorkers.length > 0 ? (
            activeWorkers.map((worker) => (
              <div key={worker.id} className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={worker.avatarUrl || `https://ui-avatars.com/api/?name=${worker.name}&background=random`}
                    alt={worker.name || 'Worker'}
                    className="w-10 h-10 rounded-full border border-border"
                  />
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
          <p className="text-muted-foreground text-xs">Günlük bütçenin <span className="font-medium text-foreground">%{budgetPercentage}</span>'i kullanıldı</p>
        </div>
      </div>
    </div>
  )
}
