import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AdminJobDetailsTabs } from "@/components/admin/job-details-tabs"

import { ApprovalActionCard } from "@/components/admin/approval-action-card"

export const dynamic = 'force-dynamic'

async function getJob(id: string) {
    return await prisma.job.findUnique({
        where: { id },
        include: {
            customer: {
                include: {
                    user: true
                }
            },
            assignments: {
                include: {
                    team: {
                        include: {
                            members: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    },
                    worker: true
                }
            },
            approvals: {
                where: {
                    status: 'PENDING'
                },
                include: {
                    requester: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            },
            steps: {
                orderBy: {
                    order: 'asc'
                },
                include: {
                    completedBy: {
                        select: {
                            name: true
                        }
                    },
                    subSteps: {
                        orderBy: {
                            order: 'asc'
                        },
                        include: {
                            photos: true
                        }
                    },
                    photos: {
                        orderBy: {
                            uploadedAt: 'desc'
                        },
                        include: {
                            uploadedBy: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            costs: {
                orderBy: {
                    date: 'desc'
                },
                include: {
                    createdBy: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    })
}

export default async function AdminJobDetailsPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    const [job, workers, teams] = await Promise.all([
        getJob(params.id),
        prisma.user.findMany({
            where: { role: 'WORKER', isActive: true },
            select: { id: true, name: true }
        }),
        prisma.team.findMany({
            where: { isActive: true },
            select: { id: true, name: true }
        })
    ])

    console.log('Fetched workers:', workers)
    console.log('Fetched teams:', teams)
    console.log('Job Assignments:', JSON.stringify(job?.assignments, null, 2))

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

    const pendingApproval = job.approvals[0]

    return (
        <div className="space-y-6">
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

            {pendingApproval && (
                <ApprovalActionCard approval={pendingApproval} />
            )}

            <AdminJobDetailsTabs
                job={job}
                workers={workers}
                teams={teams}
            />
        </div>
    )
}
