import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin, Building2, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCustomer } from "@/lib/data/customers"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export default async function CustomerDetailsPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    const customer = await getCustomer(params.id)

    if (!customer) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Müşteri Bulunamadı</h1>
                <Link href="/admin/customers" className="text-blue-600 hover:underline mt-4 inline-block">
                    Müşteri Listesine Dön
                </Link>
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        IN_PROGRESS: "bg-blue-100 text-blue-800",
        COMPLETED: "bg-green-100 text-green-800",
        CANCELLED: "bg-red-100 text-red-800",
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/customers">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{customer.company}</h1>
                    <p className="text-gray-500">Müşteri detayları ve iş geçmişi</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Firma Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900">{customer.company}</p>
                                {customer.taxId && (
                                    <p className="text-sm text-gray-500">VN: {customer.taxId}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-600">
                                {customer.address || "Adres bilgisi girilmemiş"}
                            </p>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-2 text-sm">Yetkili Kişi</h4>
                            <div className="space-y-2">
                                <p className="font-medium">{customer.user.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    <a href={`mailto:${customer.user.email}`} className="hover:text-blue-600">
                                        {customer.user.email}
                                    </a>
                                </div>
                                {customer.user.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="h-4 w-4" />
                                        <a href={`tel:${customer.user.phone}`} className="hover:text-blue-600">
                                            {customer.user.phone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {customer.notes && (
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-2 text-sm">Notlar</h4>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{customer.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Jobs History */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>İş Geçmişi</CardTitle>
                        <Badge variant="outline">{customer._count.jobs} Toplam İş</Badge>
                    </CardHeader>
                    <CardContent>
                        {customer.jobs.length > 0 ? (
                            <div className="space-y-4">
                                {customer.jobs.map((job) => (
                                    <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 hover:bg-gray-50 transition-colors">
                                        <div>
                                            <Link href={`/admin/jobs/${job.id}`} className="font-semibold text-blue-600 hover:underline">
                                                {job.title}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                <Briefcase className="h-3 w-3" />
                                                <span>
                                                    {format(new Date(job.createdAt), 'd MMM yyyy', { locale: tr })}
                                                </span>
                                                {job.location && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{job.location}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {job.assignments[0]?.team && (
                                                <Badge variant="outline" className="font-normal">
                                                    {job.assignments[0].team.name}
                                                </Badge>
                                            )}
                                            <Badge className={statusColors[job.status] || "bg-gray-100 text-gray-800"}>
                                                {job.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>Henüz kayıtlı iş bulunmuyor.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
