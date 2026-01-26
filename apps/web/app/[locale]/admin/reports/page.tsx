import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { Link } from "@/lib/navigation"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BarChart3, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getJobsForReport, getReportStats, getWeeklyCompletedSteps } from "@/lib/data/reports"
import WeeklyStepsChart from "@/components/admin/reports/charts/WeeklyStepsChart"

export default async function AdminReportsPage() {
    const session = await auth()

    if (session?.user?.role !== "ADMIN") {
        redirect("/")
    }

    const [stats, allJobs, weeklySteps] = await Promise.all([
        getReportStats(new Date(0), new Date()),
        getJobsForReport(),
        getWeeklyCompletedSteps()
    ])

    const { totalJobs, pendingJobs, inProgressJobs, completedJobs } = stats

    // Status translations and colors
    const statusConfig: any = {
        'PENDING': { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' },
        'IN_PROGRESS': { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' },
        'COMPLETED': { label: 'Tamamlandı', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' },
        'ON_HOLD': { label: 'Beklemede', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' }
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen">
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                İş Raporları
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Performans ve operasyonel analizler
                            </p>
                        </div>
                    </div>
                </div>

                {/* Performance Chart Section */}
                <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <WeeklyStepsChart data={weeklySteps} categories={weeklySteps.categories} />
                </section>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Toplam İş
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalJobs}</span>
                                <Briefcase className="w-8 h-8 text-primary/20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Tamamlanan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-bold text-green-600 dark:text-green-500">{completedJobs}</span>
                                <TrendingUp className="w-8 h-8 text-green-500/20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Devam Eden
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">
                                {inProgressJobs}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Bekleyen
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">
                                {pendingJobs}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Jobs List */}
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            <CardTitle>Tüm İşler ve Aşamaları</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {allJobs.map((job) => {
                                const totalSteps = job.steps.length
                                const completedSteps = job.steps.filter(s => s.isCompleted).length
                                const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
                                const teamName = job.assignments[0]?.team?.name || 'Ekip Atanmamış'
                                const statusInfo = statusConfig[job.status] || statusConfig.PENDING

                                return (
                                    <div
                                        key={job.id}
                                        className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/jobs/${job.id}`}
                                                        className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-primary transition-colors"
                                                    >
                                                        {job.title}
                                                    </Link>
                                                    <Badge className={`${statusInfo.color} text-[10px]`}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1.5 font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                        Müşteri: {job.customer.company}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                        Ekip: {teamName}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                                <span>AŞAMA İLERLEMESİ</span>
                                                <span className="text-slate-900 dark:text-slate-100">
                                                    {completedSteps} / {totalSteps} Adım (%{progress})
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="bg-primary h-2.5 rounded-full transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {allJobs.length === 0 && (
                                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                    Henüz hiç iş kaydı bulunmuyor.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// Minimal Briefcase icon for cards if lucide-react doesn't have it
function Briefcase(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}
