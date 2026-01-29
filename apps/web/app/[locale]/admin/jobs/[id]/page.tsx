import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/lib/navigation"
// import { AdminJobDetailsTabs } from "@/components/admin/job-details-tabs"
// import { ApprovalActionCard } from "@/components/admin/approval-action-card"
import { getJob } from "@/lib/data/jobs"
import { JobDialog } from "@/components/admin/job-dialog"
import { DeleteJobButton } from "@/components/admin/delete-job-button"
import { EditIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { JobDetailsClientWrapper } from "@/components/admin/job-details-client-wrapper"

export const dynamicParams = true

export default async function AdminJobDetailsPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    // We fetch workers and teams here for the assignment dialogs that might be inside tabs
    // Ideally these should be fetched by the components that need them or inside a data layer
    // For now, keeping the pattern but using cleaner fetch
    const [job, workers, teams, customers, templates] = await Promise.all([
        getJob(params.id),
        prisma.user.findMany({
            where: { role: 'WORKER', isActive: true },
            select: { id: true, name: true }
        }),
        prisma.team.findMany({
            where: { isActive: true },
            select: { id: true, name: true }
        }),
        prisma.customer.findMany({
            include: { user: { select: { name: true } } }
        }),
        prisma.jobTemplate.findMany({
            include: { steps: { include: { subSteps: true } } }
        })
    ])

    // Map data for JobDialog
    const dialogCustomers = customers.map(c => ({
        id: c.id,
        company: c.company,
        user: { name: c.user.name || '' }
    }))

    const dialogTemplates = templates.map(t => ({
        id: t.id,
        name: t.name,
        steps: t.steps.map(s => ({
            title: s.title,
            description: '',
            subSteps: s.subSteps.map(ss => ({ title: ss.title }))
        }))
    }))

    if (!job) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">İş Bulunamadı</h1>
                <p className="text-gray-500 mt-2">Aradığınız iş mevcut değil veya silinmiş.</p>
                <Link href="/admin/jobs" className="text-blue-600 hover:underline mt-4 inline-block">
                    İş Listesine Dön
                </Link>
            </div>
        )
    }

    // Serialize pending approval to handle Date objects
    const rawPendingApproval = job.approvals[0]
    const pendingApproval = rawPendingApproval ? JSON.parse(JSON.stringify(rawPendingApproval)) : null

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/jobs">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-gray-900">İş Detayları</h1>
                            {/* <Badge variant="outline" className="text-lg py-0 h-8 font-mono bg-orange-50 text-orange-700 border-orange-200">
                                {job.jobNo || 'NO-CODE'}
                            </Badge> */}
                        </div>
                        <p className="text-gray-500">İşin ilerleme durumunu ve detaylarını görüntüleyin.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <JobDialog
                        job={JSON.parse(JSON.stringify(job))}
                        customers={dialogCustomers}
                        teams={teams}
                        templates={dialogTemplates}
                        trigger={
                            <Button variant="outline" className="gap-2">
                                <EditIcon className="h-4 w-4" />
                                Düzenle
                            </Button>
                        }
                    />
                    <DeleteJobButton
                        jobId={job.id}
                        jobTitle={job.title}
                        variant="destructive"
                        size="default"
                        showText={true}
                    />
                </div>
            </div>

            <JobDetailsClientWrapper
                job={JSON.parse(JSON.stringify(job))}
                workers={workers}
                teams={teams}
                pendingApproval={pendingApproval}
            />

            <Card>
                <CardHeader>
                    <CardTitle>İş Sohbeti</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChatPanel jobId={params.id} title={job.title} />
                </CardContent>
            </Card>
        </div>
    )
}
