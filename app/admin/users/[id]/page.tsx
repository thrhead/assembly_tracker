import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, Calendar, User as UserIcon, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUser } from "@/lib/data/users"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export default async function UserDetailsPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    const user = await getUser(params.id)

    if (!user) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Bulunamadı</h1>
                <Link href="/admin/users" className="text-blue-600 hover:underline mt-4 inline-block">
                    Kullanıcı Listesine Dön
                </Link>
            </div>
        )
    }

    const roleLabels: Record<string, string> = {
        ADMIN: "Yönetici",
        MANAGER: "Müdür",
        TEAM_LEAD: "Takım Lideri",
        WORKER: "Çalışan",
        CUSTOMER: "Müşteri",
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Profili</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="h-32 w-32 mb-4">
                            <AvatarImage src={user.avatarUrl || ""} />
                            <AvatarFallback className="text-2xl">
                                {user.name?.substring(0, 2).toUpperCase() || "US"}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <Badge variant="secondary" className="mt-2">
                            {roleLabels[user.role] || user.role}
                        </Badge>

                        <div className="w-full mt-6 space-y-4 text-left">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="h-4 w-4" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Kayıt: {format(new Date(user.createdAt), 'd MMM yyyy', { locale: tr })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Shield className="h-4 w-4" />
                                <span className={user.isActive ? "text-green-600" : "text-red-600"}>
                                    {user.isActive ? "Hesap Aktif" : "Hesap Pasif"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Column */}
                <div className="md:col-span-2 space-y-6">
                    {/* Teams Info (if applicable) */}
                    {['TEAM_LEAD', 'WORKER'].includes(user.role) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Ekip Bilgileri</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user.teamMember.length > 0 ? (
                                    <div className="space-y-4">
                                        {user.teamMember.map((tm: any) => (
                                            <div key={tm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{tm.team.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Katılım: {format(new Date(tm.joinedAt), 'd MMM yyyy', { locale: tr })}
                                                    </p>
                                                </div>
                                                <Badge>Üye</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Herhangi bir ekibe üye değil.</p>
                                )}

                                {user.managedTeams.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="text-sm font-semibold mb-2">Yönettiği Ekipler</h4>
                                        {user.managedTeams.map((team: any) => (
                                            <div key={team.id} className="p-2 bg-blue-50 text-blue-700 rounded mb-2">
                                                {team.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Jobs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Son Aktiviteler / İşler</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.assignedJobs.length > 0 ? (
                                <div className="space-y-4">
                                    {user.assignedJobs.map((assignment: any) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <Link href={`/admin/jobs/${assignment.job.id}`} className="font-medium hover:underline text-blue-600">
                                                    {assignment.job.title}
                                                </Link>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(assignment.assignedAt), 'd MMM yyyy HH:mm', { locale: tr })}
                                                </p>
                                            </div>
                                            <Badge variant="outline">{assignment.job.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">Henüz atanmış bir iş yok.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
