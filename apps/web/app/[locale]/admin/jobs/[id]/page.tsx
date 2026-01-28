import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/lib/navigation"
import { AdminJobDetailsTabs } from "@/components/admin/job-details-tabs"
import { ApprovalActionCard } from "@/components/admin/approval-action-card"
import { getJob } from "@/lib/data/jobs"
import { JobDialog } from "@/components/admin/job-dialog"
import { DeleteJobButton } from "@/components/admin/delete-job-button"
import { EditIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import NextDynamic from 'next/dynamic'

// Dynamically import ChatPanel with SSR disabled because it uses browser-only APIs
const ChatPanel = NextDynamic(
    () => import("@/components/chat/ChatPanel").then(mod => mod.ChatPanel),
    { ssr: false, loading: () => <div className="h-[500px] bg-gray-100 rounded-lg animate-pulse" /> }
)

export const dynamic = 'force-dynamic'

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
    const [jobResult, workers, teams, customers, templates] = await Promise.all([
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

    if (!jobResult) {
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

    // Serialize ALL data to avoid Date object issues between Server and Client components
    const job = JSON.parse(JSON.stringify(jobResult))
    const serializedWorkers = JSON.parse(JSON.stringify(workers))
    const serializedTeams = JSON.parse(JSON.stringify(teams))
    const serializedCustomers = JSON.parse(JSON.stringify(customers))
    const serializedTemplates = JSON.parse(JSON.stringify(templates))

    // Map templates with safety using serialized data
    const dialogCustomers = serializedCustomers.map((c: any) => ({
        id: c.id,
        company: c.company,
        user: { name: c.user?.name || '' }
    }))

    const dialogTemplates = serializedTemplates.map((t: any) => ({
        id: t.id,
        name: t.name,
        steps: (t.steps || []).map((s: any) => ({
            title: s.title,
            description: '',
            subSteps: (s.subSteps || []).map((ss: any) => ({ title: ss.title }))
        }))
    }))

    const pendingApproval = job.approvals?.[0]

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
                        <h1 className="text-3xl font-bold text-gray-900">İş Detayları</h1>
                        <p className="text-gray-500">İşin ilerleme durumunu ve detaylarını görüntüleyin.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <JobDialog
                        job={job}
                        customers={dialogCustomers}
                        teams={serializedTeams}
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

            {pendingApproval && (
                <ApprovalActionCard approval={pendingApproval} />
            )}

            <AdminJobDetailsTabs
                job={job}
                workers={serializedWorkers}
                teams={serializedTeams}
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
