import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JobStatusChart } from "@/components/charts/job-status-chart"
import { TimelineChart } from "@/components/charts/timeline-chart"
import { TeamPerformanceChart } from "@/components/charts/team-performance-chart"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { tr } from "date-fns/locale"

async function getReportsData() {
    // 1. İş Durumu Dağılımı
    const statusCounts = await prisma.job.groupBy({
        by: ['status'],
        _count: {
            status: true
        }
    })

    const statusData = statusCounts.map(item => ({
        status: item.status,
        count: item._count.status
    }))

    // 2. Son 7 Günlük İş Tamamlanma Sayıları
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i)
        return {
            date: date,
            label: format(date, 'd MMM', { locale: tr }),
            count: 0
        }
    }).reverse()

    const completedJobs = await prisma.job.findMany({
        where: {
            status: 'COMPLETED',
            updatedAt: {
                gte: startOfDay(subDays(new Date(), 6))
            }
        },
        select: {
            updatedAt: true
        }
    })

    const timelineData = last7Days.map(day => {
        const count = completedJobs.filter(job =>
            job.updatedAt >= startOfDay(day.date) &&
            job.updatedAt <= endOfDay(day.date)
        ).length
        return {
            name: day.label,
            tamamlanan: count
        }
    })

    // 3. Ekip Performansı (Tamamlanan İş Sayısı)
    const teamPerformance = await prisma.team.findMany({
        select: {
            name: true,
            assignments: {
                where: {
                    job: {
                        status: 'COMPLETED'
                    }
                },
                select: {
                    id: true
                }
            }
        }
    })

    const teamData = teamPerformance.map(team => ({
        name: team.name,
        isSayisi: team.assignments.length
    })).sort((a, b) => b.isSayisi - a.isSayisi).slice(0, 5) // En iyi 5 ekip

    return { statusData, timelineData, teamData }
}

export default async function ReportsPage() {
    const session = await auth()
    if (!session || session.user.role !== "MANAGER") {
        redirect("/login")
    }

    const { statusData, timelineData, teamData } = await getReportsData()

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
                <p className="text-gray-500 mt-2">İş ve performans analizleri.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* İş Durumu Dağılımı */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>İş Durumu Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <JobStatusChart data={statusData} />
                    </CardContent>
                </Card>

                {/* Zaman İçindeki Tamamlanma */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Son 7 Gün Tamamlanan İşler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TimelineChart data={timelineData} />
                    </CardContent>
                </Card>

                {/* Ekip Performansı */}
                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>En İyi Ekipler (Tamamlanan İş)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TeamPerformanceChart data={teamData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
