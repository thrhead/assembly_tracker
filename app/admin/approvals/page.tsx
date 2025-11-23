import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { ApprovalDialog } from '@/components/approvals/approval-dialog'

async function getApprovals() {
  return await prisma.approval.findMany({
    where: {
      status: 'PENDING'
    },
    include: {
      job: {
        include: {
          customer: true
        }
      },
      requester: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(session.user.role)) {
    redirect('/login')
  }

  const approvals = await getApprovals()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Onay Bekleyen İşler</h1>
        <p className="text-gray-600 mt-1">
          {approvals.length} iş onayınızı bekliyor
        </p>
      </div>

      {/* Approvals Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {approvals.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed">
            <div className="text-6xl mb-3">✅</div>
            <h3 className="text-lg font-medium text-gray-900">Onay bekleyen iş bulunmuyor</h3>
            <p className="text-gray-500 mt-1">Tüm işler onaylandı</p>
          </div>
        )}

        {approvals.map((approval) => (
          <Card key={approval.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">{approval.job.title}</CardTitle>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shrink-0">
                  Bekliyor
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Müşteri:</span> {approval.job.customer.company}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Talep Eden:</span> {approval.requester.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Talep Tarihi:</span>{' '}
                  {formatDistanceToNow(new Date(approval.createdAt), {
                    addSuffix: true,
                    locale: tr
                  })}
                </p>
              </div>

              {approval.notes && (
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Not:</span> {approval.notes}
                  </p>
                </div>
              )}

              <ApprovalDialog approval={approval} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
