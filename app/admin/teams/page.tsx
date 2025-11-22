import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { TeamDialog } from "@/components/admin/team-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, BriefcaseIcon, UsersIcon, Edit } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

async function getTeams(search?: string) {
  const where: any = {}
  if (search) {
    where.name = { contains: search }
  }

  return await prisma.team.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          members: true,
          assignments: true
        }
      }
    }
  })
}

export default async function TeamsPage(props: {
  searchParams: Promise<{ search?: string }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const teams = await getTeams(searchParams.search)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ekipler</h1>
          <p className="text-gray-500 mt-2">Montaj ve servis ekiplerini yönetin.</p>
        </div>
        <TeamDialog />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <form>
              <Input
                name="search"
                placeholder="Ekip adı ara..."
                className="pl-10"
                defaultValue={searchParams.search}
              />
            </form>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ekip Adı</TableHead>
              <TableHead>Lider</TableHead>
              <TableHead>Üye Sayısı</TableHead>
              <TableHead>Aktif İşler</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Oluşturulma</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded text-blue-600">
                      <BriefcaseIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{team.name}</p>
                      {team.description && (
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{team.description}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {team.lead ? (
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-600 font-bold">
                        {team.lead.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm font-medium">{team.lead.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Atanmamış</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <UsersIcon className="h-3 w-3" />
                    {team._count.members} Üye
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {team._count.assignments} İş
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={team.isActive ? "default" : "destructive"}>
                    {team.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(team.createdAt), 'd MMM yyyy', { locale: tr })}
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))}
            {teams.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Ekip bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
