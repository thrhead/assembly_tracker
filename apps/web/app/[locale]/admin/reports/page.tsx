'use client'

import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { Link } from "@/lib/navigation"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BarChart3, TrendingUp, FileIcon, Users, Wallet, Zap, Calendar, Briefcase as BriefcaseIcon, Clock, ChevronRight, LayoutDashboard, UserCog } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
    getJobsForReport, 
    getReportStats, 
    getWeeklyCompletedSteps,
    getJobStatusDistribution,
    getTeamPerformance,
    getJobsListForFilter,
    getCategoriesForFilter,
    getCostBreakdown,
    getCostTrend,
    getTotalCostTrend,
    getPendingCostsList,
    getCostList
} from "@/lib/data/reports"
import { getAllTeamsReports, getTeamDetailedReports } from "@/lib/data/teams"
import WeeklyStepsChart from "@/components/admin/reports/charts/WeeklyStepsChart"
import JobDistributionChart from "@/components/admin/reports/charts/JobDistributionChart"
import TeamPerformanceChart from "@/components/admin/reports/charts/TeamPerformanceChart"
import CategoryPieChart from "@/components/admin/reports/charts/CategoryPieChart"
import CostTrendChart from "@/components/admin/reports/charts/CostTrendChart"
import TotalCostChart from "@/components/admin/reports/charts/TotalCostChart"
import CostListTable from "@/components/admin/reports/CostListTable"
import KPICards from "@/components/admin/reports/KPICards"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Suspense, useState, useEffect } from "react"
import ReportFilters from "@/components/admin/reports/ReportFilters"
import { TeamFinancialCharts } from "@/components/admin/team-financial-charts"
import { TeamPerformanceTrend } from "@/components/admin/team-performance-trend"
import { TeamMemberStats } from "@/components/admin/team-member-stats"
import { cn } from "@/lib/utils"

export default function AdminReportsPage(props: {
    searchParams?: Promise<{ from?: string; to?: string; jobStatus?: string; jobId?: string; category?: string; status?: string; tab?: string }>
}) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [selectedTeamId, setSelectedTeamTeamId] = useState<string | null>(null)
    const [teamDetails, setTeamDetails] = useState<any>(null)
    const [loadingTeam, setLoadingTeam] = useState(false)

    useEffect(() => {
        async function load() {
            setLoading(true)
            const searchParams = await props.searchParams;
            const fromStr = searchParams?.from;
            const toStr = searchParams?.to;
            const jobStatus = searchParams?.jobStatus || 'all';
            const jobId = searchParams?.jobId || 'all';
            const category = searchParams?.category || 'all';
            const costStatus = searchParams?.status || 'all';

            const from = fromStr ? new Date(fromStr) : new Date(0);
            const to = toStr ? new Date(toStr) : new Date();
            from.setHours(0, 0, 0, 0);
            to.setHours(23, 59, 59, 999);

            const [
                generalStats, allJobs, weeklySteps, jobDistribution,
                teamPerformance, filterJobs, filterCategories, costBreakdown,
                costTrend, totalTrend, pendingCostsList, costList, teamsReportData
            ] = await Promise.all([
                getReportStats(from, to, jobStatus, jobId, category),
                getJobsForReport(),
                getWeeklyCompletedSteps(),
                getJobStatusDistribution(from, to, jobStatus, jobId),
                getTeamPerformance(from, to, jobStatus, jobId),
                getJobsListForFilter(jobStatus),
                getCategoriesForFilter(),
                getCostBreakdown(from, to, costStatus, jobStatus, jobId, category),
                getCostTrend(from, to, costStatus, jobStatus, jobId, category),
                getTotalCostTrend(from, to, costStatus, jobStatus, jobId, category),
                getPendingCostsList(from, to, jobStatus, jobId, category),
                getCostList(from, to, costStatus, jobStatus, jobId, category),
                getAllTeamsReports()
            ])

            setData({
                generalStats, allJobs, weeklySteps, jobDistribution,
                teamPerformance, filterJobs, filterCategories, costBreakdown,
                costTrend, totalTrend, pendingCostsList, costList, teamsReportData,
                activeTab: searchParams?.tab || 'overview'
            })
            setLoading(false)
        }
        load()
    }, [props.searchParams])

    const handleTeamSelect = async (teamId: string) => {
        setLoadingTeam(true)
        setSelectedTeamTeamId(teamId)
        const details = await getTeamDetailedReports(teamId)
        setTeamDetails(details)
        setLoadingTeam(false)
    }

    if (loading || !data) {
        return <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    }

    const { generalStats, allJobs, weeklySteps, jobDistribution, teamPerformance, filterJobs, filterCategories, costBreakdown, costTrend, totalTrend, costList, teamsReportData, activeTab } = data
    const { totalJobs, pendingJobs, inProgressJobs, completedJobs } = generalStats
    const { reports: teamReports, globalStats: teamGlobalStats } = teamsReportData

    // Chart Transforms
    const jobData = Object.entries(jobDistribution).map(([status, count]) => ({ name: status, value: count as number }))
    const teamPerfData = teamPerformance.map((t: any) => ({ name: t.teamName, jobs: t.totalJobs, time: Math.round(t.avgCompletionTimeMinutes) }))
    const pieChartData = Object.entries(costBreakdown).map(([name, value]) => ({ name, value: value as number }))

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Raporlar ve Analiz</h1>
                        <p className="text-muted-foreground">Tüm performans, maliyet ve ekip verileri tek panelde.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/reports/exports">
                        <Button variant="outline" className="gap-2">
                            <FileIcon className="w-4 h-4" />
                            Dışa Aktar
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="p-4 bg-muted/30 border-none shadow-none">
                <Suspense fallback={<div>Filtreler yükleniyor...</div>}>
                    <ReportFilters jobs={filterJobs} categories={filterCategories} />
                </Suspense>
            </Card>

            <Tabs defaultValue={activeTab} className="space-y-6">
                <TabsList className="bg-muted p-1 rounded-lg">
                    <TabsTrigger value="overview" className="gap-2"><BarChart3 className="w-4 h-4" /> Genel Bakış</TabsTrigger>
                    <TabsTrigger value="performance" className="gap-2"><Zap className="w-4 h-4" /> Performans</TabsTrigger>
                    <TabsTrigger value="costs" className="gap-2"><Wallet className="w-4 h-4" /> Maliyetler</TabsTrigger>
                    <TabsTrigger value="teams" className="gap-2"><Users className="w-4 h-4" /> Ekipler</TabsTrigger>
                </TabsList>

                {/* Genel Bakış Sekmesi */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Toplam İş</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{totalJobs}</div></CardContent>
                        </Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Tamamlanan</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold text-green-600">{completedJobs}</div></CardContent>
                        </Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Devam Eden</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold text-blue-600">{inProgressJobs}</div></CardContent>
                        </Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Bekleyen</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold text-yellow-600">{pendingJobs}</div></CardContent>
                        </Card>
                    </div>
                    <section className="bg-white dark:bg-slate-900 rounded-xl border p-6">
                        <h3 className="text-lg font-semibold mb-4">Haftalık Tamamlanan Adımlar</h3>
                        <WeeklyStepsChart data={weeklySteps} categories={weeklySteps.categories} />
                    </section>
                </TabsContent>

                {/* Performans Sekmesi */}
                <TabsContent value="performance" className="space-y-6">
                    <KPICards stats={generalStats} />
                    <div className="grid gap-4 md:grid-cols-7">
                        <Card className="md:col-span-4"><CardHeader><CardTitle>Ekip Performansı</CardTitle></CardHeader>
                            <CardContent><TeamPerformanceChart data={teamPerfData} /></CardContent>
                        </Card>
                        <Card className="md:col-span-3"><CardHeader><CardTitle>Durum Dağılımı</CardTitle></CardHeader>
                            <CardContent><JobDistributionChart data={jobData} /></CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Maliyet Sekmesi */}
                <TabsContent value="costs" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-7">
                        <Card className="md:col-span-4"><CardHeader><CardTitle>Maliyet Trendi</CardTitle></CardHeader>
                            <CardContent><CostTrendChart data={costTrend.data} categories={costTrend.categories} /></CardContent>
                        </Card>
                        <Card className="md:col-span-3"><CardHeader><CardTitle>Kategori Dağılımı</CardTitle></CardHeader>
                            <CardContent><CategoryPieChart data={pieChartData} /></CardContent>
                        </Card>
                    </div>
                    <Card><CardHeader><CardTitle>Gider Kalemleri</CardTitle></CardHeader>
                        <CardContent><CostListTable costs={costList} /></CardContent>
                    </Card>
                </TabsContent>

                {/* Ekipler Sekmesi */}
                <TabsContent value="teams" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ortalama Verimlilik</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{teamGlobalStats.avgEfficiency}%</div>
                                <Progress value={teamGlobalStats.avgEfficiency} className="mt-2 h-1.5" />
                            </CardContent>
                        </Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Toplam Harcama</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">₺{teamGlobalStats.totalExpenses.toLocaleString('tr-TR')}</div></CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-12">
                        {/* Sol: Ekip Listesi */}
                        <Card className={cn(selectedTeamId ? "md:col-span-4" : "md:col-span-12")}>
                            <CardHeader><CardTitle>Ekip Karşılaştırma</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ekip</TableHead>
                                            {!selectedTeamId && <TableHead>Lider</TableHead>}
                                            <TableHead className="text-center">Verimlilik</TableHead>
                                            <TableHead className="text-right">İşlem</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teamReports.map((report: any) => (
                                            <TableRow key={report.id} className={cn(selectedTeamId === report.id && "bg-primary/5")}>
                                                <TableCell className="font-bold">{report.name}</TableCell>
                                                {!selectedTeamId && <TableCell>{report.leadName}</TableCell>}
                                                <TableCell className="text-center">%{report.stats.efficiencyScore}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleTeamSelect(report.id)}>
                                                        {selectedTeamId === report.id ? "Seçili" : "Detay"}
                                                        <ChevronRight className="ml-1 h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Sağ: Seçili Ekip Detay Raporu */}
                        {selectedTeamId && (
                            <div className="md:col-span-8 space-y-6">
                                {loadingTeam ? (
                                    <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                                ) : teamDetails && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                                        {/* Detaylı KPI Kartları */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <Card className="bg-primary/5 border-none shadow-none">
                                                <CardHeader className="p-3 pb-0"><CardTitle className="text-[10px] uppercase text-muted-foreground">Verimlilik</CardTitle></CardHeader>
                                                <CardContent className="p-3 pt-1"><div className="text-xl font-bold text-primary">%{teamDetails.stats.efficiencyScore}</div></CardContent>
                                            </Card>
                                            <Card className="bg-blue-50 border-none shadow-none text-blue-700">
                                                <CardHeader className="p-3 pb-0"><CardTitle className="text-[10px] uppercase">Çalışma Saati</CardTitle></CardHeader>
                                                <CardContent className="p-3 pt-1"><div className="text-xl font-bold">{teamDetails.stats.totalWorkingHours}s</div></CardContent>
                                            </Card>
                                            <Card className="bg-green-50 border-none shadow-none text-green-700">
                                                <CardHeader className="p-3 pb-0"><CardTitle className="text-[10px] uppercase">Başarı</CardTitle></CardHeader>
                                                <CardContent className="p-3 pt-1"><div className="text-xl font-bold">%{teamDetails.stats.successRate}</div></CardContent>
                                            </Card>
                                            <Card className="bg-orange-50 border-none shadow-none text-orange-700">
                                                <CardHeader className="p-3 pb-0"><CardTitle className="text-[10px] uppercase">Toplam Gider</CardTitle></CardHeader>
                                                <CardContent className="p-3 pt-1"><div className="text-xl font-bold">₺{teamDetails.stats.totalExpenses.toLocaleString('tr-TR')}</div></CardContent>
                                            </Card>
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <Card>
                                                <CardHeader><CardTitle className="text-sm">Performans Trendi</CardTitle></CardHeader>
                                                <CardContent><TeamPerformanceTrend data={teamDetails.stats.monthlyTrend} /></CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader><CardTitle className="text-sm">Gider Dağılımı</CardTitle></CardHeader>
                                                <CardContent><TeamFinancialCharts data={teamDetails.stats.categoryBreakdown} /></CardContent>
                                            </Card>
                                        </div>

                                        <Card>
                                            <CardHeader><CardTitle className="text-sm">Üye Performansları</CardTitle></CardHeader>
                                            <CardContent><TeamMemberStats members={teamDetails.stats.memberStats} /></CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}