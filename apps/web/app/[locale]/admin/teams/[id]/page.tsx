import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { Link } from "@/lib/navigation"
import { ArrowLeft, Users, Briefcase, Clock, TrendingUp, Wallet, CheckCircle2, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTeam, getTeamDetailedReports } from "@/lib/data/teams"
import { TeamFinancialCharts } from "@/components/admin/team-financial-charts"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export default async function TeamDetailPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    const [team, reportData] = await Promise.all([
        getTeam(params.id),
        getTeamDetailedReports(params.id)
    ])

    if (!team) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Ekip Bulunamadı</h1>
                <Link href="/admin/teams" className="text-blue-600 hover:underline mt-4 inline-block">
                    Ekip Listesine Dön
                </Link>
            </div>
        )
    }

    const { jobs, stats } = reportData

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center gap-4">
                 <Link href="/admin/teams">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                        {!team.isActive && <Badge variant="destructive">Pasif</Badge>}
                    </div>
                    <p className="text-muted-foreground">{team.description || 'Açıklama yok'}</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Montaj</CardTitle>
                        <Briefcase className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalJobs}</div>
                        <p className="text-xs text-muted-foreground">Şimdiye kadar atanan</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Çalışma Saati</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalWorkingHours} Saat</div>
                        <p className="text-xs text-muted-foreground">Sahada geçirilen süre</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Başarı Oranı</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">%{stats.successRate}</div>
                        <p className="text-xs text-muted-foreground">Tamamlanma yüzdesi</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Harcama</CardTitle>
                        <Wallet className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₺{stats.totalExpenses.toLocaleString('tr-TR')}</div>
                        <p className="text-xs text-muted-foreground">Onaylı masraf toplamı</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                    <TabsTrigger value="members">Ekip Üyeleri</TabsTrigger>
                    <TabsTrigger value="jobs">İş Geçmişi</TabsTrigger>
                    <TabsTrigger value="financials">Finansal Raporlar</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Ekip Hakkında</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg bg-gray-50">
                                        <p className="text-sm text-muted-foreground mb-1">Takım Lideri</p>
                                        <p className="font-semibold text-lg">{team.lead?.name || "Atanmamış"}</p>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-gray-50">
                                        <p className="text-sm text-muted-foreground mb-1">Üye Sayısı</p>
                                        <p className="font-semibold text-lg">{team.members.length} Kişi</p>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-gray-50">
                                        <p className="text-sm text-muted-foreground mb-1">Kuruluş Tarihi</p>
                                        <p className="font-semibold">{format(new Date(team.createdAt), 'd MMMM yyyy', { locale: tr })}</p>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-gray-50">
                                        <p className="text-sm text-muted-foreground mb-1">Durum</p>
                                        <Badge variant={team.isActive ? "success" : "destructive"}>
                                            {team.isActive ? "Aktif Ekip" : "Pasif Ekip"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Harcama Dağılımı</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats.categoryBreakdown.length > 0 ? (
                                        stats.categoryBreakdown.map((cat, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                    <span className="text-sm">{cat.name}</span>
                                                </div>
                                                <span className="text-sm font-medium">₺{cat.value.toLocaleString('tr-TR')}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">Henüz harcama kaydı yok</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="members" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Üye Listesi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {team.members.map((member) => {
                                    const isLead = team.leadId === member.userId;
                                    return (
                                        <div key={member.id} className={`flex items-center justify-between p-4 border rounded-lg ${isLead ? 'bg-indigo-50 border-indigo-200' : 'bg-white'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                                        <AvatarFallback>{member.user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    {isLead && (
                                                        <div className="absolute -top-2 -right-1 bg-yellow-400 p-1 rounded-full border-2 border-white shadow-sm">
                                                            <Crown className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{member.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={isLead ? "default" : "outline"} className={isLead ? "bg-indigo-600 hover:bg-indigo-700" : ""}>
                                                    {isLead ? 'Takım Lideri' : 'Üye'}
                                                </Badge>
                                                <p className="text-[10px] text-muted-foreground mt-2">
                                                    Katılma: {format(new Date(member.joinedAt), 'd MMM yyyy', { locale: tr })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="jobs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Atanan Montaj İşleri</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {jobs.map((job) => (
                                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <Link href={`/admin/jobs/${job.id}`} className="font-bold text-indigo-600 hover:underline">
                                                    {job.title}
                                                </Link>
                                                <Badge variant={job.status === 'COMPLETED' ? 'success' : job.status === 'IN_PROGRESS' ? 'info' : 'secondary'}>
                                                    {job.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job.customer.company}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.scheduledDate ? format(new Date(job.scheduledDate), 'd MMM yyyy') : 'Tarih yok'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">₺{job.costs.reduce((sum, c) => sum + c.amount, 0).toLocaleString('tr-TR')}</p>
                                            <p className="text-[10px] text-muted-foreground">Toplam Maliyet</p>
                                        </div>
                                    </div>
                                ))}
                                {jobs.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8 italic">Bu ekibe henüz bir iş atanmamış.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financials" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Kategori Bazlı Harcamalar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TeamFinancialCharts data={stats.categoryBreakdown} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Harcama Özeti</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Toplam Onaylı Masraf:</span>
                                        <span className="font-bold text-lg text-orange-600">₺{stats.totalExpenses.toLocaleString('tr-TR')}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">İş Başına Ortalama Masraf:</span>
                                        <span className="font-medium">₺{stats.totalJobs > 0 ? (stats.totalExpenses / stats.totalJobs).toLocaleString('tr-TR') : 0}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">En Çok Harcama Yapılan Kategori:</span>
                                        <span className="font-medium">
                                            {stats.categoryBreakdown.length > 0 
                                                ? stats.categoryBreakdown.reduce((prev, current) => (prev.value > current.value) ? prev : current).name 
                                                : "Yok"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
