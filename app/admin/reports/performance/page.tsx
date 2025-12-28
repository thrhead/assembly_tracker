import { getJobStatusDistribution, getTeamPerformance, getReportStats, getJobsListForFilter, getCategoriesForFilter } from "@/lib/data/reports";
import JobDistributionChart from "@/components/admin/reports/charts/JobDistributionChart";
import TeamPerformanceChart from "@/components/admin/reports/charts/TeamPerformanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportFilters from "@/components/admin/reports/ReportFilters";
import { Suspense } from "react";
import KPICards from "@/components/admin/reports/KPICards";

export default async function PerformanceReportPage(props: {
    searchParams?: Promise<{ from?: string; to?: string; jobStatus?: string; jobId?: string; category?: string }>
}) {
    const searchParams = await props.searchParams;
    const fromStr = searchParams?.from;
    const toStr = searchParams?.to;
    const jobStatus = searchParams?.jobStatus || 'all';
    const jobId = searchParams?.jobId || 'all';
    const category = searchParams?.category || 'all';

    const from = fromStr ? new Date(fromStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = toStr ? new Date(toStr) : new Date();

    // Set times to cover full range
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    const [jobDistribution, teamPerformance, stats, filterJobs, filterCategories] = await Promise.all([
        getJobStatusDistribution(from, to, jobStatus, jobId),
        getTeamPerformance(from, to, jobStatus, jobId),
        getReportStats(from, to),
        getJobsListForFilter(),
        getCategoriesForFilter()
    ]);

    // Transform job distribution
    const jobData = Object.entries(jobDistribution).map(([status, count]) => ({
        name: status,
        value: count
    }));

    // Transform team performance
    const teamData = teamPerformance.map(t => ({
        name: t.teamName,
        jobs: t.totalJobs,
        time: Math.round(t.avgCompletionTimeMinutes)
    }));

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Performans Raporu</h2>
            </div>

            <div className="flex items-center justify-between">
                <Suspense fallback={<div>Yükleniyor...</div>}>
                    <ReportFilters jobs={filterJobs} categories={filterCategories} />
                </Suspense>
            </div>

            <KPICards stats={stats} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <TeamPerformanceChart data={teamData} />
                </div>
                <div className="col-span-3">
                    <JobDistributionChart data={jobData} />
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                 <div className="col-span-4">
                   <Card>
                        <CardHeader>
                            <CardTitle>Ekip Detayları</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teamPerformance.map((team) => (
                                    <div key={team.teamName} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{team.teamName}</p>
                                            <p className="text-xs text-muted-foreground">{team.totalJobs} İş Tamamlandı</p>
                                        </div>
                                        <div className="font-medium">
                                            Ort. {Math.round(team.avgCompletionTimeMinutes)} Dk
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                   </Card>
                </div>
            </div>
        </div>
    );
}
