import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BriefcaseIcon,
  ReceiptIcon,
  UsersIcon,
  TrendingUpIcon,
  BellIcon
} from 'lucide-react'
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export default async function AdminDashboard() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // Fetch real data for synchronization
  const [
    activeWorkers,
    todaysCosts,
    pendingApprovalsCount
  ] = await Promise.all([
    // Fetch active workers (those with IN_PROGRESS jobs)
    prisma.user.findMany({
      where: {
        role: 'WORKER',
        isActive: true,
        assignedJobs: {
          some: {
            job: {
              status: 'IN_PROGRESS'
            }
          }
        }
      },
      take: 5,
      select: {
        id: true,
        name: true,
        avatarUrl: true
      }
    }),
    // Fetch today's costs for "Son Masraflar"
    prisma.costTracking.findMany({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      select: {
        amount: true
      }
    }),
    // Fetch pending approvals count
    prisma.approval.count({
      where: {
        status: 'PENDING'
      }
    })
  ])

  // Calculate total cost for today
  const totalCostToday = todaysCosts.reduce((sum, cost) => sum + cost.amount, 0)

  // Mock budget for progress bar (e.g., 2000 TL daily budget)
  const dailyBudget = 2000
  const budgetPercentage = Math.min(Math.round((totalCostToday / dailyBudget) * 100), 100)

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#1A1A1A] p-4 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-4">
          <img
            src={session.user.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuDmgIPsi3bPD34q9YUmIJBghzDzdjJ1rgdx1tBy10ynTsLKppEU00n7doTCFEiJdlPmoV_1BkGez8XvuImrIDFnxuqU91lP4ldNTWXjv8i-HqXYQEbOCatNc0kgwrtg5_Qm9w28VRd3Mszc19FPohh87hQImoPk0OPOj9_4PnMcxA8og88y5Uf3GyDt6qLEsXq8LHL_V3hdFx5i2I3UZqsoRVnXw8sDaQIBRNOjOJCQEVxvFwKvsLg_SvV-dnsZe7gFaAK-JaS1DM5y"}
            alt="Avatar"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="text-gray-400 text-sm">Tekrar Hoşgeldiniz,</p>
            <h1 className="text-xl font-bold text-white">{session.user.name || 'Admin Kullanıcı'}</h1>
          </div>
        </div>
        <Link href="/admin/notifications" className="p-2 bg-zinc-800 rounded-full relative hover:bg-zinc-700 transition-colors">
          <BellIcon className="w-6 h-6 text-gray-300" />
          {pendingApprovalsCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-[#CCFF04] rounded-full border-2 border-[#1A1A1A] flex items-center justify-center text-[10px] font-bold text-black">
              {pendingApprovalsCount}
            </span>
          )}
        </Link>
      </div>

      {/* Quick Actions (Hızlı İşlemler) */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/admin/jobs/new" className="bg-[#101010] border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#CCFF04] transition-colors group">
            <BriefcaseIcon className="w-8 h-8 text-[#CCFF04]" />
            <span className="text-white font-medium group-hover:text-[#CCFF04] transition-colors">Yeni Görev</span>
          </Link>
          <Link href="/admin/costs" className="bg-[#101010] border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#CCFF04] transition-colors group">
            <ReceiptIcon className="w-8 h-8 text-[#CCFF04]" />
            <span className="text-white font-medium group-hover:text-[#CCFF04] transition-colors">Masraf Ekle</span>
          </Link>
        </div>
      </div>

      {/* Team Status (Ekip Durumu) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Ekip Durumu</h2>
          <Link href="/admin/teams" className="text-[#CCFF04] text-sm font-medium hover:underline">Haritada Gör</Link>
        </div>
        <div className="space-y-3">
          {activeWorkers.length > 0 ? (
            activeWorkers.map((worker) => (
              <div key={worker.id} className="bg-[#101010] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={worker.avatarUrl || `https://ui-avatars.com/api/?name=${worker.name}&background=random`}
                    alt={worker.name || 'Worker'}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-white font-medium">{worker.name}</p>
                    <p className="text-gray-500 text-xs">Sahada / Müsait</p>
                  </div>
                </div>
                <span className="text-[#CCFF04] text-sm font-medium">Aktif</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Aktif çalışan bulunamadı.</p>
          )}
        </div>
      </div>

      {/* Recent Costs (Son Masraflar) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Son Masraflar</h2>
          <Link href="/admin/costs" className="text-[#CCFF04] text-sm font-medium hover:underline">Tümünü Gör</Link>
        </div>
        <div className="bg-[#101010] border border-zinc-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500 text-xs mb-1">Bugün Harcanan</p>
              <p className="text-2xl font-bold text-white">₺{totalCostToday.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex items-center gap-1 text-[#CCFF04]">
              <TrendingUpIcon className="w-4 h-4" />
              <span className="text-sm font-medium">%15</span>
            </div>
          </div>

          <div className="w-full bg-zinc-800 h-2 rounded-full mb-2">
            <div
              className="bg-[#CCFF04] h-2 rounded-full"
              style={{ width: `${budgetPercentage}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-xs">Günlük bütçenin %{budgetPercentage}'i kullanıldı</p>
        </div>
      </div>
    </div>
  )
}
