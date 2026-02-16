
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BriefcaseIcon, CheckCircle2Icon, TrendingUpIcon } from 'lucide-react'

interface WorkerStatsProps {
    stats: {
        activeJobs: number
        completedJobs: number
        totalEarnings: number
    }
}

export function WorkerStats({ stats }: WorkerStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Aktif İşler</CardTitle>
                    <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeJobs}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
                    <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.completedJobs}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Masraflar</CardTitle>
                    <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₺{stats.totalEarnings.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+12% geçen aydan</p>
                </CardContent>
            </Card>
        </div>
    )
}
