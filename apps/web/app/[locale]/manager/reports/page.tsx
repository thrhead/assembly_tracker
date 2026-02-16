import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JobStatusChart } from "@/components/charts/job-status-chart"
import { TimelineChart } from "@/components/charts/timeline-chart"
import { TeamPerformanceChart } from "@/components/charts/team-performance-chart"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { tr, enUS } from "date-fns/locale"
import { getTranslations } from "next-intl/server"

async function getReportsData(locale: string) {
    const dateLocale = locale === 'tr' ? tr : enUS
    
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
            label: format(date, 'd MMM', { locale: dateLocale }),
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

export default async function ReportsPage(props: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await props.params
    const session = await auth()
    
    if (!session || session.user.role !== "MANAGER") {
        redirect("/login")
    }

    const t = await getTranslations("Manager.reports")
    const { statusData, timelineData, teamData } = await getReportsData(locale)

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-500 mt-2">{t('subtitle')}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* İş Durumu Dağılımı */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t('charts.statusDistribution')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <JobStatusChart data={statusData} />
                    </CardContent>
                </Card>

                {/* Zaman İçindeki Tamamlanma */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('charts.recentCompletion')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TimelineChart data={timelineData} />
                    </CardContent>
                </Card>

                {/* Ekip Performansı */}
                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>{t('charts.topTeams')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TeamPerformanceChart data={teamData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
