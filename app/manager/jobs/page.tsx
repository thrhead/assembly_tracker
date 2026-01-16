import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { JobDialog } from "@/components/admin/job-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SearchIcon, CalendarIcon, MapPinIcon, BriefcaseIcon } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

async function getJobs(search?: string) {
    const where: any = {}
    if (search) {
        where.OR = [
            { title: { contains: search } },
            { customer: { company: { contains: search } } },
            { customer: { user: { name: { contains: search } } } }
        ]
    }

    return await prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            customer: {
                include: {
                    user: {
                        select: { name: true }
                    }
                }
            },
            assignments: {
                include: {
                    team: true
                }
            },
            _count: {
                select: {
                    steps: true
                }
            }
        }
    })
}

const priorityColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    LOW: "secondary",
    MEDIUM: "default",
    HIGH: "destructive",
    URGENT: "destructive"
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "secondary",
    IN_PROGRESS: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive"
}

const statusLabels: Record<string, string> = {
    PENDING: "Bekliyor",
    IN_PROGRESS: "Devam Ediyor",
    COMPLETED: "Tamamlandı",
    CANCELLED: "İptal",
    ON_HOLD: "Beklemede"
}

export default async function ManagerJobsPage(props: {
    searchParams: Promise<{ search?: string }>
}) {
    const searchParams = await props.searchParams
    const session = await auth()
    if (!session || session.user.role !== "MANAGER") {
        redirect("/login")
    }

    const jobs = await getJobs(searchParams.search)

    // Fetch data for JobDialog
    const [customers, teams, templates] = await Promise.all([
        prisma.customer.findMany({
            select: { id: true, company: true }
        }),
        prisma.team.findMany({
            select: { id: true, name: true }
        }),
        prisma.jobTemplate.findMany({
            select: { id: true, name: true }
        })
    ])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">İşler</h1>
                    <p className="text-gray-500 mt-2">Montaj ve servis işlerini yönetin.</p>
                </div>
                <JobDialog customers={customers} teams={teams} templates={templates} />
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <div className="relative max-w-sm">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <form>
                            <Input
                                name="search"
                                placeholder="İş, müşteri veya firma ara..."
                                className="pl-10"
                                defaultValue={searchParams.search}
                            />
                        </form>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>İş Başlığı</TableHead>
                            <TableHead>Müşteri</TableHead>
                            <TableHead>Atanan Ekip</TableHead>
                            <TableHead>Öncelik</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-orange-50 rounded text-orange-600">
                                            <BriefcaseIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <a href={`/manager/jobs/${job.id}`} className="font-medium text-gray-900 hover:underline hover:text-blue-600 block">
                                                {job.title}
                                            </a>
                                            {job.location && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MapPinIcon className="h-3 w-3" />
                                                    <span className="truncate max-w-[150px]">{job.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{job.customer.company}</div>
                                    <div className="text-sm text-gray-500">{job.customer.user.name}</div>
                                </TableCell>
                                <TableCell>
                                    {job.assignments.length > 0 && job.assignments[0].team ? (
                                        <Badge variant="outline" className="font-normal">
                                            {job.assignments[0].team.name}
                                        </Badge>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Atanmamış</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={priorityColors[job.priority]}>
                                        {job.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={statusColors[job.status]}>
                                        {statusLabels[job.status] || job.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <CalendarIcon className="h-3 w-3" />
                                        {job.scheduledDate
                                            ? format(new Date(job.scheduledDate), 'd MMM', { locale: tr })
                                            : format(new Date(job.createdAt), 'd MMM', { locale: tr })
                                        }
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {jobs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    Kayıtlı iş bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
