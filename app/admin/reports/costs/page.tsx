import { getCostBreakdown } from "@/lib/data/reports";
import KPICards from "@/components/admin/reports/KPICards";
import CostTrendChart from "@/components/admin/reports/charts/CostTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExcelDownloadButton } from "@/components/excel-download-button";
import { PDFDownloadButton } from "@/components/pdf-download-button";
import ReportFilters from "@/components/admin/reports/ReportFilters";
import { Suspense } from "react";

export default async function CostReportPage(props: {
    searchParams?: Promise<{ from?: string; to?: string }>
}) {
    const searchParams = await props.searchParams;
    const fromStr = searchParams?.from;
    const toStr = searchParams?.to;
    
    const from = fromStr ? new Date(fromStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = toStr ? new Date(toStr) : new Date();

    const costBreakdown = await getCostBreakdown(from, to);

    // Transform breakdown for chart
    const chartData = Object.entries(costBreakdown).map(([category, amount]) => ({
        date: category, 
        amount
    }));

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Maliyet Raporu</h2>
                <div className="flex items-center space-x-2">
                    <ExcelDownloadButton 
                        type="costs" 
                        filters={{
                            startDate: from.toISOString(),
                            endDate: to.toISOString()
                        }}
                    />
                    <PDFDownloadButton 
                        type="costs" 
                        filters={{
                            startDate: from.toISOString(),
                            endDate: to.toISOString()
                        }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Suspense fallback={<div>Yükleniyor...</div>}>
                    <ReportFilters />
                </Suspense>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <CostTrendChart data={chartData} />
                </div>
                <div className="col-span-3">
                   <Card>
                        <CardHeader>
                            <CardTitle>Kategori Bazlı Dağılım</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(costBreakdown).map(([category, amount]) => (
                                    <div key={category} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{category}</p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)}
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
