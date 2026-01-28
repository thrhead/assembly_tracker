import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { prisma } from "@/lib/db"
import { JobDialog } from "@/components/admin/job-dialog"
import { BulkUploadDialog } from "@/components/admin/bulk-upload-dialog"
import { AdvancedFilter } from "@/components/admin/advanced-filter"
import { DeleteJobButton } from "@/components/admin/delete-job-button"
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
import { SearchIcon, CalendarIcon, MapPinIcon, BriefcaseIcon, EditIcon, Ban, AlertTriangle, UserIcon } from "lucide-react"
import { Link } from "@/lib/navigation"
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
  searchParams: Promise<{ 
    search?: string; 
    status?: string; 
    teams?: string; 
    from?: string; 
    to?: string; 
    page?: string 
  }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // Parse filters
  const statusFilter = searchParams.status ? searchParams.status.split(',') : undefined
  const teamsFilter = searchParams.teams ? searchParams.teams.split(',') : undefined
  const dateRangeFilter = searchParams.from ? {
    start: new Date(searchParams.from),
    end: searchParams.to ? new Date(searchParams.to) : new Date(searchParams.from)
  } : undefined

  // Parallel data fetching
  const [jobsData, customers, teams, templates] = await Promise.all([
    getJobs({
      filter: { 
        search: searchParams.search,
        status: statusFilter,
        teams: teamsFilter,
        dateRange: dateRangeFilter
      },
      limit: 50,
      page: searchParams.page ? parseInt(searchParams.page) : 1
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

  // Map templates
  const mappedTemplates = templates.map(t => ({
    id: t.id,
    name: t.name,
    steps: t.steps.map(s => ({
      title: s.title,
      description: '', 
      subSteps: s.subSteps.map(ss => ({ title: ss.title }))
    }))
  }))

  const mappedCustomers = customers.map(c => ({
    id: c.id,
    company: c.company,
    user: { name: c.user.name || '' } 
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">İşler</h1>
          <p className="text-gray-500 mt-2">Montaj ve servis işlerini yönetin.</p>
        </div>
        <div className="flex items-center gap-2">
          <AdvancedFilter 
            teams={teams.map(t => ({ id: t.id, name: t.name }))}
          />
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
              <TableHead className="w-[150px]">İlerleme</TableHead>
              <TableHead>Onaylanan Tutar</TableHead>
              <TableHead>Öncelik</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const totalSteps = job.steps.length;
              const completedSteps = job.steps.filter(s => s.isCompleted).length;
              const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

              const pendingCosts = job.costs.filter(c => c.status === 'PENDING');
              const approvedCosts = job.costs.filter(c => c.status === 'APPROVED');
              const totalApprovedAmount = approvedCosts.reduce((sum, c) => sum + c.amount, 0);
              const totalPendingAmount = pendingCosts.reduce((sum, c) => sum + c.amount, 0);

              const hasPendingApprovals =
                pendingCosts.length > 0 ||
                job.steps.some(s => s.subSteps.some(ss => ss.approvalStatus === 'PENDING'));

              return (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-50 rounded text-orange-600">
                        <BriefcaseIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <Link href={`/admin/jobs/${job.id}`} className="font-medium text-gray-900 hover:underline hover:text-blue-600 block">
                          {job.title}
                        </Link>
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
                    <div className="font-medium">{job.customer?.company || 'Bilinmeyen Müşteri'}</div>
                    <div className="text-sm text-gray-500">{job.customer?.user?.name || ''}</div>
                    {job._count?.steps === 0 && job.status === 'PENDING' && (
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        <Ban className="h-3 w-3 mr-1" /> İşe Başlanmadı
                      </div>
                    )}
                    {hasPendingApprovals && (
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Onay Bekliyor
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
                          <div className="text-xs text-gray-500 flex items-center">
                            <UserIcon className="h-3 w-3 mr-1" /> Lider: {job.assignments[0].team.lead.name}
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
                    <div className="w-full max-w-[140px]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">{completedSteps}/{totalSteps} Adım</span>
                        <span className="font-medium text-gray-700">%{progress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(totalApprovedAmount)}
                      </span>
                      {totalPendingAmount > 0 && (
                        <span className="text-xs text-yellow-600 font-medium">
                          + {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(totalPendingAmount)} Bekleyen
                        </span>
                      )}
                    </div>
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
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <JobDialog
                        customers={mappedCustomers}
                        teams={teams}
                        templates={mappedTemplates}
                        job={job}
                        trigger={
                          <button className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <EditIcon className="h-4 w-4" />
                          </button>
                        }
                      />
                      <DeleteJobButton jobId={job.id} jobTitle={job.title} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
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