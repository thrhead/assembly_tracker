import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { JobDialog } from "@/components/admin/job-dialog"
import { BulkUploadDialog } from "@/components/admin/bulk-upload-dialog"
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
import { getJobs } from "@/lib/data/jobs"

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

export default async function JobsPage(props: {
  searchParams: Promise<{ search?: string }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // Parallel data fetching for jobs list and dialog dependencies
  const [jobsData, customers, teams, templates] = await Promise.all([
    getJobs({
      filter: { search: searchParams.search },
      limit: 50
    }),
    prisma.customer.findMany({
      include: { user: { select: { name: true } } }
    }),
    prisma.team.findMany({
      where: { isActive: true }
    }),
    prisma.jobTemplate.findMany({
      include: { steps: { include: { subSteps: true } } }
    })
  ])

  const { jobs } = jobsData

  // Map templates to the expected interface in JobDialog
  const mappedTemplates = templates.map(t => ({
    id: t.id,
    name: t.name,
    steps: t.steps.map(s => ({
      title: s.title,
      description: '', // TemplateStep doesn't have description in prisma schema provided? If it does, add it.
      subSteps: s.subSteps.map(ss => ({ title: ss.title }))
    }))
  }))

  const mappedCustomers = customers.map(c => ({
    id: c.id,
    company: c.company,
    user: { name: c.user.name || '' } // Handle null name
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">İşler</h1>
          <p className="text-gray-500 mt-2">Montaj ve servis işlerini yönetin.</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkUploadDialog />
          <JobDialog
            customers={mappedCustomers}
            teams={teams}
            templates={mappedTemplates}
          />
        </div>
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
                      <a href={`/admin/jobs/${job.id}`} className="font-medium text-gray-900 hover:underline hover:text-blue-600 block">
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
                  {job._count.steps === 0 && job.status === 'PENDING' && (
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      🚫 İşe Başlanmadı
                    </div>
                  )}
                  {(job.steps.length > 0 || job.costs.length > 0) && (
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⚠️ Onay Bekliyor
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {job.assignments.length > 0 && job.assignments[0].team ? (
                    <div className="space-y-1">
                      <Badge variant="outline" className="font-normal">
                        {job.assignments[0].team.name}
                      </Badge>
                      {job.assignments[0].team.lead && (
                        <div className="text-xs text-gray-500">
                          👤 Lider: {job.assignments[0].team.lead.name}
                        </div>
                      )}
                      {job.assignments[0].team.members && job.assignments[0].team.members.length > 0 && (
                        <div className="text-xs text-gray-400">
                          👥 {job.assignments[0].team.members.map((m: any) => m.user.name).join(', ')}
                        </div>
                      )}
                    </div>
                  ) : job.assignments.length > 0 && job.assignments[0].worker ? (
                    <div className="space-y-1">
                      <Badge variant="outline" className="font-normal bg-blue-50">
                        {job.assignments[0].worker.name}
                      </Badge>
                      <div className="text-xs text-gray-400">Bireysel Atama</div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Atanmamış</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={priorityColors[job.priority] || "default"}>
                    {job.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[job.status] || "default"}>
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
    </div >
  )
}
