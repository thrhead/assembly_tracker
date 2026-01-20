import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getTeam, getTeamPerformanceStats } from "@/lib/data/teams"
import { TeamStats } from "@/components/admin/team-stats"
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

    const [team, stats] = await Promise.all([
        getTeam(params.id),
        getTeamPerformanceStats(params.id)
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

    // Mapping stats to match TeamStats component expected format
    const teamStats = {
        overview: {
            total: stats.totalJobs,
            completed: stats.completedJobs,
            active: stats.inProgressJobs
        },
        chartData: [
            { name: 'Tamamlanan', value: stats.completedJobs },
            { name: 'Devam Eden', value: stats.inProgressJobs },
        ]
    }

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center gap-4">
                 <Link href="/admin/teams">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                    <p className="text-muted-foreground">{team.description || 'Açıklama yok'}</p>
                </div>
            </div>

            {/* Stats Section */}
            <TeamStats stats={teamStats} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Members Section */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Ekip Üyeleri
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {team.members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback>{member.user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{member.user.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {team.leadId === member.userId ? 'Takım Lideri' : 'Üye'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Katılma: {format(new Date(member.joinedAt), 'd MMM yyyy', { locale: tr })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {team.members.length === 0 && (
                                <p className="text-muted-foreground text-center py-4">Henüz üye yok</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Team Info Side Card */}
                <Card>
                     <CardHeader>
                        <CardTitle>Ekip Özeti</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Durum</span>
                            <span className={team.isActive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {team.isActive ? "Aktif" : "Pasif"}
                            </span>
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-gray-600">Oluşturulma</span>
                            <span className="text-sm">
                                {format(new Date(team.createdAt), 'd MMM yyyy', { locale: tr })}
                            </span>
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-gray-600">Lider</span>
                            <span className="text-sm font-medium">
                                {team.lead?.name || "Atanmamış"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
