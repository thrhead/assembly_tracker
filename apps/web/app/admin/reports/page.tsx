import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getJobsForReport, getReportStats } from "@/lib/data/reports"

export default async function AdminReportsPage() {
    const session = await auth()

    if (session?.user?.role !== "ADMIN") {
        redirect("/")
    }

    const [stats, allJobs] = await Promise.all([
        getReportStats(new Date(0), new Date()),
        getJobsForReport()
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
            <div className="max-w-4xl mx-auto p-6 space-y-6">
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
                                Tüm işlerin durum ve aşama bilgileri
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Toplam İş
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                {totalJobs}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Beklemede
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">
                                {pendingJobs}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Devam Ediyor
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">
                                {inProgressJobs}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Tamamlandı
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                                {completedJobs}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Jobs List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tüm İşler ve Aşamaları</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {allJobs.map((job) => {
                                const totalSteps = job.steps.length
                                const completedSteps = job.steps.filter(s => s.isCompleted).length
                                const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
                                const teamName = job.assignments[0]?.team?.name || 'Ekip Atanmamış'
                                const statusInfo = statusConfig[job.status] || statusConfig.PENDING

                                return (
                                    <div
                                        key={job.id}
                                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <Link
                                                    href={`/admin/jobs/${job.id}`}
                                                    className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-primary transition-colors"
                                                >
                                                    {job.title}
                                                </Link>
                                                <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                    <span>Müşteri: {job.customer.company}</span>
                                                    <span>•</span>
                                                    <span>Ekip: {teamName}</span>
                                                </div>
                                            </div>
                                            <Badge className={statusInfo.color}>
                                                {statusInfo.label}
                                            </Badge>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-300">
                                                    Aşama İlerlemesi
                                                </span>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {completedSteps} / {totalSteps} Adım
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                                <div
                                                    className="bg-primary h-2.5 rounded-full transition-all"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                                                %{progress}
                                            </div>
                                        </div>

                                        {/* Location Info */}
                                        {job.location && (
                                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    📍 {job.location}
                                                </p>
                                            </div>
                                        )}
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
