import { auth } from '@/lib/auth'
import { redirect } from '@/lib/navigation'
import { getApprovals } from '@/lib/data/approvals'
import { ApprovalsListWrapper } from '@/components/admin/approvals-list-wrapper'

export default async function ApprovalsPage() {
  const session = await auth()

  if (!session || !['ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(session.user.role)) {
    redirect('/login')
  }

  const approvals = await getApprovals()

  // Serialize all dates for client components using JSON parse/stringify
  const serializedApprovals = JSON.parse(JSON.stringify(approvals))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Onay Bekleyen İşler</h1>
        <p className="text-gray-600 mt-1">
          {serializedApprovals.length} iş onayınızı bekliyor
        </p>
      </div>

      {/* Approvals Grid - Client Side Only */}
      <ApprovalsListWrapper approvals={serializedApprovals} />
    </div>
  )
}
