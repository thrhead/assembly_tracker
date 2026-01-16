import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { JobsListClient } from '@/components/jobs-list-client'
import { ExcelDownloadButton } from '@/components/excel-download-button'

export default async function ManagerJobsListPage() {
    const session = await auth()

    if (!session || session.user.role !== "MANAGER") {
        redirect("/login")
    }

    // Fetch jobs - managers see all jobs (could be filtered by their teams in future)
    const [jobsByStatus, allJobs, teams, customers] = await Promise.all([
        prisma.job.groupBy({ by: ['status'], _count: true }),
        prisma.job.findMany({
            include: {
                assignments: { include: { team: true }, take: 1 },
                customer: true,
                steps: { select: { id: true, isCompleted: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.team.findMany({ select: { id: true, name: true } }),
        prisma.customer.findMany({ select: { id: true, company: true } })
    ])

    const totalJobs = allJobs.length
    const pendingJobs = jobsByStatus.find(g => g.status === 'PENDING')?._count || 0
    const inProgressJobs = jobsByStatus.find(g => g.status === 'IN_PROGRESS')?._count || 0
    const completedJobs = jobsByStatus.find(g => g.status === 'COMPLETED')?._count || 0

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/manager" className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">İş Listesi</h1>
                            <p className="text-sm text-slate-500">Tüm işleri görüntüle ve filtrele</p>
                        </div>
                    </div>
                    <Excel Down loadButton type="jobs" variant="default" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-500">Toplam İş</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{totalJobs}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-500">Beklemede</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">{pendingJobs}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-500">Devam Eden</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">{inProgressJobs}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-500">Tamamlanan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{completedJobs}</div>
                        </CardContent>
                    </Card>
                </div>

                <JobsListClient initialJobs={allJobs} teams={teams} customers={customers} />
            </div>
        </div>
    )
}
