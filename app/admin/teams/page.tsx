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

export default async function TeamsPage(props: {
  searchParams: Promise<{ search?: string }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const [teams, stats] = await Promise.all([
    getTeams({ search: searchParams.search }),
    getTeamStats()
  ])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Ekipler</h2>
        <TeamDialog />
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
