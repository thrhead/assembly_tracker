import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AdminJobDetailsTabs } from "@/components/admin/job-details-tabs"

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
                    team: true,
                    worker: true
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
            }
        }
    })
}

export default async function AdminJobDetailsPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    const job = await getJob(params.id)

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

            <AdminJobDetailsTabs job={job} />
        </div>
    )
}
