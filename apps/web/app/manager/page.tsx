import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BriefcaseIcon,
    UsersIcon,
    CheckCircle2Icon,
    ClockIcon,
    TrendingUpIcon
} from 'lucide-react'
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { getManagerDashboardData } from "@/lib/data/manager-dashboard"

export default async function ManagerDashboard() {
    const session = await auth()

    if (!session || session.user.role !== "MANAGER") {
        redirect("/login")
    }

    const {
        totalJobs,
        activeTeams,
        completedJobsThisMonth,
        pendingApprovals,
        recentJobs
    } = await getManagerDashboardData()

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
            change: 'Sahada',
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
            value: pendingApprovals.toString(),
            change: 'İncelenmeli',
            icon: ClockIcon,
            color: 'text-orange-600',
            bg: 'bg-orange-100'
        }
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Yönetici Paneli</h1>
                <p className="text-gray-500 mt-2">Operasyonel durumu buradan takip edebilirsiniz.</p>
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
                        <Link key={index} href="/manager/approvals">
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
                            {recentJobs.length === 0 ? (
                                <p className="text-sm text-gray-500">Henüz kayıtlı iş bulunmuyor.</p>
                            ) : (
                                recentJobs.map((job) => (
                                    <div key={job.id} className="flex items-start gap-4">
                                        <div className="mt-1 p-2 rounded-full bg-blue-100 text-blue-600">
                                            <BriefcaseIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {job.creator.name} <span className="text-gray-500 font-normal">yeni bir iş oluşturdu</span>
                                            </p>
                                            <p className="text-sm text-gray-600">{job.title} - {job.customer.company}</p>
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
                        <Link href="/manager/jobs" className="block w-full bg-white p-4 rounded-lg shadow-sm text-left hover:bg-indigo-100 transition-colors flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                                <BriefcaseIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium text-indigo-900">Yeni İş Oluştur</h3>
                                <p className="text-sm text-indigo-600/80">Müşteri için yeni bir servis kaydı aç</p>
                            </div>
                        </Link>

                        <Link href="/manager/reports" className="block w-full bg-white p-4 rounded-lg shadow-sm text-left hover:bg-indigo-100 transition-colors flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                                <UsersIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium text-indigo-900">Raporlar</h3>
                                <p className="text-sm text-indigo-600/80">Detaylı iş ve maliyet raporlarını incele</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
