import { getCostBreakdown } from "@/lib/data/reports";
import KPICards from "@/components/admin/reports/KPICards";
import CostTrendChart from "@/components/admin/reports/charts/CostTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CostReportPage(props: {
    searchParams?: Promise<{ from?: string; to?: string }>
}) {
    const searchParams = await props.searchParams;
    const from = searchParams?.from ? new Date(searchParams.from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = searchParams?.to ? new Date(searchParams.to) : new Date();

    const costBreakdown = await getCostBreakdown(from, to);

    // Transform breakdown for chart
    const chartData = Object.entries(costBreakdown).map(([category, amount]) => ({
        date: category, // Using category as X-axis for now as the breakdown function aggregates by category
        amount
    }));

    // Calculate totals
    const totalCost = Object.values(costBreakdown).reduce((a, b) => a + b, 0);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Maliyet Raporu</h2>
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
