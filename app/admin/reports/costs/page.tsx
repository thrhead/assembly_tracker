import { getCostBreakdown, getReportStats, getJobsListForFilter, getCategoriesForFilter, getCostTrend, getTotalCostTrend, getPendingCostsList } from "@/lib/data/reports";
import KPICards from "@/components/admin/reports/KPICards";
import CostTrendChart from "@/components/admin/reports/charts/CostTrendChart";
import TotalCostChart from "@/components/admin/reports/charts/TotalCostChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExcelDownloadButton } from "@/components/excel-download-button";
import { PDFDownloadButton } from "@/components/pdf-download-button";
import ReportFilters from "@/components/admin/reports/ReportFilters";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CostReportPage(props: {
    searchParams?: Promise<{ from?: string; to?: string; status?: string; jobStatus?: string; jobId?: string; category?: string }>
}) {
    const searchParams = await props.searchParams;
    const fromStr = searchParams?.from;
    const toStr = searchParams?.to;
    const status = searchParams?.status || 'all';
    const jobStatus = searchParams?.jobStatus || 'all';
    const jobId = searchParams?.jobId || 'all';
    const category = searchParams?.category || 'all';
    
    const from = fromStr ? new Date(fromStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = toStr ? new Date(toStr) : new Date();

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    const [costBreakdown, stats, filterJobs, filterCategories, costTrend, totalTrend, pendingCostsList] = await Promise.all([
        getCostBreakdown(from, to, status, jobStatus, jobId, category),
        getReportStats(from, to, jobStatus, jobId, category),
        getJobsListForFilter(),
        getCategoriesForFilter(),
        getCostTrend(from, to, status, jobStatus, jobId, category),
        getTotalCostTrend(from, to, status, jobStatus, jobId, category),
        getPendingCostsList(from, to, jobStatus, jobId, category)
    ]);

    const filteredTotalCost = Object.values(costBreakdown).reduce((a, b) => a + b, 0);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Maliyet Raporu</h2>
                <div className="flex items-center space-x-2">
                    <ExcelDownloadButton 
                        type="costs" 
                        filters={{
                            startDate: from.toISOString(),
                            endDate: to.toISOString(),
                            jobStatus,
                            jobId,
                            category
                        }}
                    />
                    <PDFDownloadButton 
                        type="costs" 
                        filters={{
                            startDate: from.toISOString(),
                            endDate: to.toISOString(),
                            jobStatus,
                            jobId,
                            category
                        }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Suspense fallback={<div>Yükleniyor...</div>}>
                    <ReportFilters jobs={filterJobs} categories={filterCategories} />
                </Suspense>
            </div>

            {pendingCostsList.length > 0 && (
                <Card className="border-red-200 bg-red-50 shadow-sm">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-red-800 text-lg flex items-center font-bold">
                            <span className="mr-2 px-2 py-0.5 bg-red-200 rounded-full text-xs animate-pulse">!</span> 
                            Onay Bekleyen Harcamalar ({pendingCostsList.length})
                        </CardTitle>
                        <Link href="/admin/costs?status=PENDING">
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-100 font-semibold">
                                Tümünü Gör <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingCostsList.slice(0, 5).map((cost) => (
                                <div key={cost.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100 shadow-sm transition-hover hover:border-red-300">
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <span className="font-bold text-gray-900">{cost.job.title}</span>
                                            <Link href={`/admin/jobs/${cost.jobId}`} target="_blank" className="ml-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-0.5 text-xs text-gray-500 font-medium">
                                            <span className="px-1.5 py-0.5 bg-gray-100 rounded uppercase">{cost.category}</span>
                                            <span>•</span>
                                            <span>{cost.createdBy.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-lg font-black text-red-700 tabular-nums">
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cost.amount)}
                                        </div>
                                        <div className="flex space-x-1.5">
                                            <Link href={`/admin/costs?search=${cost.id}`}>
                                                <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white shadow-sm font-bold px-3">
                                                    <Check className="h-3.5 w-3.5 mr-1" /> ONAY
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/costs?search=${cost.id}`}>
                                                <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-600 hover:bg-red-50 font-bold px-3">
                                                    <X className="h-3.5 w-3.5 mr-1" /> RED
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {pendingCostsList.length > 5 && (
                                <p className="text-xs text-red-500 font-semibold italic text-right mt-2 pr-2">
                                    + {pendingCostsList.length - 5} kayıt daha onayınızı bekliyor.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <KPICards stats={stats} />

            <div className="grid gap-4 md:grid-cols-2">
                <TotalCostChart data={totalTrend} />
                <CostTrendChart data={costTrend.data} categories={costTrend.categories} />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 h-full">
                   <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Kategori Bazlı Dağılım</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(costBreakdown).length > 0 ? (
                                    Object.entries(costBreakdown).map(([cat, amount]) => (
                                        <div key={cat} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{cat}</p>
                                            </div>
                                            <div className="ml-auto font-medium text-sm">
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Veri bulunamadı.</p>
                                )}
                            </div>
                        </CardContent>
                   </Card>
                </div>
                <div className="col-span-3">
                    <Card className="bg-indigo-50 border-indigo-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-indigo-600 text-sm font-medium uppercase tracking-wider">
                                Filtrelenmiş Toplam Harcama
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-indigo-900">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(filteredTotalCost)}
                            </div>
                            <p className="text-xs text-indigo-600 mt-1">
                                Seçili kriterlere ve tarihlere göre toplam harcama tutarı.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}