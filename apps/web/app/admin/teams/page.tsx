import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { TeamDialog } from '@/components/admin/team-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SearchIcon, BriefcaseIcon, UsersIcon, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { getTeams, getTeamStats } from "@/lib/data/teams"
import { DeleteTeamButton } from "@/components/admin/delete-team-button"
import { prisma } from "@/lib/db"

export default async function TeamsPage(props: {
  searchParams: Promise<{ search?: string }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // Fetch teams, stats, and users for the dialog
  const [teams, stats, users] = await Promise.all([
    getTeams({ search: searchParams.search }),
    getTeamStats(),
    prisma.user.findMany({
        where: {
            role: { in: ['TEAM_LEAD', 'WORKER'] },
            isActive: true
        },
        select: { id: true, name: true, role: true }
    })
  ])

  // Helper to fetch members for a specific team (since we can't easily fetch nested relation IDs in the main query efficiently for all rows without overfetching, but actually we included members count. For the dialog we need member IDs.
  // Ideally, we should fetch member IDs when opening the dialog, but since we are doing SSG/SSR, we can pass them if the list is small, or better: Fetch them on demand?
  // Wait, the Dialog is rendered for EACH row. If we fetch all data for all rows it might be heavy.
  // But wait, the `TeamDialog` is used in two places:
  // 1. "New Team" button at top -> needs `users` list.
  // 2. "Edit" button in row -> needs `users` list AND `currentMembers`.

  // To optimize, let's fetch members for all displayed teams.
  const teamsWithMembers = await prisma.team.findMany({
      where: {
          id: { in: teams.map(t => t.id) }
      },
      select: {
          id: true,
          members: {
              select: { userId: true }
          }
      }
  })

  const membersMap = new Map(teamsWithMembers.map(t => [t.id, t.members.map(m => m.userId)]))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Ekipler</h2>
        <TeamDialog users={users} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium">Toplam Ekip</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium">Aktif Ekip</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.active}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium">Toplam Üye</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.members}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form>
             <Input
                name="search"
                placeholder="Ekip ara..."
                defaultValue={searchParams.search}
                className="pl-9"
            />
          </form>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ekip Adı</TableHead>
              <TableHead>Lider</TableHead>
              <TableHead>Üye Sayısı</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Oluşturma Tarihi</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Ekip bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/teams/${team.id}`} className="hover:underline text-blue-600">
                      {team.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {team.lead?.name || <span className="text-muted-foreground">Atanmamış</span>}
                  </TableCell>
                  <TableCell>{team._count.members}</TableCell>
                  <TableCell>
                    <Badge variant={team.isActive ? 'default' : 'secondary'}>
                      {team.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(team.createdAt), 'd MMM yyyy', { locale: tr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <TeamDialog
                        team={{
                          id: team.id,
                          name: team.name,
                          description: team.description,
                          leadId: team.leadId,
                          isActive: team.isActive
                        }}
                        users={users}
                        currentMembers={membersMap.get(team.id)}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DeleteTeamButton teamId={team.id} teamName={team.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
