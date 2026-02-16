import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { Link } from "@/lib/navigation"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BriefcaseIcon,
    UsersIcon,
    CheckCircle2Icon,
    ClockIcon,
    TrendingUpIcon
} from 'lucide-react'
import { formatDistanceToNow } from "date-fns"
import { tr, enUS } from "date-fns/locale"
import { getManagerDashboardData } from "@/lib/data/manager-dashboard"
import { getTranslations } from "next-intl/server"

export default async function ManagerDashboard(props: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await props.params
    const session = await auth()

    if (!session || session.user.role !== "MANAGER") {
        redirect("/login")
    }

    const t = await getTranslations("Manager.dashboard")
    const tCommon = await getTranslations("Common")
    const dateLocale = locale === 'tr' ? tr : enUS

    const {
        totalJobs,
        activeTeams,
        completedJobsThisMonth,
        pendingApprovals,
        recentJobs
    } = await getManagerDashboardData()

    const stats = [
        {
            title: t('stats.totalJobs'),
            value: totalJobs.toString(),
            change: t('stats.allTime'),
            icon: BriefcaseIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            title: t('stats.activeTeams'),
            value: activeTeams.toString(),
            change: t('stats.onField'),
            icon: UsersIcon,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            title: t('stats.completed'),
            value: completedJobsThisMonth.toString(),
            change: t('stats.thisMonth'),
            icon: CheckCircle2Icon,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        },
        {
            title: t('stats.pendingApproval'),
            value: pendingApprovals.toString(),
            change: t('stats.needsReview'),
            icon: ClockIcon,
            color: 'text-orange-600',
            bg: 'bg-orange-100'
        }
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-500 mt-2">{t('subtitle')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const cardContent = (
                        <Card className={`border-none shadow-sm hover:shadow-md transition-shadow ${stat.title === t('stats.pendingApproval') ? 'cursor-pointer' : ''}`}>
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

                    return stat.title === t('stats.pendingApproval') ? (
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
                            {t('recentJobs.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentJobs.length === 0 ? (
                                <p className="text-sm text-gray-500">{t('recentJobs.noJobs')}</p>
                            ) : (
                                recentJobs.map((job) => (
                                    <div key={job.id} className="flex items-start gap-4">
                                        <div className="mt-1 p-2 rounded-full bg-blue-100 text-blue-600">
                                            <BriefcaseIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {job.creator.name} <span className="text-gray-500 font-normal">{t('recentJobs.createdNew')}</span>
                                            </p>
                                            <p className="text-sm text-gray-600">{job.title} - {job.customer.company}</p>
                                            <p className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: dateLocale })}
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
                        <CardTitle className="text-indigo-900">{t('quickActions.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href="/manager/jobs" className="block w-full bg-white p-4 rounded-lg shadow-sm text-left hover:bg-indigo-100 transition-colors flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                                <BriefcaseIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium text-indigo-900">{t('quickActions.newJob.title')}</h3>
                                <p className="text-sm text-indigo-600/80">{t('quickActions.newJob.desc')}</p>
                            </div>
                        </Link>

                        <Link href="/manager/reports" className="block w-full bg-white p-4 rounded-lg shadow-sm text-left hover:bg-indigo-100 transition-colors flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                                <UsersIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium text-indigo-900">{t('quickActions.reports.title')}</h3>
                                <p className="text-sm text-indigo-600/80">{t('quickActions.reports.desc')}</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
